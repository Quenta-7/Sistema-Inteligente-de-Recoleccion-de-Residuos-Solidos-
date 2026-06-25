# backend/core/serializers.py
from rest_framework import serializers
from .models import Usuario, Zona, Horario, Reporte, Evidencia, Notificacion, Recompensa, Canje, Ruta, Incidencia, CalificacionServicio
from django.contrib.auth import authenticate

class ZonaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zona
        fields = '__all__' # Exporta todos los campos

class HorarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Horario
        fields = '__all__'

class ReporteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reporte
        fields = '__all__'

class EvidenciaSerializer(serializers.ModelSerializer):
    foto_url = serializers.SerializerMethodField()
    usuario_nombre = serializers.CharField(source='usuario.nombre_completo', read_only=True)
    zona_nombre = serializers.CharField(source='zona.nombre', read_only=True)
    horario_entrega_detalle = serializers.SerializerMethodField()

    validador_nombre = serializers.CharField(source='validador.nombre_completo', read_only=True)

    class Meta:
        model = Evidencia
        fields = ['id', 'usuario', 'usuario_nombre', 'zona', 'zona_nombre', 'tipo_residuo', 'descripcion', 'foto', 'foto_url', 'cantidad', 'ecopuntos', 'estado', 'direccion_entrega', 'horario_entrega', 'horario_entrega_detalle', 'validador', 'validador_nombre', 'fecha_validacion', 'created_at', 'updated_at']
        read_only_fields = ['id', 'usuario', 'ecopuntos', 'validador', 'fecha_validacion', 'created_at', 'updated_at']

    def get_foto_url(self, obj):
        if obj.foto:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.foto.url)
            return obj.foto.url
        return None

    def get_horario_entrega_detalle(self, obj):
        if obj.horario_entrega:
            return f"{obj.horario_entrega.dia.capitalize()} {obj.horario_entrega.hora_inicio.strftime('%H:%M')}-{obj.horario_entrega.hora_fin.strftime('%H:%M')}"
        return None

class RecompensaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recompensa
        fields = '__all__'

class CanjeSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='usuario.nombre_completo', read_only=True)
    recompensa_nombre = serializers.CharField(source='recompensa.nombre', read_only=True)
    recompensa_puntos = serializers.IntegerField(source='recompensa.puntos', read_only=True)
    recompensa_categoria = serializers.CharField(source='recompensa.categoria', read_only=True)

    class Meta:
        model = Canje
        fields = ['id', 'usuario', 'usuario_nombre', 'recompensa', 'recompensa_nombre', 'recompensa_puntos', 'recompensa_categoria', 'puntos', 'estado', 'created_at']
        read_only_fields = ['id', 'usuario', 'puntos', 'created_at']

class NotificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificacion
        fields = ['id', 'mensaje', 'leido', 'created_at']
        read_only_fields = ['id', 'mensaje', 'created_at']

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'email', 'dni', 'nombre_completo', 'rol', 'zona', 'telefono', 'activo', 'ecopuntos']
        read_only_fields = ['id', 'ecopuntos']

class UsuarioAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'email', 'nombre_completo', 'rol', 'zona', 'telefono', 'activo', 'ecopuntos', 'acepta_terminos', 'fecha_aceptacion_terminos']
        read_only_fields = ['id', 'email', 'fecha_aceptacion_terminos']

class RegistroSerializer(serializers.ModelSerializer):
    dni = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8,
        max_length=8
    )
    password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        trim_whitespace=False,
        min_length=8
    )
    zona = serializers.PrimaryKeyRelatedField(
        queryset=Zona.objects.all(),
        required=False,
        allow_null=True
    )
    acepta_terminos = serializers.BooleanField(write_only=True, required=True)

    class Meta:
        model = Usuario
        fields = ['email', 'dni', 'nombre_completo', 'password', 'telefono', 'zona', 'acepta_terminos']

    def validate_dni(self, value):
        if not value.isdigit() or len(value) != 8:
            raise serializers.ValidationError('El DNI debe contener exactamente 8 caracteres numéricos.')
        if Usuario.objects.filter(dni=value).exists():
            raise serializers.ValidationError('Ya existe un usuario registrado con este DNI.')
        return value

    def validate_password(self, value):
        import re
        if len(value) < 8:
            raise serializers.ValidationError('La contraseña debe tener al menos 8 caracteres.')
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError('La contraseña debe contener al menos una letra mayúscula.')
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError('La contraseña debe contener al menos una letra minúscula.')
        if not re.search(r'[0-9]', value):
            raise serializers.ValidationError('La contraseña debe contener al menos un número.')
        if not re.search(r'[@$!%*?&._\-#]', value):
            raise serializers.ValidationError('La contraseña debe contener al menos un carácter especial (ej. @, $, !, %, *, ?, &, ., _, -, #).')
        return value

    def validate_acepta_terminos(self, value):
        if not value:
            raise serializers.ValidationError('Debe aceptar los Términos y Condiciones y la Política de Privacidad.')
        return value

    def validate_email(self, value):
        if Usuario.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Ya existe un usuario con ese email.')
        return value

    def create(self, validated_data):
        from django.utils import timezone
        password = validated_data.pop('password')
        email = validated_data.get('email')
        acepta_terminos = validated_data.pop('acepta_terminos', False)

        usuario = Usuario(**validated_data)
        usuario.username = email
        usuario.acepta_terminos = acepta_terminos
        if acepta_terminos:
            usuario.fecha_aceptacion_terminos = timezone.now()
        usuario.set_password(password)
        usuario.save()
        return usuario

class LoginSerializer(serializers.Serializer):
    """Serializer para autenticar usuario con email y password"""
    email = serializers.EmailField()
    password = serializers.CharField(
        style={'input_type': 'password'}, 
        trim_whitespace=False
    )

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if email and password:
            # Autenticar usando email como username
            usuario = authenticate(username=email, password=password)
            if not usuario:
                raise serializers.ValidationError(
                    "Credenciales inválidas. Email o contraseña incorrectos."
                )
        else:
            raise serializers.ValidationError(
                "Debes proporcionar email y contraseña."
            )

        data['usuario'] = usuario
        return data

class RutaSerializer(serializers.ModelSerializer):
    recolector_nombre = serializers.CharField(source='recolector.nombre_completo', read_only=True)
    zona_nombre = serializers.CharField(source='zona.nombre', read_only=True)

    class Meta:
        model = Ruta
        fields = '__all__'

    def validate_estado(self, value):
        if value not in Ruta.EstadoRuta.values:
            raise serializers.ValidationError("Estado de ruta inválido.")
        return value

class IncidenciaSerializer(serializers.ModelSerializer):
    recolector_nombre = serializers.CharField(source='recolector.nombre_completo', read_only=True)

    class Meta:
        model = Incidencia
        fields = '__all__'
        read_only_fields = ['id', 'recolector', 'respuesta_admin', 'created_at']

class CalificacionServicioSerializer(serializers.ModelSerializer):
    ciudadano_nombre = serializers.CharField(source='ciudadano.nombre_completo', read_only=True)
    ruta_fecha = serializers.CharField(source='ruta.fecha', read_only=True)
    recolector_nombre = serializers.CharField(source='ruta.recolector.nombre_completo', read_only=True)

    class Meta:
        model = CalificacionServicio
        fields = '__all__'
        read_only_fields = ['id', 'ciudadano', 'created_at']

    def validate_estrellas(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("La calificación debe estar entre 1 y 5 estrellas.")
        return value