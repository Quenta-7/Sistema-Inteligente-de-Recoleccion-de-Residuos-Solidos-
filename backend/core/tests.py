from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from core.models import Usuario, Zona, Horario, Evidencia, Recompensa, Canje, Ruta, Incidencia, CalificacionServicio

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


