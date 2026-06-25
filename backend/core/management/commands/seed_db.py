from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from datetime import time
from core.models import Zona, Usuario, Horario, Reporte, Evidencia, Notificacion, Recompensa, Canje, Ruta, Incidencia, CalificacionServicio

class Command(BaseCommand):
    help = 'Agregar datos de prueba (seed) a la base de datos'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clean',
            action='store_true',
            help='Limpia todos los datos antes de agregar los nuevos'
        )

    def handle(self, *args, **options):
        if options['clean']:
            self.stdout.write(self.style.WARNING('Limpiando datos existentes...'))
            CalificacionServicio.objects.all().delete()
            Incidencia.objects.all().delete()
            Ruta.objects.all().delete()
            Canje.objects.all().delete()
            Recompensa.objects.all().delete()
            Notificacion.objects.all().delete()
            Evidencia.objects.all().delete()
            Horario.objects.all().delete()
            Reporte.objects.all().delete()
            Usuario.objects.all().delete()
            Zona.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Datos limpiados'))

        # 1. CREAR ZONAS
        self.stdout.write('Creando zonas...')
        zonas_data = [
            {
                'nombre': 'Cusco (Cercado)',
                'codigo': 'ZC001',
                'descripcion': 'Centro Histórico y Cercado de Cusco',
                'geometria': {'type': 'Polygon', 'coordinates': [[[-71.98, -13.51], [-71.98, -13.52], [-71.97, -13.52], [-71.97, -13.51], [-71.98, -13.51]]]},
                'activa': True
            },
            {
                'nombre': 'Wanchaq',
                'codigo': 'ZN001',
                'descripcion': 'Distrito de Wanchaq - Cusco',
                'geometria': {'type': 'Polygon', 'coordinates': [[[-71.96, -13.52], [-71.96, -13.53], [-71.95, -13.53], [-71.95, -13.52], [-71.96, -13.52]]]},
                'activa': True
            },
            {
                'nombre': 'San Sebastián',
                'codigo': 'ZS001',
                'descripcion': 'Distrito de San Sebastián - Cusco',
                'geometria': {'type': 'Polygon', 'coordinates': [[[-71.94, -13.52], [-71.94, -13.53], [-71.93, -13.53], [-71.93, -13.52], [-71.94, -13.52]]]},
                'activa': True
            },
            {
                'nombre': 'San Jerónimo',
                'codigo': 'ZE001',
                'descripcion': 'Distrito de San Jerónimo - Cusco',
                'geometria': {'type': 'Polygon', 'coordinates': [[[-71.90, -13.53], [-71.90, -13.54], [-71.89, -13.54], [-71.89, -13.53], [-71.90, -13.53]]]},
                'activa': True
            },
        ]
        
        zonas_creadas = {}
        for zona_data in zonas_data:
            zona, created = Zona.objects.get_or_create(
                codigo=zona_data['codigo'],
                defaults=zona_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'[OK] Zona creada: {zona.nombre}'))
            else:
                self.stdout.write(f'  Zona existente: {zona.nombre}')
            zonas_creadas[zona.codigo] = zona

        # 2. CREAR USUARIOS
        self.stdout.write('Creando usuarios...')
        usuarios_data = [
            {
                'email': 'admin@residuos.com',
                'username': 'admin',
                'nombre_completo': 'Administrador del Sistema',
                'password': make_password('admin123'),
                'rol': 'admin',
                'is_staff': True,
                'is_superuser': True,
                'zona': zonas_creadas.get('ZC001'),
                'telefono': '+1234567890'
            },
            {
                'email': 'ciudadano1@residuos.com',
                'username': 'ciudadano1',
                'nombre_completo': 'Juan Pérez',
                'password': make_password('pass123'),
                'rol': 'ciudadano',
                'zona': zonas_creadas.get('ZC001'),
                'telefono': '+1111111111'
            },
            {
                'email': 'ciudadano2@residuos.com',
                'username': 'ciudadano2',
                'nombre_completo': 'María García',
                'password': make_password('pass123'),
                'rol': 'ciudadano',
                'zona': zonas_creadas.get('ZN001'),
                'telefono': '+2222222222'
            },
            {
                'email': 'ciudadano3@residuos.com',
                'username': 'ciudadano3',
                'nombre_completo': 'Carlos López',
                'password': make_password('pass123'),
                'rol': 'ciudadano',
                'zona': zonas_creadas.get('ZS001'),
                'telefono': '+3333333333'
            },
            {
                'email': 'supervisor@residuos.com',
                'username': 'supervisor',
                'nombre_completo': 'Supervisor de Zona',
                'password': make_password('pass123'),
                'rol': 'admin',
                'zona': zonas_creadas.get('ZE001'),
                'telefono': '+9999999999'
            },
            {
                'email': 'recolector@residuos.com',
                'username': 'recolector',
                'nombre_completo': 'Recolector de Prueba',
                'password': make_password('pass123'),
                'rol': 'recolector',
                'zona': zonas_creadas.get('ZC001'),
                'telefono': '+51987654321'
            },
        ]
        
        usuarios_creados = {}
        for usuario_data in usuarios_data:
            usuario, created = Usuario.objects.get_or_create(
                email=usuario_data['email'],
                defaults=usuario_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'[OK] Usuario creado: {usuario.nombre_completo}'))
            else:
                self.stdout.write(f'  Usuario existente: {usuario.nombre_completo}')
            usuarios_creados[usuario.email] = usuario

        # 3. CREAR HORARIOS
        self.stdout.write('Creando horarios...')
        horarios_data = [
            # Zona Centro
            {
                'zona_codigo': 'ZC001',
                'dia': 'lunes',
                'hora_inicio': time(8, 0),
                'hora_fin': time(12, 0),
                'tipos_residuo': ['orgánico', 'papel']
            },
            {
                'zona_codigo': 'ZC001',
                'dia': 'miercoles',
                'hora_inicio': time(14, 0),
                'hora_fin': time(18, 0),
                'tipos_residuo': ['plástico', 'vidrio']
            },
            {
                'zona_codigo': 'ZC001',
                'dia': 'viernes',
                'hora_inicio': time(8, 0),
                'hora_fin': time(12, 0),
                'tipos_residuo': ['metal', 'electrónico']
            },
            # Zona Norte
            {
                'zona_codigo': 'ZN001',
                'dia': 'martes',
                'hora_inicio': time(8, 0),
                'hora_fin': time(12, 0),
                'tipos_residuo': ['orgánico', 'papel']
            },
            {
                'zona_codigo': 'ZN001',
                'dia': 'jueves',
                'hora_inicio': time(14, 0),
                'hora_fin': time(18, 0),
                'tipos_residuo': ['plástico', 'vidrio']
            },
            # Zona Sur
            {
                'zona_codigo': 'ZS001',
                'dia': 'lunes',
                'hora_inicio': time(14, 0),
                'hora_fin': time(18, 0),
                'tipos_residuo': ['orgánico', 'papel']
            },
            {
                'zona_codigo': 'ZS001',
                'dia': 'miercoles',
                'hora_inicio': time(8, 0),
                'hora_fin': time(12, 0),
                'tipos_residuo': ['plástico', 'metal']
            },
            # Zona Este
            {
                'zona_codigo': 'ZE001',
                'dia': 'martes',
                'hora_inicio': time(14, 0),
                'hora_fin': time(18, 0),
                'tipos_residuo': ['orgánico', 'vidrio']
            },
            {
                'zona_codigo': 'ZE001',
                'dia': 'viernes',
                'hora_inicio': time(14, 0),
                'hora_fin': time(18, 0),
                'tipos_residuo': ['papel', 'cartón']
            },
        ]
        
        horarios_creados = 0
        for horario_data in horarios_data:
            zona_codigo = horario_data.pop('zona_codigo')
            zona = zonas_creadas.get(zona_codigo)
            if zona:
                horario, created = Horario.objects.get_or_create(
                    zona=zona,
                    dia=horario_data['dia'],
                    hora_inicio=horario_data['hora_inicio'],
                    defaults=horario_data
                )
                if created:
                    horarios_creados += 1

        if horarios_creados > 0:
            self.stdout.write(self.style.SUCCESS(f'[OK] {horarios_creados} horarios creados'))
        else:
            self.stdout.write('  Todos los horarios ya existen')

        # 4. CREAR REPORTES DE PRUEBA
        self.stdout.write('Creando reportes de ejemplo...')
        reportes_data = [
            {
                'usuario': usuarios_creados.get('ciudadano1@residuos.com'),
                'zona': zonas_creadas.get('ZC001'),
                'descripcion': 'Basura acumulada en la calle principal',
                'foto_url': 'https://via.placeholder.com/400',
                'estado': 'nuevo'
            },
            {
                'usuario': usuarios_creados.get('ciudadano2@residuos.com'),
                'zona': zonas_creadas.get('ZN001'),
                'descripcion': 'Contenedor roto que necesita reemplazo',
                'foto_url': 'https://via.placeholder.com/400',
                'estado': 'en_revision'
            },
            {
                'usuario': usuarios_creados.get('ciudadano3@residuos.com'),
                'zona': zonas_creadas.get('ZS001'),
                'descripcion': 'Problema de recolección en horario nocturno',
                'foto_url': 'https://via.placeholder.com/400',
                'estado': 'resuelto',
                'comentario_admin': 'Se realizó la recolección el mismo día'
            },
        ]
        
        reportes_creados = 0
        for reporte_data in reportes_data:
            if reporte_data['usuario'] and reporte_data['zona']:
                reporte, created = Reporte.objects.get_or_create(
                    usuario=reporte_data['usuario'],
                    zona=reporte_data['zona'],
                    descripcion=reporte_data['descripcion'],
                    defaults={k: v for k, v in reporte_data.items() if k not in ['usuario', 'zona', 'descripcion']}
                )
                if created:
                    reportes_creados += 1

        if reportes_creados > 0:
            self.stdout.write(self.style.SUCCESS(f'[OK] {reportes_creados} reportes creados'))
        else:
            self.stdout.write('  Todos los reportes ya existen')

        # 5. CREAR RECOMPENSAS
        self.stdout.write('Creando recompensas...')
        recompensas_data = [
            {
                'nombre': 'Botella termica reutilizable',
                'descripcion': 'Acero inoxidable, 750 ml con aislante.',
                'puntos': 280,
                'categoria': 'Hogar',
                'imagen': 'gift',
                'stock': 15,
                'disponible': True
            },
            {
                'nombre': 'Bono para transporte urbano',
                'descripcion': 'Recarga digital para bus o corredor.',
                'puntos': 420,
                'categoria': 'Movilidad',
                'imagen': 'ticket',
                'stock': 30,
                'disponible': True
            },
            {
                'nombre': 'Kit de compostaje en casa',
                'descripcion': 'Incluye guia practica y mini compostera.',
                'puntos': 650,
                'categoria': 'Hogar',
                'imagen': 'sparkles',
                'stock': 8,
                'disponible': True
            },
            {
                'nombre': 'Tote bag de algodon organico',
                'descripcion': 'Bolsa reforzada para compras sin plastico.',
                'puntos': 220,
                'categoria': 'EcoModa',
                'imagen': 'shopping-bag',
                'stock': 25,
                'disponible': True
            },
            {
                'nombre': 'Entrada a ruta verde guiada',
                'descripcion': 'Experiencia local con enfoque ambiental.',
                'puntos': 780,
                'categoria': 'Experiencias',
                'imagen': 'map-pin',
                'stock': 5,
                'disponible': True
            },
            {
                'nombre': 'Pack de semillas nativas',
                'descripcion': 'Variedades andinas para tu huerto urbano.',
                'puntos': 180,
                'categoria': 'Hogar',
                'imagen': 'star',
                'stock': 50,
                'disponible': True
            },
        ]

        for recompensa_data in recompensas_data:
            recompensa, created = Recompensa.objects.get_or_create(
                nombre=recompensa_data['nombre'],
                defaults=recompensa_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'[OK] Recompensa creada: {recompensa.nombre}'))

        # 6. CREAR RUTAS, INCIDENCIAS Y CALIFICACIONES
        self.stdout.write('Creando rutas...')
        from datetime import date, timedelta
        hoy = date.today()
        manana = hoy + timedelta(days=1)
        recolector = usuarios_creados.get('recolector@residuos.com')
        ciudadano = usuarios_creados.get('ciudadano1@residuos.com')
        zona_centro = zonas_creadas.get('ZC001')
        zona_norte = zonas_creadas.get('ZN001')
        
        geometria_ruta_centro = [
            {"lat": -13.5168, "lng": -71.9785, "nombre": "Plaza de Armas (Punto A)"},
            {"lat": -13.5191, "lng": -71.9765, "nombre": "Santa Catalina (Punto B)"},
            {"lat": -13.5222, "lng": -71.9729, "nombre": "Qorikancha (Punto C)"}
        ]
        geometria_ruta_norte = [
            {"lat": -13.5241, "lng": -71.9688, "nombre": "Estacion Wanchaq (Punto A)"},
            {"lat": -13.5218, "lng": -71.9635, "nombre": "Av. Garcilaso (Punto B)"},
            {"lat": -13.5202, "lng": -71.9582, "nombre": "Oval Garcilaso (Punto C)"}
        ]
        
        if recolector and zona_centro and zona_norte:
            # Ruta completada
            ruta_completada, _ = Ruta.objects.get_or_create(
                recolector=recolector,
                zona=zona_centro,
                fecha=hoy - timedelta(days=1),
                hora_inicio=time(8, 0),
                hora_fin_estimada=time(11, 0),
                defaults={
                    'estado': Ruta.EstadoRuta.COMPLETADA,
                    'observaciones': 'Ruta completada sin novedades.',
                    'geometria_ruta': geometria_ruta_centro,
                }
            )
            
            # Ruta en progreso (hoy)
            ruta_hoy, _ = Ruta.objects.get_or_create(
                recolector=recolector,
                zona=zona_centro,
                fecha=hoy,
                hora_inicio=time(8, 0),
                hora_fin_estimada=time(12, 0),
                defaults={
                    'estado': Ruta.EstadoRuta.EN_PROGRESO,
                    'observaciones': 'En ejecucion actualmente.',
                    'geometria_ruta': geometria_ruta_centro,
                }
            )

            # Ruta programada (mañana)
            ruta_manana, _ = Ruta.objects.get_or_create(
                recolector=recolector,
                zona=zona_norte,
                fecha=manana,
                hora_inicio=time(9, 0),
                hora_fin_estimada=time(13, 0),
                defaults={
                    'estado': Ruta.EstadoRuta.PROGRAMADA,
                    'observaciones': 'Ruta programada para manana.',
                    'geometria_ruta': geometria_ruta_norte,
                }
            )

            self.stdout.write(self.style.SUCCESS('[OK] Rutas de prueba creadas'))

            # Crear una calificacion para la ruta completada
            if ciudadano:
                CalificacionServicio.objects.get_or_create(
                    ciudadano=ciudadano,
                    ruta=ruta_completada,
                    defaults={
                        'estrellas': 5,
                        'comentario': 'Excelente servicio, muy punctual.'
                    }
                )
                self.stdout.write(self.style.SUCCESS('[OK] Calificacion de servicio creada'))

            # Crear incidencias de prueba
            Incidencia.objects.get_or_create(
                recolector=recolector,
                tipo='Vehiculo averiado',
                defaults={
                    'descripcion': 'Falla mecanica en el motor del camion recolector, se requirio apoyo.',
                    'estado': Incidencia.EstadoIncidencia.RESUELTA,
                    'respuesta_admin': 'Se envio unidad de auxilio mecanico.'
                }
            )
            Incidencia.objects.get_or_create(
                recolector=recolector,
                tipo='Via bloqueada',
                defaults={
                    'descripcion': 'Calle cerrada por obras en la Av. Tacna, desvio tomado.',
                    'estado': Incidencia.EstadoIncidencia.PENDIENTE
                }
            )
            self.stdout.write(self.style.SUCCESS('[OK] Incidencias de prueba creadas'))

        self.stdout.write(self.style.SUCCESS('\n*** Datos de prueba agregados exitosamente'))
        self.stdout.write('\n=== Credenciales de administrador:')
        self.stdout.write('   Email: admin@residuos.com')
        self.stdout.write('   Contrasena: admin123')
