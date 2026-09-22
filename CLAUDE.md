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
  proyecto, no pedirle que los pegue enteros en la terminal. Cuando un
  bloque parece cortado a mitad de una etiqueta/atributo (ej. un `<a>` sin
  su apertura), no asumir el contenido — confirmar con el usuario qué era
  antes de armar el diff.
- **Windows no distingue mayúsculas/minúsculas en rutas de archivo, Linux
  (Vercel) sí.** `npm run dev` local nunca revela un import mal escrito en
  mayúsculas (ej. `'../pages/Home'` contra la carpeta real `pages/home/`)
  — solo `npm run build` en un entorno case-sensitive lo revela. Pasó dos
  veces en el primer deploy (`Register`, `Home`). Si un import falla solo
  en Vercel y nunca en local, sospechar esto primero.
- **Patrón recurrente de DaisyUI**: varios de sus componentes (`.collapse-
  content`, `.drawer-side`, tablas dentro de un `flex`) no se achican por
  debajo del ancho de su contenido salvo que se les dé `min-w-0` explícito
  — y a veces hace falta en más de un nivel de anidamiento a la vez (ej.
  tanto en el `.collapse` exterior como en `.collapse-content` interior).
  Pasó 3 veces (banner de `InventoryPage.jsx`, sidebar de filtros, tabla
  de Tallas y Medidas). Si algo se desborda del contenedor en mobile sin
  causa obvia, sospechar esto antes de inventar otra explicación.

## Sitio en producción
Desplegado y en vivo — dos dominios con propósitos distintos:
- `nebadon.cl` / `www.nebadon.cl` — dominio público real, muestra una
  pantalla de "Próxima apertura" (imagen + link a Instagram), no el sitio
  completo. Chequeo de `hostname` en `App.jsx`.
- Dominio de pruebas en Vercel (`nebadona-store-cyan.vercel.app` para el
  frontend, `nebadona-store.vercel.app` para el backend) — sitio completo
  funcional, usado para QA con usuarios reales.
- Arquitectura: `FRONTEND` y `BACKEND` son dos proyectos de Vercel
  separados, cada uno con su propio `vercel.json` (el del frontend hace
  el rewrite de SPA `/(.*)` → `/index.html`; el del backend enruta
  `/api/*` hacia la función serverless en `BACKEND/api/index.js`).
  `BACKEND/src/app.js` arma la app Express sin escuchar; `server.js` la
  hace escuchar para desarrollo local; `api/index.js` la expone para
  Vercel. CORS en `app.js` acepta una lista de orígenes separados por
  coma vía `FRONTEND_URL`, no un solo dominio.
- Rama de trabajo real: `whatsapp-commerce` (no `main`, desactualizada).
  Cada `git push` a esa rama despliega solo a producción.

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

## 🔧 Tarea en curso ahora mismo: Materiales del Producto (Fase 2)

Contexto: la página de producto (`ProductPage.jsx`) tiene un acordeón
"Detalles del Producto y Cuidados". La parte de Cuidados ya se resolvió
(movida a `/guia-cuidados`, con resumen corto + link en la ficha). Lo que
queda son los **3 bullets fijos y genéricos** que hoy están hardcodeados
ahí ("Algodón peinado premium...", "Talón y puntera reforzados...",
"Banda elástica...") — pensados solo para calcetas, sin sentido para
camisas o polerones. Esta fase los reemplaza por **campos reales,
editables por producto desde el dashboard**.

**Los 4 campos** (decisión ya tomada, no volver a discutir el diseño):
- **Material Principal** — ya existe como `material` en el schema
  (`ProductModel.js`, `productSchema.js`), no hace falta campo nuevo.
- **Tipo de Calce** — campo nuevo (ej. "Oversize", "Regular", "Ajustado").
- **Especificaciones** — campo nuevo, texto libre (ej. "Cuello redondo,
  puños elasticados, bolsillo canguro").
- **Técnica de Decoración** — campo nuevo. Nombrado así a propósito, NO
  "Estampado" — las calcetas son bordadas, los polerones/camisas
  estampados; un nombre genérico evita la confusión real que ya causó
  este mismo error una vez (ver más abajo).

**Lo que falta hacer, en orden:**
1. Backend: agregar los 3 campos nuevos a `productSchema.js` (Zod) y
   `ProductModel.js` (Mongoose) — mismo patrón ya usado para `sock_type`
   (sin `.toLowerCase()`/`lowercase: true` a menos que haya evidencia de
   que hace falta comparar en minúscula, como sí la tuvieron Categoría/
   Franquicia/Tema).
2. Frontend admin: inputs nuevos en `ProductAttributesForm.jsx`, y
   sumarlos a `useProductForm.js` (`EMPTY_TEMPLATE`, `normalizeTemplate`,
   `mapProductToTemplate`, el `payload` de `handleConfirmSave`) — los 4
   lugares que hubo que tocar la vez pasada con `sock_type`, mismo
   patrón exacto.
3. `ProductPage.jsx`: reemplazar los 3 bullets fijos por los campos
   reales del producto (condicional, como `sizeGuide`/`careGuide` — no
   mostrar el bloque si el producto no tiene esos datos cargados).

**Error real ya cometido una vez con este mismo tema, no repetir:** al
escribir la Guía de Cuidados (ahora en `/guia-cuidados`) se usó la
palabra "estampados" de forma genérica para todo el texto, aunque las
calcetas son bordadas — lo detectó la dueña del negocio en QA real,
confundida de por qué se hablaba de estampado en un producto sin
estampado. Ya corregido ahí, pero sirve de ejemplo de por qué el nombre
"Técnica de Decoración" (genérico) es la elección correcta acá, y por qué
cualquier texto nuevo que se escriba debe evitar asumir una sola técnica
para todas las categorías.

## 🟡 Pendiente, pausado a pedido del usuario (no resolver sin que lo pida)

Scroll salta demasiado lejos al abrir un acordeón en `ProductPage.jsx`
(pasa de la zona de acordeones hasta "Explora más diseños"). Causa:
`<input type="radio">` nativo recibe foco al tocarlo, el navegador
intenta centrarlo en pantalla mientras el layout todavía se reacomoda
(contenido colapsando/expandiendo a la vez). Intento liviano ya probado
y confirmado insuficiente: `onClick={(e) => e.target.blur()}` en los 4
radios. Fix de fondo, no aplicado todavía: reemplazar los radios nativos
por un `useState` controlado en React para los 4 acordeones, eliminando
la dependencia del foco del navegador. Ver `BACKLOG.md` para el detalle.