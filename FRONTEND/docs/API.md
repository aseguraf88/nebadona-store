# API Reference

Base URL local:

```text
http://localhost:3001/api
```

Esta referencia describe las rutas observadas en `../BACKEND/src/routes` y el comportamiento real implementado en sus controladores.

## Auth

### POST `/auth/register`

Registra un usuario nuevo. El primer usuario registrado queda con `isAdmin: true`.

Request JSON:

```json
{
  "username": "admin123",
  "email": "admin@correo.com",
  "password": "admin123"
}
```

Reglas validadas por Zod:

- `username`: string, 3 a 20 caracteres.
- `email`: email válido, 6 a 254 caracteres.
- `password`: string, 6 a 254 caracteres.

Respuesta exitosa `201`:

```json
{
  "message": "Usuario registrado con éxito."
}
```

Efectos laterales:

- Setea cookie `accessToken` `httpOnly`.

Errores observados:

- `400`: `{ "message": "El usuario ya existe" }`
- `500`: `{ "message": "Error interno al registrar usuario." }`

Nota: el controlador no maneja `ZodError` de forma específica en esta ruta, por lo que errores de validación también terminan en `500` con el mensaje genérico.

### POST `/auth/login`

Autentica al usuario y devuelve su información pública.

Request JSON:

```json
{
  "email": "janouser@correo.com",
  "password": "pass123"
}
```

Respuesta exitosa `200`:

```json
{
  "id": "6870f...",
  "username": "janouser",
  "email": "janouser@correo.com",
  "isAdmin": false
}
```

Efectos laterales:

- Setea cookie `accessToken` `httpOnly`.

Errores observados:

- `400`: `{ "message": "Credenciales inválidas." }`
- `400`: lista de errores Zod, por ejemplo:

```json
[
  { "message": "Invalid email address" }
]
```

- `500`: `{ "message": "Error interno al iniciar sesión." }`

### POST `/auth/logout`

Limpia la cookie de sesión.

Sin body.

Respuesta exitosa `200`:

```json
{
  "message": "Cierre de Sesión Exitoso."
}
```

### GET `/auth/profile`

Obtiene el perfil del usuario autenticado usando la cookie `accessToken`.

Entrada:

- Cookie requerida: `accessToken`

Respuesta exitosa `200`:

```json
{
  "id": "6870f...",
  "email": "janouser@correo.com",
  "isAdmin": false,
  "username": "janouser"
}
```

Errores observados:

- `404`: `{ "message": "Usuario no encontrado" }`
- `401`: `{ "message": "No autorizado." }`

## Products

### GET `/products`

Lista todos los productos.

Respuesta exitosa `200`:

```json
[
  {
    "_id": "6870f...",
    "name": "Calceta Snoopy y sus amigos",
    "description": "Calceta muy divertida. Muy divertida para grandes y adultos.",
    "price": 4000,
    "stock": 15,
    "imageUrl": "https://...",
    "createdAt": "2026-07-19T10:00:00.000Z",
    "updatedAt": "2026-07-19T10:00:00.000Z"
  }
]
```

Errores observados:

- `500`: `{ "message": "Error al obtener productos." }`

### GET `/products/:id`

Obtiene un producto por su ObjectId.

Parámetros:

- `id` en path.

Respuesta exitosa `200`:

```json
{
  "_id": "6870f...",
  "name": "Calceta Snoopy y sus amigos",
  "description": "Calceta muy divertida. Muy divertida para grandes y adultos.",
  "price": 4000,
  "stock": 15,
  "imageUrl": "https://...",
  "createdAt": "2026-07-19T10:00:00.000Z",
  "updatedAt": "2026-07-19T10:00:00.000Z"
}
```

Observación: si el ID no existe pero la consulta no falla, el controlador devuelve `200` con `null`.

Errores observados:

- `500`: `{ "message": "Error al obtener el producto." }`

### POST `/products`

Crea un producto.

Request JSON:

```json
{
  "name": "Calceta Snoopy y sus amigos",
  "description": "Calceta muy divertida. Muy divertida para grandes y adultos.",
  "price": 4000,
  "stock": 15,
  "imageUrl": "https://res.cloudinary.com/.../image.png"
}
```

Reglas validadas por Zod:

- `name`: string, 3 a 50 caracteres.
- `description`: string, 50 a 500 caracteres.
- `price`: number >= 0.
- `stock`: number >= 0.
- `imageUrl`: URL válida.

Respuesta exitosa `201`:

```json
{
  "message": "Producto creado exitosamente.",
  "product": {
    "_id": "6870f...",
    "name": "Calceta Snoopy y sus amigos",
    "description": "Calceta muy divertida. Muy divertida para grandes y adultos.",
    "price": 4000,
    "stock": 15,
    "imageUrl": "https://res.cloudinary.com/.../image.png",
    "createdAt": "2026-07-19T10:00:00.000Z",
    "updatedAt": "2026-07-19T10:00:00.000Z"
  }
}
```

Errores observados:

- `400`: lista de errores Zod.
- `500`: `{ "message": "Error al crear el producto." }`

### PUT `/products/:id`

Actualiza parcialmente un producto.

Parámetros:

- `id` en path.

Request JSON de ejemplo:

```json
{
  "stock": 500
}
```

Respuesta exitosa `200`:

```json
{
  "_id": "6870f...",
  "name": "Calceta Snoopy y sus amigos",
  "description": "Calceta muy divertida. Muy divertida para grandes y adultos.",
  "price": 4000,
  "stock": 500,
  "imageUrl": "https://...",
  "createdAt": "2026-07-19T10:00:00.000Z",
  "updatedAt": "2026-07-19T10:05:00.000Z"
}
```

Errores observados:

- `404`: `{ "message": "Producto no encontrado." }`
- `200`: `{ "message": "Error al actualizar producto." }` en errores inesperados o de validación, porque el controlador no fija código de estado en el `catch`.

### DELETE `/products/:id`

Elimina un producto por ID.

Parámetros:

- `id` en path.

Respuesta exitosa `200`:

```json
{
  "_id": "6870f...",
  "name": "Calceta Snoopy y sus amigos",
  "description": "Calceta muy divertida. Muy divertida para grandes y adultos.",
  "price": 4000,
  "stock": 15,
  "imageUrl": "https://..."
}
```

Observación: si el producto no existía, `findByIdAndDelete` puede devolver `null` con estado `200`.

Errores observados:

- `500`: `{ "message": "Error al eliminar el producto." }`

## Cart

### POST `/cart/add`

Agrega un producto al carrito. El controlador intenta usar `req.user._id` o `req.body.userId`; como no hay middleware visible que setee `req.user`, en la práctica el `userId` debe enviarse en el body.

Request JSON:

```json
{
  "userId": "6a222122bf34569eb9a5ef42",
  "productId": "6a2b6f5915c115c8efe7946d",
  "quantity": 2
}
```

Respuesta exitosa `200`:

```json
{
  "message": "Producto agregado al carrito",
  "cart": {
    "_id": "6870f...",
    "userId": "6a222122bf34569eb9a5ef42",
    "products": [
      {
        "productId": {
          "_id": "6a2b6f5915c115c8efe7946d",
          "name": "Calceta Snoopy y sus amigos",
          "price": 4000,
          "stock": 15,
          "imageUrl": "https://...",
          "description": "Calceta muy divertida. Muy divertida para grandes y adultos."
        },
        "quantity": 2
      }
    ]
  }
}
```

Errores observados:

- `400`: `{ "message": "El userId es requerido" }`
- `400`: `{ "message": "El productId es requerido" }`
- `400`: `{ "message": "La cantidad debe ser al menos de 1" }`
- `400`: `{ "message": "Producto no econtrado" }`
- `400`: `{ "message": "Solo hay X de unidades disponibles" }`
- `200`: `{ "message": "ERROR" }` en errores inesperados.

### GET `/cart/get/:userId`

Obtiene el carrito de un usuario y popula los productos.

Parámetros:

- `userId` en path.

Respuesta exitosa `200`:

```json
{
  "message": "Carrito obtenido con éxito",
  "cart": {
    "_id": "6870f...",
    "userId": "6a222122bf34569eb9a5ef42",
    "products": [
      {
        "productId": {
          "_id": "6a2b6f5915c115c8efe7946d",
          "name": "Calceta Snoopy y sus amigos",
          "description": "Calceta muy divertida. Muy divertida para grandes y adultos.",
          "price": 4000,
          "stock": 15,
          "imageUrl": "https://..."
        },
        "quantity": 2
      }
    ]
  }
}
```

Errores observados:

- `404`: `{ "message": "Carrito no econtrado" }`
- `500`: `{ "message": "Error del servidor al obtener el carrito", "error": "..." }`

### GET `/cart/total/:userId`

Calcula el total del carrito.

Parámetros:

- `userId` en path.

Respuesta exitosa `200`:

```json
{
  "message": "Total obtenido con éxito",
  "total": 8000
}
```

Errores observados:

- `400`: `{ "message": "El userId es requerid" }`
- `404`: `{ "message": "Carrito no encontrado" }`
- `500`: `{ "message": "Error del servidor al obtener el total" }`

### PUT `/cart/update/:userId`

Actualiza la cantidad de un producto ya presente en el carrito.

Parámetros:

- `userId` en path.

Request JSON:

```json
{
  "productId": "6a2b6f5915c115c8efe7946d",
  "quantity": 3
}
```

Respuesta exitosa `200`:

```json
{
  "message": "Carrito actualizado con éxito",
  "cart": {
    "_id": "6870f...",
    "userId": "6a222122bf34569eb9a5ef42",
    "products": [
      {
        "productId": "6a2b6f5915c115c8efe7946d",
        "quantity": 3
      }
    ]
  }
}
```

Errores observados:

- `404`: `{ "message": "Carrito no econtrado" }`
- `404`: `{ "message": "Producto no econtrado" }`
- `404`: `{ "message": "Producto no econtrado en el carrito" }`
- `400`: `{ "message": "Solo hay X unidades disponibles" }`
- `500`: `{ "message": "Error del servidor al actualizar el carrito", "error": "..." }`

### DELETE `/cart/removeProduct/:userId`

Elimina un producto específico del carrito.

Parámetros:

- `userId` en path.

Request JSON:

```json
{
  "productId": "6a2b6f5915c115c8efe7946d"
}
```

Respuesta exitosa `200`:

```json
{
  "message": "Producto eliminado del carrito con éxito",
  "cart": {
    "_id": "6870f...",
    "userId": "6a222122bf34569eb9a5ef42",
    "products": []
  }
}
```

Errores observados:

- `400`: `{ "message": "El userId es requerido" }`
- `404`: `{ "message": "Carrito no encontrado" }`
- `404`: `{ "message": "Producto no encontrado en el carrito" }`
- `500`: `{ "message": "Error del servidor al eliminar el producto del carrito" }`

### DELETE `/cart/clear/:userId`

Vacía todo el carrito del usuario.

Parámetros:

- `userId` en path.

Respuesta exitosa `200`:

```json
{
  "message": "Carrito vaciado con éxito",
  "cart": {
    "_id": "6870f...",
    "userId": "6a222122bf34569eb9a5ef42",
    "products": []
  }
}
```

Errores observados:

- `404`: `{ "message": "Carrito no encontrado" }`
- `500`: `{ "message": "Error del servidor al eliminar un producto" }`

## Orders

### POST `/orders/create`

Crea una orden pendiente en MongoDB para el flujo de WhatsApp.

Request JSON:

```json
{
  "items": [
    {
      "id": "6870f...",
      "title": "Calceta Snoopy y sus amigos",
      "quantity": 2,
      "unit_price": 4000,
      "currency_id": "ARS"
    }
  ],
  "payer": {
    "email": "comprador@correo.com"
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
  }
}
```

Respuesta exitosa `201`:

```json
{
  "success": true,
  "message": "Orden creada exitosamente"
}
```

Errores observados:

- `400`: `{ "success": false, "message": "Se requieren items para crear la orden" }`
- `400`: `{ "success": false, "message": "Se requiere email del comprador" }`
- `500`: `{ "success": false, "message": "Error al crear la orden", "error": "..." }`


Nota: este controlador no tiene `try/catch` alrededor del flujo principal de producción. Fallos de red o errores del SDK no tienen una respuesta explícita definida en el archivo actual.