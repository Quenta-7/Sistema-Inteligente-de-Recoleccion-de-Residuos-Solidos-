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
                'nombre': 'Sector Central San Jerónimo',
                'codigo': 'SJE001',
                'descripcion': 'El centro del distrito, alrededor de la Plaza Principal',
                'geometria': {
                    'type': 'Polygon',
                    'coordinates': [[
                        [-71.8800, -13.5470],
                        [-71.8800, -13.5510],
                        [-71.8760, -13.5510],
                        [-71.8760, -13.5470],
                        [-71.8800, -13.5470]
                    ]]
                },
                'activa': True
            },
            {
                'nombre': 'Urb. Kennedy',
                'codigo': 'SJE002',
                'descripcion': 'Urbanización Kennedy, sector residencial',
                'geometria': {
                    'type': 'Polygon',
                    'coordinates': [[
                        [-71.8760, -13.5500],
                        [-71.8760, -13.5540],
                        [-71.8720, -13.5540],
                        [-71.8720, -13.5500],
                        [-71.8760, -13.5500]
                    ]]
                },
                'activa': True
            },
            {
                'nombre': 'Urb. Los Incas',
                'codigo': 'SJE003',
                'descripcion': 'Urbanización Los Incas',
                'geometria': {
                    'type': 'Polygon',
                    'coordinates': [[
                        [-71.8780, -13.5450],
                        [-71.8780, -13.5490],
                        [-71.8740, -13.5490],
                        [-71.8740, -13.5450],
                        [-71.8780, -13.5450]
                    ]]
                },
                'activa': True
            },
            {
                'nombre': 'Sector Pillao Matao',
                'codigo': 'SJE004',
                'descripcion': 'Zona de Pillao Matao',
                'geometria': {
                    'type': 'Polygon',
                    'coordinates': [[
                        [-71.8810, -13.5530],
                        [-71.8810, -13.5570],
                        [-71.8770, -13.5570],
                        [-71.8770, -13.5530],
                        [-71.8810, -13.5530]
                    ]]
                },
                'activa': True
            },
            {
                'nombre': 'Urb. Santa Rosa',
                'codigo': 'SJE005',
                'descripcion': 'Urbanización Santa Rosa',
                'geometria': {
                    'type': 'Polygon',
                    'coordinates': [[
                        [-71.8770, -13.5480],
                        [-71.8770, -13.5520],
                        [-71.8730, -13.5520],
                        [-71.8730, -13.5480],
                        [-71.8770, -13.5480]
                    ]]
                },
                'activa': True
            },
            {
                'nombre': 'Sector Conchacalla',
                'codigo': 'SJE006',
                'descripcion': 'Sector Conchacalla',
                'geometria': {
                    'type': 'Polygon',
                    'coordinates': [[
                        [-71.8820, -13.5460],
                        [-71.8820, -13.5500],
                        [-71.8780, -13.5500],
                        [-71.8780, -13.5460],
                        [-71.8820, -13.5460]
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
                'nombre_completo': 'Recolector San Jerónimo',
                'password': make_password('pass123'),
                'rol': 'recolector',
                'dni': '40000001',
                'zona': zonas_creadas.get('SJE001'),
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
        # Un único camión recolector cubre todo el distrito San Jerónimo en recorrido semanal.
        # Tipo de residuo: Residuos Generales (recolección general, sin separación por tipo).
        self.stdout.write('Creando horarios de recolección San Jerónimo...')
        horarios_data = [
            # Lunes: Sector Central (SJE001) + Urb. Kennedy (SJE002) — turno mañana
            {
                'zona_codigo': 'SJE001',
                'dia': 'lunes',
                'hora_inicio': time(7, 0),
                'hora_fin': time(10, 0),
                'tipos_residuo': ['Residuos Generales']
            },
            {
                'zona_codigo': 'SJE002',
                'dia': 'lunes',
                'hora_inicio': time(7, 0),
                'hora_fin': time(10, 0),
                'tipos_residuo': ['Residuos Generales']
            },
            # Martes: Urb. Los Incas (SJE003) + Sector Pillao Matao (SJE004) — turno mañana
            {
                'zona_codigo': 'SJE003',
                'dia': 'martes',
                'hora_inicio': time(7, 0),
                'hora_fin': time(10, 0),
                'tipos_residuo': ['Residuos Generales']
            },
            {
                'zona_codigo': 'SJE004',
                'dia': 'martes',
                'hora_inicio': time(7, 0),
                'hora_fin': time(10, 0),
                'tipos_residuo': ['Residuos Generales']
            },
            # Miércoles: Urb. Santa Rosa (SJE005) + Sector Conchacalla (SJE006) — turno mañana
            {
                'zona_codigo': 'SJE005',
                'dia': 'miercoles',
                'hora_inicio': time(7, 0),
                'hora_fin': time(10, 0),
                'tipos_residuo': ['Residuos Generales']
            },
            {
                'zona_codigo': 'SJE006',
                'dia': 'miercoles',
                'hora_inicio': time(7, 0),
                'hora_fin': time(10, 0),
                'tipos_residuo': ['Residuos Generales']
            },
            # Jueves: Sector Central (SJE001) + Urb. Los Incas (SJE003) — segundo recorrido, turno tarde
            {
                'zona_codigo': 'SJE001',
                'dia': 'jueves',
                'hora_inicio': time(15, 0),
                'hora_fin': time(18, 0),
                'tipos_residuo': ['Residuos Generales']
            },
            {
                'zona_codigo': 'SJE003',
                'dia': 'jueves',
                'hora_inicio': time(15, 0),
                'hora_fin': time(18, 0),
                'tipos_residuo': ['Residuos Generales']
            },
            # Viernes: Urb. Kennedy (SJE002) + Urb. Santa Rosa (SJE005) — segundo recorrido, turno tarde
            {
                'zona_codigo': 'SJE002',
                'dia': 'viernes',
                'hora_inicio': time(15, 0),
                'hora_fin': time(18, 0),
                'tipos_residuo': ['Residuos Generales']
            },
            {
                'zona_codigo': 'SJE005',
                'dia': 'viernes',
                'hora_inicio': time(15, 0),
                'hora_fin': time(18, 0),
                'tipos_residuo': ['Residuos Generales']
            },
            # Sábado: Sector Pillao Matao (SJE004) + Sector Conchacalla (SJE006) — segundo recorrido, turno mañana
            {
                'zona_codigo': 'SJE004',
                'dia': 'sabado',
                'hora_inicio': time(7, 0),
                'hora_fin': time(10, 0),
                'tipos_residuo': ['Residuos Generales']
            },
            {
                'zona_codigo': 'SJE006',
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

        # Ruta SJ-01: Plaza Principal → Jr. Cusco → Av. Evitamiento → Mercado San Jerónimo
        geometria_ruta_sj01 = [
            {"lat": -13.5485, "lng": -71.8772, "nombre": "Plaza Principal San Jerónimo"},
            {"lat": -13.5493, "lng": -71.8755, "nombre": "Jr. Cusco"},
            {"lat": -13.5510, "lng": -71.8742, "nombre": "Av. Evitamiento"},
            {"lat": -13.5522, "lng": -71.8730, "nombre": "Mercado San Jerónimo"}
        ]

        # Ruta SJ-02: Urb. Kennedy → Urb. Los Incas → Sector Conchacalla
        geometria_ruta_sj02 = [
            {"lat": -13.5520, "lng": -71.8740, "nombre": "Urb. Kennedy"},
            {"lat": -13.5470, "lng": -71.8760, "nombre": "Urb. Los Incas"},
            {"lat": -13.5480, "lng": -71.8800, "nombre": "Sector Conchacalla"}
        ]

        if recolector and zona_central and zona_kennedy:
            # Ruta completada (SJ-01 ayer)
            ruta_completada, _ = Ruta.objects.get_or_create(
                recolector=recolector,
                zona=zona_central,
                fecha=hoy - timedelta(days=1),
                hora_inicio=time(7, 0),
                hora_fin_estimada=time(10, 0),
                defaults={
                    'estado': Ruta.EstadoRuta.COMPLETADA,
                    'observaciones': 'Ruta SJ-01 completada sin novedades. Plaza Principal → Mercado San Jerónimo.',
                    'geometria_ruta': geometria_ruta_sj01,
                }
            )

            # Ruta en progreso (SJ-01 hoy)
            ruta_hoy, _ = Ruta.objects.get_or_create(
                recolector=recolector,
                zona=zona_central,
                fecha=hoy,
                hora_inicio=time(7, 0),
                hora_fin_estimada=time(10, 0),
                defaults={
                    'estado': Ruta.EstadoRuta.EN_PROGRESO,
                    'observaciones': 'Ruta SJ-01 en ejecución. Recorrido por Sector Central San Jerónimo.',
                    'geometria_ruta': geometria_ruta_sj01,
                }
            )

            # Ruta programada (SJ-02 mañana)
            ruta_manana, _ = Ruta.objects.get_or_create(
                recolector=recolector,
                zona=zona_kennedy,
                fecha=manana,
                hora_inicio=time(7, 0),
                hora_fin_estimada=time(10, 0),
                defaults={
                    'estado': Ruta.EstadoRuta.PROGRAMADA,
                    'observaciones': 'Ruta SJ-02 programada. Urb. Kennedy → Urb. Los Incas → Conchacalla.',
                    'geometria_ruta': geometria_ruta_sj02,
                }
            )

            self.stdout.write(self.style.SUCCESS('[OK] Rutas San Jerónimo creadas (SJ-01, SJ-02)'))

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
                defaults={
                    'descripcion': 'Falla mecánica del camión recolector en Av. Evitamiento, San Jerónimo. Se requirió apoyo.',
                    'estado': Incidencia.EstadoIncidencia.RESUELTA,
                    'respuesta_admin': 'Se envió unidad de auxilio mecánico desde el municipio de San Jerónimo.'
                }
            )
            Incidencia.objects.get_or_create(
                recolector=recolector,
                tipo='Via bloqueada',
                defaults={
                    'descripcion': 'Jr. Cusco cerrado por obras de pavimentación. Se realizó desvío por Sector Conchacalla.',
                    'estado': Incidencia.EstadoIncidencia.PENDIENTE
                }
            )
            self.stdout.write(self.style.SUCCESS('[OK] Incidencias de prueba creadas'))

        # 7. CREAR EVIDENCIAS - EcoPuntos de Acopio en San Jerónimo
        self.stdout.write('Creando puntos de acopio (EcoPuntos) San Jerónimo...')
        zona_central_obj = zonas_creadas.get('SJE001')
        zona_kennedy_obj = zonas_creadas.get('SJE002')
        zona_losincas_obj = zonas_creadas.get('SJE003')
        ciudadano1 = usuarios_creados.get('ciudadano1@residuos.com')
        ciudadano2 = usuarios_creados.get('ciudadano2@residuos.com')
        ciudadano3 = usuarios_creados.get('ciudadano3@residuos.com')

        evidencias_data = [
            {
                'usuario': ciudadano1,
                'zona': zona_central_obj,
                'descripcion': 'Punto Acopio Central: Plaza Principal San Jerónimo',
                'tipo': 'reciclaje',
                'puntos_otorgados': 50,
                'estado': 'aprobado',
                'ubicacion': {
                    'lat': -13.5485,
                    'lng': -71.8772,
                    'direccion': 'Plaza Principal, San Jerónimo, Cusco'
                }
            },
            {
                'usuario': ciudadano2,
                'zona': zona_kennedy_obj,
                'descripcion': 'Punto Acopio Kennedy: Jr. Simón Bolívar s/n, Urb. Kennedy',
                'tipo': 'reciclaje',
                'puntos_otorgados': 40,
                'estado': 'aprobado',
                'ubicacion': {
                    'lat': -13.5520,
                    'lng': -71.8740,
                    'direccion': 'Jr. Simón Bolívar s/n, Urb. Kennedy, San Jerónimo'
                }
            },
            {
                'usuario': ciudadano3,
                'zona': zona_losincas_obj,
                'descripcion': 'Punto Acopio Los Incas: Av. Principal, Urb. Los Incas',
                'tipo': 'reciclaje',
                'puntos_otorgados': 45,
                'estado': 'aprobado',
                'ubicacion': {
                    'lat': -13.5470,
                    'lng': -71.8760,
                    'direccion': 'Av. Principal, Urb. Los Incas, San Jerónimo'
                }
            },
            {
                'usuario': ciudadano1,
                'zona': zona_central_obj,
                'descripcion': 'Punto Acopio Mercado: Mercado San Jerónimo, Av. Evitamiento',
                'tipo': 'reciclaje',
                'puntos_otorgados': 55,
                'estado': 'pendiente',
                'ubicacion': {
                    'lat': -13.5522,
                    'lng': -71.8730,
                    'direccion': 'Mercado San Jerónimo, Av. Evitamiento, San Jerónimo'
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
        self.stdout.write('   SJE001 - Sector Central San Jerónimo')
        self.stdout.write('   SJE002 - Urb. Kennedy')
        self.stdout.write('   SJE003 - Urb. Los Incas')
        self.stdout.write('   SJE004 - Sector Pillao Matao')
        self.stdout.write('   SJE005 - Urb. Santa Rosa')
        self.stdout.write('   SJE006 - Sector Conchacalla')
