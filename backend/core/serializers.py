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