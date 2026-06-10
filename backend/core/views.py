# backend/core/views.py
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from .models import Zona, Horario, Reporte, Usuario, Evidencia
from .serializers import (
    ZonaSerializer,
    HorarioSerializer,
    ReporteSerializer,
    LoginSerializer,
    UsuarioSerializer,
    RegistroSerializer,
    EvidenciaSerializer,
    UsuarioAdminSerializer,
)

class ZonaViewSet(viewsets.ModelViewSet):
    queryset = Zona.objects.all()
    serializer_class = ZonaSerializer

class HorarioViewSet(viewsets.ModelViewSet):
    queryset = Horario.objects.all()
    serializer_class = HorarioSerializer

class ReporteViewSet(viewsets.ModelViewSet):
    queryset = Reporte.objects.all()
    serializer_class = ReporteSerializer

class LoginView(APIView):
    """
    Endpoint para autenticar usuarios con Token
    POST /api/auth/login/
    {
        "email": "usuario@email.com",
        "password": "password123"
    }
    """
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        
        if serializer.is_valid():
            usuario = serializer.validated_data['usuario']
            
            # Generar o obtener token para el usuario
            token, created = Token.objects.get_or_create(user=usuario)
            
            # Responder con token y datos del usuario autenticado
            usuario_serializer = UsuarioSerializer(usuario)
            
            return Response({
                'success': True,
                'message': f'Bienvenido {usuario.nombre_completo}',
                'token': token.key,
                'user': usuario_serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_401_UNAUTHORIZED)


class RegisterView(APIView):
    """
    Endpoint para registrar usuarios
    POST /api/register/
    {
        "email": "usuario@email.com",
        "nombre_completo": "Nombre Apellido",
        "password": "password123",
        "telefono": "+51999999999",
        "zona": 1
    }
    """

    def post(self, request):
        serializer = RegistroSerializer(data=request.data)

        if serializer.is_valid():
            usuario = serializer.save()
            usuario_serializer = UsuarioSerializer(usuario)

            return Response({
                'success': True,
                'message': 'Registro exitoso',
                'usuario': usuario_serializer.data
            }, status=status.HTTP_201_CREATED)

        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class EvidenciaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para crear y listar evidencias de reciclaje.
    POST /api/evidencias/ - Crear (requiere autenticación y FormData con foto)
    GET /api/evidencias/ - Listar (requiere autenticación)
    """
    serializer_class = EvidenciaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Si el usuario es administrador, puede ver todas las evidencias
        if hasattr(self.request.user, 'rol') and self.request.user.rol == 'admin':
            return Evidencia.objects.all()
        return Evidencia.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        # El usuario se asigna automáticamente del token
        usuario = self.request.user
        # Por defecto se crea en estado 'nuevo'
        evidencia = serializer.save(usuario=usuario, estado='nuevo')
        # Los EcoPuntos ahora se otorgan cuando el administrador la aprueba (estado='resuelto')

    def perform_update(self, serializer):
        instancia = self.get_object()
        estado_previo = instancia.estado
        evidencia = serializer.save()
        
        # Si el estado cambia a 'resuelto' (aprobada por admin) y antes no lo estaba, otorgar EcoPuntos
        if evidencia.estado == 'resuelto' and estado_previo != 'resuelto':
            usuario = evidencia.usuario
            puntos_por_tipo = {
                'reciclable': 20,
                'organico': 10,
                'no_reciclable': 5,
            }
            puntos = puntos_por_tipo.get(evidencia.tipo_residuo.lower(), 0)
            usuario.ecopuntos += puntos
            usuario.save()


class UsuarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para listar y gestionar usuarios en el dashboard administrativo
    """
    serializer_class = UsuarioAdminSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Solo administradores pueden ver y gestionar usuarios
        if hasattr(self.request.user, 'rol') and self.request.user.rol == 'admin':
            return Usuario.objects.all()
        return Usuario.objects.filter(id=self.request.user.id)


class PerfilView(APIView):
    """
    Endpoint para obtener el perfil del usuario autenticado
    GET /api/perfil/ - Devuelve datos del usuario actual con ecopuntos
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        usuario_serializer = UsuarioSerializer(request.user, context={'request': request})
        return Response({
            'success': True,
            'user': usuario_serializer.data
        }, status=status.HTTP_200_OK)