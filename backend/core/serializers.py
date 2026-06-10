# backend/core/serializers.py
from rest_framework import serializers
from .models import Usuario, Zona, Horario, Reporte, Evidencia
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

    class Meta:
        model = Evidencia
        fields = ['id', 'usuario', 'usuario_nombre', 'zona', 'zona_nombre', 'tipo_residuo', 'descripcion', 'foto', 'foto_url', 'cantidad', 'ecopuntos', 'estado', 'created_at', 'updated_at']
        read_only_fields = ['id', 'usuario', 'ecopuntos', 'created_at', 'updated_at']

    def get_foto_url(self, obj):
        if obj.foto:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.foto.url)
            return obj.foto.url
        return None

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'email', 'nombre_completo', 'rol', 'zona', 'telefono', 'activo', 'ecopuntos']
        read_only_fields = ['id', 'ecopuntos']

class UsuarioAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'email', 'nombre_completo', 'rol', 'zona', 'telefono', 'activo', 'ecopuntos', 'acepta_terminos', 'fecha_aceptacion_terminos']
        read_only_fields = ['id', 'email', 'fecha_aceptacion_terminos']

class RegistroSerializer(serializers.ModelSerializer):
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
        fields = ['email', 'nombre_completo', 'password', 'telefono', 'zona', 'acepta_terminos']

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