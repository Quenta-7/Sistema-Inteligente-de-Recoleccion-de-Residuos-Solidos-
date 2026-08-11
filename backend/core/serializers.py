# backend/core/serializers.py
from rest_framework import serializers
from .models import Usuario, Zona, Horario, Reporte, Evidencia, Notificacion, Recompensa, Canje, Ruta, Incidencia, CalificacionServicio
from django.contrib.auth import authenticate

class ZonaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zona
        fields = '__all__' # Exporta todos los campos

class HorarioSerializer(serializers.ModelSerializer):
    zona_nombre = serializers.CharField(source='zona.nombre', read_only=True)

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
        fields = ['id', 'usuario', 'usuario_nombre', 'zona', 'zona_nombre', 'tipo_residuo', 'descripcion', 'foto', 'foto_url', 'cantidad', 'ecopuntos', 'estado', 'direccion_entrega', 'latitud', 'longitud', 'horario_entrega', 'horario_entrega_detalle', 'validador', 'validador_nombre', 'fecha_validacion', 'created_at', 'updated_at']
        read_only_fields = ['id', 'usuario', 'ecopuntos', 'validador', 'fecha_validacion', 'created_at', 'updated_at']

    def get_foto_url(self, obj):
        if obj.foto:
            request = self.context.get('request')
            if request:
                url = request.build_absolute_uri(obj.foto.url)
                if request.is_secure() or request.META.get('HTTP_X_FORWARDED_PROTO') == 'https':
                    if url.startswith('http://'):
                        url = 'https://' + url[7:]
                return url
            return obj.foto.url
        return None

    def get_horario_entrega_detalle(self, obj):
        if obj.horario_entrega:
            turno = "Mañana" if obj.horario_entrega.hora_inicio.hour < 12 else "Tarde"
            return f"{obj.horario_entrega.dia.capitalize()}: {obj.horario_entrega.hora_inicio.strftime('%H:%M')} a {obj.horario_entrega.hora_fin.strftime('%H:%M')} (Turno {turno})"
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
    foto_perfil_url = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = ['id', 'email', 'dni', 'nombre_completo', 'rol', 'zona', 'telefono', 'activo', 'ecopuntos', 'foto_perfil', 'foto_perfil_url']
        read_only_fields = ['id', 'ecopuntos']

    def get_foto_perfil_url(self, obj):
        if obj.foto_perfil:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.foto_perfil.url)
            return obj.foto_perfil.url
        return None

class UsuarioAdminSerializer(serializers.ModelSerializer):
    foto_perfil_url = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    dni = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def get_foto_perfil_url(self, obj):
        if obj.foto_perfil:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.foto_perfil.url)
            return obj.foto_perfil.url
        return None

    class Meta:
        model = Usuario
        fields = ['id', 'email', 'dni', 'nombre_completo', 'password', 'rol', 'zona', 'telefono', 'activo', 'ecopuntos', 'acepta_terminos', 'fecha_aceptacion_terminos', 'foto_perfil', 'foto_perfil_url']
        read_only_fields = ['id', 'fecha_aceptacion_terminos']

    def validate_dni(self, value):
        if value:
            value = str(value).strip()
            if not value.isdigit() or len(value) != 8:
                raise serializers.ValidationError('El DNI debe contener exactamente 8 caracteres numéricos.')
            qs = Usuario.objects.filter(dni=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError('Ya existe un usuario registrado con este DNI.')
        return value

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        email = validated_data.get('email')
        usuario = Usuario(**validated_data)
        if email:
            usuario.username = email
        if password:
            usuario.set_password(password)
        else:
            usuario.set_unusable_password()
        usuario.save()
        return usuario

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

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
        if not re.search(r'[^A-Za-z0-9]', value):
            raise serializers.ValidationError('La contraseña debe contener al menos un carácter especial (ej. @, $, !, %, *, ?, &, ., _, -, #, (, ), etc.).')
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
        read_only_fields = ['ultima_actualizacion_gps']

    def validate_estado(self, value):
        if value not in Ruta.EstadoRuta.values:
            raise serializers.ValidationError("Estado de ruta inválido.")
        return value

    def validate(self, attrs):
        recolector = attrs.get('recolector', self.instance.recolector if self.instance else None)
        zona = attrs.get('zona', self.instance.zona if self.instance else None)
        fecha = attrs.get('fecha', self.instance.fecha if self.instance else None)
        hora_inicio = attrs.get('hora_inicio', self.instance.hora_inicio if self.instance else None)
        hora_fin_estimada = attrs.get('hora_fin_estimada', self.instance.hora_fin_estimada if self.instance else None)
        estado = attrs.get('estado', self.instance.estado if self.instance else Ruta.EstadoRuta.PROGRAMADA)

        if hora_inicio and hora_fin_estimada:
            if hora_inicio >= hora_fin_estimada:
                raise serializers.ValidationError({
                    'hora_fin_estimada': 'La hora de fin estimada debe ser posterior a la hora de inicio.'
                })

        ACTIVE_STATES = [Ruta.EstadoRuta.PROGRAMADA, Ruta.EstadoRuta.EN_PROGRESO]

        if estado in ACTIVE_STATES and recolector and zona and fecha and hora_inicio and hora_fin_estimada:
            # 1. Unicidad de recolector: un recolector no puede tener dos rutas activas en horarios solapados del mismo día
            qs_recolector = Ruta.objects.filter(
                recolector=recolector,
                fecha=fecha,
                estado__in=ACTIVE_STATES,
                hora_inicio__lt=hora_fin_estimada,
                hora_fin_estimada__gt=hora_inicio
            )
            if self.instance:
                qs_recolector = qs_recolector.exclude(pk=self.instance.pk)

            if qs_recolector.exists():
                conflict = qs_recolector.first()
                inicio_str = conflict.hora_inicio.strftime('%H:%M')
                fin_str = conflict.hora_fin_estimada.strftime('%H:%M')
                raise serializers.ValidationError({
                    'recolector': f'El recolector {recolector.nombre_completo} ya tiene una ruta activa ("{conflict.zona.nombre}") programada de {inicio_str} a {fin_str} el día {fecha}.'
                })

            # 2. Unicidad de zona: una zona no puede tener dos rutas activas programadas en horarios solapados del mismo día
            qs_zona = Ruta.objects.filter(
                zona=zona,
                fecha=fecha,
                estado__in=ACTIVE_STATES,
                hora_inicio__lt=hora_fin_estimada,
                hora_fin_estimada__gt=hora_inicio
            )
            if self.instance:
                qs_zona = qs_zona.exclude(pk=self.instance.pk)

            if qs_zona.exists():
                conflict = qs_zona.first()
                inicio_str = conflict.hora_inicio.strftime('%H:%M')
                fin_str = conflict.hora_fin_estimada.strftime('%H:%M')
                raise serializers.ValidationError({
                    'zona': f'La zona "{conflict.zona.nombre}" ya tiene una ruta activa programada con el recolector {conflict.recolector.nombre_completo} de {inicio_str} a {fin_str} el día {fecha}.'
                })

        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.estado != Ruta.EstadoRuta.EN_PROGRESO:
            data['lat_actual'] = None
            data['lng_actual'] = None
            data['ultima_actualizacion_gps'] = None
        return data

class IncidenciaSerializer(serializers.ModelSerializer):
    recolector_nombre = serializers.CharField(source='recolector.nombre_completo', read_only=True)

    class Meta:
        model = Incidencia
        fields = '__all__'
        read_only_fields = ['id', 'recolector', 'created_at']

class CalificacionServicioSerializer(serializers.ModelSerializer):
    ciudadano_nombre = serializers.CharField(source='ciudadano.nombre_completo', read_only=True)
    ruta_fecha = serializers.CharField(source='ruta.fecha', read_only=True)
    recolector_nombre = serializers.CharField(source='ruta.recolector.nombre_completo', read_only=True)

    class Meta:
        model = CalificacionServicio
        fields = '__all__'
        read_only_fields = ['id', 'ciudadano', 'estado_moderacion', 'moderado_por', 'fecha_moderacion', 'created_at']

    def validate_estrellas(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("La calificación debe estar entre 1 y 5 estrellas.")
        return value

    def validate(self, attrs):
        request = self.context.get('request')
        if request and request.method == 'POST':
            user = request.user
            ruta = attrs.get('ruta')
            if getattr(user, 'rol', None) != 'ciudadano':
                raise serializers.ValidationError('Solo los ciudadanos pueden calificar el servicio.')
            if ruta.estado not in [Ruta.EstadoRuta.COMPLETADA, Ruta.EstadoRuta.PARCIALMENTE_COMPLETADA]:
                raise serializers.ValidationError({'ruta': 'Solo se puede calificar un servicio ya realizado.'})
            if not user.zona_id or ruta.zona_id != user.zona_id:
                raise serializers.ValidationError({'ruta': 'El servicio no corresponde a la zona del ciudadano.'})
            if CalificacionServicio.objects.filter(ciudadano=user, ruta=ruta).exists():
                raise serializers.ValidationError({'ruta': 'Ya registraste una calificación para este servicio.'})
        return attrs
