from django.contrib import admin
from .models import Usuario, Zona, Horario, Reporte, CalificacionServicio, BitacoraAuditoria

admin.site.register(Usuario)
admin.site.register(Zona)
admin.site.register(Horario)
admin.site.register(Reporte)
admin.site.register(CalificacionServicio)
admin.site.register(BitacoraAuditoria)
