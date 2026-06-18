from django.db import models
from django.contrib.auth.models import AbstractUser

# 1. ENUMERACIONES (TextChoices en Django)
class RolUsuario(models.TextChoices):
    CIUDADANO = 'ciudadano', 'Ciudadano'
    ADMIN = 'admin', 'Administrador'

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
    descripcion = models.TextField()
    foto_url = models.URLField(max_length=500, null=True, blank=True)
    estado = models.CharField(max_length=20, choices=EstadoReporte.choices, default=EstadoReporte.NUEVO)
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