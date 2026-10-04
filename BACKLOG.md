# Backlog — Nebadon Store

> Objetivo actual: dejar el dashboard 100% funcional en navegador (PC + mobile)
> y publicar. La versión app nativa (Capacitor) queda pausada hasta después
> del lanzamiento — ver decisión y contexto más abajo.

## ✅ Confirmado hecho y probado

- [x] MercadoPago eliminado por completo del código
- [x] Dashboard de productos dividido: listado (tabla), crear, editar,
      configuración de catálogo (categorías/franquicias/temas)
- [x] Página de Inventario: importar/exportar CSV + tabla de stock por variante
- [x] Subida de imágenes directo a Cloudinary (arregla el problema de payload
      del lado del frontend)
- [x] Fixes de `ProductAttributesForm`: tamaño de input SKU, autogenerado de
      SKU, bug de coma en colores de diseño, orden de secciones (imágenes
      antes de precios)
- [x] Sidebar: `isActive` corregido, links de Inventario y Configuración
      agregados
- [x] **Selector de variantes (talla/color) de punta a punta** — 11 archivos:
      `VariantSelector.jsx` (nuevo) + `ProductPage.jsx`, `ProductCard.jsx`,
      `ProductDetailModal.jsx`, `CartContext.jsx`, `cartServices.js`,
      `CartDrawer.jsx` (no estaba en la lista original, apareció al buscar
      consumidores de `removeFromCart`/`updateQuantity`), `CartModel.js`,
      `cartControllers.js`, `OrderModel.js`, `orderControllers.js`.
      Arregla de raíz que el carrito/orden nunca supieran qué variante
      elegía el cliente, y de paso dos bugs reales: la validación de stock
      que comparaba contra un campo `product.stock` inexistente (nunca
      frenaba nada), y el tope de cantidad que por el mismo motivo caía
      siempre en 1. Probado como invitado: variantes en líneas separadas,
      tope de stock real con aviso al excederlo, borrado por variante
      correcto, talla/color visibles en el carrito. Confirmado también el
      flujo logueado y el checkout (WhatsApp + PDF muestran talla/color
      correctamente). **Tarea cerrada de punta a punta.**
- [x] SKU visible en `ProductPage.jsx` corregido — mostraba `product.sku`
      (campo inexistente, siempre "N/A") en vez de `selectedVariant?.sku`.
      Mismo fix ya aplicado antes en `ProductDetailModal.jsx`.
- [x] Payload de `server.js` bajado a 2mb (confirmado, ya estaba aplicado).
      Bonus no pedido, encontrado al verificar: `x-powered-by` deshabilitado,
      headers de seguridad manuales (`X-Content-Type-Options`,
      `Referrer-Policy`, `X-Frame-Options`), 404 handler y error handler
      centralizado al final del archivo.

- [x] `env.js` de validación fail-fast — implementado, corregido para
      aceptar `CLOUDINARY_URL` solo o las tres variables sueltas (el diseño
      original exigía siempre las tres, incorrecto para este proyecto), y
      probado en los dos sentidos: arranca limpio con `.env` real, corta
      con mensaje claro (`JWT_SECRET: 'Invalid input...'`) si falta algo.
      `JWT_SECRET` además renovado de 12 a 32+ caracteres aleatorios.
- [x] **Incidente de secretos reales en `env.js` (3 apariciones) — resuelto
      de raíz.** Causa real encontrada por evidencia (no era un proceso
      externo): al reescribirse el archivo a mano en cada sesión, el
      segundo argumento de `z.string().min(1, '...')` — pensado para un
      mensaje de error — recibía por error el valor real de la variable.
      Fix: los mensajes ahora se generan automáticamente a partir de una
      lista de nombres (`REQUIRED_STRING_VARS`), sin ningún lugar donde
      escribir un secreto "de ejemplo" tenga sentido. Confirmado limpio y
      funcionando igual que antes. Nunca llegó a un commit en ninguna de
      las 3 veces — el riesgo real siempre estuvo contenido. `env.js`
      sigue siendo un archivo versionado normal a propósito (no se agrega
      a `.gitignore`, es código de la app, no un secreto).
- [x] **Backend del endpoint "marcar orden como pagada"** —
      `PATCH /api/orders/:id/status` (`orderControllers.js` +
      `orderRoutes.js`, protegido con `requireAdmin`) y
      `GET /api/orders` (listar). Probado con datos reales: una orden
      creada con el sistema de variantes actual, marcada `approved`,
      descontó el stock exacto de la variante correcta en `ProductModel`.
      403 confirmado para un usuario no-admin en ambos endpoints. Se
      encontraron y corrigieron 2 bugs en el camino: un diff aplicado a
      medias por el agente (faltaban las funciones nuevas en el archivo
      pese a reportarse como guardado — servidor no arrancaba) y CORS sin
      `PATCH` en `methods` (bloqueaba el fetch antes de llegar al server).
      Camino inverso (salir de `approved` restaura stock) confirmado con
      datos reales desde la interfaz. **Backend cerrado de punta a punta,
      sin nada pendiente de probar.**
- [x] **`OrdersPage.jsx` cableado al backend real.** Reemplazo completo de
      la maqueta: `getOrders()`, tabs por estado real, buscador en vivo
      por folio/cliente/teléfono, `<select>` de estado con modal de
      confirmación (avisa si la transición va a mover stock), fila
      expandible con sku/talla/color por item. Se encontró y corrigió un
      bug relacionado: `InventoryPage.jsx` llamaba a `fetchProducts`
      (nombre que nunca existió en `ProductContext`, la función real se
      llama `getProducts`) — el catálogo nunca se refrescaba solo después
      de importar CSV, en silencio, sin error. Se corrigió ahí y se sumó
      la misma llamada en `OrdersPage.jsx` para que el stock se vea
      actualizado en `ProductFormPage` sin necesitar refresh forzado.
      Los 3 casos probados desde la interfaz real (no solo por API):
      aprobar descuenta stock visible en vivo, cancelar una aprobada lo
      restaura visible en vivo, usuario no-admin es redirigido al intentar
      entrar por URL directa. **Panel de órdenes completo, cerrado.**
- [x] **Bug funcional real encontrado durante la pasada de responsividad**:
      el sidebar del admin era completamente inaccesible en mobile — no
      por un bug de lógica (el mecanismo de drawer de DaisyUI funcionaba
      bien), sino porque los íconos `ti ti-*` (convención de Tabler Icons)
      nunca tuvieron una fuente cargada en ningún lado del proyecto — sin
      `<link>` a CDN, sin paquete npm, sin `@font-face`. El botón de menú
      hamburguesa era invisible pero clickeable, sin ninguna pista de que
      existía. Diagnóstico confirmado con evidencia doble: navegador (cero
      requests de fuente en Network) y código (grep sin resultados en todo
      el repo). Fix aplicado en `AdminLayout.jsx` (el único con impacto
      funcional): reemplazo de los 10 `<i className="ti ti-*">` por
      componentes de `react-icons/tb` (ya instalado, evita agregar una
      dependencia nueva). Confirmado visualmente en 375px: botón de menú
      visible y funcional, los 6 íconos de navegación visibles en estilo
      outline correcto. **Bug funcional cerrado.**

## ✅ Home / Tienda pública — mejoras recientes

- [x] Secciones nuevas en `Home.jsx`: "Destacados" y "Populares" (usando
      los campos `featured`/`popular` que ya existían en `ProductModel`
      sin usarse en ningún lado público) + "Explora por Categoría" con
      conteo real de productos por categoría. Reutiliza `ProductSection`
      existente, sin componentes nuevos.
- [x] Bug real encontrado y corregido: los checkboxes de Categoría y
      Franquicia en `ShopSidebar.jsx` comparaban contra el nombre tal
      cual se muestra (ej. `"Zapatos"`), pero `ProductModel` fuerza esos
      campos a minúscula al guardar (`lowercase: true`) — el filtro
      nunca coincidía, probablemente devolviendo cero resultados cada
      vez que se tildaba un filtro. Corregido con `.toLowerCase()` al
      comparar/guardar en el estado del filtro (el texto visible no se
      tocó). Confirmado funcionando.
- [x] Conectadas las tarjetas de "Explora por Categoría" del Home con el
      filtro real de la tienda vía `?category=` en la URL — tocar una
      categoría en el Home lleva a `/shop` con esa categoría ya
      filtrada y el checkbox correspondiente marcado. Confirmado
      visualmente.
- [x] Sacados los `console.log('🔍 LO QUE LLEGA DE LA BD:'...)` de
      `Home.jsx` y `ShoppingPage.jsx` — restos de una sesión de
      debugging de hace mucho tiempo (el bug DRAFT/PUBLISHED original),
      nunca se habían limpiado.

## 🎨 Pulido visual / UI-UX — sesión aparte, pendiente

Trabajo de diseño (identidad de marca, composición visual), distinto en
naturaleza al resto del backlog (que es funcionalidad/bugs). Mencionado
por el usuario, sin definir todavía:

- [ ] Paleta de colores de la tienda/marca — revisar si la actual
      transmite lo que se busca para "Nebadona". El tema efectivo hoy es
      `light` de DaisyUI (primario violeta índigo, secundario rosa,
      acento turquesa): `tailwind.config.js` solo genera `light`, y el
      `data-theme="autumn"` de `index.html` no tiene ningún CSS asociado,
      así que no se aplica (confirmado en el CSS compilado; ver sección
      A.1 del informe de consistencia). El atributo queda sin tocar a
      propósito, para decidirlo en esta sesión.
- [ ] Carrusel del Hero (Home) — el usuario lo sintió "poco atractivo".
      Sin diagnóstico específico todavía (¿la imagen, la composición del
      texto, la animación, el CTA?).
      Pedido concreto de octubre: deslizamiento táctil en mobile (ver
      "📝 Lista de la dueña y usuarios (octubre)").

**Para preparar esa sesión, conviene tener a mano**: `HeroCarousel.jsx`
(nunca se vio completo en esta conversación), `tailwind.config.js` o
donde esté definido el tema de DaisyUI actual, el informe
`informe-consistencia-ui-ux.md` (raíz del repo, generado el 2026-09-23:
auditoría de paleta de color, radio de bordes e íconos/emojis, con los
hallazgos separados por Tienda pública y Admin y una lista priorizada de
inconsistencias con esfuerzo estimado), y — si el usuario tiene
referencias de otras tiendas/apps cuyo estilo le guste — capturas de esas
como punto de partida, en vez de diseñar a ciegas.

## 🌙 Observaciones de uso real — actualizado

- [x] **Checkout generaba órdenes duplicadas al reintentar el botón** —
      resuelto: al completar la orden con éxito, ahora se vacía el
      carrito (`clearCart()`) y se muestra una pantalla de confirmación
      dedicada ("¡Tu orden fue registrada!") con botón para reabrir
      WhatsApp y otro para seguir comprando, en vez de dejar el
      formulario disponible para reenviar. Sumado en la misma sesión:
      si se entra a `/checkout` con el carrito vacío (link directo, o
      refresh accidental en la pantalla de confirmación), se redirige
      a `/shop` con un mensaje claro en vez de mostrar un formulario que
      no se puede completar sin explicación. Confirmado en pantalla:
      ambos casos probados de punta a punta.
- [x] **Voseo eliminado del código** — encontrados y corregidos 3 casos
      reales (2 introducidos por error en esta misma conversación:
      "Corregí/volvé" en el mensaje de SKU duplicado, "podés" en la
      pantalla de confirmación del checkout; 1 preexistente:
      "Gestioná" en `CatalogSettingsPage.jsx`). Búsqueda sistemática
      confirmó que no quedan más casos en `FRONTEND/src` ni
      `BACKEND/src`. Idioma del proyecto (mensajes al usuario) y de la
      conversación, ambos pasan a español neutro de ahora en adelante.
- [x] **Franquicias/Temas creados desde el formulario de producto no se
      persistían** — `handleSaveTheme`/`handleSaveFranchise` en
      `ProductAttributesForm.jsx` solo actualizaban un estado local, sin
      llamar a `createDesignTheme`/`createFranchiseName` reales del
      contexto. Conectados a las funciones reales; de paso se eliminó el
      estado espejo (`localThemes`/`localFranchises`) que ya no hacía
      falta. Confirmado: aparecen en Configuración y sirven para filtrar
      en la tienda.
- [x] **Categoría, Franquicia y Tema no quedaban marcados en el dropdown
      al editar un producto** (típicamente los importados por CSV) —
      mismo bug de mayúsculas/minúsculas que ya se había corregido en
      `ShopSidebar.jsx`: los tres campos se guardan en minúscula por el
      schema, pero los `<option value={item.name}>` comparaban contra el
      nombre con mayúscula. Corregido con `.toLowerCase()` en los tres
      `<select>` de `ProductAttributesForm.jsx` (value, onChange, y las
      opciones). Confirmado con el producto real que originó el reporte.
- [x] **Tipo de calceta (`sock_type`) no persistía en ningún lado** —
      confirmado que el campo nunca existió en el backend (ni Zod ni
      Mongoose) y que `useProductForm.js` nunca lo incluía en la
      comparación de "cambios sin guardar", por eso el botón quedaba
      apagado al elegirlo. Agregado a los 3 archivos (frontend + Zod +
      Mongoose), deliberadamente **sin** `.toLowerCase()` en ningún lado
      para no repetir la misma clase de bug de mayúsculas/minúsculas que
      afectó a Categoría/Franquicia/Tema. Confirmado con recarga completa
      de página, no solo en la misma sesión.
- [x] **El carrito de un usuario logueado no mostraba nada si tenía una
      línea apuntando a un producto ya borrado** — no era un problema de
      permisos de admin, como se sospechaba en un principio: cualquier
      cuenta con una referencia rota se topaba con lo mismo. Causa real:
      `loadCart()` en `CartContext.jsx` leía `item.productId.variants`
      sin `?.` — si el producto ya no existía (`productId: null`),
      explotaba con un `TypeError` que un `catch` silencioso (sin log)
      tragaba por completo, cayendo al carrito local vacío sin ninguna
      pista visible. Corregido: se filtran las líneas con producto
      borrado antes de transformarlas (el resto del carrito se muestra
      bien), y se agregó logging al `catch` para que un futuro error
      similar deje rastro. Confirmado con un caso real: borrar un
      producto que estaba en el carrito lo hace desaparecer en silencio
      de la vista, sin romper el resto. La línea vieja queda inofensiva
      en el documento de MongoDB, sin limpiar — no es necesario tocarla.
- [ ] Durante el diagnóstico de `sock_type` surgió una idea nueva del
      usuario (anotada abajo en "post-lanzamiento"): tallas condicionadas
      por categoría + género, extendiendo el patrón que ya existe en
      `productTypeOptions.js`.

## ✅ Pulido visual del Home y la tienda — sesión del 16/09

- [x] Contenedor general ensanchado de `max-w-[1200px]` a `max-w-[1800px]`
      en `Home.jsx` y `ShoppingPage.jsx` — el hero ya era a sangre
      completa desde antes (no hacía falta tocarlo), el problema real
      era que todo lo de abajo quedaba innecesariamente apretado en el
      centro en pantallas grandes.
- [x] Progresión de ancho no monótona en `CartDrawer.jsx` corregida
      (`max-w-md sm:max-w-sm md:max-w-md` angostaba entre breakpoints en
      vez de crecer parejo) — ahora `max-w-sm sm:max-w-md md:max-w-md`.
- [x] `ProductList.jsx`: grid de 4 columnas corrido de `lg:` a `xl:`, con
      más separación entre tarjetas (`gap-x-4 gap-y-10 sm:gap-8`) — 3
      columnas más grandes en el rango medio, 4 recién en pantallas
      anchas.
- [x] **Sidebar de filtros de desktop, investigación larga con conclusión
      real importante**: el ancho se ajustó (`w-64` → `w-80` → `w-56`,
      afinado a ojo) sin problema. Pero el efecto `sticky` en desktop
      parecía no funcionar pese a varios intentos (forzar `overflow`,
      forzar `position: static` sobre `.drawer-side` de DaisyUI, y
      finalmente una reestructuración completa: `ShopSidebar.jsx` pasó a
      exportar `ShopSidebarMobile` — el `drawer` de DaisyUI de siempre,
      sin tocar — y `ShopSidebarDesktop` — un `<aside>` de Tailwind puro,
      completamente fuera de cualquier mecanismo de DaisyUI). **Ni
      siquiera sacar DaisyUI del camino por completo resolvió el
      síntoma** — la pista que llevó a la causa real: con solo ~12
      productos de prueba, la sección de catálogo mide apenas ~1100px,
      casi lo mismo que una pantalla, así que casi no hay distancia real
      de scroll para que el efecto se note antes de pasar a la zona del
      footer (donde soltar el sticky es el comportamiento *correcto*, no
      un bug). Confirmado con el usuario probando: el sticky sí funciona
      bien dentro de la sección del catálogo. **Nunca hubo un bug real
      de CSS** — la reestructuración a `ShopSidebarMobile`/
      `ShopSidebarDesktop` igual se queda, porque es más simple y ya no
      compite con el `sticky` propio que trae `drawer-side` de DaisyUI
      (que sí sería un problema real en cuanto hubiera más contenido).
      Revalidar visualmente una vez cargados los productos reales, con
      varias pantallas completas de catálogo.

## ✅ Despliegue a Vercel — COMPLETO, sitio en vivo

- [x] 11 commits pendientes de `git push` descubiertos y subidos — hábito
      nuevo: `push` después de cada sesión, no solo `commit`.
- [x] Backend adaptado a serverless (`app.js`/`server.js`/`api/index.js`/
      `vercel.json`), sin romper el desarrollo local.
- [x] Backend desplegado y confirmado con datos reales:
      `https://nebadona-store.vercel.app`.
- [x] Frontend desplegado y confirmado con datos reales:
      `https://nebadona-store-cyan.vercel.app`.
- [x] Tres bugs de "funciona en local, no en instalación limpia"
      encontrados y corregidos en el camino: imports con mayúscula
      incorrecta (`Register`, `Home` — Windows no distingue mayúsculas,
      Linux/Vercel sí) y `jspdf` usado pero nunca declarado en
      `package.json`. `npx depcheck` confirmó que no queda ningún otro
      paquete en esa misma situación.
- [x] `FRONTEND_URL` del backend actualizada con el dominio real del
      frontend (CORS).
- [x] Confirmado: cada `git push` a `whatsapp-commerce` despliega solo a
      producción automáticamente. Un build roto no tumba el sitio en
      vivo — sigue sirviendo la última versión buena hasta que se
      corrija.
- [x] Backend también en `api.nebadon.cl` y frontend de pruebas en
      `pruebas.nebadon.cl` (paso 47). Variables de entorno, dominios y DNS:
      ver "Sitio en producción" en `CLAUDE.md`.
- [ ] Renombrar todo de "nebadona" a "nebadon" (GitHub + los dos
      proyectos de Vercel) — pospuesto a propósito hasta después de
      confirmar que el sitio funciona estable en producción, para no
      arriesgar la integración recién lograda.
      Ojo (paso 47): si cambia el nombre del proyecto del frontend en
      Vercel, cambia `nebadona-store-cyan.vercel.app`, y hay que reescribir
      `FRONTEND_URL` completa en el backend (Vercel no deja ver su valor) y
      redesplegar el backend.

## 🔍 QA en producción — recién empezado

- [x] **Login no funcionaba en producción (y "algunos enlaces rotos")** —
      la sospecha inicial (cookies cross-domain) era razonable pero
      incorrecta. Causa real: el sitio es una SPA (React Router), y
      Vercel no sabía enrutar peticiones directas a rutas internas
      (`/login`, o cualquier link compartido/refresh que no pasara por
      la portada primero) — devolvía su propio 404 genérico antes de que
      React llegara a cargar. Confirmado con el HTML del error (era el
      404 de Vercel, no de la app). Corregido con
      `FRONTEND/vercel.json` (rewrite catch-all `/(.*)` → `/index.html`,
      distinto al `vercel.json` del backend). Resuelve el login y
      cualquier "enlace roto" al mismo tiempo — era un solo bug con
      varios síntomas. Confirmado entrando directo por URL a `/login`.

## 🔴 Antes del lanzamiento (octubre)

- [x] ~~**Prioridad alta, paso propio — el export CSV no tiene
      autenticación**~~ — resuelto (paso 45, commit `bd29200`). Encontrado
      en el paso 44: cualquiera que conociera la URL descargaba el catálogo
      completo, con borradores y stock. Ahora `GET /api/products/export/csv`
      está en el bloque de rutas protegidas de `productsRoutes.js`, con
      `authenticate` y `requireAdmin`. El botón "Exportar CSV" de
      Inventario descarga con axios (`responseType: 'blob'`, cookie de
      sesión como el resto del dashboard) en vez de un link: con un link,
      en producción (frontend y backend en dominios distintos) no estaba
      garantizado que viajara la cookie, y con la sesión vencida el clic
      reemplazaba el dashboard por una página de error; ahora muestra un
      aviso con el mensaje del backend. El archivo conserva el BOM y el
      UTF-8 (los acentos se ven bien en OpenOffice Calc). El paso incluyó
      un barrido de las 7 rutas del backend: ninguna ruta de escritura
      (POST, PUT, PATCH, DELETE) quedó sin protección; el único POST
      público es el checkout, a propósito. Probado: 401 sin sesión, 403
      con una cuenta no-admin y descarga como admin, en local y en
      producción.

- [x] ~~**Prioridad media, paso propio — `GET /api/products` devuelve
      borradores y stock a cualquier visitante**~~ — resuelto (paso 46,
      commit `b44ec8d`). Encontrado en el barrido del paso 45: cualquiera
      que abriera la tienda descargaba el catálogo completo, con
      borradores y stock. Ahora `getAllProducts` devuelve siempre solo
      `PUBLISHED` e ignora `?status=` (antes un visitante podía pedir
      `?status=DRAFT` y recibir solo los borradores), y `getProductById`
      responde 404 para un borrador y para un id mal formado (antes, 500).
      El dashboard tiene su propia ruta, `GET /api/products/admin`
      (`authenticate` + `requireAdmin`, declarada antes de `/:id`), y
      `ProductContext` tiene dos listas: `products` para la tienda (se pide
      al cargar la app, ya filtrada por el backend) y `adminProducts` para
      el dashboard (la pide `AdminLayout` al entrar; la usan el listado, la
      edición, que busca el producto en esa lista, e Inventario). Después
      de crear, editar o borrar un producto, de importar un CSV o de cambiar
      el estado de una orden, se refrescan las dos, así que la tienda
      refleja los cambios sin recargar. Los filtros por `PUBLISHED` del
      navegador quedan como segunda barrera. Se corrigió además un bug del
      error global: `getProductById` (y crear, editar o borrar) lo dejaban
      puesto y nada lo limpiaba, así que después de abrir la ficha de un
      producto no disponible, "Volver a la tienda" llevaba a una tienda con
      el cartel de error hasta recargar. Ahora el error global es solo el
      de la carga del catálogo, y se limpia al cargar bien. `addToCart`
      también rechaza borradores, con 404 "Producto no disponible" (se ve
      en el aviso al pasar el carrito de invitado al iniciar sesión). En
      `nebadon.cl` no se pide ningún producto: `App.jsx` muestra "Próxima
      apertura" antes de montar `ProductContext`. Probado en local (API sin
      sesión, 403 con una cuenta no-admin, tienda, dashboard, F5 en la
      edición de un borrador, import, órdenes y carrito con un producto que
      pasa a borrador) y en producción (`GET /api/products` con 21
      productos y 0 no publicados, ficha de un borrador en incógnito,
      dashboard con el admin en una ventana normal de Chrome; en incógnito
      falla por el ítem de cookies de terceros).

- [x] **El import CSV del dashboard nunca funcionó en producción** —
      encontrado y resuelto en el paso 46. `CsvImportModal.jsx` hacía el
      `fetch` contra `http://localhost:3001/api/products/import` escrito a
      mano, así que desde el dashboard de Vercel el navegador intentaba
      subir el archivo a la propia computadora del admin; las importaciones
      se hacían desde local. Ahora usa `VITE_BACKEND_URL` como el resto del
      frontend (con `fetch` y `credentials: 'include'`). Confirmado en
      producción: importar un CSV de prueba dio "1 nuevos productos",
      visible sin recargar. De paso se corrigió el respaldo de
      `Checkout.jsx` (`'http://localhost:3001/api'` → `'.../api/'`, con la
      barra final como el resto); solo se usaría si faltara la variable.

- [x] ~~**Prioridad alta, paso propio — la sesión depende de cookies de
      terceros**~~ — resuelto (paso 47, commit `7add77f`). El frontend y el
      backend en `*.vercel.app` eran sites distintos (`vercel.app` está en
      la Public Suffix List), así que la cookie de sesión era de terceros:
      en incógnito de Chrome el dashboard daba 401, y el login "parecía"
      funcionar porque el frontend guardaba el usuario sin comprobar que la
      cookie había quedado guardada. Solución: el backend responde también
      en `api.nebadon.cl`, del mismo sitio que `nebadon.cl`,
      `www.nebadon.cl` y `pruebas.nebadon.cl`, así que la cookie es de
      primera parte. Se descartó el proxy en `FRONTEND/vercel.json`: según
      la documentación de Vercel, un backend en Vercel sobrescribe
      `X-Forwarded-For` cuando la petición llega desde otro proxy (y el
      frontend también está en Vercel), así que todas las peticiones
      llegarían con la IP del proxy y el límite de login quedaría
      compartido entre todos. Se agregó `app.set('trust proxy', 1)` en
      `app.js`, que corrige además un problema que ya existía: sin eso,
      `req.ip` era la conexión de la capa de borde de Vercel, y el límite de
      login probablemente era compartido entre todos los visitantes. Login
      y registro ahora confirman la sesión con `GET /api/auth/profile`
      (`checkSession` devuelve el usuario o `null`) antes de darla por
      iniciada; si el navegador bloqueó la cookie, muestran "Tu navegador
      bloqueó la sesión…" en vez de un dashboard vacío. Ojo:
      `nebadona-store-cyan.vercel.app` sigue dependiendo de cookies de
      terceros (falla en incógnito y en Safari, ahora con el aviso); para
      probar sesiones se usa `pruebas.nebadon.cl`. Configuración de Vercel y
      DNS: ver "Sitio en producción" en `CLAUDE.md`. Probado: en local,
      login del admin, sincronización del carrito de invitado y registro;
      en producción, el aviso en incógnito en
      `nebadona-store-cyan.vercel.app`; en `pruebas.nebadon.cl` en
      incógnito, el dashboard con productos, guardar, export, import, una
      orden aprobada y cancelada, el carrito logueado con sincronización y
      el logout (401 en `/api/products/admin`); en ventana normal,
      `pruebas.nebadon.cl` y `nebadona-store-cyan.vercel.app`; el límite de
      login, bloqueado desde el computador y con acceso desde el celular
      con datos móviles. **Pendiente: probar en Safari (iPhone y Mac)**;
      está en el checklist del lanzamiento.

- [ ] **Checklist del día del lanzamiento** (paso 47):
      1. Sacar `nebadon.cl` y `www.nebadon.cl` de `COMING_SOON_HOSTNAMES`
         en `App.jsx`.
      2. En `nebadon.cl`: login en incógnito (admin y cliente) y un
         checkout completo.
      3. Safari (iPhone y Mac), que nunca se probó: login del admin,
         dashboard y carrito de un cliente logueado.
      Después del lanzamiento:
      4. Decidir si se retira `nebadona-store-cyan.vercel.app`; si se
         retira, sacarlo de `FRONTEND_URL`.
      5. Ya sin ese dominio, pasar la cookie de sesión a `sameSite: 'lax'`
         en `authControllers.js`: login, registro y logout a la vez, para
         que el logout la siga borrando.

- [x] ~~**Prioridad media — el dashboard borra `cost_price` en cada
      guardado**~~ — resuelto (paso 48, commit `e195e84`). Observado en el
      paso 44 (`PRUEBA-P44-MILES` se importó con Costo 5.000 y quedó en
      `null` después de guardarlo desde el dashboard). Causa aislada: el
      import sí guardaba el costo (comprobado pasando una operación como la
      del import por el mismo `castUpdateOne` que usa `bulkWrite`, sin tocar
      la base: `cost_price` llegaba al `$set`). El problema era el
      dashboard: la lista de admin no traía el costo (`select: false` en
      `ProductModel`), así que el campo "Costo Bodega" aparecía siempre
      vacío, y al guardar el formulario mandaba `cost_price: null`, que
      `updateProduct` guardaba tal cual. Arreglo: `getAllProductsAdmin` y el
      export CSV (los dos solo admin) piden `+cost_price`; el formulario
      muestra el costo real y lo conserva al guardar, y exportar y reimportar
      ya no lo pierde. Además, un costo de 0 se muestra como 0 (antes, por
      un chequeo de verdad, aparecía vacío y se guardaba como `null`).
      Vaciar el campo a propósito y guardar deja el costo en `null`. Las
      lecturas públicas (`getAllProducts`, `getProductById`) y los
      `populate` del carrito siguen sin traer el costo: verificado con grep,
      `+cost_price` aparece solo en `getAllProductsAdmin` y en el export.
      Probado en local: import con costo (5.000 y 0), el campo muestra el
      valor, guardar sin tocarlo lo conserva, cambiarlo, el costo 0 visible,
      borrarlo a propósito (`null`), el export con la columna Costo y la
      ruta de admin con `cost_price`. En producción (`pruebas.nebadon.cl`):
      el campo muestra 5000, guardar cambiando solo la descripción lo
      conserva (confirmado con una consulta) y el export trae el costo.

- [ ] **Tarea de catálogo, no de código — 209 productos en borrador sin
      precio**: la consulta del paso 44 a producción (`ecommerceDB`)
      encontró 209 de 244 productos sin precio, todos en `DRAFT`, creados
      por CSV sin la columna Precio. No están dañados: el dashboard no deja
      publicarlos sin precio. Hay que cargarles precio (y descripción e
      imagen) antes de publicarlos. Ojo: hay **dos Finn**, `CAL-HDA-FINN`
      (del CSV, sin precio) y `CAL-HDV-FINN` (cargado a mano): publicar
      solo uno.
      Actualizado en el paso 46: la consulta dio 23 publicados y 224
      borradores. Los dos `PRUEBA-P44-` publicados ya se borraron, así que
      hoy hay **21 productos reales a la venta** (confirmado por
      `GET /api/products` en producción).
      Actualizado en el paso 48: **ningún producto tiene costo cargado**
      (0 de 245, según la consulta del paso 48). Hay que cargarlo por CSV
      (desde el paso 48, exportar y reimportar lo conserva) o desde el
      campo "Costo Bodega" del dashboard.

## 📝 Lista de la dueña y usuarios (octubre)

Pedidos de la dueña del negocio y de usuarios reales, recibidos en
octubre. Sin código todavía: cada grupo se convierte en uno o más pasos.

### Prioridad alta, antes del lanzamiento

- [ ] **Acordeones de la página de producto independientes**: que cada
      uno se abra y se cierre libremente; hoy solo uno puede estar abierto
      a la vez. Es una queja de clientes reales. Tiene la misma causa y el
      mismo arreglo que el **scroll que salta al abrir un acordeón**
      (movido aquí desde "🔵 Baja prioridad"): `ProductPage.jsx` usa
      `<input type="radio">` nativos, que funcionan como grupo (por eso
      solo uno abierto) y reciben el foco del navegador, que intenta
      centrarlos mientras el contenido se reacomoda (por eso el scroll
      salta hasta "Explora más diseños"). El arreglo liviano
      (`onClick={(e) => e.target.blur()}` en los 4 radios) no lo resolvió
      del todo. Arreglo de fondo para los dos: reemplazar los radios por un
      estado controlado con `useState`, uno por acordeón para que sean
      independientes, sin depender del foco del navegador. Ojo: `CLAUDE.md`
      todavía lista el scroll como "pausado a pedido del usuario";
      actualizarlo al hacer este paso.

- [ ] **Stock en 0**: un producto o una talla sin stock tiene que mostrar
      "Agotado" y no dejar agregar al carrito. Hoy aparece un 1,
      probablemente el selector de cantidad (por diagnosticar).

- [ ] **Quitar el mensaje sobre impuestos del carrito**, y revisar que los
      precios mostrados sean siempre el total con IVA.

- [ ] **"Explora más diseños increíbles"**: mostrar primero los productos
      de la misma franquicia, y después el resto de la categoría. Hoy
      muestra solo los de la misma categoría (ver el ítem resuelto de esa
      sección en "🔵 Baja prioridad").

- [ ] **Inicio del dashboard (`AdminHome.jsx`) con números reales**: hoy
      los números están fijos en el código (`salesToday`, `salesCount`,
      `ticketMedio`, `totalCustomers`; confirmado en el paso 46).
      Reemplazarlos por datos reales, incluido el contador de productos
      publicados.

- [ ] **Esconder el registro y el link de iniciar sesión para los
      clientes**: sin registro y sin link de login visible; `/login` queda
      solo para el admin. Los clientes compran siempre como invitados. A
      revisar en ese paso: "Historial de pedidos consultable por cliente"
      (post-lanzamiento) supone cuentas de cliente, y el carrito guardado
      de un cliente logueado (pasos 37 y 47) quedaría sin uso.

- [ ] **Google Analytics 4**, con aviso de privacidad. Revisar qué exige
      la ley chilena de datos personales.

### Prioridad alta, antes de la feria navideña (meta: probado a mediados de noviembre)

- [ ] **Ventas en la feria: aplicación de venta rápida.**

      **Contexto:**
      - Una sola feria navideña: puesto fijo durante 14 o 15 días en
        diciembre, de 18:00 a 24:00 (hasta la 01:00 los fines de semana).
        Se esperan entre 500 y 700 ventas.
      - Hoy anotan en un cuaderno: número de venta por cliente, hora,
        artículo, precio y pago (efectivo o transferencia). Si un cliente
        lleva varios artículos, van bajo el mismo número de venta. Lo pasan
        a Excel de madrugada.

      **Requisitos:**
      - Registro rápido desde el celular. Una venta por cliente, con uno o
        varios artículos; pago efectivo o transferencia por venta; hora
        automática.
      - Descuenta stock. El stock es **uno solo** para el sitio, la feria y
        cualquier otro canal.
      - **Artículos del catálogo** (producto, talla y color) **y artículos
        sueltos** (extraordinarios): descripción y precio a mano, sin stock.
      - **Precio editable en cada artículo**, por descuentos y promociones.
        Guardar el precio de lista y el precio cobrado.
      - **Registro sin conexión obligatorio** (la señal se corta de golpe):
        - guardar en el celular y sincronizar al volver la señal;
        - un identificador único por venta, para que un reintento nunca la
          duplique;
        - un indicador de ventas pendientes de subir.
      - **Dos vendedoras a la vez, cada una con su cuenta.** Hace falta un
        rol "vendedor" que solo pueda registrar ventas; esto adelanta
        "Multiusuario con niveles de acceso" (post-lanzamiento).
      - **Stock negativo:** con dos celulares sin señal y el sitio
        vendiendo, puede venderse algo sin stock. Aceptar la venta y avisar
        el stock negativo, no rechazarla: la venta ya ocurrió. Es el mismo
        criterio que ya usa el panel de órdenes al aprobar (permite stock
        negativo y avisa).
      - **Número de venta:** con dos celulares sin conexión no hay un
        correlativo único. Usar una serie por vendedora (A-001, B-001) o
        asignar el número definitivo al sincronizar.
      - **Resumen de cierre por día** (total, efectivo y transferencia) y
        exportación a Excel/CSV.
      - **Las ventas de la feria tienen que poder filtrarse** respecto de
        las ventas en línea.

      **Forma y acceso:**
      - Aplicación **separada del dashboard**, enfocada solo en vender.
      - Propuesta: aplicación web instalable (**PWA**) en
        `ventas.nebadon.cl`, del mismo sitio que `api.nebadon.cl` (cookie de
        primera parte, como en el paso 47; habría que sumarla a
        `FRONTEND_URL`), con modo sin conexión, en vez de una app nativa en
        tiendas.
      - Siempre **a través del backend**, nunca conectada directo a la base
        de datos.
      - **Celulares:** las dos vendedoras usan Android (Chrome). La PWA
        puede usar sincronización en segundo plano y huella, sin las
        limitaciones de iPhone.
      - **Sesión:** hoy dura 1 hora (JWT y cookie), y una jornada dura unas
        7 horas. Si la sesión vence sin señal, no se puede volver a entrar.
        Primero: una sesión larga por dispositivo con el rol de vendedor.
        Después, si hay tiempo: entrada con huella (passkeys/WebAuthn).

      **Calendario:**
      - Probado a mediados de noviembre, idealmente con una noche de prueba
        simulando ventas y cortes de señal.
      - Probablemente en varios pasos: roles y registro de ventas en el
        backend (con protección contra duplicados); la PWA de venta rápida
        con modo sin conexión; resumen, filtro y exportación; y la huella al
        final, si hay tiempo.

### Prioridad media

- [ ] **Pedir por Telegram** como alternativa a WhatsApp. Telegram no
      permite abrir un chat con un usuario con el mensaje ya escrito.
      Opción simple para el lanzamiento: copiar el pedido al portapapeles y
      abrir `t.me/<usuario de la tienda>`. Un bot de Telegram queda como
      mejora posterior. Falta el usuario de Telegram de la tienda.

- [ ] **Buscador**: que busque también por categoría, franquicia y tema,
      además del nombre (por confirmar).

- [ ] **Menú de categorías del navbar**: listar las categorías reales,
      cada una llevando a `/shop?category=` (por confirmar; alternativa:
      menú hamburguesa también en desktop).

- [ ] **Página de producto, en un solo paso de diseño:**
      - SKU y franquicia amontonados sobre el título (evaluar sacar el SKU
        de esa zona);
      - color de franquicia igual en `ProductCard`, `ProductDetailModal` y
        `ProductPage`;
      - botón de compartir visible sobre la imagen en mobile, y galería a
        pantalla completa estilo Shein/AliExpress.

- [ ] **Guía de tallas**: tablas de tallas universales, dejando claro qué
      cubre cada tabla (sobre todo si se entra desde el footer), e imágenes
      de cómo medir el pie. Necesita material de la dueña. Relacionado con
      "Tallas y medidas" (punto 3 del ítem "Página de producto — 3
      pendientes reales", en "🔵 Baja prioridad"), que ya anota los rangos
      de calcetines, la talla de bebé y niño, y las tallas elegibles sin
      fila en la tabla.

### Pulido visual

Relacionado con "🎨 Pulido visual / UI-UX", más arriba:

- [ ] **Carrusel del Hero con deslizamiento táctil en mobile**,
      reutilizando el enfoque de `ProductCarousel.jsx` (scroll nativo con
      `overflow-x-auto` + `snap-x`, ya probado en celular). Se suma al ítem
      del Hero "poco atractivo" de esa sección.

- [ ] **Dashboard con estilos uniformes** (bordes de inputs, badges,
      etc.), usando `informe-consistencia-ui-ux.md`, que ya tiene los
      hallazgos del Admin priorizados.

## 🔵 Baja prioridad, no bloqueante

- [ ] Limpieza cosmética menor, sin apuro: `careGuides.js` contiene
      referencias a componentes de React (`Droplet`, `Wind`, `IronIcon`,
      etc., vía `createElement` para evitar depender de que `.js`
      soporte sintaxis JSX) — candidato a renombrarse `careGuides.jsx`
      para reflejar mejor su contenido real, a diferencia de
      `sizeGuides.js` que sí es texto plano. Además, `GuiaCuidados.jsx`
      (y probablemente `EnviosYEntregas.jsx`) rompen la convención del
      resto del proyecto de nombrar componentes en inglés aunque el
      contenido sea en español (`ProductPage`, `Footer`, `Navbar`...) —
      candidatos a renombrarse `CareGuide.jsx`/`ShippingInfo.jsx` o
      similar. Ninguno de los dos afecta el funcionamiento ni las rutas
      públicas (`/guia-cuidados`, que sí conviene mantener en español).
      La tercera página de este tipo, la Guía de Tallas (Fase 4, paso 34),
      ya se creó con la convención correcta (`pages/size-guide/ui/SizeGuide.jsx`,
      ruta `/guia-tallas` en español): quedan 2 de 3 por renombrar.

- [ ] Limpieza chica, sin apuro: la lista de sinónimos de "calcetines"
      (`calceta`, `calcetas`, `calcetin`, `calcetines`) tiene su fuente en
      `PRODUCT_TYPES_BY_CATEGORY` (`productTypeOptions.js`), que
      `isSockCategory` reutiliza desde la Fase 4 (paso 32) sin copiarla.
      Queda una sola copia a mano: `CATEGORY_ALIASES` en `sizeGuides.js`,
      que además traduce `camisa`/`poleron`. Si se suma un sinónimo nuevo,
      hay que agregarlo en los dos lugares.

- [x] ~~El listado de productos del dashboard (`ProductsListPage.jsx`) no
      muestra el Handle~~ — resuelto (paso 42). Encontrado en una prueba
      real (paso 37): había dos "Misfits" (`CAL-ROCK-MISF-01` publicado y
      `CAL-ROCK-MISF` en borrador) y se bajó el stock del que no era.
      Ahora el Handle va debajo del nombre, en la misma celda (tabla) o
      entre nombre y categoría (tarjeta mobile, con `truncate`), sin
      columna nueva: `font-mono text-xs` como en `InventoryPage.jsx`, más
      el gris de dato secundario del mismo archivo (`text-base-content/60`).
      El buscador también busca por Handle ("Buscar por nombre o
      handle..."), sin distinguir mayúsculas. Confirmado en el navegador:
      desktop, mobile, nombres cortos y largos, dos productos con el mismo
      nombre, y búsqueda combinada con los filtros de estado.

- [ ] PDF del pedido (`generatePDF` en `Checkout.jsx`): el nombre del
      producto se corta en el código a 38 caracteres
      (`item.name.substring(0, 38)`) y la categoría a 15
      (`categoryName.substring(0, 15)`). No impiden distinguir variantes
      (el SKU completo ya alcanza, desde el paso 39), pero un nombre largo
      queda trunco. Mismo arreglo posible que el SKU: `splitTextToSize`.

- [ ] PDF del pedido: no hay salto de página. Cada fila avanza 8 mm y la
      tabla empieza en y=75 de una hoja A4 (297 mm), así que con un
      carrito de ~25 ítems o más las filas y el total se salen de la hoja.
      Se arreglaría con un `doc.addPage()` cuando `startY` pase el
      margen inferior, repitiendo el encabezado de la tabla.

- [ ] **PDF y mensaje de WhatsApp generados en el backend, editables desde
      el dashboard**: hoy ambos los arma `Checkout.jsx` con el `cart` local,
      así que pueden no coincidir con lo que el backend valida (el paso 40
      lo contiene rechazando con 409 cualquier diferencia de precio, pero
      la fuente sigue siendo el frontend). Corto plazo: armarlos con los
      datos que devuelve el backend al crear la orden. Más adelante: mover
      la generación al backend (permite reimprimir el PDF desde el panel de
      órdenes) y una plantilla de WhatsApp editable desde el dashboard.

- [ ] Contador del carrito (navbar) no sanea cantidades manipuladas en
      `localStorage`: con `-1` el contador desaparece, con `0` lo corrige a
      1, con `1.5` lo muestra tal cual. Solo cosmético — el backend ya
      rechaza los tres casos al crear la orden (paso 40).

- [ ] El checkout no se limpia al cerrar sesión: si la pantalla de
      confirmación del pedido (reabrir WhatsApp / seguir comprando) queda
      abierta y el usuario cierra sesión, sigue visible. No expone datos de
      otro usuario, pero en un equipo compartido podría quedar a la vista.

- [x] ~~**`variant.price` en 0 desde el CSV haría gratis esa variante en
      todo el sitio**~~ — resuelto (paso 44). Encontrado en el paso 40: el
      import aceptaba "Precio Variante" = 0 y la regla `variant.price ??
      product.price` (sin cambios) lo usaba tal cual. Junto con el bug del
      separador de miles (`parseInt("1.000")` daba 1), era el mismo
      problema con otra entrada. Ahora, en `importProductsCsv`:
      `parseClpPrice` lee Precio, Precio Variante y Costo (acepta `12990`,
      `12.990`, `12,990` y `$12.990`; rechaza con aviso lo ambiguo o no
      numérico, como `12,99`, `1.5` o `abc`, en vez de truncar en
      silencio). Precio Variante en 0 queda en `null` (usa el precio del
      producto) con aviso, igual que el dashboard. Precio de producto en 0
      o inválido rechaza el producto completo, con aviso, y sus filas
      siguientes se omiten (también si se rechaza por falta de Nombre o
      Categoría; antes la fila siguiente lo creaba a medias). Una celda de
      Precio vacía sigue como antes: no toca el precio de un producto que
      ya existe. Además, Zod exige `.int().positive()` en el precio del
      producto y de la variante (la API tampoco acepta 0 ni decimales; no
      cambió qué es obligatorio), y `createWhatsAppOrder` rechaza la orden
      si algún precio calculado no es un entero positivo, con
      `console.warn` del SKU. La consulta de solo lectura a producción no
      encontró datos dañados (ningún precio en 0, menor a 100 ni con
      decimales), y el catálogo exportado pasa completo por
      `parseClpPrice` sin ningún rechazo. Probado: los 3 CSV de prueba
      (Precio Variante 0, Precio 0 con Handle repetido, `12.990` y
      `"12,99"`), los mensajes de Zod en el dashboard ("Precio: debe ser
      mayor que 0.", "Precio: debe ser un número entero."), un borrador
      sin precio (Guardar sigue desactivado) y un pedido normal.

- [x] ~~**Se puede pedir un producto en borrador (`DRAFT`)**~~ — resuelto
      (paso 41): la consulta de `createWhatsAppOrder` ahora filtra por
      `status: 'PUBLISHED'` (la misma regla que usa el sitio público), así
      que un producto en `DRAFT` no aparece entre los encontrados y cae en
      el mismo 409 "ya no está disponible" que un producto borrado. También
      cubre el caso legítimo: un producto que se pasa a Borrador mientras
      está en el carrito de alguien ya no se puede comprar. Probado: 409 con
      un `DRAFT` con variante válida (fetch a mano), orden normal con un
      `PUBLISHED` sin cambios. (Código en el commit `6aa9297`; BACKLOG
      actualizado en el commit del paso 42.)

- [x] ~~**La ficha de un producto en `DRAFT` se puede abrir por URL directa
      y agregar al carrito**~~ — resuelto en el paso 46 (commit `b44ec8d`),
      junto con `GET /api/products`. `ProductPage` cargaba con `getProductById`, que
      no filtra por `status`, y la ficha no revisa el estado (pasa con un
      link compartido de un producto que después se ocultó, sin DevTools).
      Desde el paso 41 ya no se puede comprar (la orden da 409 "ya no está
      disponible"), pero el cliente recién se entera en el checkout.
      El barrido del paso 45 confirmó que `GET /api/products/:id` no filtra
      por `status`: conviene resolverlo junto con el ítem de
      `GET /api/products` (en "🔴 Antes del lanzamiento").
      Ahora `getProductById` responde 404 para un borrador, y la ficha
      muestra "Producto no disponible" ("Este producto no existe o ya no
      está disponible.", sin asumir que es una calceta) con el botón
      "Volver a la tienda", que lleva a una tienda que carga normal.
      Probado en local y en producción (incógnito).

- [ ] **El formulario de Configuración no avisa por qué no guarda**: al
      crear un tema, categoría o franquicia con el nombre vacío o solo con
      espacios, el formulario bloquea el envío en silencio, sin mandar
      ninguna petición ni mostrar ningún aviso. El usuario no se entera de
      por qué no se guardó. Encontrado al probar el paso 43; el mensaje
      nuevo del backend ("Nombre: es obligatorio.") nunca llega a
      ejecutarse por esta vía.

- [ ] El import CSV no acepta `;` como separador: `csv-parser` usa coma
      y no lo detecta. Un CSV con `;` responde "Archivo CSV vacío o sin
      filas válidas." y no importa nada (falla sin hacer daño). Baja
      prioridad: los CSV se editan con OpenOffice Calc, que pregunta el
      separador al abrir y al guardar, así que el flujo con coma funciona.
      Nota: si en Calc la columna Precio tiene formato de miles y se guarda
      con "contenido de la celda como se muestra", el CSV sale con
      `12.990`. Es el caso que cubre `parseClpPrice` desde el paso 44.

- [ ] Stock en el import CSV sigue usando `parseInt(...) || 0`: `"1.000"`
      en Stock queda en 1, y un texto inválido en 0, sin aviso. Mismo
      problema de separador de miles que se resolvió para los precios en
      el paso 44 (no se tocó a propósito: no es un precio). Baja prioridad.

- [ ] El contador de `express-rate-limit` vive en la memoria de cada
      instancia serverless de Vercel: se reinicia en cada arranque en frío
      y no se comparte entre instancias (en la prueba del paso 47 hicieron
      falta más de 10 intentos en algunos casos). Alcanza para frenar
      intentos repetidos desde una IP; si algún día hace falta un límite
      exacto, se necesitaría un almacén compartido (por ejemplo, Redis).

- [x] **Guía de Cuidados y Envíos separadas a páginas propias** —
      encontrado en QA con la dueña real del negocio: el texto de
      cuidados en la ficha de producto era demasiado largo para leerse,
      y usaba "estampados" de forma genérica aunque las calcetas son
      bordadas, no estampadas (error propio, corregido de raíz). Movido
      a `/guia-cuidados` (una tabla por categoría — Calcetines/Camisas/
      Polerones — cada una con su técnica real incorporada) y
      `/envios-y-entregas` (el contenido largo que ya existía, sin
      cambios de fondo). La ficha de producto ahora muestra solo una
      mini tabla de ícono + instrucción corta por cada cuidado, más un
      link "Ver guía completa" / "Ver detalles de envíos", leyendo los
      íconos y textos del mismo archivo de datos que alimenta la página
      completa (una sola fuente de verdad). El link de cuidados incluye
      ancla a la sección de la categoría del producto (`#calcetines`,
      etc.), con scroll directo a esa sección. Los dos links nuevos
      agregados al footer. Confirmado con productos reales de las tres
      categorías.
- [x] **Footer desktop: separadores desbordados a la izquierda** — el
      `<footer>` era `flex flex-col` sin ancho máximo, así que los 3
      `divider` (`w-full`) se estiraban hasta el borde de la pantalla en
      vez de limitarse al ancho del contenido centrado. Corregido
      separando el fondo (`<footer>`, cubre toda la pantalla) del
      contenido (`<div>` interno con `max-w-md`, centrado) — un primer
      intento (poner `max-w-md` directo en el `<footer>`) encogió
      también el fondo por error, corregido en la misma sesión.
      Confirmado en desktop y mobile.
- [x] Año de fundación en el footer corregido: "Estilo urbano desde
      2019" (antes decía 2020).
- [x] **Guía de Cuidados migrada de tarjetas a formato tabla** (era una
      mejora futura: el usuario prefería tabla, y se había construido con
      tarjetas por ser más rápido). `/guia-cuidados` ahora muestra una
      tabla por categoría (ícono / acción / instrucción), y la ficha de
      producto, una mini tabla ícono + instrucción corta, con la etiqueta
      como nombre accesible del ícono. De paso, los detalles del producto
      (Material, Tipo de Calce, Técnica de Decoración, Especificaciones)
      pasaron de lista a tabla de dos columnas. Íconos con `lucide-react`
      + `@lucide/lab` (nuevo; el ícono de plancha, `IronIcon`, viene de
      lab y va envuelto en `Icon iconNode={...}`). Confirmado en el
      navegador, desktop y 375px, con las tres categorías.
- [x] Acordeón "Detalles del Producto y Cuidados" separado en dos
      subsecciones: subtítulos "Detalles" y "Cuidados" (mismo estilo que
      la línea de técnica de `/guia-cuidados`, cada uno visible solo si
      su bloque existe) y una línea divisoria entre ambos, solo cuando
      hay detalles arriba (hoy en `border-base-content/10`, el mismo tono
      que los separadores de tabla). Confirmado en el navegador.
- [x] **Estilo de tabla unificado en todo el sitio** — una sola receta
      en `/guia-cuidados`, Detalles y Cuidados de la ficha, Tallas y
      Medidas, y Envíos: contenedor `overflow-x-auto` con borde
      `border-base-content/10` (mismo tono que el `divider` del footer),
      separadores de fila en el mismo tono, sin `table-zebra` ni
      separadores verticales. Encabezado oscuro (`bg-neutral
      text-neutral-content`) solo en las tablas con fila de encabezado
      real (`/guia-cuidados` y Tallas y Medidas); las de la ficha sin
      encabezado usan el subtítulo "Detalles"/"Cuidados" en su lugar. En
      Tallas y Medidas la columna Talla va en negrita, igual que la
      columna de etiquetas de las otras tablas, y el fix de `min-w-0` en
      dos niveles se conservó. Receta documentada en `CLAUDE.md`.
      Confirmado en el navegador, desktop y 375px.
- [x] Emoji de categoría (🧦👕🧥) sacado de los títulos de
      `/guia-cuidados` — los íconos de la tabla ya cumplen esa función.
      El campo `emoji` de `careGuides.js` quedó sin uso (se dejó a
      propósito, pendiente de decidir si se borra).
- [x] **Mini tabla de envíos en la ficha** — el acordeón "Detalles de
      Envío y Entregas" reemplazó sus 3 emojis sueltos por una mini tabla
      con las 4 modalidades reales de `/envios-y-entregas` (agencia,
      express, presencial, retiro), con íconos de `lucide-react`
      (`Truck`, `Zap`, `Handshake`, `Warehouse`) y el mismo estilo que la
      de Cuidados. No existe ícono de moto/scooter en `lucide-react` ni
      en `@lucide/lab`; se eligió `Zap` para "express". Los textos cortos
      los definió el usuario — no se agregó ninguna condición de tiempos,
      costos ni garantía. Confirmado en el navegador.
- [x] Botón "← Volver al producto" en `/guia-cuidados` y
      `/envios-y-entregas` — solo aparece al llegar desde la ficha
      (`state` de React Router en los links de origen, sobrevive a F5) y
      vuelve con `navigate(-1)`. Pasó a `btn-outline btn-primary`; queda
      distinto a propósito del "Seguir comprando" del checkout, que sigue
      sin color.
- [x] **Radio de las tablas anidadas en acordeones** — las 4 tablas de la
      ficha usaban `rounded-box` (16px) dentro de acordeones `rounded-xl`
      (12px): la caja de adentro más redondeada que la de afuera. Pasaron
      a `rounded-lg` (8px, igual a `--rounded-btn` del tema). La tabla de
      `/guia-cuidados`, que no está anidada, sigue con `rounded-box`.
      Confirmado en el navegador.

- [x] **Tabla de "Tallas y Medidas" se desbordaba en mobile** (la de
      Polerones, 5 columnas, era la más notoria) — tercer caso del mismo
      patrón de DaisyUI en este proyecto (mismo tipo que el banner de
      `InventoryPage.jsx` y el sidebar de filtros): un contenedor no se
      achica por debajo del ancho de su contenido salvo que se le dé
      `min-w-0` explícito, y con `.collapse-content` de DaisyUI el
      problema aparece un nivel más adentro de lo esperable. Confirmado
      con evidencia real (Computed de 4 niveles de anidamiento): el
      primer `min-w-0` en el `<div className="collapse...">` exterior no
      alcanzó — hacía falta también en `.collapse-content` directamente
      (587px de ancho contra 343px de su propio padre, antes del fix).
      Confirmado en celular con la tabla más ancha (Polerones).

- [x] **Pantalla de "Próxima apertura" para `nebadon.cl`** — el dominio
      público (`nebadon.cl`/`www.nebadon.cl`) muestra una imagen a
      pantalla completa (versión mobile y desktop) con link a Instagram,
      en vez del sitio completo — mientras el dominio de pruebas en
      Vercel sigue mostrando la tienda funcional para seguir juntando
      feedback. Chequeo por `hostname` antes de `<Routes>` en `App.jsx`.
      Confirmado: `nebadon.cl` muestra la pantalla nueva, el dominio de
      pruebas sigue intacto (admin incluido). Detalle cosmético menor,
      aceptado tal cual por decisión del usuario: en desktop la imagen
      no encuadra perfectamente en los bordes de la pantalla — no
      bloqueante, el mensaje se entiende igual; retomar solo si en algún
      momento importa el detalle visual exacto.

- [x] **Dominio propio `nebadon.cl` conectado y funcionando** — el
      frontend cargaba pero los datos no llegaban: CORS solo aceptaba un
      origen (`FRONTEND_URL` apuntaba únicamente al dominio viejo de
      Vercel). Corregido en `app.js` para aceptar una lista de orígenes
      separados por coma en vez de uno solo, así conviven `nebadon.cl`,
      `www.nebadon.cl` y el dominio de respaldo en Vercel sin que
      agregar uno rompa los demás. Confirmado con datos reales en el
      dominio nuevo, y confirmado que el dominio viejo sigue funcionando
      igual de bien.

- [x] **Sección "Explora más diseños increíbles" nunca mostraba nada** —
      `ProductPage.jsx` la montaba con `products={[]]}` hardcodeado, un
      pendiente que quedó marcado desde que se construyó la página.
      Resuelto con productos de la misma categoría (excluyendo el actual,
      filtrando por `PUBLISHED`), usando el array `products` que ya trae
      `ProductContext` — sin ninguna llamada nueva al backend. La sección
      entera se oculta si no hay relacionados, en vez de mostrarse vacía.
      Confirmado con productos reales.
- [ ] **Página de producto — 3 pendientes reales, de tamaño creciente**:
      1. ~~Sacar el texto de garantía de 30 días de "Envíos y Garantía"~~
         — resuelto: el texto ya no existe en el código (búsqueda en
         `FRONTEND/src` sin resultados), el acordeón se llama "Detalles de
         Envío y Entregas" y tiene contenido real (mini tabla con las 4
         modalidades). Si algún día se quiere publicar una política de
         cambios o devoluciones, es un tema de negocio aparte, no de
         código.
      2. ~~"Materiales y Cuidados" editable desde el admin~~ — resuelto
         en la Fase 2 de Materiales del Producto, con un diseño distinto
         al pedido original: en vez de una lista dinámica (agregar/quitar
         puntos), quedaron 4 campos fijos (`material`, `fit_type`,
         `decoration_technique`, `specifications`) editables desde
         `ProductAttributesForm.jsx`. Detalle en `CLAUDE.md`.
      3. "Tallas y medidas" — ya no está bloqueado por falta de datos:
         `sizeGuides.js` tiene medidas para calcetines, camisas y
         polerones. Quedan cuatro pendientes:
         - **Rangos de calcetines**: no se tocan todavía en
           `sizeGuides.js`. Hay que confirmar con el proveedor cómo
           publica las tallas reales (ej. "39-43", "36-39") antes de
           cargarlas; hoy la guía usa S/M/L con otros cortes de calzado.
         - **Calcetines de bebé y niño**: sin cubrir. Tienen rangos
           propios, distintos de los de adulto; `sizeGuides.js` no tiene
           nada para eso. Es una categoría de dato nueva, no un ajuste de
           la existente.
         - **"Oversize" en polerones**: se sacó la nota fija de
           `sizeGuides.js` (`note: null`) como parche temporal — hoy
           coincidía solo porque el único polerón del catálogo es
           oversize. "Oversize" no es un tipo seleccionable para
           polerones en el dashboard. Cuando se agregue un segundo
           polerón que no lo sea, hará falta un atributo real por
           producto (mismo patrón que `sock_type`) para diferenciarlos.
         - **Tallas elegibles sin fila en la tabla**: `SIZE_OPTIONS`
           (`productTypeOptions.js`) permite elegir en el dashboard
           tallas que la tabla de Tallas y Medidas no cubre — camisas:
           XS y STD; calcetines: XS, XL, XXL y STD (la tabla solo tiene
           S/M/L); polerones: XXL (la tabla llega hasta XL). El cliente
           que elige una de esas no encuentra su talla en la tabla, sin
           explicación. Bloqueado hasta tener las medidas reales de cada
           una, y qué significa "STD" en cada categoría (puede ser talla
           única solo para un tipo de producto, no igual en las tres).
         Sigue conectado con la idea de tallas condicionadas por
         categoría/género (en "puede esperar").
         Pedido de octubre relacionado: tablas universales, qué cubre cada
         tabla e imágenes de cómo medir el pie (ver "📝 Lista de la dueña y
         usuarios (octubre)").

- [x] **Carruseles del Home sin deslizamiento táctil en mobile** —
      `ProductCarousel.jsx` nunca tuvo scroll real: armaba "páginas"
      completas en un array de JS y navegaba por clic en flechas,
      mostrando una página a la vez. Rediseñado para mobile con scroll
      horizontal nativo (`overflow-x-auto` + `snap-x snap-mandatory`),
      sin flechas (se sacaron a pedido, los puntitos quedan como único
      indicador de "esto es una galería"); desktop queda funcionalmente
      idéntico a como estaba, solo reorganizado en variables separadas.
      Confirmado en celular físico: desliza suave, encaja bien al
      soltar. Los puntitos son aproximados en mobile (se calculan por
      posición de scroll, no exactos como en desktop) — a validar con
      más usuarios probando si molesta o si cumplen su función igual.

- [ ] Unificar que `configdb.js`, `authControllers.js`, `authMiddleware.js`
      y `cloudinaryConfig.js` importen desde `env.js` en vez de leer
      `process.env` directo — hoy funcionan igual (dotenv ya corrió), es
      solo tener un único punto de verdad. No urgente.
- [ ] Evaluar `helmet` si en algún momento se quiere hardening extra
      (Content-Security-Policy, etc.) — los headers manuales actuales
      cubren lo esencial para la escala de hoy.

## ✅ Verificado con evidencia real (sept 2026) — mejor de lo esperado

- [x] CORS: whitelist de orígenes vía `FRONTEND_URL` — hoy una lista
      separada por comas (ver "Dominio propio `nebadon.cl`" más arriba),
      credentials explícito. Sin acción necesaria.
- [x] Rate limiting: ya implementado con `express-rate-limit` (general
      200/15min, auth 10/15min). Sin acción necesaria.

## 🟡 Nuevo, encontrado durante el cableado de OrdersPage.jsx

- [x] ~~Entender el mecanismo de ProtectedRoute.jsx~~ — confirmado con el
      archivo real: dos guardas explícitas, `Object.keys(userInfo).length
      === 0` (no logueado) y `!userInfo.isAdmin` (logueado sin permisos),
      ambas redirigen a `/`. Es un chequeo de rol a propósito, funciona
      como se esperaba. Mejora cosmética opcional, no urgente: las dos
      redirecciones son silenciosas, sin mensaje — si alguna vez un
      no-admin cae ahí por error de UI, no sabe por qué lo mandaron al
      home.

## 🟡 Nuevo, encontrado durante el trabajo de variantes

- [x] ~~Validar stock en el backend al crear la orden~~ — resuelto (paso
      37): `createWhatsAppOrder` consulta en una sola query el stock real
      de cada variante (por `sku`) y, si algo no alcanza o la variante ya
      no existe, rechaza la orden completa con 409 y un mensaje por ítem
      (no ajusta cantidades: el PDF y el WhatsApp se arman en el frontend
      con el carrito). `Checkout.jsx` ahora muestra ese mensaje en vez del
      genérico. Límite conocido: no reserva stock (se descuenta al
      aprobar), así que dos órdenes casi simultáneas por la última unidad
      pasan las dos; el admin lo ve como aviso de stock negativo al
      aprobar la segunda.
- [x] ~~**La orden confía en el precio que manda el frontend**~~ — resuelto
      (paso 40), todo en `createWhatsAppOrder`. Valida que cada `quantity`
      sea un entero ≥ 1 (400 si no: antes una cantidad negativa pasaba el
      chequeo de stock y habría restado del total), recalcula el precio
      real de cada ítem con la misma regla del carrito (`variant.price ??
      product.price`) y el total, reutilizando la consulta de stock del
      paso 37 (solo se sumó `price` a la proyección), y rechaza con 409 si
      el precio de algún ítem o el `totalAmount` no coinciden. Nunca guarda
      lo que manda el frontend: precio y total salen siempre de la base.
      Se eligió rechazar en vez de corregir en silencio porque el PDF y el
      WhatsApp los arma el frontend con el carrito local: corregir solo la
      orden guardada los dejaría distintos (y el WhatsApp es por donde se
      cobra). Cubre también un caso legítimo: el carrito de invitado guarda
      el precio al agregar y nunca lo refresca, así que un cambio de precio
      en el dashboard ahora se avisa antes de crear la orden ("quítalo del
      carrito y vuelve a agregarlo"). Límite: el cliente siempre puede
      editar el texto del WhatsApp antes de enviarlo; la referencia para
      cobrar es el total del panel de órdenes. Probado: pedido normal
      (invitado y logueado), precio manipulado en `localStorage` y en el
      payload, cantidad inválida, y carrito viejo tras cambiar el precio.
- [ ] Imagen específica por variante de color — hoy la galería de fotos es
      una lista suelta sin asociación a ninguna variante en particular.
      Requiere schema + selector en `ProductAttributesForm` + lógica en el
      selector del cliente. Mejora post-lanzamiento, no un bug.
- [x] ~~**El checkout y su PDF no distinguen variantes del mismo
      producto**~~ — encontrado probando el paso 38, resuelto en el paso
      39. En `Checkout.jsx`, la lista del resumen mostraba solo imagen y
      título: ahora muestra talla y color debajo del nombre (mismo formato
      y clases que `CartDrawer.jsx`), y la `key` de cada fila pasó de
      `item._id` (repetida con dos variantes del mismo producto) a
      `${item._id}-${item.sku}`. En el PDF, el SKU se cortaba **en el
      código** a 18 caracteres (`sku.substring(0, 18)`), que se llevaba
      justo el sufijo de talla/color: `CAL-RANDOM-PAT-XXL-ROS-2`, `-ROS` y
      `-AMA` salían idénticos. Ahora va completo y, si no entra en su
      columna, sigue en otra línea (`splitTextToSize`), con la fila
      creciendo solo cuando hace falta.
- [x] ~~Limpieza menor: sacar el `console.log('UPDATE CART', ...)`~~ de
      `cartControllers.js` — resuelto (paso 38).
- [x] ~~Limpieza menor: `stock` sin uso en `ProductCard.jsx`~~ — resuelto
      (paso 38). El payload ya no lo mandaba; quedaba solo la variable
      desestructurada sin usar. De paso se quitó `sku: sku || 'SIN-SKU'`:
      el producto no tiene `sku` propio (es de cada variante), así que
      siempre mandaba `'SIN-SKU'`, y `CartContext` lo pisaba con el `sku`
      de la variante elegida.
- [x] **`jspdf` usado en `Checkout.jsx` pero nunca declarado en
      `package.json`** — funcionaba en local porque ya estaba instalado
      físicamente en `node_modules` de alguna instalación anterior; un
      `npm install` limpio (como el que hace Vercel en cada deploy) nunca
      lo hubiera traído. Encontrado al desplegar, corregido con
      `npm install jspdf` (actualiza `package.json` y
      `package-lock.json` juntos, no se editó a mano). Confirmado con
      `npx depcheck` que no quedó ningún otro paquete usado-pero-no-
      declarado en el proyecto.
- [x] ~~Limpieza opcional, de `npx depcheck`~~ — resuelto (paso 38):
      se desinstalaron `@types/react` y `@types/react-dom` (el proyecto es
      `.jsx`, sin `tsconfig`) y `react-router` (ningún import directo;
      `react-router-dom` lo declara como dependencia propia, así que sigue
      instalado). Para no repetir la duda:
      - ⚠️ `tailwindcss`, `postcss`, `autoprefixer` — depcheck los marca
        como "no usados", pero es un FALSO POSITIVO: se usan desde
        archivos de configuración (`tailwind.config.js`,
        `postcss.config.js`), no desde imports directos en `.jsx`, que es
        lo único que depcheck rastrea bien. **No desinstalar nunca** —
        son la base de todo el sistema de estilos del sitio.
- [x] ~~Limpieza menor: `ProductPreviewCard.jsx` es código huérfano~~ —
      resuelto: reconfirmado después de Fase 3 (ningún import fuera de su
      propio export en `features/products/index.js`; además usaba campos
      que el formulario ya no tiene, `template.color` y `template.colors`).
      Borrado junto con su export del barrel. `ProductEditModal.jsx` ya no
      existía: se había borrado en el commit `e895121` (división de
      `ProductsPage` en rutas separadas), no quedaba nada que limpiar ahí.
- [x] ~~`syncCartWithBackend` falla con carritos viejos sin `sku`~~ —
      resuelto (paso 37). El bug real era peor: llamaba
      `addToCartService(userId, item._id, item.quantity)`, sin `sku` y con
      la cantidad en su lugar, así que **todo** carrito de invitado se
      perdía en silencio al iniciar sesión (404 "Variante no encontrada"
      en cada ítem, solo logueado en dev, y después se borraba el
      `localStorage`). Ahora pasa `sku` y cantidad reales; los ítems viejos
      sin `sku` se resuelven con `resolveLocalItemSku`
      (`entities/cart/lib/`) solo si no hay ambigüedad (variante única, o
      talla + color exactos); lo que no se puede pasar (sin variante
      identificable, sin stock, variante borrada) se avisa en un toast.
      Encontrado al probar: un carrito **guardado en la base** con ítems
      viejos sin `sku` (obligatorio en `CartModel`) hacía fallar con 500
      cualquier `cart.save()` de ese usuario — no podía agregar, cambiar
      cantidad ni quitar nada. `cartControllers.js` ahora descarta esos
      ítems (`dropItemsWithoutSku`) antes de tocar el carrito, así que cada
      carrito viejo se limpia solo la primera vez que el usuario lo usa.
- [x] ~~Patrón de archivos modificados sin explicación~~ — descartado como
      preocupación real. Las dos apariciones tienen causa mundana
      confirmada, no un proceso externo: (1) los secretos en `env.js` se
      repetían porque el archivo nunca vivía en git (sin diff previo que
      alertara del error de escribirlos en el mensaje de `.min()`),
      resuelto de raíz generando los mensajes desde nombres; (2) la
      declaración duplicada en `ShoppingPage.jsx` fue una edición manual
      propia sin borrar el código viejo antes de pegar el nuevo. No hace
      falta seguir sospechando de extensiones ni de sesiones paralelas.
- [ ] **Pulido visual sin resolver**: el banner de "stock bajo" en
      `InventoryPage.jsx` se ve ligeramente desbordado del borde derecho
      de la tarjeta (confirmado real con DevTools cerrado, no era efecto
      del inspector). Se probaron 3 fixes sin éxito confirmado en pantalla:
      `min-w-0` en el texto, `w-full` + `overflow-hidden` en el
      contenedor (esto solo recortó el desborde, no lo resolvió — dejó un
      margen asimétrico), y `!grid-cols-1` en el `.alert` (el componente
      usa `display: grid` internamente, sospecha de que la columna
      implícita no se achica). No bloqueante — es un aviso informativo,
      no impide usar el sistema. Retomar con más tiempo si molesta.

## 🟡 Nuevo, encontrado durante Fase 3 (formulario de producto)

- [x] ~~**Handle sin validar en el frontend**~~ — resuelto (paso 35):
      `isFormValid` exige Handle y Título de al menos 3 caracteres
      (medidos con `trim()`, igual que los manda el `payload`), como ya
      exigía `productSchema.js`. El indicador de "Información básica" en
      creación usa el mismo criterio, y los inputs tienen el máximo del
      backend: Handle `maxLength={50}` y Título `maxLength={100}`. El
      Título tenía el mismo bug (mínimo 3 en el backend, solo "no vacío"
      en el frontend) y se corrigió en el mismo paso.
- [x] ~~**Mensajes de error del backend al guardar un producto**~~ — la causa
      real (diagnosticada en Fase 4, paso 32b) no era solo que faltara el
      nombre del campo — el mensaje del backend **nunca llegaba al toast**.
      El backend responde bien (400 con `message` = primer issue de Zod,
      mismo formato para errores simples y para `superRefine`), pero
      `ProductContext.jsx` lo descartaba: texto fijo al editar,
      `error.message` de axios ("Request failed with status code 400") al
      crear. Corregido en el paso 32b solo para productos: el toast ahora
      muestra `error.response.data.message`. **Queda pendiente
      (alternativa B):** que el mensaje diga qué campo falló — los errores
      genéricos de Zod siguen llegando en inglés y sin nombre de campo
      (ej. "Too small: expected string to have >=3 characters"; en la
      prueba real de Fase 3 el campo era Stock). Si se hace con un helper
      compartido en el backend, toca los 5 controladores que atrapan
      `ZodError` (products, auth, franchiseNames, designThemes,
      productCategories): afectaría también login y registro.
      **Alternativa B resuelta (paso 43)** con un helper compartido,
      `BACKEND/src/utils/formatZodError.js`, usado en los 10 `catch` de
      esos 5 controladores. Arma el mensaje en español según el tipo de
      error de Zod (`issue.code`), con el nombre del campo en español
      ("Handle: debe tener al menos 3 caracteres.", "Variantes #1 › Stock:
      debe ser mayor o igual a 0."), y distingue "es obligatorio" de "debe
      ser un número". Los mensajes `custom` (refine/superRefine), ya en
      español, se respetan tal cual. Se descartó el locale en español de
      Zod 4 (`z.locales.es()`): traduce literal ("se esperaba string") y
      no nombra el campo. La investigación encontró algo más grave que el
      idioma: en 4 de los 5 controladores el mensaje **nunca llegaba a la
      pantalla**. Login y los 3 de catálogo respondían un array suelto, sin
      `message`, así que el usuario veía siempre el genérico del frontend;
      y el registro ni siquiera atrapaba `ZodError`: respondía 500 "Error
      interno" ante un dato mal escrito. Ahora los 5 responden el mismo
      formato `{ message, errors }` (el toast muestra el primero), y el
      registro da 400 como el login. Probado: registro y login con datos
      inválidos (Console), tema vacío y producto con stock negativo.
- [x] **El email distinguía mayúsculas: "Juan@Gmail.com" no podía
      registrarse ni iniciar sesión** — encontrado y resuelto en el paso
      43. El patrón de email de `LoginForm.jsx` y `RegisterForm.jsx` no
      tenía la bandera `i`, así que rechazaba cualquier mayúscula con
      "Correo electrónico inválido.". Agregar solo la `i` habría creado
      otro bug: `UserModel` guarda el email tal cual y el login lo busca
      exacto, así que `Juan@` no habría podido entrar como `juan@`, y el
      índice único habría permitido dos cuentas. Por eso `authSchema.js`
      ahora pasa el email a minúscula (`z.email().toLowerCase()`) en
      registro y login. Los usuarios existentes no se ven afectados: con
      el formulario anterior, todos sus emails estaban en minúscula.
      Probado: registro con mayúsculas, login con el mismo email en
      minúscula y en mayúscula, registro duplicado rechazado, login del
      admin con mayúscula.

## 🟡 Nuevo, encontrado durante Fase 4 (tallas)

- [x] ~~**CSV: exportar y reimportar perdía datos**~~ — resuelto (paso
      36), todo en `importProductsCsv`. El diagnóstico real era peor que
      lo anotado: el BOM que agrega la exportación (para Excel) hacía que
      la primera columna llegara como "﻿Handle", así que un CSV
      exportado y reimportado sin tocar no importaba **ninguna** fila. Se
      corrigió: (1) `mapHeaders` quita el BOM; (2) se lee la columna
      `Genero` (sin tilde, como la exporta) además de `Género`/`gender`,
      y `genderTranslationMap` reconoce los valores en inglés que exporta
      (`men`/`women`/`kids`/`babies`) y `bebés`/`bebes`; un Género
      desconocido avisa en `errors` en vez de caer en silencio a
      `unisex`; (3) se lee `Precio Variante` (antes cada variante
      reimportada quedaba con `price: null`, borrando precios reales);
      (4) antes del `bulkWrite`, una consulta liviana trae el
      `size_standard` de los productos que ya existen y, si tiene talla
      fija, fuerza esa Talla en sus variantes (con aviso en `errors`),
      usando `LOCKED_VARIANT_SIZE_BY_STANDARD` (`productSchema.js`, copia
      de `variantSize` del frontend). Los SKUs no se regeneran.
      ~~Pendiente menor: `parseInt` lee mal precios con punto de miles
      ("1.000" → 1)~~ — resuelto para Precio, Precio Variante y Costo en
      el paso 44 (`parseClpPrice`). Stock sigue con `parseInt`: anotado
      aparte en "🔵 Baja prioridad".
      Relacionado, **resuelto en el paso 33**: el selector libre de Talla
      ya no muestra "N/A" para tallas que no están en `SIZE_OPTIONS` (ej.
      "39-43" cargado por CSV); ahora muestra el valor real.

## ❓ Pregunta abierta, sin resolver

- Se mencionó una idea sobre que los badges de variante (o los de
  `featured`/`popular`) tuvieran "otra utilidad", pero se perdió en el
  camino de la conversación y nunca se aclaró cuál era. Dato relacionado:
  `ProductModel.js` ya tiene los campos `featured` y `popular`, el admin ya
  los deja marcar, pero ningún componente público (`ProductCard`,
  `ProductPage`, catálogo) renderiza un badge visual para ellos todavía —
  el dato existe, no tiene salida visual. Confirmar si era esto antes de
  construir nada.
- Revisar precios de variantes: el modelo y el CSV ya soportan un
  precio propio por variante (price en variants, null = usa el
  precio general del producto), confirmado funcional en el paso 36. Hoy
  el dashboard no tiene forma de asignarlo: en VariantsFields.jsx la
  tabla y las tarjetas muestran SKU, Talla, Color Base, Diseño y Stock,
  pero ninguna columna de precio — el campo existe en el formulario y se
  envía al guardar, pero nadie lo puede editar desde la pantalla; solo
  llega por CSV. Falta definir cómo se le mostraría al cliente en la
  ficha de producto (¿el precio cambia al elegir una variante mediante
  un selector, o se necesita agregar ese selector?), y qué pasa con la
  galería/scroll de variantes que ya existe. Sin definir todavía — es
  una conversación de diseño pendiente, no una implementación en curso.

## 🟡 Puede esperar sin riesgo real (post-lanzamiento)

- [ ] **Tallas condicionadas por categoría + género** — idea del usuario:
      que las opciones de talla disponibles cambien según el tipo de
      prenda y a quién está destinada (ej. poleras de niño con tallas
      distintas a poleras de hombre). El patrón ya existe en el proyecto
      para una sola dimensión: `PRODUCT_TYPES_BY_CATEGORY` en
      `productTypeOptions.js` mapea categoría → lista de tipos. Se
      extendería con una clave compuesta (ej. `polera-mujer`,
      `polera-nino`) en el mismo archivo, en vez de agregar una
      estructura nueva. No urgente, no bloquea la carga de catálogo
      actual (`SIZE_OPTIONS` genérico sigue funcionando mientras tanto).

- [ ] Alertas de stock bajo
- [ ] Reportes básicos de qué se vende más
- [ ] Multiusuario con niveles de acceso
- [ ] Historial de pedidos consultable por cliente
- [ ] Personalización visible del catálogo (branding/tema)

## ✅ Pasada de responsividad (mobile/tablet) — CERRADA

Único prerrequisito real para publicar. Regla de prueba usada: ~375px
(mobile), ~768px (tablet), desktop normal.

- [x] Navegación del admin en mobile — bug funcional real (sidebar
      inaccesible), resuelto: los íconos `ti ti-*` nunca tuvieron fuente
      cargada en ningún lado del proyecto.
- [x] Los 6 archivos restantes con íconos `ti ti-*` — reemplazados por
      `react-icons/tb`: `ProductAttributesForm.jsx`, `AdminHome.jsx`
      (caso especial: ícono condicional `TrendIcon`), `CsvImportModal.jsx`,
      `InventoryPage.jsx`, `ShoppingPage.jsx` (tienda pública, botón de
      Filtros — el único de los 6 con impacto en clientes reales, no solo
      admin), `ProductPreviewCard.jsx` (resultó código huérfano).
- [x] `ProductAttributesForm.jsx`, tabla de Variantes — tarjetas apiladas
      en mobile. De paso, 3 bugs reales corregidos: colisión de SKU
      autogenerado (violaba índice único de Mongo), "0" pegado en el
      input de Stock al escribir, sin scroll automático a variante nueva.
- [x] `ProductsListPage.jsx` — tarjetas apiladas en mobile con imagen,
      nombre, categoría, badge de estado, precio, stock y acción de
      Editar. El botón Eliminar se redujo a un ícono chico en la esquina
      (no un botón grande al lado de Editar) tras discutir el riesgo de
      toque accidental en una acción destructiva — mismo patrón que ya
      usan las tarjetas de Variantes. Confirmado visualmente, filtros
      Publicados/Borradores funcionando igual sobre las tarjetas.
- [x] `InventoryPage.jsx` — columna Handle oculta en mobile
      (`hidden md:table-cell`, redundante con Producto), liberando
      espacio para que Stock entre sin scroll horizontal. Confirmado
      visualmente: las 5 columnas relevantes entran completas.

Es también el prerrequisito ya cumplido de la futura app con Capacitor
(pausada post-lanzamiento) — la web ya es responsiva en las pantallas
del panel de administración.

## 📋 Resuelto fuera del código

- [x] Boleta electrónica → Portal MiPyme gratuito del SII, emisión manual

## ❌ Descartado a propósito

- Integración de pasarela de pago (MercadoPago)

## 📱 Decisión de alcance (registrada para no repetir la discusión)

App móvil nativa (Play Store / App Store, vía Capacitor): pausada hasta
después de publicar la web. Prerrequisito cuando se retome: la web tiene que
estar ya responsiva, porque Capacitor envuelve el mismo código web tal cual
está — no arregla nada visual por sí solo.
