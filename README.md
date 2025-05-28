# 🛒 Prueba Tecnica Eccomerce

Este proyecto es una aplicación web de tienda en línea que incluye:

- Gestión de clientes VIP y no VIP.
- Aplicación dinámica de descuentos según tipo de cliente, cantidad de productos o fechas especiales.
- Historial de cambios VIP.
- Dashboard administrativo en Angular.
- Backend en Django + Django REST Framework.

---

## 🔧 Tecnologías

| Parte         | Stack                        |
|--------------|------------------------------|
| Frontend     | Angular, Tailwind CSS        |
| Backend      | Django, Django REST Framework|
| Base de datos| SQLite (desarrollo)          |
| Autenticación| JWT                          |

---


## 🧠 Elección de Tecnologías y Adaptaciones Realizadas

### ❓ ¿Por qué Django?

- **Evaluación más realista y completa**: Tener un backend funcional permite evaluar no solo la interfaz, sino también la lógica del negocio, la persistencia de datos y la seguridad.
- **Mejor manejo de estados y lógica compleja**: Lógicas como la aplicación dinámica de promociones, verificación de estados VIP, y el historial de cambios se gestionan de forma mucho más clara y mantenible desde el backend.
- **Autenticación real**: Se usó JWT para manejar sesiones de usuario, algo fundamental para sistemas con roles diferenciados como clientes y administradores.
- **Simulación de un entorno real de producción**: Este stack refleja un caso de uso profesional, ideal para probar integraciones entre frontend y backend.

### 🛠️ Adaptaciones sobre el enunciado original

- **Parámetros simulados pasaron a ser funcionales**: En lugar de simular condiciones (como "si un cliente es VIP"), se implementó un sistema real de autenticación y validación de estados desde el backend.
- **Promociones más completas**: Se incorporó una lógica más robusta para aplicar o descartar promociones según el tipo de cliente, el subtotal y las fechas especiales.
- **Historial de clientes VIP**: Se implementó el seguimiento de entradas y salidas del estado VIP, algo que no estaba explícito en el enunciado original, pero agrega mucho valor al análisis.
- **Separación real de roles (VIP, No VIP, Admin)**: Se desarrollaron vistas y permisos diferenciados según el tipo de usuario autenticado.
- **Ajustes en las reglas de descuentos**: Se modificaron algunos criterios de promoción para que tengan mayor sentido desde el punto de vista del negocio. Por ejemplo, se ajustó la lógica del producto bonificado: para obtenerlo, el cliente debe comprar al menos 2 unidades del mismo producto; de lo contrario, la bonificación no se aplica. Esto evita abusos y refleja mejor una promoción comercial real.



---

## 🔧 Credenciales

|Tipo| Usuarios        | Contraseña                    |
|--------------|--------------|------------------------------|
|Vip| damian vip   | 12       |
|Admin| zulma     | 12|
|No VIP| lautaro| 12      |
|| Autenticación| JWT                          |

---

## 📦 Estructura del Proyecto

### Backend (Django)

- `clientes/`: modelos y lógica de clientes VIP y no VIP.
- `carrito/`: lógica de descuentos, promociones, y compras.
- `auth/`: autenticación con JWT.
- `historial/`: historial de cambios en el estado VIP.

### Frontend (Angular)

- `src/app/services/`: lógica de negocio separada por servicios (`ClienteService`, `CartApiService`, etc).
- `src/app/pipes/`: pipes personalizados (`CapitalizePipe`).
- `src/app/guards/`: `AuthGuard` para proteger rutas.

---

## 🎯 Lógica de Descuentos

### 🎁 Clientes No VIP

- **4 productos exactos** → 25% de descuento.
- **Más de 10 productos** → $100 de descuento.
- **Promoción especial por fecha** → $300 si supera un monto mínimo configurado.

🟡 Nota: Si hay una promoción especial por fecha activa y el cliente cumple las condiciones, se descartan automáticamente las demás promociones. Esta promoción tiene prioridad sobre el resto.

### 🏅 Clientes VIP

- No acceden a promociones normales ni especiales.
- Obtienen automáticamente:
  - El **producto más barato bonificado**, **si se compran 2 o más unidades del mismo producto**.
  - $500 de descuento adicional **si el subtotal supera $600**.
  - $5 extra de descuento fijo. (agregue esto por los $500 que pedian) 

### ❗ Promociones descartadas

El sistema registra las promociones no aplicadas por conflicto de reglas (ej. un VIP no puede recibir promociones normales).

---

## 📋 Endpoints Principales (Backend)

| Método | Ruta                               | Descripción                              |
|--------|------------------------------------|------------------------------------------|
| GET    | `/clientes/vip/`                   | Lista clientes VIP                       |
| GET    | `/clientes/no-vip/`                | Lista clientes no VIP                    |
| POST   | `/api/cart/`                    | Crea carrito, aplica descuentos          |
| GET    | `/historial-cambios-vip/?mes=AAAA-MM` | Cambios de estado VIP por mes         |
| POST   | `/descuentos/`              | Crea descuentos por fecha especial       |

---

## 📊 Dashboard Administrativo

El dashboard (solo para administradores) permite:

- Visualizar clientes VIP y no VIP.
- Crear promociones especiales configurando:
  - Fecha.
  - Descripción.
  - Monto mínimo requerido.
- Consultar historial de entradas/salidas VIP por mes.

---

## 🛡️ Seguridad

- Todas las rutas sensibles están protegidas mediante tokens JWT.
- Se utiliza `AuthGuard` en Angular para proteger rutas del dashboard.

---

## 🚀 Para correr el proyecto

### Backend (Django)

```bash
cd backend/
python3 -m venv env
source env/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend (Angular)

```bash
cd signal-store/
npm install         
npm run start
```


### ❗ Corrección detectada durante el desarrollo

Durante las pruebas, me di cuenta de que había un error lógico importante: la función que evalúa si un cliente debe ser promovido a VIP (evaluar_rol_vip) se ejecutaba antes de guardar la compra actual en la base de datos. Esto provocaba que incluso si el total del mes superaba los $10.000, el cliente no era promovido a VIP porque la compra más reciente todavía no contaba en el cálculo.

Además, noté que faltaban mensajes informativos al usuario cuando se producía un cambio de rol, como por ejemplo:

🎉 ¡Felicidades! Superaste los $10.000 este mes y ahora sos un cliente VIP.

Por cuestiones de transparencia y equidad, no voy a tocar el codigo, así todos tenemos el mismo punto de partida y el mismo tiempo para aplicar las mejoras o correcciones necesarias. Solo se documenta este hallazgo en el README para dejarlo claro.

### ⚠️ Nota sobre la promoción especial por fecha
Aunque el sistema permite configurar una promoción especial por fecha (ej. $300 de descuento si el monto supera un mínimo), actualmente no está funcionando correctamente. Por defecto, siempre aplicará un descuento fijo de $300, ya que la lógica condicional no quedó finalizada. Pensé que había quedado funcional, pero al final prioricé el enfoque en la experiencia de usuario y el diseño del dashboard, y este detalle se me pasó.

---

