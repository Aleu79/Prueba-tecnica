from django.contrib import admin
from .models import *
# Register your models here.

admin.site.register(Cliente)
admin.site.register(Carrito)
admin.site.register(HistorialVIP)
@admin.register(ConfiguracionDescuento)
class ConfiguracionDescuentoAdmin(admin.ModelAdmin):
    list_display = ['fecha_especial',  'descripcion']
    list_filter = ['fecha_especial']
    search_fields = ['descripcion']

