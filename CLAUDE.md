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
- **Nunca escribas el valor de un secreto en ningún archivo versionado**
  (ni como valor, ni como "ejemplo" en un mensaje de error, comentario o
  documentación). Secreto es cualquier valor que dé acceso: contraseñas,
  tokens, claves de API, la cadena de conexión a MongoDB (`MONGO_DB_URI`
  completa) y sus credenciales (usuario y contraseña), `JWT_SECRET`, las
  credenciales de Cloudinary (`CLOUDINARY_URL` o sus tres variables), y
  cualquier variable nueva con ese carácter. Ante la duda, tratarlo como
  secreto. El porqué: pasó 3 veces con `env.js` por escribir el secreto
  real en el segundo argumento de `.min()` en vez de un mensaje genérico.
  Los mensajes de error de validación deben generarse a partir de nombres
  de variable, nunca de sus valores. El host del cluster de MongoDB
  tampoco es una credencial, pero no hace falta escribirlo en archivos
  versionados: si alguna vez hay que identificar la base, basta con su
  nombre. **Excepción acotada:** las URLs públicas de configuración
  (`FRONTEND_URL`, `VITE_BACKEND_URL`) sí se pueden anotar, porque ya
  aparecen en el JS compilado y en las respuestas de CORS (ver "Sitio en
  producción").
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
  causa obvia, sospechar esto antes de inventar otra explicación. Con los
  avatares con texto pasa algo parecido: `.avatar > div` fuerza
  `display: block` (especificidad 0,1,1) y le gana a `flex`, así que el
  texto queda arriba; se centra con la clase `placeholder` en el
  contenedor `avatar` (paso 55).
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
  real con texto (`/guia-cuidados`, la tabla del acordeón "Tallas"); las
  tablas sin encabezado (la de Detalles de la ficha) no lo llevan.
  La tabla de envíos de la ficha ya no existe: el acordeón de envíos se
  quitó en el paso 54 y su información quedó en la franja bajo el botón
  "Agregar" y en `/envios-y-entregas` (tarjetas, no tablas).
  Radio según dónde vive la tabla: anidada dentro de un acordeón
  (`rounded-xl`, 12px) → `rounded-lg` (8px), más chico que su contenedor
  y además igual a `--rounded-btn` del tema, así que no suma un valor
  nuevo; suelta, no anidada (`/guia-cuidados`) → `rounded-box` (16px).
  Aplicado en `ProductPage.jsx` y `GuiaCuidados.jsx`. Si la tabla va
  dentro de un acordeón, sumar también el `min-w-0` en dos niveles de la
  regla de DaisyUI de más arriba.
- **`scrollbar-hide` no existe en este proyecto** (no hay plugin ni regla
  en `index.css`): la clase no hace nada. Para ocultar una barra de scroll,
  usar `[scrollbar-width:none] [&::-webkit-scrollbar]:hidden` (paso 59b).
  Definirla en `index.css` cambiaría los 6 lugares que ya la usan.

## Sitio en producción
Desplegado y en vivo — dos dominios con propósitos distintos:
- `nebadon.cl` / `www.nebadon.cl` — dominio público real, muestra una
  pantalla de "Próxima apertura" (imagen + link a Instagram), no el sitio
  completo. Chequeo de `hostname` en `App.jsx`.
- Dominios de pruebas — sitio completo funcional, usado para QA con
  usuarios reales: `pruebas.nebadon.cl` (el que hay que usar para probar
  sesiones: es del mismo sitio que el backend) y
  `nebadona-store-cyan.vercel.app` (funciona en ventana normal, pero su
  cookie de sesión es de terceros: falla en incógnito y en Safari).
- Backend: `api.nebadon.cl`, el que usa el frontend desde el paso 47 (así
  la cookie de sesión es de primera parte para `nebadon.cl`, `www` y
  `pruebas`). `nebadona-store.vercel.app` sigue respondiendo.
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
- **Configuración fuera del código** (paso 47). Estos dos valores no son
  secretos: son URLs públicas que ya aparecen en el JS compilado y en las
  respuestas de CORS. La regla de no escribir secretos sigue valiendo
  para todo lo demás.
  - `FRONTEND_URL` (proyecto backend, entorno Production):
    `https://nebadona-store-cyan.vercel.app,https://nebadon.cl,https://www.nebadon.cl,https://pruebas.nebadon.cl`.
    Vercel no muestra el valor al editarla: hay que reescribirla completa,
    sin espacios, y después redesplegar el backend.
  - `VITE_BACKEND_URL` (proyecto frontend, entorno Production):
    `https://api.nebadon.cl/api/`, con la barra final (todos los servicios
    concatenan sin barra). Vite la escribe en el build: después de
    cambiarla hay que redesplegar el frontend.
  - Dominios: `api.nebadon.cl` en el proyecto del backend; `nebadon.cl`,
    `www.nebadon.cl` y `pruebas.nebadon.cl` en el del frontend.
  - DNS: `nebadon.cl` usa los nameservers de Vercel (`ns1.vercel-dns.com`,
    `ns2.vercel-dns.com`), configurados en NIC Chile. Los registros se
    administran en Vercel (sección Domains de la cuenta), no en NIC Chile.
  - Rama de producción: los dos proyectos de Vercel deben tener
    `whatsapp-commerce` en Settings → Environments → Production → Branch
    Tracking. Si un push aparece como "Preview" en vez de "Production",
    es lo primero que hay que revisar (pasó con el frontend, que la tenía
    en `main`, hasta el paso 49).

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
del Producto y Cuidados" (hoy "Detalles", desde el paso 58), 3 bullets
fijos pensados solo para calcetas
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

**Comportamiento en la ficha (actualizado en el paso 58):** el acordeón
"Detalles" muestra una **tabla de dos columnas** (etiqueta / valor), en
orden fijo (Material, Tipo de Calce, Técnica de Decoración,
Especificaciones y **Código**, el `sku` de la variante seleccionada, que
cambia al elegir talla o color); solo aparecen las filas con valor.
`whitespace-pre-line` y `break-words` van solo en la celda del valor.
Como todo producto tiene al menos una variante con `sku`, la fila Código
casi siempre existe y el acordeón casi siempre aparece.

Debajo de la tabla va el link "Ver guía de cuidados →" a
`/guia-cuidados#<categoría>` con `state={{ from: 'product' }}` (hace
aparecer "← Volver al producto" en la guía, también tras F5), con
`mt-3` solo si hay tabla arriba. El link solo aparece si la categoría
tiene guía en `careGuides.js` (calcetines, camisas, polerones). La mini
tabla de cuidados (ícono + instrucción) se quitó de la ficha en el paso
58; los íconos y textos de `careGuides.js` los sigue usando
`/guia-cuidados`. El acordeón no se renderiza solo si no hay ninguna
fila (ni siquiera Código) y la categoría no tiene guía.

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