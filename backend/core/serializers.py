# backend/core/serializers.py
from rest_framework import serializers
from .models import Usuario, Zona, Horario, Reporte
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

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'email', 'nombre_completo', 'rol', 'zona', 'telefono', 'activo']
        read_only_fields = ['id']

class RegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        trim_whitespace=False,
        min_length=6
    )
    zona = serializers.PrimaryKeyRelatedField(
        queryset=Zona.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Usuario
        fields = ['email', 'nombre_completo', 'password', 'telefono', 'zona']

    def validate_email(self, value):
        if Usuario.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Ya existe un usuario con ese email.')
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        email = validated_data.get('email')

        usuario = Usuario(**validated_data)
        usuario.username = email
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