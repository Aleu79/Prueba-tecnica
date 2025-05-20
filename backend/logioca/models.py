from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now

class Cliente(models.Model):
    ROLES = (
        ('admin', 'Admin'),
        ('vip', 'VIP'),
        ('normal', 'No VIP'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    rol = models.CharField(max_length=10, choices=ROLES, default='normal')
    fecha_ultima_evaluacion_vip = models.DateField(null=True, blank=True)

    def __str__(self):
        return f'{self.user.username} - {self.rol}'

class HistorialVIP(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(null=True, blank=True)  


class Carrito(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    total_pagado = models.DecimalField(max_digits=10, decimal_places=2)
    fecha = models.DateTimeField(auto_now_add=True)
    tipo = models.CharField(max_length=20, default='normal') 
    


    def __str__(self):
        return f'Carrito de {self.cliente.user.username} - {self.fecha.date()} - ${self.total_pagado}'


class CarritoItem(models.Model):
    carrito = models.ForeignKey(Carrito, related_name='items', on_delete=models.CASCADE)
    nombre = models.CharField(max_length=255)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    cantidad = models.PositiveIntegerField()

    def subtotal(self):
        return self.precio_unitario * self.cantidad

    def __str__(self):
        return f'{self.nombre} x{self.cantidad}'
    
class ConfiguracionDescuento(models.Model):
    fecha_especial = models.DateField(unique=True)
    descripcion = models.CharField(max_length=255, blank=True, null=True)
    monto_minimo = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    descuento = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.fecha_especial} - {self.descripcion or 'sin descripción'}"
