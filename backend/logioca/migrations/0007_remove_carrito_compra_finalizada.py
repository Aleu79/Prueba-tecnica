# Generated by Django 4.2.21 on 2025-05-18 16:55

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('logioca', '0006_carrito_compra_finalizada'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='carrito',
            name='compra_finalizada',
        ),
    ]
