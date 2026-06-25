from django.db import models
from django.contrib.auth.models import AbstractUser

# 1. ENUMERACIONES (TextChoices en Django)
class RolUsuario(models.TextChoices):
    CIUDADANO = 'ciudadano', 'Ciudadano'
    ADMIN = 'admin', 'Administrador'
    RECOLECTOR = 'recolector', 'Recolector'

class DiaSemana(models.TextChoices):
    LUNES = 'lunes', 'Lunes'
    MARTES = 'martes', 'Martes'
    MIERCOLES = 'miercoles', 'Miércoles'
    JUEVES = 'jueves', 'Jueves'
    VIERNES = 'viernes', 'Viernes'
    SABADO = 'sabado', 'Sábado'
    DOMINGO = 'domingo', 'Domingo'

class EstadoReporte(models.TextChoices):
    NUEVO = 'nuevo', 'Nuevo'
    EN_REVISION = 'en_revision', 'En Revisión'
    RESUELTO = 'resuelto', 'Resuelto'
    RECHAZADO = 'rechazado', 'Rechazado'

# 2. TABLAS

class Zona(models.Model):
    nombre = models.CharField(max_length=150, unique=True)
    codigo = models.CharField(max_length=50, unique=True)
    descripcion = models.TextField(null=True, blank=True)
    geometria = models.JSONField(null=True, blank=True) # GeoJSON
    activa = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nombre} ({self.codigo})"

class Usuario(AbstractUser):
    # Extendemos el usuario de Django para que use Email como login
    email = models.EmailField(unique=True)
    dni = models.CharField(max_length=8, unique=True, null=True, blank=True)
    nombre_completo = models.CharField(max_length=150)
    telefono = models.CharField(max_length=20, null=True, blank=True)
    zona = models.ForeignKey(Zona, on_delete=models.SET_NULL, null=True, blank=True)
    rol = models.CharField(max_length=20, choices=RolUsuario.choices, default=RolUsuario.CIUDADANO)
    activo = models.BooleanField(default=True)
    ecopuntos = models.IntegerField(default=0)
    acepta_terminos = models.BooleanField(default=False)
    fecha_aceptacion_terminos = models.DateTimeField(null=True, blank=True)
    
    # Configuramos el email como el campo principal para login
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'nombre_completo']

    class Meta:
        indexes = [models.Index(fields=['email', 'rol'])]

class Horario(models.Model):
    zona = models.ForeignKey(Zona, on_delete=models.CASCADE, related_name='horarios')
    dia = models.CharField(max_length=15, choices=DiaSemana.choices)
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    tipos_residuo = models.JSONField() # Ejemplo: ["orgánico", "reciclable"]
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['zona', 'dia', 'hora_inicio'], name='idx_horario_unico')
        ]

class Reporte(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='reportes')
    zona = models.ForeignKey(Zona, on_delete=models.CASCADE, related_name='reportes')
    tipo_reporte = models.CharField(max_length=100, default='General')
    direccion = models.CharField(max_length=255, default='')
    descripcion = models.TextField()
    foto_url = models.URLField(max_length=500, null=True, blank=True)
    estado = models.CharField(max_length=20, choices=EstadoReporte.choices, default=EstadoReporte.NUEVO)
    codigo_seguimiento = models.CharField(max_length=50, unique=True, null=True, blank=True)
    comentario_admin = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=['usuario', 'zona', 'estado'])]

class Evidencia(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='evidencias')
    zona = models.ForeignKey(Zona, on_delete=models.CASCADE, related_name='evidencias')
    tipo_residuo = models.CharField(max_length=50)  # orgánico, reciclable, no-reciclable
    descripcion = models.TextField()
    foto = models.ImageField(upload_to='evidencias/', blank=True, null=True)
    cantidad = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # en kg
    ecopuntos = models.IntegerField(default=50)  # puntos otorgados
    estado = models.CharField(max_length=20, choices=EstadoReporte.choices, default=EstadoReporte.NUEVO)
    direccion_entrega = models.CharField(max_length=255, null=True, blank=True)
    horario_entrega = models.ForeignKey(Horario, on_delete=models.SET_NULL, null=True, blank=True, related_name='evidencias')
    validador = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True, related_name='evidencias_validadas')
    fecha_validacion = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['usuario', 'estado', '-created_at'])]

class Notificacion(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='notificaciones')
    mensaje = models.CharField(max_length=255)
    leido = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['usuario', 'leido', '-created_at'])]

    def __str__(self):
        return f"Notificación para {self.usuario.username}: {self.mensaje[:30]}"

class Recompensa(models.Model):
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField()
    puntos = models.IntegerField()
    categoria = models.CharField(max_length=50) # Movilidad, Hogar, EcoModa, Experiencias
    imagen = models.CharField(max_length=255, null=True, blank=True)
    stock = models.IntegerField(default=10)
    disponible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nombre

class Canje(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='canjes')
    recompensa = models.ForeignKey(Recompensa, on_delete=models.CASCADE, related_name='canjes')
    puntos = models.IntegerField()
    estado = models.CharField(max_length=20, default='en_proceso') # en_proceso, entregado
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.usuario.nombre_completo} - {self.recompensa.nombre}"

class Ruta(models.Model):
    class EstadoRuta(models.TextChoices):
        PROGRAMADA = 'programada', 'Programada'
        EN_PROGRESO = 'en_progreso', 'En progreso'
        COMPLETADA = 'completada', 'Completada'
        PARCIALMENTE_COMPLETADA = 'parcialmente_completada', 'Parcialmente completada'
        NO_COMPLETADA = 'no_completada', 'No completada'

    recolector = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='rutas')
    zona = models.ForeignKey(Zona, on_delete=models.CASCADE, related_name='rutas')
    fecha = models.DateField()
    hora_inicio = models.TimeField()
    hora_fin_estimada = models.TimeField()
    estado = models.CharField(max_length=30, choices=EstadoRuta.choices, default=EstadoRuta.PROGRAMADA)
    observaciones = models.TextField(null=True, blank=True)
    fecha_hora_reporte = models.DateTimeField(null=True, blank=True)
    distancia_restante = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    geometria_ruta = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ['fecha', 'hora_inicio']

    def __str__(self):
        return f"Ruta {self.id} - {self.recolector.nombre_completo} ({self.fecha})"

class Incidencia(models.Model):
    class EstadoIncidencia(models.TextChoices):
        PENDIENTE = 'pendiente', 'Pendiente'
        RESUELTA = 'resuelta', 'Resuelta'

    recolector = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='incidencias')
    tipo = models.CharField(max_length=100)
    descripcion = models.TextField()
    estado = models.CharField(max_length=20, choices=EstadoIncidencia.choices, default=EstadoIncidencia.PENDIENTE)
    respuesta_admin = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Incidencia {self.id} - {self.tipo} ({self.estado})"

class CalificacionServicio(models.Model):
    ciudadano = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='calificaciones_enviadas')
    ruta = models.ForeignKey(Ruta, on_delete=models.CASCADE, related_name='calificaciones')
    estrellas = models.IntegerField()
    comentario = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(fields=['ciudadano', 'ruta'], name='calificacion_unica_por_ruta')
        ]

    def __str__(self):
        return f"Calificación {self.estrellas}* para Ruta {self.ruta.id} por {self.ciudadano.nombre_completo}"