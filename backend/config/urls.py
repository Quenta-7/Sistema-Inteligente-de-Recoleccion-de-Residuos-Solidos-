# backend/config/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core import views # Importamos las vistas de nuestra app 'core'

# Creamos un enrutador que asigna las URLs automáticamente
router = DefaultRouter()
router.register(r'zonas', views.ZonaViewSet)
router.register(r'horarios', views.HorarioViewSet)
router.register(r'reportes', views.ReporteViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    # Endpoint de login
    path('api/login/', views.LoginView.as_view(), name='login'),
    # Endpoint de registro
    path('api/register/', views.RegisterView.as_view(), name='register'),
    # Incluimos todas las rutas generadas por el router bajo el prefijo 'api/'
    path('api/', include(router.urls)), 
]