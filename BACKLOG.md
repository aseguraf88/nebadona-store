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
- [ ] Renombrar todo de "nebadona" a "nebadon" (GitHub + los dos
      proyectos de Vercel) — pospuesto a propósito hasta después de
      confirmar que el sitio funciona estable en producción, para no
      arriesgar la integración recién lograda.

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
- [ ] Scroll automático al abrir un acordeón en `ProductPage.jsx` salta
      demasiado lejos (hasta "Explora más diseños") en vez de quedarse
      en la zona de acordeones — el fix liviano (`onClick={(e) =>
      e.target.blur()}` en los 4 `<input type="radio">`) no lo resolvió
      del todo. Pausado a pedido del usuario para priorizar otros
      hallazgos. Fix de fondo pendiente si se retoma: reemplazar el
      mecanismo de radios nativos por `useState` controlado en React,
      eliminando la dependencia del foco del navegador por completo.

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
         polerones. Quedan tres pendientes:
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
         Sigue conectado con la idea de tallas condicionadas por
         categoría/género (en "puede esperar").

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

- [ ] Validar stock en el backend al crear la orden (`createWhatsAppOrder`
      no valida stock hoy). El carrito de invitado nunca toca el backend
      hasta el checkout final — hoy solo hay defensa del lado del cliente.
- [ ] Imagen específica por variante de color — hoy la galería de fotos es
      una lista suelta sin asociación a ninguna variante en particular.
      Requiere schema + selector en `ProductAttributesForm` + lógica en el
      selector del cliente. Mejora post-lanzamiento, no un bug.
- [ ] Limpieza menor: sacar el `console.log('UPDATE CART', ...)` que sigue
      en `cartControllers.js` (ya señalado en la auditoría de seguridad
      original, nunca se sacó).
- [ ] Limpieza menor: `ProductCard.jsx` manda un campo `stock` sin uso en
      el payload de `addToCart` — `CartContext` ya lo resuelve desde la
      variante real, es código muerto que quedó del cambio.
- [x] **`jspdf` usado en `Checkout.jsx` pero nunca declarado en
      `package.json`** — funcionaba en local porque ya estaba instalado
      físicamente en `node_modules` de alguna instalación anterior; un
      `npm install` limpio (como el que hace Vercel en cada deploy) nunca
      lo hubiera traído. Encontrado al desplegar, corregido con
      `npm install jspdf` (actualiza `package.json` y
      `package-lock.json` juntos, no se editó a mano). Confirmado con
      `npx depcheck` que no quedó ningún otro paquete usado-pero-no-
      declarado en el proyecto.
- [ ] Limpieza opcional, de `npx depcheck` — NO urgente, revisar con
      calma en otro momento:
      - `@types/react`, `@types/react-dom` en devDependencies — candidato
        razonable a eliminar (el proyecto es `.jsx`, no `.tsx`).
      - `react-router` en dependencies — posiblemente redundante, ya que
        `react-router-dom` lo trae internamente.
      - ⚠️ `tailwindcss`, `postcss`, `autoprefixer` — depcheck los marca
        como "no usados", pero es un FALSO POSITIVO: se usan desde
        archivos de configuración (`tailwind.config.js`,
        `postcss.config.js`), no desde imports directos en `.jsx`, que es
        lo único que depcheck rastrea bien. **No desinstalar nunca** —
        son la base de todo el sistema de estilos del sitio.
- [ ] Limpieza menor: `ProductPreviewCard.jsx` es código huérfano —
      confirmado sin consumidores reales (solo se exporta a sí mismo desde
      el barrel). Probablemente sobrante de la vista previa que se sacó de
      la vieja `ProductsPage.jsx` cuando armamos `ProductFormPage.jsx`.
      Borrar junto con `ProductEditModal.jsx` en la próxima limpieza.
- [ ] `syncCartWithBackend`: un carrito viejo en `localStorage` de antes de
      este cambio (sin `sku`) va a fallar el sync al loguearse. No
      bloqueante mientras el sitio no esté publicado — revisar antes del
      lanzamiento si hay usuarios de prueba con carritos viejos guardados.
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

## ❓ Pregunta abierta, sin resolver

- Se mencionó una idea sobre que los badges de variante (o los de
  `featured`/`popular`) tuvieran "otra utilidad", pero se perdió en el
  camino de la conversación y nunca se aclaró cuál era. Dato relacionado:
  `ProductModel.js` ya tiene los campos `featured` y `popular`, el admin ya
  los deja marcar, pero ningún componente público (`ProductCard`,
  `ProductPage`, catálogo) renderiza un badge visual para ellos todavía —
  el dato existe, no tiene salida visual. Confirmar si era esto antes de
  construir nada.

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
