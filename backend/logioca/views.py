from django.views.decorators.csrf import csrf_exempt
from django.db.models import Sum
from django.utils.timezone import now
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from decimal import Decimal
from datetime import timedelta
import calendar

from .models import Cliente, Carrito, CarritoItem, ConfiguracionDescuento, HistorialVIP


def evaluar_rol_vip(cliente):
    hoy = now().date()
    primer_dia_mes = hoy.replace(day=1)
    ultimo_dia_mes = hoy.replace(
        day=calendar.monthrange(hoy.year, hoy.month)[1])

    carritos_mes = Carrito.objects.filter(cliente=cliente, fecha__date__range=[
                                          primer_dia_mes, ultimo_dia_mes])
    total_mes = carritos_mes.aggregate(Sum('total_pagado'))[
        'total_pagado__sum'] or 0
    if total_mes > 10000 and cliente.rol != 'vip':
        cliente.rol = 'vip'
        cliente.fecha_ultima_evaluacion_vip = hoy
        cliente.save()
        HistorialVIP.objects.create(cliente=cliente, fecha_inicio=hoy)

    elif not carritos_mes.exists() and cliente.rol == 'vip':
        cliente.rol = 'normal'
        cliente.fecha_ultima_evaluacion_vip = hoy
        cliente.save()

        historial = HistorialVIP.objects.filter(
            cliente=cliente, fecha_fin__isnull=True).last()
        if historial:
            historial.fecha_fin = hoy
            historial.save()
        # mensaje de te sacamos el viop


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Username and password are required.'}, status=400)

    user = authenticate(request, username=username, password=password)
    if not user:
        return Response({'error': 'Invalid credentials'}, status=401)

    try:
        cliente = Cliente.objects.get(user=user)
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Login successful',
            'username': user.username,
            'rol': cliente.rol,
            'token': str(refresh.access_token),
            'refresh': str(refresh),
        })
    except Cliente.DoesNotExist:
        return Response({'error': 'Cliente no encontrado para este usuario'}, status=404)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def cart_create_view(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({'error': 'Token no proporcionado'}, status=401)

    token = auth_header.split(' ')[1]
    jwt_authenticator = JWTAuthentication()
    try:
        validated_token = jwt_authenticator.get_validated_token(token)
        user = jwt_authenticator.get_user(validated_token)
    except AuthenticationFailed:
        return Response({'error': 'Token inválido o expirado'}, status=401)

    cliente = get_object_or_404(Cliente, user=user)
    evaluar_rol_vip(cliente)

    productos = request.data.get('products', [])
    if not productos:
        return Response({'error': 'No se proporcionaron productos'}, status=400)

    es_compra_final = request.data.get('compra_finalizada', False)
    cantidad_total = sum([p['quantity'] for p in productos])
    subtotal = sum([Decimal(p['price']) * p['quantity'] for p in productos])
    subtotal_original = subtotal

    descuento_total = Decimal('0.0')
    descuentos = []
    promociones_descartadas = []
    tipo_carrito = 'normal'
    hoy = now().date()

    promocion_especial = None
    aplico_promocion_especial = False

    config = ConfiguracionDescuento.objects.filter(fecha_especial=hoy).first()
    if config:
        promocion_especial = {
            'descripcion': config.descripcion,
            'monto_minimo': float(config.monto_minimo),
        }

        if cliente.rol != 'vip':
            if subtotal >= config.monto_minimo:
                descuento_total += Decimal('300')
                descripcion = config.descripcion or f"Descuento especial del {config.fecha_especial}"
                descuentos.append(f"{descripcion}: -$300.00")
                tipo_carrito = 'especial'
                aplico_promocion_especial = True

                if cantidad_total == 4:
                    promociones_descartadas.append("25% por comprar exactamente 4 productos")
                if cantidad_total > 10:
                    promociones_descartadas.append("Descuento $100 por más de 10 productos")
            else:
                aplico_promocion_especial = False
        else:
            descripcion = config.descripcion or f"Descuento especial del {config.fecha_especial}"
            promociones_descartadas.append(f"{descripcion}: -$300.00")

    if not aplico_promocion_especial:
        if cliente.rol != 'vip':
            if cantidad_total == 4:
                descuento_25 = subtotal * Decimal('0.25')
                descuento_total += descuento_25
                descuentos.append(f"25% por comprar exactamente 4 productos: -${descuento_25:.2f}")
            if cantidad_total > 10:
                descuento_100 = Decimal('100')
                descuento_total += descuento_100
                descuentos.append("Descuento $100 por más de 10 productos")
        else:
            if cantidad_total == 4:
                promociones_descartadas.append("25% por comprar exactamente 4 productos")
            if cantidad_total > 10:
                promociones_descartadas.append("Descuento $100 por más de 10 productos")

            # VIP: bonifica producto más barato si hay al menos 2 del mismo
            productos_elegibles = [p for p in productos if p['quantity'] >= 2]
            if productos_elegibles:
                producto_mas_barato = min(productos_elegibles, key=lambda p: Decimal(p['price']))
                descuento_barato = Decimal(producto_mas_barato['price'])
                descuento_total += descuento_barato
                descuentos.append(
                    f"Producto '{producto_mas_barato.get('name') or producto_mas_barato.get('title')}' bonificado por tener al menos 2 unidades: -${descuento_barato:.2f}"
                )
            else:
                promociones_descartadas.append("Bonificación de producto más barato (requiere al menos 2 unidades del mismo producto)")

            # VIP: descuento adicional si subtotal supera $600
            if subtotal >= 600:
                descuento_500 = Decimal('500')
                descuento_total += descuento_500
                descuentos.append("Descuento VIP adicional por superar $600: -$500")

            tipo_carrito = 'vip'

    total_pagado = max(subtotal_original - descuento_total, 0)

    if es_compra_final:
        carrito = Carrito.objects.create(
            cliente=cliente, total_pagado=total_pagado, tipo=tipo_carrito)
        for p in productos:
            CarritoItem.objects.create(
                carrito=carrito,
                nombre=p.get('name') or p.get('title') or 'Producto sin nombre',
                precio_unitario=Decimal(p['price']),
                cantidad=p['quantity'],
            )

    return Response({
        'username': user.username,
        'rol': cliente.rol,
        'subtotaloriginal': float(subtotal_original),
        'subtotal': float(subtotal),
        'total_pagado': float(total_pagado),
        'tipo_carrito': tipo_carrito,
        'descuentos_aplicados': descuentos,
        'promociones_descartadas': promociones_descartadas,
        'productos': productos,
        'promocion_especial': promocion_especial,
        'aplico_promocion_especial': aplico_promocion_especial,
    })

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def historial_cambios_vip_view(request):
    mes = request.query_params.get('mes')
    if not mes:
        return Response({'error': 'Se requiere el parámetro "mes" en formato YYYY-MM'}, status=400)

    try:
        anio, mes_num = map(int, mes.split('-'))
    except ValueError:
        return Response({'error': 'Formato de mes inválido. Use YYYY-MM'}, status=400)

    primer_dia = now().replace(year=anio, month=mes_num, day=1).date()
    ultimo_dia = primer_dia.replace(day=calendar.monthrange(anio, mes_num)[1])

    vip_entrantes = HistorialVIP.objects.filter(
        fecha_inicio__range=(primer_dia, ultimo_dia))
    vip_salientes = HistorialVIP.objects.filter(
        fecha_fin__range=(primer_dia, ultimo_dia))

    def formato(hist):
        return {
            'username': hist.cliente.user.username,
            'fecha': hist.fecha_inicio if hist.fecha_inicio else hist.fecha_fin
        }

    return Response({
        'vip_entrantes': [formato(h) for h in vip_entrantes],
        'vip_salientes': [formato(h) for h in vip_salientes],
    })


@csrf_exempt
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def descuentos_especiales_view(request):
    if request.method == 'GET':
        descuentos = ConfiguracionDescuento.objects.all().order_by('fecha_especial')
        data = [
            {
                'id': d.id,
                'fecha_especial': d.fecha_especial,
                'monto_minimo': float(d.monto_minimo),
                'descuento': float(d.descuento),
                'descripcion': d.descripcion
            } for d in descuentos
        ]
        return Response(data)

    elif request.method == 'POST':
        data = request.data
        fecha = data.get('fecha_especial')
        monto_minimo = data.get('monto_minimo')
        descuento = data.get('descuento')
        descripcion = data.get('descripcion', '')
        print('data',data)

        if not fecha or monto_minimo is None or descuento is None:
            return Response({'error': 'Faltan campos'}, status=403)

        if ConfiguracionDescuento.objects.filter(fecha_especial=fecha).exists():
            return Response({'error': 'Ya existe una promoción en esa fecha.'}, status=403)

        ConfiguracionDescuento.objects.create(
            fecha_especial=fecha,
            monto_minimo=monto_minimo,
            descuento=descuento,
            descripcion=descripcion
        )
        return Response({'message': 'Descuento creado correctamente'})



@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def listar_clientes_por_rol(request, rol):
    if rol not in ['vip', 'normal']:
        return Response({'error': 'Rol no válido'}, status=400)

    clientes = Cliente.objects.filter(rol=rol)
    data = []

    for cliente in clientes:
        total_pagado = Carrito.objects.filter(cliente=cliente).aggregate(
            Sum('total_pagado'))['total_pagado__sum'] or 0
        cantidad_compras = Carrito.objects.filter(cliente=cliente).count()

        dias_restantes = None
        if cliente.rol == 'vip' and cliente.fecha_ultima_evaluacion_vip:
            fin_periodo = cliente.fecha_ultima_evaluacion_vip + \
                timedelta(days=30)
            dias_restantes = (fin_periodo - now().date()).days
            if dias_restantes < 0:
                dias_restantes = 0

        historial_vip = HistorialVIP.objects.filter(
            cliente=cliente).order_by('-fecha_inicio')
        historial = [
            {
                'desde': h.fecha_inicio,
                'hasta': h.fecha_fin if h.fecha_fin else 'Actual'
            } for h in historial_vip
        ]

        data.append({
            'username': cliente.user.username,
            'rol': cliente.rol,
            'fecha_ultima_evaluacion_vip': cliente.fecha_ultima_evaluacion_vip,
            'total_pagado': float(total_pagado),
            'cantidad_compras': cantidad_compras,
            'dias_restantes_vip': dias_restantes,
            'historial_vip': historial
        })

    return Response(data, status=200)
