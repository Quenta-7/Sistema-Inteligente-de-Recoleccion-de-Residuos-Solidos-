# Generated migration to add seed data

from django.db import migrations
from django.contrib.auth.hashers import make_password
from datetime import time

def add_seed_data(apps, schema_editor):
    """Agrega datos iniciales a las tablas"""
    Zona = apps.get_model('core', 'Zona')
    Usuario = apps.get_model('core', 'Usuario')
    Horario = apps.get_model('core', 'Horario')
    
    # 1. CREAR ZONAS
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
        zonas_creadas[zona.codigo] = zona
    
    # 2. CREAR USUARIOS
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
    
    for usuario_data in usuarios_data:
        Usuario.objects.get_or_create(
            email=usuario_data['email'],
            defaults=usuario_data
        )
    
    # 3. CREAR HORARIOS
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
    
    for horario_data in horarios_data:
        zona_codigo = horario_data.pop('zona_codigo')
        zona = zonas_creadas.get(zona_codigo)
        if zona:
            Horario.objects.get_or_create(
                zona=zona,
                dia=horario_data['dia'],
                hora_inicio=horario_data['hora_inicio'],
                defaults=horario_data
            )

def remove_seed_data(apps, schema_editor):
    """Elimina los datos de prueba (reversible)"""
    Zona = apps.get_model('core', 'Zona')
    Usuario = apps.get_model('core', 'Usuario')
    Horario = apps.get_model('core', 'Horario')
    
    # Elimina en orden inverso para respetar relaciones
    Horario.objects.all().delete()
    Usuario.objects.all().delete()
    Zona.objects.all().delete()

class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(add_seed_data, remove_seed_data),
    ]
