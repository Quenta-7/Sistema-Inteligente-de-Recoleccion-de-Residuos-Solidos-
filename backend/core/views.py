# backend/core/views.py
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
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
        usuario = self.request.user
        cantidad = serializer.validated_data.get('cantidad')
        
        # Calcular ecopuntos proporcionalmente a la cantidad en kg (20 EcoPuntos por cada kg, mínimo 10)
        ecopuntos = 50
        if cantidad:
            try:
                ecopuntos = max(10, int(float(cantidad) * 20))
            except Exception:
                ecopuntos = 50

        # Si se usó GPS y no se envió dirección explícita
        direccion = serializer.validated_data.get('direccion_entrega')
        lat = serializer.validated_data.get('latitud')
        lng = serializer.validated_data.get('longitud')
        if not direccion and lat is not None and lng is not None:
            direccion = f"Ubicación GPS Satelital Registrada (Lat: {lat:.5f}, Lng: {lng:.5f})"

        zona = serializer.validated_data.get('zona')
        if not zona:
            zona = usuario.zona
            if not zona:
                zona = Zona.objects.filter(activa=True).first()

        evidencia = serializer.save(
            usuario=usuario,
            zona=zona,
            ecopuntos=ecopuntos,
            direccion_entrega=direccion,
            estado='nuevo'
        )

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
            puntos = evidencia.ecopuntos
            usuario.ecopuntos += puntos
            usuario.save()

        # Si el estado cambia, crear una notificación para el ciudadano
        if evidencia.estado != estado_previo:
            if evidencia.estado == 'resuelto':
                puntos = evidencia.ecopuntos
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
    pagination_class = None

    def get_queryset(self):
        # Solo administradores pueden ver y gestionar usuarios
        if hasattr(self.request.user, 'rol') and self.request.user.rol == 'admin':
            return Usuario.objects.all()
        return Usuario.objects.filter(id=self.request.user.id)


class PerfilView(APIView):
    """
    Endpoint para obtener el perfil del usuario autenticado
    GET /api/perfil/ - Devuelve datos del usuario actual con ecopuntos
    PATCH /api/perfil/ - Actualiza los datos de perfil (zona, teléfono, foto_perfil)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        usuario_serializer = UsuarioSerializer(request.user, context={'request': request})
        return Response({
            'success': True,
            'user': usuario_serializer.data
        }, status=status.HTTP_200_OK)

    def patch(self, request):
        usuario = request.user
        serializer = UsuarioSerializer(usuario, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Perfil actualizado correctamente.',
                'user': serializer.data
            }, status=status.HTTP_200_OK)
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


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
        import os
        try:
            token = os.environ.get('RENIEC_API_TOKEN', 'sk_14327.Mp0kGu1vUedcnvCZNFpFFss0NrUEOZ8D')
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
            if hasattr(request.user, 'auth_token'):
                request.user.auth_token.delete()
        except Exception:
            pass
        return Response({
            'success': True,
            'message': 'Sesión cerrada correctamente en el servidor.'
        }, status=status.HTTP_200_OK)


class RecuperarContrasenaView(APIView):
    """
    Solicitud de recuperación de contraseña.
    POST /api/auth/recuperar-contrasena/
    { "email": "usuario@email.com" }
    """
    def post(self, request):
        email = request.data.get('email', '').strip()
        if not email:
            return Response({
                'success': False,
                'message': 'El correo electrónico es obligatorio.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            usuario = Usuario.objects.get(email__iexact=email)
        except Usuario.DoesNotExist:
            return Response({
                'success': True,
                'message': 'Si el correo ingresado se encuentra registrado, recibirás las instrucciones para restablecer tu contraseña.'
            }, status=status.HTTP_200_OK)

        uidb64 = urlsafe_base64_encode(force_bytes(usuario.pk))
        token = default_token_generator.make_token(usuario)

        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        reset_url = f"{frontend_url}/restablecer-contrasena/{uidb64}/{token}"

        # Enviar correo de restablecimiento
        asunto = "Restablecimiento de contraseña - Sistema Inteligente de Recolección de Residuos"
        mensaje_texto = (
            f"Hola {usuario.nombre_completo},\n\n"
            f"Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.\n\n"
            f"Para restablecer tu contraseña, haz clic en el siguiente enlace o cópialo en tu navegador:\n"
            f"{reset_url}\n\n"
            f"Este enlace caducará por seguridad. Si no solicitaste este cambio, puedes ignorar este correo.\n\n"
            f"Atentamente,\n"
            f"Equipo de Gestión de Residuos Sólidos"
        )

        mensaje_html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #059669; margin: 0;">🌱 Sistema de Recolección de Residuos</h2>
                <p style="color: #64748b; font-size: 14px;">Restablecimiento de Contraseña</p>
            </div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="color: #334155;">Hola <strong>{usuario.nombre_completo}</strong>,</p>
            <p style="color: #334155;">Hemos recibido una solicitud para restablecer la contraseña de tu cuenta asociada a <strong>{usuario.email}</strong>.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_url}" style="background-color: #10b981; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Restablecer mi contraseña</a>
            </div>
            <p style="color: #64748b; font-size: 13px;">O copia y pega el siguiente enlace en tu navegador:</p>
            <p style="background-color: #f1f5f9; padding: 10px; border-radius: 6px; font-size: 12px; word-break: break-all; color: #0f172a;">{reset_url}</p>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 25px;">Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
        </div>
        """

        try:
            send_mail(
                subject=asunto,
                message=mensaje_texto,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@residuos.com'),
                recipient_list=[usuario.email],
                html_message=mensaje_html,
                fail_silently=False
            )
        except Exception:
            pass

        return Response({
            'success': True,
            'message': 'Si el correo ingresado se encuentra registrado, recibirás las instrucciones para restablecer tu contraseña en tu bandeja de entrada.'
        }, status=status.HTTP_200_OK)


class ValidarTokenRecuperacionView(APIView):
    """
    Verifica si el token de restablecimiento es válido.
    GET /api/auth/validar-token-recuperacion/<uidb64>/<token>/
    """
    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            usuario = Usuario.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, Usuario.DoesNotExist):
            return Response({
                'valid': False,
                'message': 'El enlace de recuperación es inválido o ha expirado.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(usuario, token):
            return Response({
                'valid': False,
                'message': 'El enlace de recuperación ha expirado o ya fue utilizado.'
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'valid': True,
            'email': usuario.email,
            'nombre_completo': usuario.nombre_completo
        }, status=status.HTTP_200_OK)


class RestablecerContrasenaView(APIView):
    """
    Endpoint para guardar la nueva contraseña usando el token verificado.
    POST /api/auth/restablecer-contrasena/
    {
        "uid": "...",
        "token": "...",
        "password": "Nuevapassword123!"
    }
    """
    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        nueva_password = request.data.get('password')

        if not uidb64 or not token or not nueva_password:
            return Response({
                'success': False,
                'message': 'Todos los campos (uid, token y nueva contraseña) son obligatorios.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if len(nueva_password) < 8:
            return Response({
                'success': False,
                'message': 'La contraseña debe tener al menos 8 caracteres.'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            usuario = Usuario.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, Usuario.DoesNotExist):
            return Response({
                'success': False,
                'message': 'El token o usuario es inválido.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(usuario, token):
            return Response({
                'success': False,
                'message': 'El enlace de recuperación es inválido o ha expirado.'
            }, status=status.HTTP_400_BAD_REQUEST)

        usuario.set_password(nueva_password)
        usuario.save()

        return Response({
            'success': True,
            'message': 'Tu contraseña ha sido actualizada correctamente. Ahora puedes iniciar sesión con tu nueva clave.'
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

    def perform_update(self, serializer):
        from django.utils import timezone
        if 'lat_actual' in serializer.validated_data or 'lng_actual' in serializer.validated_data:
            serializer.save(ultima_actualizacion_gps=timezone.now())
        else:
            serializer.save()

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