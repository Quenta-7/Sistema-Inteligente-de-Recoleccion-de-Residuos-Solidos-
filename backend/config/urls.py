# backend/config/urls.py
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core import views # Importamos las vistas de nuestra app 'core'

# Creamos un enrutador que asigna las URLs automáticamente
router = DefaultRouter()
router.register(r'zonas', views.ZonaViewSet)
router.register(r'horarios', views.HorarioViewSet)
router.register(r'reportes', views.ReporteViewSet, basename='reporte')
router.register(r'evidencias', views.EvidenciaViewSet, basename='evidencia')
router.register(r'usuarios', views.UsuarioViewSet, basename='usuario')
router.register(r'notificaciones', views.NotificacionViewSet, basename='notificacion')
router.register(r'recompensas', views.RecompensaViewSet, basename='recompensa')
router.register(r'canjes', views.CanjeViewSet, basename='canje')
router.register(r'rutas', views.RutaViewSet, basename='ruta')
router.register(r'incidencias', views.IncidenciaViewSet, basename='incidencia')
router.register(r'calificaciones', views.CalificacionServicioViewSet, basename='calificacion')

urlpatterns = [
    path('admin/', admin.site.urls),
    # Endpoint de login con token
    path('api/auth/login/', views.LoginView.as_view(), name='login'),
    # Endpoint de logout
    path('api/auth/logout/', views.LogoutView.as_view(), name='logout'),
    # Endpoint de recuperar contraseña
    path('api/auth/recuperar-contrasena/', views.RecuperarContrasenaView.as_view(), name='recuperar_contrasena'),
    # Endpoint de consulta DNI
    path('api/consultar-dni/<str:dni>/', views.ConsultarDniView.as_view(), name='consultar_dni'),
    # Endpoint de registro
    path('api/register/', views.RegisterView.as_view(), name='register'),
    # Endpoint de perfil del usuario autenticado
    path('api/perfil/', views.PerfilView.as_view(), name='perfil'),
    # Incluimos todas las rutas generadas por el router bajo el prefijo 'api/'
    path('api/', include(router.urls)), 
]

# Servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)