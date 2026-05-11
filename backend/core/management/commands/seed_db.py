from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from datetime import time
from core.models import Zona, Usuario, Horario, Reporte

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
            Horario.objects.all().delete()
            Reporte.objects.all().delete()
            Usuario.objects.all().delete()
            Zona.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Datos limpiados'))

        # 1. CREAR ZONAS
        self.stdout.write('Creando zonas...')
        zonas_data = [
            {
                'nombre': 'Zona Centro',
                'codigo': 'ZC001',
                'descripcion': 'Zona del centro histórico de la ciudad',
                'geometria': {'type': 'Polygon', 'coordinates': [[[-74.0, 40.7], [-74.0, 40.8], [-73.9, 40.8], [-73.9, 40.7], [-74.0, 40.7]]]},
                'activa': True
            },
            {
                'nombre': 'Zona Norte',
                'codigo': 'ZN001',
                'descripcion': 'Zona norte de la ciudad',
                'geometria': {'type': 'Polygon', 'coordinates': [[[-74.0, 40.8], [-74.0, 40.9], [-73.9, 40.9], [-73.9, 40.8], [-74.0, 40.8]]]},
                'activa': True
            },
            {
                'nombre': 'Zona Sur',
                'codigo': 'ZS001',
                'descripcion': 'Zona sur de la ciudad',
                'geometria': {'type': 'Polygon', 'coordinates': [[[-74.0, 40.6], [-74.0, 40.7], [-73.9, 40.7], [-73.9, 40.6], [-74.0, 40.6]]]},
                'activa': True
            },
            {
                'nombre': 'Zona Este',
                'codigo': 'ZE001',
                'descripcion': 'Zona este de la ciudad',
                'geometria': {'type': 'Polygon', 'coordinates': [[[-73.9, 40.7], [-73.9, 40.8], [-73.8, 40.8], [-73.8, 40.7], [-73.9, 40.7]]]},
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
                self.stdout.write(self.style.SUCCESS(f'✓ Zona creada: {zona.nombre}'))
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
        ]
        
        usuarios_creados = {}
        for usuario_data in usuarios_data:
            usuario, created = Usuario.objects.get_or_create(
                email=usuario_data['email'],
                defaults=usuario_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Usuario creado: {usuario.nombre_completo}'))
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
            self.stdout.write(self.style.SUCCESS(f'✓ {horarios_creados} horarios creados'))
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
            self.stdout.write(self.style.SUCCESS(f'✓ {reportes_creados} reportes creados'))
        else:
            self.stdout.write('  Todos los reportes ya existen')

        self.stdout.write(self.style.SUCCESS('\n✅ Datos de prueba agregados exitosamente'))
        self.stdout.write('\n📋 Credenciales de administrador:')
        self.stdout.write('   Email: admin@residuos.com')
        self.stdout.write('   Contraseña: admin123')
