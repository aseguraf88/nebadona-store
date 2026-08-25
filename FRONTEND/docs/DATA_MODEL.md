# Data Model

Los modelos persistidos están definidos con Mongoose en `../BACKEND/src/models`.

## Vista general

Colecciones principales:

- `User`
- `Product`
- `Cart`
- `Order`

Relaciones principales:

- Un `Cart` puede referenciar un `User` mediante `userId`.
- Un `Cart` contiene múltiples referencias a `Product` mediante `products[].productId`.
- Una `Order` puede referenciar un `User` mediante `userId`.
- Una `Order` contiene múltiples productos mediante `products[].productId`.

## User

Colección: `users`

Campos:

- `email`: `String`, requerido, único, trim, longitud 6-254.
- `password`: `String`, requerido, trim, longitud 6-254. Se guarda hasheado con `bcryptjs`.
- `username`: `String`, requerido, trim, longitud 3-20.
- `isAdmin`: `Boolean`, requerido, default `false`.

Ejemplo:

```json
{
  "_id": "6870f...",
  "email": "janouser@correo.com",
  "password": "$2b$10$...",
  "username": "janouser",
  "isAdmin": false
}
```

Regla de negocio observada:

- El primer usuario registrado en la base queda marcado como administrador.

## Product

Colección: `products`

Campos:

- `name`: `String`, requerido, trim.
- `description`: `String`, requerido, trim.
- `price`: `Number`, requerido, mínimo `0`.
- `stock`: `Number`, requerido, mínimo `0`.
- `imageUrl`: `String`, requerido.
- `createdAt`: `Date`, generado por timestamps.
- `updatedAt`: `Date`, generado por timestamps.

Ejemplo:

```json
{
  "_id": "6870f...",
  "name": "Calceta Snoopy y sus amigos",
  "description": "Calceta muy divertida. Muy divertida para grandes y adultos.",
  "price": 4000,
  "stock": 15,
  "imageUrl": "https://res.cloudinary.com/.../image.png",
  "createdAt": "2026-07-19T10:00:00.000Z",
  "updatedAt": "2026-07-19T10:00:00.000Z"
}
```

## Cart

Colección: `carts`

Campos:

- `userId`: `ObjectId -> User`, opcional.
- `products`: arreglo de items.
- `products[].productId`: `ObjectId -> Product`, requerido.
- `products[].quantity`: `Number`, requerido, default `1`, mínimo `1`.
- `createdAt`: `Date`, generado por timestamps.
- `updatedAt`: `Date`, generado por timestamps.

Ejemplo persistido:

```json
{
  "_id": "6870f...",
  "userId": "6a222122bf34569eb9a5ef42",
  "products": [
    {
      "productId": "6a2b6f5915c115c8efe7946d",
      "quantity": 2
    }
  ],
  "createdAt": "2026-07-19T10:00:00.000Z",
  "updatedAt": "2026-07-19T10:05:00.000Z"
}
```

Observaciones:

- El esquema permite `userId` nulo, pero las rutas actuales del backend operan con un `userId` explícito.
- En lecturas, el backend suele poblar `products.productId` con el documento completo del producto.

## Order

Colección: `orders`

Campos raíz:

- `userId`: `ObjectId -> User`, opcional.
- `products`: arreglo de items comprados.
- `totalAmount`: `Number`, requerido, mínimo `0`.
- `status`: `String`, enum `pending | approved | rejected | cancelled | in_process`, default `pending`.
- `mercadoPagoData`: objeto con metadatos de pago.
- `shippingInfo`: objeto requerido con datos de envío.
- `createdAt`: `Date`, generado por timestamps.
- `updatedAt`: `Date`, generado por timestamps.

### Order.products[]

- `productId`: `ObjectId -> Product`, requerido.
- `name`: `String`, opcional.
- `price`: `Number`, requerido.
- `quantity`: `Number`, requerido.
- `imageUrl`: `String`, opcional.

### Order.mercadoPagoData

- `preferenceId`: `String`, opcional.
- `payerEmail`: `String`, opcional.
- `paymentId`: `String`, opcional.
- `paymentStatus`: `String`, enum `pending | approved | rejected | cancelled | in_process`, default `pending`.
- `transactionAmount`: `Number`, opcional.
- `paymentMethodId`: `String`, opcional.
- `paidAt`: `Date`, opcional.

### Order.shippingInfo

- `firstName`: `String`, requerido.
- `lastName`: `String`, requerido.
- `email`: `String`, opcional.
- `phone`: `String`, requerido.
- `address.street`: `String`, requerido.
- `address.number`: `String`, requerido.
- `address.city`: `String`, requerido.
- `address.state`: `String`, requerido.
- `address.zipCode`: `String`, requerido.

Ejemplo persistido:

```json
{
  "_id": "6870f...",
  "products": [
    {
      "productId": "6870f111111111111111111",
      "price": 4000,
      "quantity": 2
    }
  ],
  "totalAmount": 8000,
  "status": "pending",
  "mercadoPagoData": {
    "preferenceId": "123456789-abcdef",
    "payerEmail": "comprador@correo.com",
    "paymentStatus": "pending"
  },
  "shippingInfo": {
    "firstName": "Ana",
    "lastName": "Pérez",
    "email": "comprador@correo.com",
    "phone": "1122334455",
    "address": {
      "street": "Av. Siempre Viva",
      "number": "742",
      "city": "Springfield",
      "state": "Buenos Aires",
      "zipCode": "1000"
    }
  },
  "createdAt": "2026-07-19T10:00:00.000Z",
  "updatedAt": "2026-07-19T10:00:00.000Z"
}
```

Observaciones de negocio:

- `createOrder` crea primero una orden `pending` y luego guarda el `preferenceId` de Mercado Pago.
- Cuando el webhook procesa un pago aprobado, actualiza `status`, rellena `mercadoPagoData` y descuenta stock de cada producto.
- Aunque el esquema permite guardar `name` e `imageUrl` dentro de `products[]`, el controlador actual de creación de órdenes solo persiste `productId`, `quantity` y `price`.

## Resumen de relaciones

```text
User 1 --- 0..n Cart
User 1 --- 0..n Order
Product 1 --- 0..n Cart.products[]
Product 1 --- 0..n Order.products[]
```