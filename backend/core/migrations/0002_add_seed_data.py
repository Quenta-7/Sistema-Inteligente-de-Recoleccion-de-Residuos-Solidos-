# Generated migration to add seed data

from django.db import migrations
from django.contrib.auth.hashers import make_password
from datetime import time

def add_seed_data(apps, schema_editor):
    """Agrega datos iniciales a las tablas"""
    Zona = apps.get_model('core', 'Zona')
    Usuario = apps.get_model('core', 'Usuario')
    Horario = apps.get_model('core', 'Horario')
    
    # 1. CREAR ZONAS (Cuadrantes San Jerónimo)
    zonas_data = [
        {
            'nombre': 'Cuadrante Este – Urb. Larapa Residencial & Larapa Grande & Pata Pata',
            'codigo': 'SJE001',
            'descripcion': 'Sector Este: Urb. Larapa Residencial, Larapa Grande y Pata Pata',
            'geometria': {'type': 'Polygon', 'coordinates': [[[-71.8740, -13.5500], [-71.8740, -13.5560], [-71.8600, -13.5560], [-71.8600, -13.5500], [-71.8740, -13.5500]]]},
            'activa': True
        },
        {
            'nombre': 'Cuadrante Noreste – Urb. Versalles & Kantu & Huayna Picol Norte',
            'codigo': 'SJE002',
            'descripcion': 'Sector Noreste: Urb. Versalles, Sector Kantu de Larapa, APV Huayna Picol Norte',
            'geometria': {'type': 'Polygon', 'coordinates': [[[-71.8740, -13.5410], [-71.8740, -13.5500], [-71.8600, -13.5500], [-71.8600, -13.5410], [-71.8740, -13.5410]]]},
            'activa': True
        },
        {
            'nombre': 'Cuadrante Noroeste – Santa Rosa Alta & Mirador & Conchacalla Alta',
            'codigo': 'SJE003',
            'descripcion': 'Sector Noroeste: Urb. Santa Rosa Alta, APV Pampa Chanca Alta, APV Mirador Norte y Conchacalla Alta',
            'geometria': {'type': 'Polygon', 'coordinates': [[[-71.8860, -13.5350], [-71.8860, -13.5500], [-71.8740, -13.5500], [-71.8740, -13.5350], [-71.8860, -13.5350]]]},
            'activa': True
        },
        {
            'nombre': 'Cuadrante Suroeste – Pillao Matao Sur & Chimpahuaylla Sur & Retamales Sur',
            'codigo': 'SJE004',
            'descripcion': 'Sector Suroeste: Sector Chimpahuaylla Sur, Pillao Matao Sur, APV Los Retamales Sur',
            'geometria': {'type': 'Polygon', 'coordinates': [[[-71.8860, -13.5500], [-71.8860, -13.5580], [-71.8740, -13.5580], [-71.8740, -13.5500], [-71.8860, -13.5500]]]},
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
            'zona': zonas_creadas.get('SJE001'),
            'telefono': '+51984123456'
        },
        {
            'email': 'ciudadano1@residuos.com',
            'username': 'ciudadano1',
            'nombre_completo': 'Juan Pérez',
            'password': make_password('pass123'),
            'rol': 'ciudadano',
            'zona': zonas_creadas.get('SJE001'),
            'telefono': '+51951111111'
        },
        {
            'email': 'ciudadano2@residuos.com',
            'username': 'ciudadano2',
            'nombre_completo': 'María García',
            'password': make_password('pass123'),
            'rol': 'ciudadano',
            'zona': zonas_creadas.get('SJE002'),
            'telefono': '+51952222222'
        },
        {
            'email': 'ciudadano3@residuos.com',
            'username': 'ciudadano3',
            'nombre_completo': 'Carlos López',
            'password': make_password('pass123'),
            'rol': 'ciudadano',
            'zona': zonas_creadas.get('SJE003'),
            'telefono': '+51953333333'
        },
        {
            'email': 'supervisor@residuos.com',
            'username': 'supervisor',
            'nombre_completo': 'Supervisor San Jerónimo',
            'password': make_password('pass123'),
            'rol': 'admin',
            'zona': zonas_creadas.get('SJE004'),
            'telefono': '+51959999999'
        },
    ]
    
    for usuario_data in usuarios_data:
        Usuario.objects.get_or_create(
            email=usuario_data['email'],
            defaults=usuario_data
        )
    
    # 3. CREAR HORARIOS
    horarios_data = [
        # SJE001 - Cuadrante Este
        {
            'zona_codigo': 'SJE001',
            'dia': 'lunes',
            'hora_inicio': time(7, 0),
            'hora_fin': time(10, 0),
            'tipos_residuo': ['Residuos Generales']
        },
        {
            'zona_codigo': 'SJE001',
            'dia': 'miercoles',
            'hora_inicio': time(15, 0),
            'hora_fin': time(18, 0),
            'tipos_residuo': ['Residuos Generales']
        },
        {
            'zona_codigo': 'SJE001',
            'dia': 'viernes',
            'hora_inicio': time(7, 0),
            'hora_fin': time(10, 0),
            'tipos_residuo': ['Residuos Generales']
        },
        # SJE002 - Cuadrante Noreste
        {
            'zona_codigo': 'SJE002',
            'dia': 'lunes',
            'hora_inicio': time(7, 0),
            'hora_fin': time(10, 0),
            'tipos_residuo': ['Residuos Generales']
        },
        {
            'zona_codigo': 'SJE002',
            'dia': 'miercoles',
            'hora_inicio': time(15, 0),
            'hora_fin': time(18, 0),
            'tipos_residuo': ['Residuos Generales']
        },
        # SJE003 - Cuadrante Noroeste
        {
            'zona_codigo': 'SJE003',
            'dia': 'martes',
            'hora_inicio': time(7, 0),
            'hora_fin': time(10, 0),
            'tipos_residuo': ['Residuos Generales']
        },
        {
            'zona_codigo': 'SJE003',
            'dia': 'jueves',
            'hora_inicio': time(15, 0),
            'hora_fin': time(18, 0),
            'tipos_residuo': ['Residuos Generales']
        },
        # SJE004 - Cuadrante Suroeste
        {
            'zona_codigo': 'SJE004',
            'dia': 'martes',
            'hora_inicio': time(7, 0),
            'hora_fin': time(10, 0),
            'tipos_residuo': ['Residuos Generales']
        },
        {
            'zona_codigo': 'SJE004',
            'dia': 'jueves',
            'hora_inicio': time(15, 0),
            'hora_fin': time(18, 0),
            'tipos_residuo': ['Residuos Generales']
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
