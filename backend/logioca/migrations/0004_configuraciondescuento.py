# Generated by Django 4.2.21 on 2025-05-17 23:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('logioca', '0003_carritoitem_alter_itemcarrito_unique_together_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='ConfiguracionDescuento',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fecha_especial', models.DateField(unique=True)),
                ('monto_descuento', models.DecimalField(decimal_places=2, max_digits=10)),
                ('descripcion', models.CharField(blank=True, max_length=255, null=True)),
            ],
        ),
    ]
