# backend/core/views.py
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from .models import Zona, Horario, Reporte, Usuario, Evidencia, Notificacion
from .serializers import (
    ZonaSerializer,
    HorarioSerializer,
    ReporteSerializer,
    LoginSerializer,
    UsuarioSerializer,
    RegistroSerializer,
    EvidenciaSerializer,
    UsuarioAdminSerializer,
    NotificacionSerializer,
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

        # Si el estado cambia, crear una notificación para el ciudadano
        if evidencia.estado != estado_previo:
            if evidencia.estado == 'resuelto':
                puntos_por_tipo = {
                    'reciclable': 20,
                    'organico': 10,
                    'no_reciclable': 5,
                }
                puntos = puntos_por_tipo.get(evidencia.tipo_residuo.lower(), 0)
                Notificacion.objects.create(
                    usuario=evidencia.usuario,
                    mensaje=f"Tu entrega de residuos ({evidencia.tipo_residuo.capitalize()}) ha sido Aprobada. ¡Has ganado {puntos} EcoPuntos!"
                )
            elif evidencia.estado == 'rechazado':
                Notificacion.objects.create(
                    usuario=evidencia.usuario,
                    mensaje=f"Tu entrega de residuos ({evidencia.tipo_residuo.capitalize()}) ha sido Rechazada por el administrador."
                )


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


class ConsultarDniView(APIView):
    """
    Consulta a la RENIEC a través del API de Decolecta.
    GET /api/consultar-dni/<dni>/
    """
    def get(self, request, dni):
        if not dni.isdigit() or len(dni) != 8:
            return Response({
                'success': False,
                'message': 'El DNI debe contener exactamente 8 caracteres numéricos.'
            }, status=status.HTTP_400_BAD_REQUEST)

        import requests
        try:
            token = "sk_14327.Mp0kGu1vUedcnvCZNFpFFss0NrUEOZ8D"
            url = f"https://api.decolecta.com/v1/reniec/dni?numero={dni}"
            headers = {
                'Authorization': f'Bearer {token}',
                'Accept': 'application/json'
            }

            response = requests.get(url, headers=headers, timeout=10)

            if response.status_code == 200:
                data = response.json()
                
                # Extraer los datos de la respuesta de Decolecta
                first_name = data.get('first_name', '')
                first_last_name = data.get('first_last_name', '')
                second_last_name = data.get('second_last_name', '')

                # Construir el nombre completo de manera ordenada
                nombres = first_name
                apellidos = f"{first_last_name} {second_last_name}".strip()
                nombre_completo = f"{nombres} {apellidos}".strip()

                return Response({
                    'success': True,
                    'nombres': nombres,
                    'apellidos': apellidos,
                    'nombre_completo': nombre_completo
                }, status=status.HTTP_200_OK)
            elif response.status_code == 404:
                return Response({
                    'success': False,
                    'message': 'El DNI ingresado no fue encontrado en los registros de RENIEC.'
                }, status=status.HTTP_404_NOT_FOUND)
            else:
                return Response({
                    'success': False,
                    'message': f'Error en el servicio de consulta (Código: {response.status_code}).'
                }, status=status.HTTP_400_BAD_REQUEST)

        except requests.exceptions.RequestException:
            return Response({
                'success': False,
                'message': 'No se pudo conectar con el servicio externo de consulta de DNI.'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)


class LogoutView(APIView):
    """
    Invalida y elimina el token de autenticación del usuario en la base de datos.
    POST /api/auth/logout/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            request.user.auth_token.delete()
            return Response({
                'success': True,
                'message': 'Sesión cerrada correctamente en el servidor.'
            }, status=status.HTTP_200_OK)
        except Exception:
            return Response({
                'success': False,
                'message': 'Error al intentar cerrar la sesión en el servidor.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RecuperarContrasenaView(APIView):
    """
    Endpoint mock para la solicitud de recuperación de contraseña.
    POST /api/auth/recuperar-contrasena/
    """
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({
                'success': False,
                'message': 'El correo electrónico es obligatorio.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Simula envío exitoso de correo de recuperación
        return Response({
            'success': True,
            'message': f'Se ha enviado un enlace de recuperación al correo {email} exitosamente.'
        }, status=status.HTTP_200_OK)


class NotificacionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para listar y marcar notificaciones del ciudadano.
    GET /api/notificaciones/ - Listar notificaciones
    PATCH /api/notificaciones/<id>/ - Cambiar estado a leído
    """
    serializer_class = NotificacionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notificacion.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)