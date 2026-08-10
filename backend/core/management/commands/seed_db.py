from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from datetime import time
from core.models import Zona, Usuario, Horario, Reporte, Evidencia, Notificacion, Recompensa, Canje, Ruta, Incidencia, CalificacionServicio


class Command(BaseCommand):
    help = 'Agregar datos de prueba (seed) a la base de datos - Distrito San Jerónimo, Cusco'

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

        # 1. CREAR ZONAS (Sectores/Urbanizaciones del Distrito San Jerónimo)
        self.stdout.write('Creando sectores/zonas de San Jerónimo...')
        zonas_data = [
            {
                'nombre': 'Cuadrante Este – Urb. Larapa Residencial & Larapa Grande & Pata Pata',
                'codigo': 'SJE001',
                'descripcion': 'Sector Este: Urb. Larapa Residencial, Larapa Grande y Pata Pata',
                'geometria': {
                    'type': 'Polygon',
                    'coordinates': [[
                        [-71.8740, -13.5500],
                        [-71.8740, -13.5560],
                        [-71.8600, -13.5560],
                        [-71.8600, -13.5500],
                        [-71.8740, -13.5500]
                    ]]
                },
                'activa': True
            },
            {
                'nombre': 'Cuadrante Noreste – Urb. Versalles & Kantu & Huayna Picol Norte',
                'codigo': 'SJE002',
                'descripcion': 'Sector Noreste: Urb. Versalles, Sector Kantu de Larapa, APV Huayna Picol Norte',
                'geometria': {
                    'type': 'Polygon',
                    'coordinates': [[
                        [-71.8740, -13.5410],
                        [-71.8740, -13.5500],
                        [-71.8600, -13.5500],
                        [-71.8600, -13.5410],
                        [-71.8740, -13.5410]
                    ]]
                },
                'activa': True
            },
            {
                'nombre': 'Cuadrante Noroeste – Santa Rosa Alta & Mirador & Conchacalla Alta',
                'codigo': 'SJE003',
                'descripcion': 'Sector Noroeste: Urb. Santa Rosa Alta, APV Pampa Chanca Alta, APV Mirador Norte y Conchacalla Alta',
                'geometria': {
                    'type': 'Polygon',
                    'coordinates': [[
                        [-71.8860, -13.5350],
                        [-71.8860, -13.5500],
                        [-71.8740, -13.5500],
                        [-71.8740, -13.5350],
                        [-71.8860, -13.5350]
                    ]]
                },
                'activa': True
            },
            {
                'nombre': 'Cuadrante Suroeste – Pillao Matao Sur & Chimpahuaylla Sur & Retamales Sur',
                'codigo': 'SJE004',
                'descripcion': 'Sector Suroeste: Sector Chimpahuaylla Sur, Pillao Matao Sur, APV Los Retamales Sur',
                'geometria': {
                    'type': 'Polygon',
                    'coordinates': [[
                        [-71.8860, -13.5500],
                        [-71.8860, -13.5580],
                        [-71.8740, -13.5580],
                        [-71.8740, -13.5500],
                        [-71.8860, -13.5500]
                    ]]
                },
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
                'dni': '10000001',
                'is_staff': True,
                'is_superuser': True,
                'zona': zonas_creadas.get('SJE001'),
                'telefono': '+51984123456'
            },
            {
                'email': 'ciudadano1@residuos.com',
                'username': 'ciudadano1',
                'nombre_completo': 'Juan Pérez Quispe',
                'password': make_password('pass123'),
                'rol': 'ciudadano',
                'dni': '20000001',
                'zona': zonas_creadas.get('SJE001'),
                'telefono': '+51951111111'
            },
            {
                'email': 'ciudadano2@residuos.com',
                'username': 'ciudadano2',
                'nombre_completo': 'María García Mamani',
                'password': make_password('pass123'),
                'rol': 'ciudadano',
                'dni': '20000002',
                'zona': zonas_creadas.get('SJE002'),
                'telefono': '+51952222222'
            },
            {
                'email': 'ciudadano3@residuos.com',
                'username': 'ciudadano3',
                'nombre_completo': 'Carlos López Ccoa',
                'password': make_password('pass123'),
                'rol': 'ciudadano',
                'dni': '20000003',
                'zona': zonas_creadas.get('SJE003'),
                'telefono': '+51953333333'
            },
            {
                'email': 'supervisor@residuos.com',
                'username': 'supervisor',
                'nombre_completo': 'Supervisor San Jerónimo',
                'password': make_password('pass123'),
                'rol': 'admin',
                'dni': '30000001',
                'zona': zonas_creadas.get('SJE004'),
                'telefono': '+51959999999'
            },
            {
                'email': 'recolector@residuos.com',
                'username': 'recolector',
                'nombre_completo': 'Recolector 01 – Ing. Marco Antonio Quispe (Placa: E1M-908)',
                'password': make_password('pass123'),
                'rol': 'recolector',
                'dni': '40000001',
                'zona': zonas_creadas.get('SJE001'),
                'telefono': '+51987654321'
            },
            {
                'email': 'recolector2@residuos.com',
                'username': 'recolector2',
                'nombre_completo': 'Recolector 02 – Carlos Alberto Huamán (Placa: E1M-909)',
                'password': make_password('pass123'),
                'rol': 'recolector',
                'dni': '40000002',
                'zona': zonas_creadas.get('SJE001'),
                'telefono': '+51987654322'
            },
            {
                'email': 'recolector3@residuos.com',
                'username': 'recolector3',
                'nombre_completo': 'Recolector 03 – Juan Carlos Mamani (Placa: E2M-745)',
                'password': make_password('pass123'),
                'rol': 'recolector',
                'dni': '40000003',
                'zona': zonas_creadas.get('SJE002'),
                'telefono': '+51987654323'
            },
            {
                'email': 'recolector4@residuos.com',
                'username': 'recolector4',
                'nombre_completo': 'Recolector 04 – Percy Alexander Cutipa (Placa: E2M-746)',
                'password': make_password('pass123'),
                'rol': 'recolector',
                'dni': '40000004',
                'zona': zonas_creadas.get('SJE002'),
                'telefono': '+51987654324'
            },
            {
                'email': 'recolector5@residuos.com',
                'username': 'recolector5',
                'nombre_completo': 'Recolector 05 – Roberto Mendoza (Placa: E3M-512)',
                'password': make_password('pass123'),
                'rol': 'recolector',
                'dni': '40000005',
                'zona': zonas_creadas.get('SJE003'),
                'telefono': '+51987654325'
            },
            {
                'email': 'recolector6@residuos.com',
                'username': 'recolector6',
                'nombre_completo': 'Recolector 06 – Víctor Raúl Champi (Placa: E3M-513)',
                'password': make_password('pass123'),
                'rol': 'recolector',
                'dni': '40000006',
                'zona': zonas_creadas.get('SJE003'),
                'telefono': '+51987654326'
            },
            {
                'email': 'recolector7@residuos.com',
                'username': 'recolector7',
                'nombre_completo': 'Recolector 07 – David Ramos V. (Placa: E4M-902)',
                'password': make_password('pass123'),
                'rol': 'recolector',
                'dni': '40000007',
                'zona': zonas_creadas.get('SJE004'),
                'telefono': '+51987654327'
            },
            {
                'email': 'recolector8@residuos.com',
                'username': 'recolector8',
                'nombre_completo': 'Recolector 08 – José Luis Condori (Placa: E4M-903)',
                'password': make_password('pass123'),
                'rol': 'recolector',
                'dni': '40000008',
                'zona': zonas_creadas.get('SJE004'),
                'telefono': '+51987654328'
            },
        ]

        usuarios_creados = {}
        for usuario_data in usuarios_data:
            email = usuario_data['email']
            username = usuario_data.get('username')
            usuario = Usuario.objects.filter(email=email).first()
            if not usuario and username:
                usuario = Usuario.objects.filter(username=username).first()

            if not usuario:
                usuario = Usuario.objects.create(**usuario_data)
                self.stdout.write(self.style.SUCCESS(f'[OK] Usuario creado: {usuario.nombre_completo}'))
            else:
                self.stdout.write(f'  Usuario existente: {usuario.nombre_completo}')

            usuarios_creados[email] = usuario

        # 3. CREAR HORARIOS
        # Un único camión recolector cubre todo el distrito San Jerónimo en recorrido semanal.
        # Tipo de residuo: Residuos Generales (recolección general, sin separación por tipo).
        self.stdout.write('Creando horarios de recolección San Jerónimo...')
        horarios_data = [
            # Lunes: Cuadrante Este (SJE001) — turno mañana
            {
                'zona_codigo': 'SJE001',
                'dia': 'lunes',
                'hora_inicio': time(7, 0),
                'hora_fin': time(10, 0),
                'tipos_residuo': ['Residuos Generales']
            },
            # Lunes: Cuadrante Noreste (SJE002) — turno mañana
            {
                'zona_codigo': 'SJE002',
                'dia': 'lunes',
                'hora_inicio': time(7, 0),
                'hora_fin': time(10, 0),
                'tipos_residuo': ['Residuos Generales']
            },
            # Martes: Cuadrante Noroeste (SJE003) — turno mañana
            {
                'zona_codigo': 'SJE003',
                'dia': 'martes',
                'hora_inicio': time(7, 0),
                'hora_fin': time(10, 0),
                'tipos_residuo': ['Residuos Generales']
            },
            # Martes: Cuadrante Suroeste (SJE004) — turno mañana
            {
                'zona_codigo': 'SJE004',
                'dia': 'martes',
                'hora_inicio': time(7, 0),
                'hora_fin': time(10, 0),
                'tipos_residuo': ['Residuos Generales']
            },
            # Miércoles: Cuadrante Este (SJE001) — segundo recorrido, turno tarde
            {
                'zona_codigo': 'SJE001',
                'dia': 'miercoles',
                'hora_inicio': time(15, 0),
                'hora_fin': time(18, 0),
                'tipos_residuo': ['Residuos Generales']
            },
            # Miércoles: Cuadrante Noreste (SJE002) — segundo recorrido, turno tarde
            {
                'zona_codigo': 'SJE002',
                'dia': 'miercoles',
                'hora_inicio': time(15, 0),
                'hora_fin': time(18, 0),
                'tipos_residuo': ['Residuos Generales']
            },
            # Jueves: Cuadrante Noroeste (SJE003) — segundo recorrido, turno tarde
            {
                'zona_codigo': 'SJE003',
                'dia': 'jueves',
                'hora_inicio': time(15, 0),
                'hora_fin': time(18, 0),
                'tipos_residuo': ['Residuos Generales']
            },
            # Jueves: Cuadrante Suroeste (SJE004) — segundo recorrido, turno tarde
            {
                'zona_codigo': 'SJE004',
                'dia': 'jueves',
                'hora_inicio': time(15, 0),
                'hora_fin': time(18, 0),
                'tipos_residuo': ['Residuos Generales']
            },
            # Viernes: Cuadrante Este (SJE001) + Noroeste (SJE003) — turno mañana
            {
                'zona_codigo': 'SJE001',
                'dia': 'viernes',
                'hora_inicio': time(7, 0),
                'hora_fin': time(10, 0),
                'tipos_residuo': ['Residuos Generales']
            },
            {
                'zona_codigo': 'SJE003',
                'dia': 'viernes',
                'hora_inicio': time(7, 0),
                'hora_fin': time(10, 0),
                'tipos_residuo': ['Residuos Generales']
            },
            # Sábado: Cuadrante Noreste (SJE002) + Suroeste (SJE004) — turno mañana
            {
                'zona_codigo': 'SJE002',
                'dia': 'sabado',
                'hora_inicio': time(7, 0),
                'hora_fin': time(10, 0),
                'tipos_residuo': ['Residuos Generales']
            },
            {
                'zona_codigo': 'SJE004',
                'dia': 'sabado',
                'hora_inicio': time(7, 0),
                'hora_fin': time(10, 0),
                'tipos_residuo': ['Residuos Generales']
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
                'zona': zonas_creadas.get('SJE001'),
                'descripcion': 'Basura acumulada frente a la Plaza Principal de San Jerónimo',
                'foto_url': 'https://via.placeholder.com/400',
                'estado': 'nuevo'
            },
            {
                'usuario': usuarios_creados.get('ciudadano2@residuos.com'),
                'zona': zonas_creadas.get('SJE002'),
                'descripcion': 'Contenedor desbordado en Jr. Simón Bolívar, Urb. Kennedy',
                'foto_url': 'https://via.placeholder.com/400',
                'estado': 'en_revision'
            },
            {
                'usuario': usuarios_creados.get('ciudadano3@residuos.com'),
                'zona': zonas_creadas.get('SJE003'),
                'descripcion': 'El camión no pasó en el horario indicado por Urb. Los Incas',
                'foto_url': 'https://via.placeholder.com/400',
                'estado': 'resuelto',
                'comentario_admin': 'Se reprogramó la recolección al día siguiente'
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
        self.stdout.write('Creando rutas San Jerónimo...')
        from datetime import date, timedelta
        hoy = date.today()
        manana = hoy + timedelta(days=1)
        recolector = usuarios_creados.get('recolector@residuos.com')
        ciudadano = usuarios_creados.get('ciudadano1@residuos.com')
        zona_central = zonas_creadas.get('SJE001')
        zona_kennedy = zonas_creadas.get('SJE002')

        # Helper para ruteo por calles usando OSRM
        import urllib.request, json
        def get_street_route(waypoints):
            try:
                coords_str = ';'.join([f"{w['lng']},{w['lat']}" for w in waypoints])
                url = f"https://router.project-osrm.org/route/v1/driving/{coords_str}?overview=full&geometries=geojson"
                req = urllib.request.urlopen(url, timeout=3)
                data = json.loads(req.read().decode())
                street_pts = data['routes'][0]['geometry']['coordinates']
                return [{'lat': round(pt[1], 6), 'lng': round(pt[0], 6), 'nombre': f"Punto {i+1}"} for i, pt in enumerate(street_pts)]
            except Exception:
                return waypoints

        # Ruta SJ-01: Cuadrante Este – Urb. Larapa Residencial & Larapa Grande & Pata Pata
        waypoints_sj01 = [
            {"lat": -13.5510, "lng": -71.8740, "nombre": "Salida: Base Operativa Municipal"},
            {"lat": -13.5525, "lng": -71.8705, "nombre": "Calle Los Álamos (Larapa Residencial)"},
            {"lat": -13.5515, "lng": -71.8680, "nombre": "Av. Larapa Central"},
            {"lat": -13.5525, "lng": -71.8655, "nombre": "Urb. Larapa Grande"},
            {"lat": -13.5545, "lng": -71.8620, "nombre": "Sector Pata Pata Residencial"},
            {"lat": -13.5505, "lng": -71.8715, "nombre": "Retorno: Av. Universidad"},
            {"lat": -13.5510, "lng": -71.8740, "nombre": "Retorno: Base Operativa Municipal"}
        ]
        geometria_ruta_sj01 = get_street_route(waypoints_sj01)

        # Ruta SJ-02: Cuadrante Noreste (Arriba a la Derecha) – Versalles & Kantu & Huayna Picol Norte
        waypoints_sj02 = [
            {"lat": -13.5510, "lng": -71.8740, "nombre": "Salida: Base Operativa Municipal"},
            {"lat": -13.5480, "lng": -71.8680, "nombre": "Sector Kantu de Larapa"},
            {"lat": -13.5450, "lng": -71.8650, "nombre": "Urb. Versalles (Arriba Derecha)"},
            {"lat": -13.5415, "lng": -71.8620, "nombre": "APV Huayna Picol Norte"},
            {"lat": -13.5440, "lng": -71.8660, "nombre": "APV San Antonio Norte"},
            {"lat": -13.5490, "lng": -71.8710, "nombre": "Av. Collana Norte"},
            {"lat": -13.5510, "lng": -71.8740, "nombre": "Retorno: Base Operativa Municipal"}
        ]
        geometria_ruta_sj02 = get_street_route(waypoints_sj02)

        # Ruta SJ-03: Cuadrante Noroeste (Arriba a la Izquierda) – Santa Rosa Alta & Mirador & Conchacalla Alta
        waypoints_sj03 = [
            {"lat": -13.5510, "lng": -71.8740, "nombre": "Salida: Base Operativa Municipal"},
            {"lat": -13.5450, "lng": -71.8785, "nombre": "Urb. Santa Rosa Alta"},
            {"lat": -13.5420, "lng": -71.8800, "nombre": "APV Pampa Chanca Alta"},
            {"lat": -13.5380, "lng": -71.8815, "nombre": "APV Mirador San Jerónimo (Laderas Altas)"},
            {"lat": -13.5400, "lng": -71.8835, "nombre": "APV Conchacalla Alta"},
            {"lat": -13.5470, "lng": -71.8780, "nombre": "Bajada Conchacalla"},
            {"lat": -13.5510, "lng": -71.8740, "nombre": "Retorno: Base Operativa Municipal"}
        ]
        geometria_ruta_sj03 = get_street_route(waypoints_sj03)

        # Ruta SJ-04: Cuadrante Suroeste (Abajo a la Izquierda) – Pillao Matao Sur & Chimpahuaylla Sur & Retamales Sur
        waypoints_sj04 = [
            {"lat": -13.5510, "lng": -71.8740, "nombre": "Salida: Base Operativa Municipal"},
            {"lat": -13.5525, "lng": -71.8770, "nombre": "Sector Chimpahuaylla Sur"},
            {"lat": -13.5535, "lng": -71.8805, "nombre": "Pillao Matao Sur"},
            {"lat": -13.5545, "lng": -71.8830, "nombre": "APV Los Retamales Sur"},
            {"lat": -13.5560, "lng": -71.8860, "nombre": "Límite San Sebastián Sur"},
            {"lat": -13.5530, "lng": -71.8790, "nombre": "Retorno Av. Cusco Sur"},
            {"lat": -13.5510, "lng": -71.8740, "nombre": "Retorno: Base Operativa Municipal"}
        ]
        geometria_ruta_sj04 = get_street_route(waypoints_sj04)

        zona_este = zonas_creadas.get('SJE001')
        zona_noreste = zonas_creadas.get('SJE002')
        zona_noroeste = zonas_creadas.get('SJE003')
        zona_suroeste = zonas_creadas.get('SJE004')

        if recolector and zona_este and zona_noreste and zona_noroeste and zona_suroeste:
            # Ruta completada (SJ-01 ayer)
            ruta_completada, _ = Ruta.objects.get_or_create(
                recolector=recolector,
                zona=zona_este,
                fecha=hoy - timedelta(days=1),
                hora_inicio=time(7, 0),
                hora_fin_estimada=time(10, 0),
                defaults={
                    'estado': Ruta.EstadoRuta.COMPLETADA,
                    'observaciones': 'Ruta SJ-01 completada sin novedades. Cuadrante Este: Larapa Residencial → Larapa Grande → Pata Pata.',
                    'geometria_ruta': geometria_ruta_sj01,
                }
            )

            # Ruta en progreso (SJ-02 hoy)
            ruta_hoy, _ = Ruta.objects.get_or_create(
                recolector=recolector,
                zona=zona_noreste,
                fecha=hoy,
                hora_inicio=time(7, 0),
                hora_fin_estimada=time(10, 0),
                defaults={
                    'estado': Ruta.EstadoRuta.EN_PROGRESO,
                    'observaciones': 'Ruta SJ-02 en ejecución. Cuadrante Noreste: Versalles → Kantu → Huayna Picol Norte.',
                    'geometria_ruta': geometria_ruta_sj02,
                }
            )

            # Ruta programada (SJ-03 mañana)
            ruta_manana, _ = Ruta.objects.get_or_create(
                recolector=recolector,
                zona=zona_noroeste,
                fecha=manana,
                hora_inicio=time(7, 0),
                hora_fin_estimada=time(10, 0),
                defaults={
                    'estado': Ruta.EstadoRuta.PROGRAMADA,
                    'observaciones': 'Ruta SJ-03 programada. Cuadrante Noroeste: Santa Rosa Alta → Mirador → Conchacalla Alta.',
                    'geometria_ruta': geometria_ruta_sj03,
                }
            )

            # Ruta programada (SJ-04 pasado mañana)
            ruta_pasado_manana, _ = Ruta.objects.get_or_create(
                recolector=recolector,
                zona=zona_suroeste,
                fecha=manana + timedelta(days=1),
                hora_inicio=time(7, 0),
                hora_fin_estimada=time(10, 0),
                defaults={
                    'estado': Ruta.EstadoRuta.PROGRAMADA,
                    'observaciones': 'Ruta SJ-04 programada. Cuadrante Suroeste: Pillao Matao Sur → Chimpahuaylla Sur → Retamales Sur.',
                    'geometria_ruta': geometria_ruta_sj04,
                }
            )

            self.stdout.write(self.style.SUCCESS('[OK] Rutas San Jerónimo creadas (SJ-01 a SJ-04)'))

            # Calificación para la ruta completada
            if ciudadano:
                CalificacionServicio.objects.get_or_create(
                    ciudadano=ciudadano,
                    ruta=ruta_completada,
                    defaults={
                        'estrellas': 5,
                        'comentario': 'Excelente servicio, el camión pasó puntual por la Plaza Principal.'
                    }
                )
                self.stdout.write(self.style.SUCCESS('[OK] Calificacion de servicio creada'))

            # Incidencias de prueba
            Incidencia.objects.get_or_create(
                recolector=recolector,
                tipo='Vehiculo averiado',
                descripcion='Falla mecánica del camión recolector en Av. Evitamiento, San Jerónimo. Se requirió apoyo.',
                defaults={
                    'estado': Incidencia.EstadoIncidencia.RESUELTA,
                    'respuesta_admin': 'Se envió unidad de auxilio mecánico desde el municipio de San Jerónimo.'
                }
            )
            Incidencia.objects.get_or_create(
                recolector=recolector,
                tipo='Via bloqueada',
                descripcion='Jr. Cusco cerrado por obras de pavimentación. Se realizó desvío por Sector Conchacalla.',
                defaults={
                    'estado': Incidencia.EstadoIncidencia.PENDIENTE
                }
            )
            self.stdout.write(self.style.SUCCESS('[OK] Incidencias de prueba creadas'))

        # 7. CREAR EVIDENCIAS - EcoPuntos de Acopio en San Jerónimo
        self.stdout.write('Creando puntos de acopio (EcoPuntos) San Jerónimo...')
        zona_central_obj = zonas_creadas.get('SJE001')
        zona_noreste_obj = zonas_creadas.get('SJE002')
        zona_noroeste_obj = zonas_creadas.get('SJE003')
        ciudadano1 = usuarios_creados.get('ciudadano1@residuos.com')
        ciudadano2 = usuarios_creados.get('ciudadano2@residuos.com')
        ciudadano3 = usuarios_creados.get('ciudadano3@residuos.com')

        evidencias_data = [
            {
                'usuario': ciudadano1,
                'zona': zona_central_obj,
                'descripcion': 'Punto Acopio: Av. Larapa Central, Cuadrante Este',
                'tipo': 'reciclaje',
                'puntos_otorgados': 50,
                'estado': 'aprobado',
                'ubicacion': {
                    'lat': -13.5515,
                    'lng': -71.8680,
                    'direccion': 'Av. Larapa Central, Urb. Larapa, San Jerónimo'
                }
            },
            {
                'usuario': ciudadano2,
                'zona': zona_noreste_obj,
                'descripcion': 'Punto Acopio: Sector Kantu de Larapa, Cuadrante Noreste',
                'tipo': 'reciclaje',
                'puntos_otorgados': 40,
                'estado': 'aprobado',
                'ubicacion': {
                    'lat': -13.5480,
                    'lng': -71.8680,
                    'direccion': 'Sector Kantu de Larapa, San Jerónimo'
                }
            },
            {
                'usuario': ciudadano3,
                'zona': zona_noroeste_obj,
                'descripcion': 'Punto Acopio: Urb. Santa Rosa Alta, Cuadrante Noroeste',
                'tipo': 'reciclaje',
                'puntos_otorgados': 45,
                'estado': 'aprobado',
                'ubicacion': {
                    'lat': -13.5450,
                    'lng': -71.8785,
                    'direccion': 'Urb. Santa Rosa Alta, San Jerónimo'
                }
            },
            {
                'usuario': ciudadano1,
                'zona': zona_central_obj,
                'descripcion': 'Punto Acopio: Sector Pata Pata, Cuadrante Este',
                'tipo': 'reciclaje',
                'puntos_otorgados': 55,
                'estado': 'pendiente',
                'ubicacion': {
                    'lat': -13.5545,
                    'lng': -71.8620,
                    'direccion': 'Sector Pata Pata Residencial, San Jerónimo'
                }
            },
        ]

        evidencias_creadas = 0
        for ev_data in evidencias_data:
            if ev_data.get('usuario') and ev_data.get('zona'):
                try:
                    ev, created = Evidencia.objects.get_or_create(
                        usuario=ev_data['usuario'],
                        zona=ev_data['zona'],
                        descripcion=ev_data['descripcion'],
                        defaults={k: v for k, v in ev_data.items() if k not in ['usuario', 'zona', 'descripcion']}
                    )
                    if created:
                        evidencias_creadas += 1
                except Exception:
                    pass  # El modelo Evidencia puede no tener todos estos campos; se omite si falla

        if evidencias_creadas > 0:
            self.stdout.write(self.style.SUCCESS(f'[OK] {evidencias_creadas} puntos de acopio (evidencias) creados'))
        else:
            self.stdout.write('  Puntos de acopio ya existen o no se pudieron crear')

        self.stdout.write(self.style.SUCCESS('\n*** Datos de San Jerónimo agregados exitosamente'))
        self.stdout.write('\n=== Credenciales de administrador:')
        self.stdout.write('   Email: admin@residuos.com')
        self.stdout.write('   Contrasena: admin123')
        self.stdout.write('\n=== Sectores San Jerónimo creados:')
        self.stdout.write('   SJE001 - Cuadrante Este – Urb. Larapa Residencial & Larapa Grande & Pata Pata')
        self.stdout.write('   SJE002 - Cuadrante Noreste – Urb. Versalles & Kantu & Huayna Picol Norte')
        self.stdout.write('   SJE003 - Cuadrante Noroeste – Santa Rosa Alta & Mirador & Conchacalla Alta')
        self.stdout.write('   SJE004 - Cuadrante Suroeste – Pillao Matao Sur & Chimpahuaylla Sur & Retamales Sur')
