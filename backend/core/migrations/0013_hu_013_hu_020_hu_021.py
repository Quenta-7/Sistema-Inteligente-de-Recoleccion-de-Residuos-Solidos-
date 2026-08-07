from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [('core', '0012_evidencia_latitud_evidencia_longitud')]

    operations = [
        migrations.AddField(model_name='usuario', name='active_device_id', field=models.CharField(blank=True, editable=False, max_length=128, null=True)),
        migrations.AddField(model_name='usuario', name='active_session_id', field=models.CharField(blank=True, editable=False, max_length=64, null=True)),
        migrations.AddField(model_name='calificacionservicio', name='estado_moderacion', field=models.CharField(choices=[('visible', 'Visible'), ('oculto', 'Oculto')], default='visible', max_length=10)),
        migrations.AddField(model_name='calificacionservicio', name='fecha_moderacion', field=models.DateTimeField(blank=True, null=True)),
        migrations.AddField(model_name='calificacionservicio', name='moderado_por', field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='calificaciones_moderadas', to=settings.AUTH_USER_MODEL)),
        migrations.CreateModel(
            name='BitacoraAuditoria',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('accion', models.CharField(max_length=100)), ('entidad', models.CharField(max_length=100)),
                ('entidad_id', models.PositiveBigIntegerField(blank=True, null=True)),
                ('detalle', models.JSONField(blank=True, default=dict)), ('ip', models.GenericIPAddressField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('usuario', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.AddIndex(model_name='bitacoraauditoria', index=models.Index(fields=['entidad', 'entidad_id', '-created_at'], name='core_bitaco_entidad_bb2708_idx')),
    ]
