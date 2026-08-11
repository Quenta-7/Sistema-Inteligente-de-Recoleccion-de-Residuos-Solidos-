from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from core.models import Usuario, Zona, Horario, Evidencia, Recompensa, Canje, Ruta, Incidencia, CalificacionServicio, BitacoraAuditoria

class CoreApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Crear zona de prueba
        self.zona = Zona.objects.create(
            nombre="San Jerónimo Test",
            codigo="SJ-TEST",
            descripcion="Zona de pruebas"
        )
        
        # Crear usuario ciudadano
        self.ciudadano = Usuario.objects.create_user(
            username="ciudadano@test.com",
            email="ciudadano@test.com",
            nombre_completo="Juan Perez",
            dni="12345678",
            password="Password123!",
            rol="ciudadano",
            zona=self.zona,
            ecopuntos=100
        )
        
        # Crear usuario recolector
        self.recolector = Usuario.objects.create_user(
            username="recolector@test.com",
            email="recolector@test.com",
            nombre_completo="Carlos Recolector",
            password="Password123!",
            rol="recolector",
            zona=self.zona
        )
        
        # Crear usuario admin
        self.admin = Usuario.objects.create_user(
            username="admin@test.com",
            email="admin@test.com",
            nombre_completo="Admin General",
            password="Password123!",
            rol="admin"
        )
        
        # Crear horario
        self.horario = Horario.objects.create(
            zona=self.zona,
            dia="lunes",
            hora_inicio="07:00:00",
            hora_fin="10:00:00",
            tipos_residuo=["organico", "reciclable"]
        )

    def test_login_exitoso(self):
        url = reverse('login')
        data = {
            "email": "ciudadano@test.com",
            "password": "Password123!"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('token', response.data)

    def test_consulta_dni_formato_invalido(self):
        url = reverse('consultar_dni', kwargs={'dni': '123'})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registro_usuario(self):
        url = reverse('register')
        data = {
            "email": "nuevo@test.com",
            "dni": "87654321",
            "nombre_completo": "Nuevo Usuario",
            "password": "Password123!",
            "zona": self.zona.id,
            "acepta_terminos": True
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])

    def test_crear_y_aprobar_evidencia(self):
        self.client.force_authenticate(user=self.ciudadano)
        evidencia = Evidencia.objects.create(
            usuario=self.ciudadano,
            zona=self.zona,
            tipo_residuo="reciclable",
            descripcion="10kg de plastico",
            cantidad=10,
            ecopuntos=50,
            estado="nuevo"
        )
        
        # Admin aprueba la evidencia
        self.client.force_authenticate(user=self.admin)
        url = f"/api/evidencias/{evidencia.id}/"
        response = self.client.patch(url, {"estado": "resuelto"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.ciudadano.refresh_from_db()
        self.assertEqual(self.ciudadano.ecopuntos, 150) # 100 + 50

    def test_canje_recompensa(self):
        recompensa = Recompensa.objects.create(
            nombre="Planta Eco",
            descripcion="Planta decorativa",
            puntos=50,
            categoria="Hogar",
            stock=5
        )
        
        self.client.force_authenticate(user=self.ciudadano)
        url = "/api/canjes/"
        data = {"recompensa": recompensa.id}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        self.ciudadano.refresh_from_db()
        recompensa.refresh_from_db()
        self.assertEqual(self.ciudadano.ecopuntos, 50)
        self.assertEqual(recompensa.stock, 4)

    def test_actualizacion_gps_ruta(self):
        ruta = Ruta.objects.create(
            recolector=self.recolector,
            zona=self.zona,
            fecha="2026-07-30",
            hora_inicio="07:00:00",
            hora_fin_estimada="10:00:00",
            estado="en_progreso"
        )
        
        self.client.force_authenticate(user=self.recolector)
        url = f"/api/rutas/{ruta.id}/"
        data = {
            "lat_actual": -13.5485,
            "lng_actual": -71.8772
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        ruta.refresh_from_db()
        self.assertEqual(ruta.lat_actual, -13.5485)
        self.assertIsNotNone(ruta.ultima_actualizacion_gps)

    def test_incidencia_y_respuesta_admin(self):
        self.client.force_authenticate(user=self.recolector)
        incidencia = Incidencia.objects.create(
            recolector=self.recolector,
            tipo="Vía Bloqueada",
            descripcion="Obras en Jr. Cusco"
        )
        
        # Admin responde incidencia
        self.client.force_authenticate(user=self.admin)
        url = f"/api/incidencias/{incidencia.id}/"
        data = {
            "respuesta_admin": "Camión desviado por Av. Evitamiento",
            "estado": "resuelta"
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        incidencia.refresh_from_db()
        self.assertEqual(incidencia.estado, "resuelta")
        self.assertEqual(incidencia.respuesta_admin, "Camión desviado por Av. Evitamiento")
        self.assertTrue(self.recolector.notificaciones.filter(mensaje__contains=f'#{incidencia.id}').exists())

    def test_calificacion_servicio(self):
        ruta = Ruta.objects.create(
            recolector=self.recolector,
            zona=self.zona,
            fecha="2026-07-30",
            hora_inicio="07:00:00",
            hora_fin_estimada="10:00:00",
            estado="completada"
        )
        
        self.client.force_authenticate(user=self.ciudadano)
        url = "/api/calificaciones/"
        data = {
            "ruta": ruta.id,
            "estrellas": 5,
            "comentario": "Excelente servicio y puntualidad."
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], 'Calificación registrada correctamente.')
        self.assertTrue(BitacoraAuditoria.objects.filter(
            usuario=self.ciudadano,
            accion='calificacion_creada',
            entidad_id=response.data['calificacion']['id'],
        ).exists())

        # La restricción existe tanto en API como en la base de datos.
        duplicate = self.client.post(url, data, format='json')
        self.assertEqual(duplicate.status_code, status.HTTP_400_BAD_REQUEST)

        rating_id = response.data['calificacion']['id']
        self.assertEqual(self.client.delete(f'/api/calificaciones/{rating_id}/').status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

        self.client.force_authenticate(user=self.admin)
        moderation = self.client.patch(
            f'/api/calificaciones/{rating_id}/',
            {'estado_moderacion': 'oculto'},
            format='json',
        )
        self.assertEqual(moderation.status_code, status.HTTP_200_OK)
        self.assertEqual(moderation.data['estado_moderacion'], 'oculto')

    def test_no_se_califica_ruta_no_realizada(self):
        ruta = Ruta.objects.create(
            recolector=self.recolector, zona=self.zona, fecha='2026-08-07',
            hora_inicio='07:00:00', hora_fin_estimada='10:00:00', estado='programada',
        )
        self.client.force_authenticate(user=self.ciudadano)
        response = self.client.post('/api/calificaciones/', {'ruta': ruta.id, 'estrellas': 4}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_gps_solo_durante_ruta_y_se_limpia_al_finalizar(self):
        ruta = Ruta.objects.create(
            recolector=self.recolector, zona=self.zona, fecha='2026-08-07',
            hora_inicio='07:00:00', hora_fin_estimada='10:00:00', estado='programada',
            geometria_ruta=[{'lat': -13.54, 'lng': -71.87}, {'lat': -13.55, 'lng': -71.88}],
        )
        self.client.force_authenticate(user=self.recolector)
        url = f'/api/rutas/{ruta.id}/'
        rejected = self.client.patch(url, {'lat_actual': -13.54, 'lng_actual': -71.87}, format='json')
        self.assertEqual(rejected.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(self.client.patch(url, {'estado': 'en_progreso'}, format='json').status_code, status.HTTP_200_OK)
        tracked = self.client.patch(url, {'lat_actual': -13.54, 'lng_actual': -71.87}, format='json')
        self.assertEqual(tracked.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(tracked.data['ultima_actualizacion_gps'])
        completed = self.client.patch(url, {'estado': 'completada', 'observaciones': 'Ruta terminada'}, format='json')
        self.assertEqual(completed.status_code, status.HTTP_200_OK)
        self.assertIsNone(completed.data['lat_actual'])
        self.assertIsNone(completed.data['lng_actual'])

    def test_unicidad_y_no_solapamiento_de_rutas_programadas(self):
        self.client.force_authenticate(user=self.admin)
        # 1. Crear primera ruta programada
        res1 = self.client.post('/api/rutas/', {
            'recolector': self.recolector.id,
            'zona': self.zona.id,
            'fecha': '2026-08-11',
            'hora_inicio': '07:00:00',
            'hora_fin_estimada': '10:00:00',
            'estado': 'programada'
        }, format='json')
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)
        ruta1_id = res1.data['id']

        # 2. Intentar crear segunda ruta idéntica/solapada mientras la primera está programada -> Rechazado
        res2 = self.client.post('/api/rutas/', {
            'recolector': self.recolector.id,
            'zona': self.zona.id,
            'fecha': '2026-08-11',
            'hora_inicio': '07:00:00',
            'hora_fin_estimada': '10:00:00',
            'estado': 'programada'
        }, format='json')
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('recolector', res2.data)

        # 3. Cambiar estado de la primera ruta a 'no_completada' (avería/no completada)
        self.client.patch(f'/api/rutas/{ruta1_id}/', {'estado': 'no_completada'}, format='json')

        # 4. Ahora sí debe permitir programar una nueva ruta para esa hora/día
        res3 = self.client.post('/api/rutas/', {
            'recolector': self.recolector.id,
            'zona': self.zona.id,
            'fecha': '2026-08-11',
            'hora_inicio': '07:00:00',
            'hora_fin_estimada': '10:00:00',
            'estado': 'programada'
        }, format='json')
        self.assertEqual(res3.status_code, status.HTTP_201_CREATED)

    def test_nuevo_login_invalida_jwt_anterior(self):
        login_url = reverse('login')
        first = self.client.post(login_url, {
            'email': self.recolector.email, 'password': 'Password123!', 'device_id': 'android-a',
        }, format='json')
        second = self.client.post(login_url, {
            'email': self.recolector.email, 'password': 'Password123!', 'device_id': 'android-b',
        }, format='json')
        previous_client = APIClient()
        previous_client.credentials(HTTP_AUTHORIZATION=f"Bearer {first.data['token']}")
        self.assertEqual(previous_client.get('/api/perfil/').status_code, status.HTTP_401_UNAUTHORIZED)
        current_client = APIClient()
        current_client.credentials(HTTP_AUTHORIZATION=f"Bearer {second.data['token']}")
        self.assertEqual(current_client.get('/api/perfil/').status_code, status.HTTP_200_OK)

    def test_solicitud_recuperar_contrasena(self):
        url = reverse('recuperar_contrasena')
        # Probar correo existente
        response = self.client.post(url, {"email": "ciudadano@test.com"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

        # Probar correo no existente
        response_inexistente = self.client.post(url, {"email": "noexiste@test.com"}, format='json')
        self.assertEqual(response_inexistente.status_code, status.HTTP_200_OK)
        self.assertTrue(response_inexistente.data['success'])

    def test_flujo_completo_restablecer_contrasena(self):
        # 1. Generar token para ciudadano@test.com
        uid = urlsafe_base64_encode(force_bytes(self.ciudadano.pk))
        token = default_token_generator.make_token(self.ciudadano)

        # 2. Validar token
        url_validar = reverse('validar_token_recuperacion', kwargs={'uidb64': uid, 'token': token})
        response_validar = self.client.get(url_validar)
        self.assertEqual(response_validar.status_code, status.HTTP_200_OK)
        self.assertTrue(response_validar.data['valid'])

        # 3. Restablecer con nueva contraseña
        url_restablecer = reverse('restablecer_contrasena')
        nueva_clave = "NuevaPassword123!"
        response_restablecer = self.client.post(url_restablecer, {
            "uid": uid,
            "token": token,
            "password": nueva_clave
        }, format='json')
        self.assertEqual(response_restablecer.status_code, status.HTTP_200_OK)
        self.assertTrue(response_restablecer.data['success'])

        # 4. Probar login con nueva contraseña
        url_login = reverse('login')
        response_login = self.client.post(url_login, {
            "email": "ciudadano@test.com",
            "password": nueva_clave
        }, format='json')
        self.assertEqual(response_login.status_code, status.HTTP_200_OK)
        self.assertTrue(response_login.data['success'])

    def test_filtrado_horarios_por_zona(self):
        # Crear otra zona y otro horario
        zona2 = Zona.objects.create(nombre="Zona 2 Test", codigo="Z2-TEST")
        horario2 = Horario.objects.create(
            zona=zona2,
            dia="martes",
            hora_inicio="14:00:00",
            hora_fin="17:00:00",
            tipos_residuo=["reciclable"]
        )

        # Autenticar ciudadano de la primera zona
        self.client.force_authenticate(user=self.ciudadano)

        # 1. GET /api/horarios/ debe retornar solo los horarios de su zona por defecto
        res = self.client.get('/api/horarios/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        ids = [h['id'] for h in res.data]
        self.assertIn(self.horario.id, ids)
        self.assertNotIn(horario2.id, ids)

        # 2. GET /api/horarios/?mi_zona=true debe retornar solo los de su zona
        res_mi_zona = self.client.get('/api/horarios/?mi_zona=true')
        self.assertEqual(res_mi_zona.status_code, status.HTTP_200_OK)
        ids_mi_zona = [h['id'] for h in res_mi_zona.data]
        self.assertIn(self.horario.id, ids_mi_zona)
        self.assertNotIn(horario2.id, ids_mi_zona)

        # 3. GET /api/horarios/?todos=true debe retornar todos los horarios
        res_todos = self.client.get('/api/horarios/?todos=true')
        self.assertEqual(res_todos.status_code, status.HTTP_200_OK)
        ids_todos = [h['id'] for h in res_todos.data]
        self.assertIn(self.horario.id, ids_todos)
        self.assertIn(horario2.id, ids_todos)



