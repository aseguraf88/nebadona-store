# Nebadona Store — Contexto para Claude Code

## Qué es este proyecto
E-commerce por WhatsApp (modelo tipo Kyte) para un negocio chico en Chile.
Sin pasarela de pago integrada: el cliente arma el carrito, la web genera un
mensaje de WhatsApp con el resumen, y el pago se confirma por transferencia
manual. MercadoPago fue eliminado del código por completo (no reintroducir).

## Stack
- **FRONTEND**: React + Vite, arquitectura tipo feature-sliced
  (`entities/`, `features/`, `pages/`, `widgets/`, `shared/`), Tailwind +
  DaisyUI, React Router, Axios, react-hot-toast.
- **BACKEND**: Node/Express + Mongoose (MongoDB), Zod para validación,
  Cloudinary para imágenes — se suben directo desde el navegador, el backend
  nunca recibe bytes de imagen.

## Reglas de trabajo (no negociables, así trabajamos hasta ahora)
- Antes de proponer un cambio en un archivo que no leíste en esta sesión,
  mostralo primero completo. No asumas su contenido ni su schema.
- No declares un fix "resuelto" hasta que el usuario confirme que lo probó.
- Mostrá el diff antes de guardar cambios en archivos existentes.
- No agregues funciones ni cambies de tema sin que se pida explícitamente —
  nada de scope creep. Si algo parece un próximo paso lógico, mencionalo en
  una frase y esperá confirmación, no lo implementes solo.
- Sugerí un commit de checkpoint (`git add . && git commit -m "..."`) antes
  de aplicar un batch de cambios grande, y recordá que el usuario está en
  PowerShell de Windows (no asumir sintaxis de bash tipo `2>/dev/null`).
- Si una búsqueda o lectura falla, decilo explícitamente — no sigas como si
  hubiera funcionado.
- **Un "guardado" confirmado no es prueba de que se aplicó completo.** Pasó
  una vez: se mostró un diff correcto de 2 funciones nuevas, pero solo se
  ejecutó la mitad (faltó la segunda llamada de escritura), y el reporte
  dijo "guardado" igual. Para cualquier cambio que toque más de un bloque o
  archivo: después de guardar, arrancar el servidor (o el smoke test que
  corresponda) ANTES de seguir, y no dar nada por cerrado solo porque el
  guardado no tiró error.
- **Nunca escribas un valor real de variable de entorno en ningún archivo
  versionado** (ni como valor, ni como "ejemplo" en un mensaje de error o
  comentario) — pasó 3 veces con `env.js` por escribir el secreto real en
  el segundo argumento de `.min()` en vez de un mensaje genérico. Los
  mensajes de error de validación deben generarse a partir de nombres de
  variable, nunca de sus valores.
- **Bug conocido de Claude Code en Windows**: pegar bloques de texto largos
  en la consola se puede truncar en silencio, sin ningún aviso (confirmado,
  reportado a Anthropic). Para bloques de código largos que el usuario deba
  pasar, preferir que los reciba como archivo para copiar directamente al
  proyecto, no pedirle que los pegue enteros en la terminal.

## Estado del proyecto
Ver `BACKLOG.md` en la raíz del repo para la lista completa de pendientes,
lo ya resuelto y lo descartado a propósito (incluye la decisión de app
móvil nativa vía Capacitor, pausada hasta después de publicar la web).

## ✅ Tarea cerrada: selector de variantes (talla/color)

Completada de punta a punta en una sesión anterior — los 11 archivos
listados originalmente (`VariantSelector.jsx`, `ProductPage.jsx`,
`ProductCard.jsx`, `ProductDetailModal.jsx`, `CartContext.jsx`,
`cartServices.js`, `CartDrawer.jsx`, `CartModel.js`, `cartControllers.js`,
`OrderModel.js`, `orderControllers.js`) ya tienen el sku/size/baseColor
fluyendo de punta a punta, desde el selector hasta la orden guardada.
Probado end-to-end (invitado, logueado, y checkout con WhatsApp/PDF).

Ver `BACKLOG.md` para el detalle de esta tarea y el resto del estado
del proyecto — es la fuente de verdad actualizada, no esta sección.

## ✅ Tarea cerrada: backend del panel de órdenes

`GET /api/orders` y `PATCH /api/orders/:id/status` (`orderControllers.js`,
`orderRoutes.js`), protegidos con `requireAdmin`. Probado con datos reales:
- Entrar a `approved` descuenta el stock exacto de la variante correcta
  (por `sku`), permite negativo sin bloquear, avisa en `warnings`.
- Repetir el mismo estado no vuelve a descontar (idempotencia confirmada).
- 403 confirmado para usuario no-admin en los dos endpoints.
- CORS necesitó sumar `'PATCH'` a `methods` en `server.js` (bug real
  encontrado al probar, ya corregido).
- `Checkout.jsx` tenía un bug separado: el payload que arma la orden
  (`orderPayload.items`) no incluía `size`/`baseColor` aunque el mensaje de
  WhatsApp y el PDF sí los mostraban bien (caminos de código distintos).
  Corregido y confirmado con una orden nueva.

⚠️ Sin probar todavía: el camino inverso (salir de `approved` restaura el
stock). Mismo mecanismo que el de entrar, menor riesgo, pero no verificado
con datos reales.

## 🔧 Tarea en curso ahora mismo: cablear `OrdersPage.jsx` al backend real

`OrdersPage.jsx` sigue siendo una maqueta con datos inventados (Juan Pérez,
María Gómez...), sin ningún fetch real, sin tabs que filtren de verdad.

El reemplazo completo ya está escrito y listo para aplicar (no hay que
diseñarlo de nuevo): trae órdenes reales vía `getOrders()`, tabs que
filtran por estado de verdad, buscador por folio/cliente, `<select>` de
estado por fila que dispara `updateOrderStatus` con modal de confirmación
(el mensaje avisa si esa transición va a mover stock), y fila expandible
por orden mostrando sku/talla/color de cada item.

**Siguiente paso al retomar**: pedirle a Claude Code que muestre el
contenido actual de `OrdersPage.jsx` (por si cambió), aplicar el
reemplazo, y probar desde la interfaz real (no más `fetch()` a mano) los 3
casos ya validados por API: cambiar a pagado y ver el stock bajar en
`ProductFormPage`, que un usuario no-admin no pueda ver la página, y de
paso la prueba pendiente del camino inverso (aprobado → cancelado
restaura stock).