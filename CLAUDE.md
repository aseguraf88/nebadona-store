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
  muéstralo primero completo. No asumas su contenido ni su schema.
- No declares un fix "resuelto" hasta que el usuario confirme que lo probó.
- Muestra el diff antes de guardar cambios en archivos existentes.
- No agregues funciones ni cambies de tema sin que se pida explícitamente —
  nada de scope creep. Si algo parece un próximo paso lógico, menciónalo en
  una frase y espera confirmación, no lo implementes solo.
- Sugiere un commit de checkpoint (`git add . && git commit -m "..."`) antes
  de aplicar un batch de cambios grande, y recuerda que el usuario está en
  PowerShell de Windows (no asumir sintaxis de bash tipo `2>/dev/null`).
- Si una búsqueda o lectura falla, dilo explícitamente — no sigas como si
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
  antes de armar el diff. Lo mismo aplica a prompts largos: el usuario los
  guarda como `.md` en la raíz del repo y pide "Lee <archivo>.md y sigue
  sus instrucciones"; el archivo se borra antes del commit.
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
- **Los `estructura.txt` pueden estar desactualizados.** Pasó con el de
  `BACKEND/src`: mostraba archivos de MercadoPago ya borrados y no mostraba
  `app.js` ni `config/env.js`. Antes de confiar en uno, regenerarlo desde
  la carpeta `src` correspondiente con
  `tree /F /A | Out-File -Encoding utf8 estructura.txt` — nunca desde la
  raíz de `BACKEND`/`FRONTEND`, porque `tree` no permite excluir
  `node_modules`.
- **Los íconos de `@lucide/lab` son icon nodes, no componentes de React.**
  Hay que envolverlos con `<Icon iconNode={...} />` de `lucide-react` (en
  un `.js` sin JSX, con `createElement`; ejemplo real: `IronIcon` en
  `careGuides.js`). Si se usan directo, `npm run build` no detecta el
  error: solo falla al renderizar.
- **Estilo de tabla del sitio (receta única, no reinventarla)**:
  contenedor `overflow-x-auto` + radio + `border border-base-content/10`
  (mismo tono que el `divider` del footer), y `border-base-content/10` en
  cada `<tr>` del cuerpo — reemplaza el separador por defecto de DaisyUI
  (`base-200`, casi invisible sobre blanco) y gana por orden en el CSS,
  sin `!important`. Sin `table-zebra` ni separadores verticales por
  defecto. Encabezado oscuro (`bg-neutral text-neutral-content` en el
  `<tr>` del `<thead>`) solo si la tabla tiene una fila de encabezado
  real con texto (`/guia-cuidados`, Tallas y Medidas); las tablas sin
  encabezado (Detalles, Cuidados y Envíos de la ficha) no lo llevan.
  Radio según dónde vive la tabla: anidada dentro de un acordeón
  (`rounded-xl`, 12px) → `rounded-lg` (8px), más chico que su contenedor
  y además igual a `--rounded-btn` del tema, así que no suma un valor
  nuevo; suelta, no anidada (`/guia-cuidados`) → `rounded-box` (16px).
  Aplicado en `ProductPage.jsx` y `GuiaCuidados.jsx`. Si la tabla va
  dentro de un acordeón, sumar también el `min-w-0` en dos niveles de la
  regla de DaisyUI de más arriba.

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
  coma vía `FRONTEND_URL`, no un solo dominio. La validación de variables
  de entorno vive en `BACKEND/src/config/env.js`.
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

## ✅ Tarea cerrada: Materiales del Producto (Fase 2)

La ficha de producto (`ProductPage.jsx`) tenía, en el acordeón "Detalles
del Producto y Cuidados", 3 bullets fijos pensados solo para calcetas
("Algodón peinado premium...", etc.), sin sentido para camisas o
polerones. La parte de Cuidados se había resuelto antes (movida a
`/guia-cuidados`, con resumen corto + link en la ficha). Esta fase
reemplazó los bullets por **campos reales, editables por producto desde
el dashboard**. Probado de punta a punta por el usuario (crear, editar,
borrar un valor, recarga completa, ficha pública).

**Los 4 campos:**
- **Material** — `material`, ya existía. Se guarda en minúscula
  (`lowercase: true` en Mongoose, `.toLowerCase()` en Zod y en el payload
  del formulario). En la ficha se muestra con la primera letra en
  mayúscula, **solo en la vista** — no se tocó schema ni datos.
- **Tipo de Calce** — `fit_type` (nuevo).
- **Técnica de Decoración** — `decoration_technique` (nuevo).
- **Especificaciones** — `specifications` (nuevo), texto libre, máximo
  500 caracteres en los tres lugares (Zod, Mongoose y `maxLength` del
  `<textarea>`). En la ficha respeta los saltos de línea.

Los tres campos nuevos son opcionales (`default: null`) y **no fuerzan
minúsculas en ningún lado** — se guardan y se muestran tal cual se
escriben, mismo criterio que `sock_type`. En el formulario son texto
libre, no `<select>`; pasarlos a opciones fijas más adelante solo
requiere cambiar dos inputs, sin tocar datos ni backend.

**Archivos tocados:** `productSchema.js`, `ProductModel.js`,
`useProductForm.js` (los 4 lugares de siempre: `EMPTY_TEMPLATE`,
`normalizeTemplate`, `mapProductToTemplate`, `payload` de
`handleConfirmSave`), `ProductAttributesForm.jsx` (inputs debajo de
Material, en la tarjeta "Organización") y `ProductPage.jsx`. Para los
cuidados: `careGuides.js`, `GuiaCuidados.jsx`, `package.json` y
`package-lock.json`.

**Comportamiento en la ficha:** los 4 detalles se muestran como **tabla de
dos columnas** (etiqueta / valor), en orden fijo (Material, Tipo de Calce,
Técnica de Decoración, Especificaciones); solo aparecen las filas con
valor, y la tabla se oculta si los cuatro están vacíos. `whitespace-pre-line`
y `break-words` van solo en la celda del valor.

Debajo, los cuidados se muestran como **mini tabla ícono + instrucción
corta** (`item.text`), con `item.label` como nombre accesible del ícono
(`aria-label` + `role="img"`), más el link "Ver guía completa de
cuidados". El margen superior de ese bloque es condicional: solo aparece
si hay tabla de detalles arriba. Solo hay guía de cuidados para las
categorías de `careGuides.js` (calcetines, camisas, polerones); si un
producto no tiene ni detalles ni guía de cuidados, el acordeón completo
no se renderiza.

`/guia-cuidados` pasó de tarjetas a **tabla por categoría** (ícono /
acción / instrucción).

**Íconos:** `lucide-react` + `@lucide/lab` (dependencia nueva en
`package.json`). Ver la regla sobre `@lucide/lab` en "Reglas de trabajo".

**Error real ya cometido una vez con este mismo tema, no repetir:** al
escribir la Guía de Cuidados (`/guia-cuidados`) se usó la palabra
"estampados" de forma genérica para todo el texto, aunque las calcetas
son bordadas — lo detectó la dueña del negocio en QA real. Por eso el
campo se llama "Técnica de Decoración" (genérico) y no "Estampado", y
cualquier texto nuevo debe evitar asumir una sola técnica para todas las
categorías.

## 🔧 Tarea en curso ahora mismo

Ninguna definida. Ver `BACKLOG.md` para elegir la siguiente.

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