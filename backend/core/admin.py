from django.contrib import admin
from .models import Usuario, Zona, Horario, Reporte

admin.site.register(Usuario)
admin.site.register(Zona)
admin.site.register(Horario)
admin.site.register(Reporte)