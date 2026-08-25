# Backend Documentation

Esta carpeta documenta el backend ubicado en `../BACKEND`. El contenido se generó a partir del código fuente actual, sin asumir endpoints, middlewares o validaciones que no estén implementados.

## Arquitectura general

El backend es una API monolítica en Node.js con Express 5 y módulos por dominio.

- `src/server.js`: punto de arranque. Carga variables de entorno, configura CORS, cookies, `express.json()` y monta las rutas bajo `/api`.
- `src/config/configdb.js`: construye la URI de MongoDB a partir de variables de entorno y abre la conexión con Mongoose.
- `src/config/mercadoPagoConfig.js`: inicializa el cliente de Mercado Pago y expone las operaciones usadas por la app.
- `src/routes/*.js`: define las rutas HTTP por módulo.
- `src/controllers/*.js`: implementa la lógica de negocio y las respuestas HTTP.
- `src/models/*.js`: define los esquemas Mongoose para usuarios, productos, carritos y órdenes.
- `src/schemas/*.js`: validación con Zod para autenticación y productos.

## Flujo de request

1. El cliente llama una ruta bajo `/api/...`.
2. Express resuelve el módulo de rutas correspondiente.
3. El controlador valida parte del input con Zod cuando aplica.
4. El controlador consulta o modifica MongoDB mediante modelos Mongoose.
5. Algunas rutas integran Mercado Pago para crear preferencias o procesar webhooks.
6. La autenticación se mantiene con una cookie `accessToken` de tipo `httpOnly`.

## Módulos funcionales

- `auth`: registro, login, logout y perfil de usuario autenticado por cookie JWT.
- `products`: CRUD de productos.
- `cart`: carrito persistido por usuario y cálculo de total.
- `orders`: creación de órdenes y generación de preferencia de pago en Mercado Pago.
- `webhook`: recepción de eventos de pago de Mercado Pago.

## Observaciones relevantes del código actual

- El puerto está fijo en `3001`; no se lee desde variables de entorno.
- Las rutas de productos incluyen comentarios de "rutas protegidas", pero no hay middleware de autenticación/autorización montado en esas rutas.
- Algunos controladores no normalizan todos los errores. Por ejemplo, `PUT /api/products/:id` y errores inesperados en `POST /api/cart/add` responden con `200` y un mensaje de error en el cuerpo.
- No existe middleware visible que cargue `req.user`; por eso las rutas del carrito dependen en la práctica del `userId` enviado por parámetro o body.

## Instalación local

### Requisitos

- Node.js instalado.
- MongoDB accesible con las credenciales configuradas.
- Credenciales de Mercado Pago si se probará el flujo de pagos.

### Pasos

```bash
cd ../BACKEND
npm install
```

Crear un archivo `.env` en `../BACKEND` con las variables requeridas.

Iniciar en desarrollo:

```bash
npm run dev
```

Iniciar en modo normal:

```bash
npm start
```

La API queda escuchando en:

```text
http://localhost:3001
```

## Variables de entorno necesarias

Las siguientes variables están referenciadas desde el código del backend:

```env
MONGO_DB_URI=
MONGO_DB_USER=
MONGO_DB_PASSWORD=
MONGO_DB_NAME=
JWT_SECRET=
FRONTEND_URL=
MP_ACCESS_TOKEN=
BACKEND_URL=
MERCADOPAGO_WEBHOOK_SECRET=
NODE_ENV=
```

### Qué hace cada variable

- `MONGO_DB_URI`: plantilla de conexión a MongoDB. El código espera placeholders `<db_username>`, `<db_password>` y `<db_name>` para reemplazarlos.
- `MONGO_DB_USER`: usuario de MongoDB.
- `MONGO_DB_PASSWORD`: contraseña de MongoDB.
- `MONGO_DB_NAME`: nombre de la base de datos.
- `JWT_SECRET`: clave para firmar y verificar el JWT de sesión.
- `FRONTEND_URL`: origen permitido por CORS y base para los `back_urls` de Mercado Pago.
- `MP_ACCESS_TOKEN`: access token usado por el SDK de Mercado Pago.
- `BACKEND_URL`: URL pública del backend usada como `notification_url` del webhook. Si falta, el código usa `http://localhost:3001`.
- `MERCADOPAGO_WEBHOOK_SECRET`: secreto para validar la firma del webhook. En desarrollo puede omitirse, pero en producción es necesario.
- `NODE_ENV`: controla flags de cookies y el comportamiento del webhook en desarrollo/producción.

## Ejemplo mínimo de `.env`

```env
MONGO_DB_URI=mongodb+srv://<db_username>:<db_password>@cluster.example.mongodb.net/<db_name>?retryWrites=true&w=majority
MONGO_DB_USER=tu_usuario
MONGO_DB_PASSWORD=tu_password
MONGO_DB_NAME=tu_base
JWT_SECRET=tu_secreto_jwt
FRONTEND_URL=http://localhost:5173
MP_ACCESS_TOKEN=tu_access_token_mp
BACKEND_URL=http://localhost:3001
MERCADOPAGO_WEBHOOK_SECRET=tu_secreto_webhook
NODE_ENV=development
```

## Referencias cruzadas

- API HTTP: ver `docs/API.md`
- Modelos de datos: ver `docs/DATA_MODEL.md`