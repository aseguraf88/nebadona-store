# Nebadon Store — Contexto para Claude Code

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

## ✅ Tarea cerrada: panel de órdenes completo (backend + frontend)

`GET /api/orders` y `PATCH /api/orders/:id/status` (`orderControllers.js`,
`orderRoutes.js`), protegidos con `requireAdmin`, más `OrdersPage.jsx`
cableado al backend real (tabs por estado, buscador, `<select>` con modal
de confirmación, fila expandible con sku/talla/color). Probado de punta a
punta desde la interfaz real, no solo por API:

- Entrar a `approved` descuenta el stock exacto de la variante correcta
  (por `sku`), permite negativo sin bloquear, avisa en `warnings`.
- Salir de `approved` restaura el stock. Confirmado con datos reales.
- Repetir el mismo estado no vuelve a descontar (idempotencia confirmada).
- Usuario no-admin es redirigido al intentar entrar por URL directa.
- Los cambios de stock se ven en `ProductFormPage` sin refresh forzado.

Dos bugs reales encontrados y corregidos en el camino:
- CORS sin `'PATCH'` en `methods` de `server.js` (bloqueaba el fetch antes
  de llegar al server).
- `InventoryPage.jsx` llamaba a `fetchProducts` (nunca existió en
  `ProductContext`, el nombre real es `getProducts`) — el catálogo nunca
  se refrescaba solo tras importar CSV, en silencio, sin error.

**Sin tareas grandes pendientes de lo construido hasta acá** — variantes,
carrito, y órdenes están cerrados y probados de punta a punta, incluido
`ProtectedRoute.jsx` (confirmado: chequeo de rol a propósito, funciona
bien). Ver `BACKLOG.md` para los ítems sueltos de "baja prioridad" y
"post-lanzamiento" que quedan, ninguno bloqueante.

## 🔧 Tarea en curso ahora mismo: pasada de responsividad (mobile/tablet)

Único prerrequisito real para publicar. Regla de prueba acordada: achicar
la ventana del navegador a ~375px (mobile), ~768px (tablet) y desktop
normal — alcanza para detectar la mayoría de los problemas sin necesitar
un celular físico.

**Puntos de riesgo ya identificados, sin confirmar todavía si molestan en
la práctica** (no arreglar preventivamente sin ver el problema real primero
— confirmar en pantalla, después corregir):

- `ProductAttributesForm.jsx`, tabla de Variantes y Stock — 6 columnas
  (SKU, Talla, Color, Diseño, Stock, borrar) en `table-sm`, probablemente
  necesita scroll horizontal en mobile.
- `ProductsListPage.jsx` — 7 columnas con `overflow-x-auto`, funciona pero
  no es el patrón más cómodo en mobile.
- `InventoryPage.jsx` — 6 columnas, mismo patrón que arriba.

Patrón esperable de solución si alguno de estos molesta de verdad: tabla
en desktop/tablet, lista de tarjetas apiladas en mobile por breakpoint
(mismo lenguaje que ya usa `ProductList.jsx` del catálogo público con
`grid-cols-2 md:grid-cols-3 lg:grid-cols-4`) — no diseñar de cero.

Esto es también el prerrequisito de la futura app con Capacitor (pausada
post-lanzamiento): Capacitor envuelve el mismo código web tal cual está,
no arregla nada visual por sí solo.