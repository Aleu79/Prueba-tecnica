"""
URL configuration for back project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from . import views

urlpatterns = [
    path('api/login/', views.login_view, name='api-login'),
    path('api/cart/', views.cart_create_view, name='api-login'),
    path('descuentos/', views.descuentos_especiales_view),
    path('historial-cambios-vip/', views.historial_cambios_vip_view),
    path('clientes/<str:rol>/', views.listar_clientes_por_rol, name='listar_clientes_por_rol'),

]

