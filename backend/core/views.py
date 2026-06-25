# backend/core/views.py
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from .models import Zona, Horario, Reporte, Usuario, Evidencia, Notificacion, Recompensa, Canje, Ruta, Incidencia, CalificacionServicio
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
    RecompensaSerializer,
    CanjeSerializer,
    RutaSerializer,
    IncidenciaSerializer,
    CalificacionServicioSerializer,
)

class ZonaViewSet(viewsets.ModelViewSet):
    queryset = Zona.objects.all()
    serializer_class = ZonaSerializer

class HorarioViewSet(viewsets.ModelViewSet):
    queryset = Horario.objects.all()
    serializer_class = HorarioSerializer

class ReporteViewSet(viewsets.ModelViewSet):
    serializer_class = ReporteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'rol') and user.rol == 'admin':
            return Reporte.objects.all()
        return Reporte.objects.filter(usuario=user)

    def perform_create(self, serializer):
        import random
        import string
        codigo = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        while Reporte.objects.filter(codigo_seguimiento=codigo).exists():
            codigo = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        
        zona = serializer.validated_data.get('zona')
        if not zona:
            zona = self.request.user.zona
            if not zona:
                zona = Zona.objects.filter(activa=True).first()
        
        serializer.save(usuario=self.request.user, codigo_seguimiento=codigo, zona=zona)

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.throttling import SimpleRateThrottle

class LoginRateThrottle(SimpleRateThrottle):
    scope = 'login'

    def get_cache_key(self, request, view):
        if request.method != 'POST':
            return None
        email = request.data.get('email', '')
        ident = self.get_ident(request)
        return self.cache_format % {
            'scope': self.scope,
            'ident': f"{ident}_{email}"
        }

class LoginView(APIView):
    """
    Endpoint para autenticar usuarios con JWT Token
    POST /api/auth/login/
    {
        "email": "usuario@email.com",
        "password": "password123"
    }
    """
    throttle_classes = [LoginRateThrottle]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        
        if serializer.is_valid():
            usuario = serializer.validated_data['usuario']
            
            # Generar token JWT para el usuario
            refresh = RefreshToken.for_user(usuario)
            access_token = str(refresh.access_token)
            
            # Responder con token y datos del usuario autenticado
            usuario_serializer = UsuarioSerializer(usuario)
            
            return Response({
                'success': True,
                'message': f'Bienvenido {usuario.nombre_completo}',
                'token': access_token,
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
        
        # Registrar validador y fecha de validacion si cambia el estado
        nuevo_estado = serializer.validated_data.get('estado', estado_previo)
        if nuevo_estado in ['resuelto', 'rechazado', 'en_revision'] and nuevo_estado != estado_previo:
            from django.utils import timezone
            evidencia = serializer.save(validador=self.request.user, fecha_validacion=timezone.now())
        else:
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

class RecompensaViewSet(viewsets.ModelViewSet):
    queryset = Recompensa.objects.all()
    serializer_class = RecompensaSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return []
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        from rest_framework.exceptions import PermissionDenied
        if not hasattr(self.request.user, 'rol') or self.request.user.rol != 'admin':
            raise PermissionDenied("Solo los administradores pueden crear recompensas.")
        serializer.save()

    def perform_update(self, serializer):
        from rest_framework.exceptions import PermissionDenied
        if not hasattr(self.request.user, 'rol') or self.request.user.rol != 'admin':
            raise PermissionDenied("Solo los administradores pueden modificar recompensas.")
        serializer.save()

class CanjeViewSet(viewsets.ModelViewSet):
    serializer_class = CanjeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if hasattr(self.request.user, 'rol') and self.request.user.rol == 'admin':
            return Canje.objects.all()
        return Canje.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        from django.db import transaction
        from rest_framework.exceptions import ValidationError

        recompensa = serializer.validated_data['recompensa']
        usuario = self.request.user

        with transaction.atomic():
            recompensa_db = Recompensa.objects.select_for_update().get(id=recompensa.id)
            usuario_db = Usuario.objects.select_for_update().get(id=usuario.id)

            if usuario_db.ecopuntos < recompensa_db.puntos:
                raise ValidationError({"detail": "No tienes suficientes EcoPuntos para canjear esta recompensa."})

            if recompensa_db.stock <= 0 or not recompensa_db.disponible:
                raise ValidationError({"detail": "Esta recompensa no tiene stock disponible."})

            usuario_db.ecopuntos -= recompensa_db.puntos
            usuario_db.save()

            recompensa_db.stock -= 1
            if recompensa_db.stock == 0:
                recompensa_db.disponible = False
            recompensa_db.save()

            serializer.save(usuario=usuario_db, puntos=recompensa_db.puntos)

            Notificacion.objects.create(
                usuario=usuario_db,
                mensaje=f"Has canjeado '{recompensa_db.nombre}' por {recompensa_db.puntos} EcoPuntos. Código de canje: {serializer.instance.id}."
            )

class RutaViewSet(viewsets.ModelViewSet):
    serializer_class = RutaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'rol'):
            if user.rol == 'admin':
                return Ruta.objects.all()
            elif user.rol == 'recolector':
                return Ruta.objects.filter(recolector=user)
            elif user.rol == 'ciudadano':
                # Citizens see all routes in their zone (so they can track garbage truck in real time/calificar)
                if user.zona:
                    return Ruta.objects.filter(zona=user.zona)
        return Ruta.objects.none()

class IncidenciaViewSet(viewsets.ModelViewSet):
    serializer_class = IncidenciaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'rol') and user.rol == 'admin':
            return Incidencia.objects.all()
        return Incidencia.objects.filter(recolector=user)

    def perform_create(self, serializer):
        serializer.save(recolector=self.request.user)

class CalificacionServicioViewSet(viewsets.ModelViewSet):
    serializer_class = CalificacionServicioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'rol') and user.rol == 'admin':
            return CalificacionServicio.objects.all()
        return CalificacionServicio.objects.filter(ciudadano=user)

    def perform_create(self, serializer):
        serializer.save(ciudadano=self.request.user)