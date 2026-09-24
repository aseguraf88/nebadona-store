# Informe de consistencia visual (UI/UX) — Nebadon Store

Fecha: 2026-09-23 · Alcance: `FRONTEND/src` (97 archivos `.js`/`.jsx`/`.css`) ·
Informe de solo lectura: no se modificó ningún archivo de código.

> **Nota de actualización (2026-09-23, después de los pasos 10 a 14):**
> este informe es un registro del estado al momento de escribirlo; sus
> tablas y datos no se modificaron. Desde entonces:
> - Se resolvió parte del hallazgo de íconos y emojis mezclados (punto 3
>   de la conclusión): en la ficha, los acordeones de Cuidados y Envíos
>   usan un solo origen, `lucide-react`, y `/guia-cuidados` ya no tiene
>   emoji en los títulos. `/envios-y-entregas` sigue con emojis en su
>   lista de modalidades.
> - Las tablas de la ficha recibieron un radio en el paso 10
>   (`rounded-box`, 16px), que quedó más redondeado que el acordeón que
>   las contiene (`rounded-xl`, 12px); en el paso 14 pasaron a
>   `rounded-lg` (8px), a propósito. Este caso no existía cuando se
>   escribió el informe.
> - El botón "Volver al producto" ahora es `btn-outline btn-primary`.
> - El resto de los hallazgos sigue sin tocar: radio de los botones del
>   recorrido de compra, íconos duplicados por función, colores del hero,
>   de la etiqueta de franquicia y de la marquesina,
>   `data-theme="autumn"`, íconos y emojis del admin, entre otros.

---

## 1. Resumen ejecutivo

1. **El botón principal del recorrido de compra cambia de forma en cada paso**
   (Tienda pública). La acción principal usa cuatro radios distintos según la
   pantalla: `rounded-xl` en la tarjeta, el modal y el carrito; `rounded-2xl`
   en la ficha y el checkout; `rounded-full` en el hero; y 0.5rem (el valor por
   defecto de DaisyUI) en el resto. De los 30 `btn` de la tienda, 23 usan el
   radio por defecto y 7 lo sobrescriben con 3 valores distintos. En el
   admin, 0 de 54 lo sobrescriben.
2. **Íconos: la tienda pública mezcla 8 librerías o sets de íconos**, además de
   SVG escritos a mano y caracteres de texto. Eso produce **duplicados reales
   de la misma función con distinto dibujo**: buscar (SVG propio y `Hi`),
   compartir (`lucide` y SVG propio), cerrar (`✕`, `FiX` y `HiOutlineX`) y
   flechas (`lucide` y `Fi`). El admin, en cambio, usa un solo set (`Tb`).
3. **Emojis e íconos vectoriales chocan en la misma pantalla**: en la ficha de
   producto, el acordeón de Envíos muestra 📦🛵🤝 justo debajo del acordeón de
   Cuidados, que ahora usa íconos `lucide`. Lo mismo pasa entre las páginas
   hermanas `/envios-y-entregas` (emojis) y `/guia-cuidados` (`lucide`).
4. **La paleta está bien centralizada**: el 93,3 % de las referencias de color
   (603 de 646) pasan por tokens del tema. Pero hay **usos del mismo dato con
   colores distintos**: la etiqueta de franquicia es `text-secondary` en la
   tarjeta, `text-primary` en la ficha y gris en el modal, y el mismo CTA del
   hero es `btn-accent` en un slide y `btn-primary` en el otro. Además, el
   color `error` se usa para promoción (marquesina y "Ofertas").
5. **El tema activo no es "autumn"**. `index.html` declara
   `data-theme="autumn"`, pero `tailwind.config.js` solo genera el tema
   `light`, y el CSS compilado no contiene ninguna regla para "autumn". El
   sitio se ve con `light` por descarte, y el `BACKLOG.md` documenta un tema
   que no está activo.

---

## 2. Metodología y límites

- **Escenario de cada archivo**: sale del **grafo real de imports**, partiendo
  de las rutas de `App.jsx`, y los barrels `index.js` se resuelven hasta el
  archivo real importado.
  - Raíces "Tienda": `Layout` y las páginas públicas.
  - Raíces "Admin": `AdminLayout`, `ProtectedRoute` y las páginas de admin.
  - Resultado:

    | Escenario | Archivos |
    |---|---|
    | Tienda pública | 33 |
    | Admin | 19 |
    | Ambos (contextos y servicios, sin UI) | 5 |
    | Infraestructura (`App.jsx`, `main.jsx`, `index.css`) | 3 |
    | Sin uso | 37 |

    "Sin uso" son 33 barrels más 4 archivos que nadie importa:
    `payment-results/*` (3, comentados en `App.jsx`), `ProductPreviewCard.jsx`,
    `AuthButtons.jsx` y `colorFamilies.js`. **Los archivos sin uso quedan fuera
    de los porcentajes.**
- **Conteos**: se hicieron con expresiones regulares sobre el código, incluidos
  los template literals. Busqué clases construidas dinámicamente
  (`` `bg-${…}` ``, `` `rounded-${…}` ``, etc.) y encontré **0**, así que los
  conteos cubren todas las clases.
- **Correcciones que hice durante la auditoría**:
  - Un primer conteo de imports de íconos salió mal: la regex abarcaba varios
    imports seguidos. Lo rehice y **verifiqué 24 imports de íconos contra 24
    líneas** encontradas con `grep`.
  - El primer conteo de `<svg>` en línea dio 0 por un error del patrón. El
    valor correcto, verificado con `grep`, es **7**.
- **Límites que no pude resolver sin ver el sitio renderizado**:
  - El contraste real de color (no se midió).
  - El efecto de `text-black` sobre la fuente del logo: *Bungee Spice* es una
    fuente a color, así que es posible que el color de texto no tenga efecto
    visible.
  - `TbTrendingUp` aparece con 0 usos, pero se usa dentro de un ternario que mi
    patrón no reconoce (falso cero).
  - El radio por defecto de `.modal-box` no aparece en el CSS compilado de
    DaisyUI 4.12.24, así que **no está confirmado**. Solo afecta a modales del
    admin.

---

## 3. Sección A — Paleta de color

### A.1 Tema real (confirmado en el archivo y en el CSS compilado)

- `tailwind.config.js` → `daisyui.themes: ['light']`.
- `index.html` → `<html data-theme="autumn">`.
- **CSS compilado** (`dist/assets/index-*.css`): tiene **1 solo bloque de
  variables de tema, en `:root`**, y **0 menciones de "autumn"**. Como el
  atributo `data-theme="autumn"` no corresponde a ninguna regla, se aplica
  `:root`, que es `light`.

Tokens efectivos, del bloque `:root` compilado (DaisyUI 4.12.24, tema `light`):

| Token | Valor |
|---|---|
| primary | `oklch(49.12% 0.3096 275.75)` (violeta índigo) |
| primary-content | `oklch(89.82% 0.0619 275.75)` |
| secondary | `oklch(69.71% 0.329 342.55)` (rosa fucsia) |
| accent | `oklch(76.76% 0.184 183.61)` (turquesa) |
| neutral | `oklch(32.18% 0.0248 255.7)` (`#2B3440`) |
| base-100 / 200 / 300 | `oklch(100% 0 0)` / `oklch(96.1% 0 0)` (`#F2F2F2`) / `oklch(92.4% 0.001 197.1)` (`#E5E6E6`) |
| base-content | `oklch(27.8% 0.0296 256.8)` (`#1f2937`) |
| info / success / warning / error | `oklch(72.06% .191 231.6)` / `oklch(64.8% .15 160)` / `oklch(84.71% .199 83.87)` / `oklch(71.76% .221 22.18)` |

### A.2 Distribución de referencias de color

**Denominador: 646 referencias de color en archivos en uso.** Se compone de:
- 644 clases de color;
- 2 hex en `style={{}}`.

Quedan **excluidas del denominador**:
- 60 variantes de estilo sin color propio: `btn-ghost` ×38, `btn-outline` ×18 y
  `badge-outline` ×4;
- 44 clases de color en archivos sin uso.

| Origen | Referencias | % de 646 |
|---|---|---|
| Tokens del tema DaisyUI (utilidades `bg-/text-/border-…` más modificadores de componente como `btn-primary`, `badge-success`…) | 603 | 93,3 % |
| Tailwind `white` / `black` (con o sin opacidad) | 31 | 4,8 % |
| Paleta cruda de Tailwind (`slate-*`) | 10 | 1,5 % |
| Hex literal (`style={{ backgroundColor: '#…' }}`) | 2 | 0,3 % |
| Clases arbitrarias `bg-[#…]` | 0 | 0 % |

Por escenario:
- **Tienda**: 361 referencias. 333 son del tema (92,2 %), 26 son blanco/negro,
  0 son paleta cruda y 2 son hex.
- **Admin**: 283 referencias. 268 son del tema (94,7 %), 5 son blanco/negro y
  10 son paleta cruda.

### A.3 Tabla por token

(T = Tienda, A = Admin. El % es sobre 646.)

| Color / token | Usos | % | Escenario |
|---|---|---|---|
| base-content | 181 | 28,0 % | T 110 · A 70 · Ambos 1 |
| primary (incl. `-content`, `btn-/badge-/link-/checkbox-/toggle-/input-primary`) | 132 | 20,4 % | T 88 · A 44 |
| base-200 | 117 | 18,1 % | T 55 · A 62 |
| base-100 | 62 | 9,6 % | T 30 · A 31 · Ambos 1 |
| error | 45 | 7,0 % | T 21 · A 24 |
| base-300 | 27 | 4,2 % | T 17 · A 10 |
| success | 21 | 3,3 % | T 8 · A 13 |
| Tailwind `black` | 17 | 2,6 % | T 16 · A 1 |
| Tailwind `white` | 14 | 2,2 % | T 10 · A 4 |
| Tailwind `slate-*` | 10 | 1,5 % | A 10 |
| warning | 8 | 1,2 % | A 8 |
| neutral | 5 | 0,8 % | A 5 |
| secondary | 3 | 0,5 % | T 3 |
| Hex `#25D366` | 2 | 0,3 % | T 2 |
| info | 1 | 0,2 % | A 1 |
| accent | 1 | 0,2 % | T 1 |

**Lectura de la tabla**: `secondary` (3 usos) y `accent` (1 uso) casi no se
usan, así que cualquier aparición de esos colores destaca. Por eso sus usos
sueltos son los más visibles (ver A.4).

### A.4 Casos fuera del patrón

**Tienda pública**

| Archivo:línea | Valor actual | Token más cercano | Clasificación |
|---|---|---|---|
| `widgets/layouts/ui/Layout.jsx:14` | `bg-error/90` + `text-primary-content` (marquesina "GRAN APERTURA") | un token de marca (`primary`/`secondary`) con su propio `-content` | **Inconsistencia real**: usa el color de error para una promoción y lo combina con el color de texto pensado para otro token (`primary-content` es un violeta muy claro). El contraste no se verificó. |
| `widgets/layouts/ui/Layout.jsx:68` y `widgets/header/ui/MobileMenuDrawer.jsx:70` | `text-error` en "Ofertas" | — | **Inconsistencia real (uso no semántico)**: `error` para promoción. Es coherente entre desktop y mobile; puede ser una decisión de marca deliberada, a confirmar. |
| `entities/product/ui/ProductCard.jsx:203` | `text-secondary` en la etiqueta de franquicia | — | **Inconsistencia real**: el mismo dato (`franchise_name`) es `text-primary` en `pages/product/ui/ProductPage.jsx:301` y hereda `text-base-content/50` en `widgets/product-detail-modal/ui/ProductDetailModal.jsx:122`. Tres colores para la misma etiqueta. |
| `widgets/hero/ui/HeroCarousel.jsx:39` | `btn-accent` en "Ver Colección Limitada" | `btn-primary` | **Inconsistencia real**: el mismo CTA, con el mismo texto, es `btn-primary` en `HeroCarousel.jsx:85` (el otro slide). Es el único uso de `accent` en todo el proyecto. |
| `features/cart/ui/Cart.jsx:58` | `badge-secondary` (contador del carrito) | — | Uso semántico diferenciado, correcto (badge de notificación). El comentario en la línea 55 dice "número rojo", pero el color es rosa (`secondary`); es solo un comentario desactualizado. |
| `pages/product/ui/ProductPage.jsx:414` | `badge-secondary badge-outline` (tags) | — | Uso semántico diferenciado, correcto. |
| `pages/checkout/ui/Checkout.jsx:86` y `:566` | `style={{ backgroundColor: '#25D366' }}` | ninguno (es el verde de WhatsApp) | **Uso semántico diferenciado, correcto** (color de marca de un tercero). Está repetido como literal en dos lugares; podría ser una constante. |
| `widgets/header/ui/Navbar.jsx:93`, `:110` y `widgets/footer/ui/Footer.jsx:14` | `text-black` en el logo | `base-content` | Inconsistencia real, de **impacto bajo e incierto**: es coherente entre los tres lugares, y como la fuente del logo es a color, el color de texto podría no verse. |
| `widgets/hero/ui/HeroCarousel.jsx:27,29,34,48,54,72,74,79,94,100` (15 clases) | `bg-black/40`, `bg-black/30`, `text-white`, `text-white/90` | — | **Uso semántico diferenciado, correcto**: velos y texto sobre fotografía; es independiente del tema a propósito. |
| `features/cart/ui/CartDrawer.jsx:74`, `widgets/header/ui/MobileMenuDrawer.jsx:33`, `widgets/product-detail-modal/ui/ProductDetailModal.jsx:58` | `bg-black/60` | — | **Correcto y consistente**: los tres fondos de overlay de la tienda usan el mismo valor. |
| `pages/checkout/ui/Checkout.jsx:85` y `:565` | `text-white` sobre el verde de WhatsApp | — | Correcto (acompaña al color de marca). |

**Usos semánticos correctos en la tienda** (no son inconsistencias):
- `text-error` en mensajes de validación: `LoginForm.jsx:76,117`,
  `RegisterForm.jsx:73,102,143`, `Checkout.jsx:433,450,470`.
- `input-error`: `LoginForm.jsx:23`, `RegisterForm.jsx:23`, `Checkout.jsx:19`.
- `alert-error` en `ShoppingPage.jsx:133`.
- "Agotado" en `ProductCard.jsx:177`.
- Hover de eliminar en `CartDrawer.jsx:194`.
- Cerrar sesión en `UserDropDown.jsx:59`.
- `bg-success` / `text-success` como confirmación de "agregado" (`ProductCard.jsx:172`,
  `ProductPage.jsx:379`), en el check de "copiado"
  (`ProductDetailModal.jsx:148`) y en el ícono de éxito del checkout
  (`Checkout.jsx:68`).

**Admin**

| Archivo:línea | Valor actual | Token más cercano | Clasificación |
|---|---|---|---|
| `widgets/layouts/ui/AdminLayout.jsx:155,157,170,186,203,206` (10 clases) | `bg-slate-900`, `text-slate-300/400/500`, `border-slate-800`, `hover:bg-slate-800` | `neutral` / `neutral-content` (`#2B3440` / `#D7DDE4`) | **Inconsistencia real** (sidebar oscuro fuera del tema). Es coherente dentro del propio archivo, y no afecta al cliente. |
| `pages/admin/customers/ui/CustomersPage.jsx:74` | `bg-primary text-neutral-content` | `text-primary-content` | **Inconsistencia real**: el color de texto corresponde a otro token de fondo. |
| `features/products/ui/modals/AddEntityModal.jsx:55` | `btn btn-primary text-white` | `btn-primary` ya aplica `primary-content` | Inconsistencia real menor: la clase `text-white` es redundante. |

El resto de los colores de estado del admin son **usos semánticos correctos**:
- Badges de estado de orden: `OrdersPage.jsx:11-17`.
- Borrador/publicado: `ProductsListPage.jsx:160,161,234,235`.
- Botones de eliminar con `btn-error`: `CatalogManagerModal.jsx:95`,
  `ProductImagesModal.jsx:136,226`, `CatalogSettingsPage.jsx:285`,
  `ProductsListPage.jsx:177,271`.
- Asteriscos de campo obligatorio con `text-error`.
- Tendencias con `success`/`error` en `AdminHome.jsx`.
- Alertas de stock y de advertencia: `InventoryPage.jsx:78,133`,
  `OrdersPage.jsx:221,375`.

---

## 4. Sección B — Radio de bordes

### B.1 Valores del tema (confirmados en `node_modules/daisyui`, v4.12.24)

En la versión instalada, las variables son `--rounded-box`, `--rounded-btn`,
`--rounded-badge` y `--tab-radius`. **No existe `--rounded-field`**, que es un
nombre de DaisyUI 5.

| Variable | Valor | Equivalente Tailwind | La usan por defecto |
|---|---|---|---|
| `--rounded-box` | 1rem | `rounded-2xl` | `.card`, `.collapse`, `.alert` |
| `--rounded-btn` | 0.5rem | `rounded-lg` | `.btn`, `.input`, `.select`, `.checkbox`, `.file-input`, ítems de `.menu` |
| `--rounded-badge` | 1.9rem | (píldora) | `.badge` |
| `--tab-radius` | 0.5rem | `rounded-lg` | tabs |
| `.modal-box` | **no confirmado** | — | — |

### B.2 Componentes DaisyUI: ¿usan el radio del tema o lo sobrescriben?

Denominador: elementos cuyo `className` contiene la clase del componente, en
archivos en uso.

| Componente | Total (T / A) | Sin override (radio del tema) | Con override | Valores de override |
|---|---|---|---|---|
| `btn` | 84 (30 / 54) | 77 (91,7 %) | 7, **todos en la Tienda** | `rounded-full` ×3, `rounded-xl` ×2, `rounded-2xl` ×2 |
| `input` / `select` / `textarea` | 37 (2 / 35) | 36 | 1 (T) | `rounded-2xl` en `shared/ui/SearchBar.jsx:39` |
| `card` | 19 (4 / 15) | 17 | 2 (T) | `rounded-2xl` = mismo valor que el tema; sin efecto visual |
| `badge` | 13 (7 / 6) | 13 | 0 | — |
| `collapse` | 4 (4 / 0) | 0 | 4 (T) | `rounded-xl` ×4, coherente entre los cuatro |
| `alert` | 4 (1 / 3) | 4 | 0 | — |
| `modal-box` | 6 (0 / 6) | 6 | 0 | — |

**En la Tienda**, de 30 `btn`, 23 (76,7 %) usan el radio del tema (0.5rem) y
7 (23,3 %) lo sobrescriben con 3 valores distintos. **En el Admin**, 54 de 54
(100 %) usan el radio del tema.

### B.3 Todos los `rounded-*` explícitos por tipo de componente

80 clases `rounded-*` en archivos en uso (9 más en archivos sin uso, no
contadas). El tipo de componente se asignó según la etiqueta y las clases del
elemento, y los botones los revisé uno por uno.

| Tipo de componente | Total | Valor más común | % | Alternativos (archivo:línea) |
|---|---|---|---|---|
| Acción principal de compra (ver B.4) | 7 | `rounded-xl` / `rounded-2xl` (empate) | 3 de 7 cada uno, 42,9 % | `rounded-full`: `HeroCarousel.jsx:39,85` |
| Acciones secundarias con `btn` | 1 | `rounded-full` | — | `CartDrawer.jsx:135`. Los demás secundarios (`Checkout.jsx:90`, "Volver" en envíos y cuidados, `ProductPage.jsx:174`) no tienen override, así que miden 0.5rem |
| Controles de carrusel (puntos, flechas) e ícono del carrito | 6 | `rounded-full` | 100 % | — (`ProductCarousel.jsx:118,156,167,182`, `Cart.jsx:71`) |
| Miniaturas de galería | 3 | `rounded-xl` | 100 % | `ProductPage.jsx:211,250`, `ProductDetailModal.jsx:99` |
| Imagen principal del producto | 3 | — (todas distintas) | — | `rounded-3xl` en `ProductPage.jsx:227` (figure) y `:270,286`; `rounded-2xl` en `ProductDetailModal.jsx:76`; `rounded-t-2xl` en `ProductCard.jsx:110` |
| Tarjetas y contenedores | 18 | `rounded-xl` | 5 de 18 (27,8 %) | `rounded-2xl` ×4, `rounded-box` ×3, `rounded-t-2xl` ×3 (encabezados de tablas del admin), `rounded-lg` ×2, `rounded-b-2xl` ×1 |
| Inputs | 4 | `rounded-md` | 3 de 4 | `rounded-md` en los checkboxes de `ShopSidebar.jsx:24,47,70` (tema: 0.5rem); `rounded-2xl` en `SearchBar.jsx:39` |
| Acordeones | 4 | `rounded-xl` | 100 % | `ProductPage.jsx:393,425,488,556` |
| Swatches, avatares e indicadores | 14 | `rounded-full` | 7 de 14 (50 %) | `rounded-lg` ×3, `rounded-xl` ×2, `rounded-2xl` ×1, `rounded` ×1 |
| Otros (links de nav del admin, chips, etc.) | 13 | `rounded-lg` / `rounded-3xl` (empate) | 3 de 13 cada uno | ver lista en B.5 |

### B.4 Acción principal de compra: la inconsistencia más visible

| Paso | Archivo:línea | Elemento | Radio | Alto |
|---|---|---|---|---|
| Hero (slide 1) | `widgets/hero/ui/HeroCarousel.jsx:39` | `btn btn-accent` | `rounded-full` | h-10 / sm:h-12 |
| Hero (slide 2) | `widgets/hero/ui/HeroCarousel.jsx:85` | `btn btn-primary` | `rounded-full` | h-10 / sm:h-12 |
| Tarjeta de producto | `entities/product/ui/ProductCard.jsx:170` | `<button>` propio (sin `btn`) | `rounded-xl` | py-2.5 |
| Modal de vista rápida ("Agregar") | `widgets/product-detail-modal/ui/ProductDetailModal.jsx:223` | `btn btn-primary` | `rounded-xl` | h-12 |
| Ficha ("Agregar al Carrito") | `pages/product/ui/ProductPage.jsx:377` | `btn` | `rounded-2xl` | h-14 |
| Carrito ("Solicitar pedido") | `features/cart/ui/CartDrawer.jsx:274` | `btn btn-primary` | `rounded-xl` | h-14 |
| Checkout (enviar por WhatsApp) | `pages/checkout/ui/Checkout.jsx:565` | `btn` + `#25D366` | `rounded-2xl` | h-14 |

Además, **"Seguir comprando" aparece dos veces con estilos distintos**:
- `features/cart/ui/CartDrawer.jsx:135` usa `btn btn-outline btn-primary
  rounded-full`.
- `pages/checkout/ui/Checkout.jsx:90` usa `btn btn-outline`, con radio de
  0.5rem y sin color primario.

Clasificación: **inconsistencia real**, porque es la misma función con formas
distintas a lo largo del mismo recorrido. La diferencia de **alto** entre el
modal (h-12) y la ficha (h-14) sí puede ser intencional, ya que el modal es más
compacto.

### B.5 Resto de casos fuera del patrón

| Archivo:línea | Valor | Escenario | Clasificación |
|---|---|---|---|
| `shared/ui/SearchBar.jsx:39` | `rounded-2xl` | Tienda | Inconsistencia real: los otros inputs de la tienda (`LoginForm`, `RegisterForm`, `Checkout`) usan 0.5rem. |
| `widgets/catalog/ui/ShopSidebar.jsx:24,47,70` | `rounded-md` en checkbox | Tienda | Inconsistencia real, muy baja: son 2px menos que el tema, y los tres casos son coherentes entre sí. |
| `pages/product/ui/ProductPage.jsx:227` contra `widgets/product-detail-modal/ui/ProductDetailModal.jsx:76` | `rounded-3xl` contra `rounded-2xl` | Tienda | Inconsistencia real, baja: la misma imagen principal, en ficha y en modal, con un radio distinto. |
| `pages/product/ui/ProductPage.jsx:393,425,488,556` | `rounded-xl` en `collapse` | Tienda | Coherente entre los 4; se aparta del tema (1rem). Es aceptable. |
| `pages/checkout/ui/Checkout.jsx:361,379` | `rounded-2xl` (tarjetas de opción de entrega) | Tienda | Coherente entre sí. |
| `pages/checkout/ui/Checkout.jsx:595` | `rounded-lg` ("Editar") | Tienda | Es un chip-botón único, sin par con el que compararlo. |
| `widgets/layouts/ui/AdminLayout.jsx:183,185,206` y `features/products/ui/ProductAttributesForm.jsx:301` | `rounded-lg`, `rounded-l-none` | Admin | Coherente dentro del admin. |

---

## 5. Sección C — Sistema de íconos y emojis

### C.1 Fuentes de íconos por escenario

(Se verificaron 24 líneas de import de íconos, que coinciden con 24 filas del
análisis.)

| Sistema | Archivos en uso (T / A) | Íconos distintos | Usos | Archivos representativos |
|---|---|---|---|---|
| `react-icons/tb` (Tabler) | 6 (1 / 5) | 21 | 26 | `AdminLayout.jsx`, `ProductAttributesForm.jsx`, `InventoryPage.jsx`, `CsvImportModal.jsx`, `AdminHome.jsx`; en la tienda solo `ShoppingPage.jsx` (`TbFilter`) |
| `lucide-react` | 3 (3 / 0) | 8 | 14 | `careGuides.js` (`Droplet`, `Wind`, `Ban`, `Spool`, `Icon`), `ProductPage.jsx` (`Share2`), `ProductCarousel.jsx` (`ChevronLeft`/`Right`) |
| `@lucide/lab` | 1 (1 / 0) | 1 | 1 | `careGuides.js` (`iron`) |
| `react-icons/fi` (Feather) | 2 (2 / 0) | 6 | 6 | `Checkout.jsx` (`FiTruck`, `FiMapPin`, `FiArrowLeft`, `FiCheckCircle`), `MobileMenuDrawer.jsx` (`FiChevronRight`, `FiX`) |
| `react-icons/hi` (Heroicons v1) | 3 (3 / 0) | 4 | 4 | `SearchBar.jsx` (`HiOutlineSearch`, `HiOutlineX`), `Cart.jsx` (`HiOutlineShoppingBag`), `UserDropDown.jsx` (`HiOutlineLogout`) |
| `react-icons/hi2` (Heroicons v2) | 1 (1 / 0) | 1 | 2 | `Navbar.jsx` (`HiOutlineBuildingStorefront`) |
| `react-icons/fa` (Font Awesome) | 3 (3 / 0) + 3 sin uso | 3 | 5 | `LoginForm.jsx` / `RegisterForm.jsx` (`FaEye`, `FaEyeSlash`), `Footer.jsx` (`FaInstagram`) |
| `react-icons/cg` (css.gg) | 1 (1 / 0) | 1 | 1 | `CartDrawer.jsx` (`CgTrash`) |
| SVG escrito a mano | 4 archivos, 7 `<svg>` (T) | — | 7 | `Navbar.jsx:56` (menú), `:151` (buscar), `:174`; `ProductCard.jsx:140` (vista rápida); `CartDrawer.jsx:116` (carrito vacío); `ProductDetailModal.jsx:146` (check), `:162` (compartir) |
| Caracteres de texto usados como ícono | T: `✕` ×2, `✓` ×1, `+` ×1 · A: `✕` ×7, `◀ ▶` ×2 | — | 13 | Tienda: `CartDrawer.jsx:101`, `ProductDetailModal.jsx:70`, `ProductCard.jsx:183,190` |
| `ti ti-*` (Tabler webfont, **sin fuente cargada**) | 1 (0 / 1) | 2 | 2 | `pages/admin/home/ui/AdminHome.jsx:59` (`ti-calendar`), `:124` (`ti-chart-line`): **no se muestran**. Quedaron sin migrar. |

**Resumen por escenario**:
- **Tienda**: 8 librerías o sets (`lucide`, `lucide/lab`, `fi`, `hi`, `hi2`,
  `fa`, `cg`, `tb`), más SVG escritos a mano y caracteres de texto, es decir,
  10 orígenes distintos.
- **Admin**: 1 librería (`tb`), más 2 restos de `ti` y caracteres de texto.

### C.2 La misma función dibujada con íconos distintos (Tienda)

Estos son los casos con **mayor riesgo de choque visual**, porque el cliente ve
la misma acción dibujada de dos o tres maneras:

| Función | Variante 1 | Variante 2 | Variante 3 |
|---|---|---|---|
| Buscar | SVG propio, `Navbar.jsx:151` | `HiOutlineSearch`, `SearchBar.jsx` | — |
| Cerrar | `✕` (texto), `CartDrawer.jsx:101`, `ProductDetailModal.jsx:70` | `FiX`, `MobileMenuDrawer.jsx` | `HiOutlineX`, `SearchBar.jsx` |
| Compartir | `Share2` (lucide), `ProductPage.jsx` | SVG propio, `ProductDetailModal.jsx:162` | — |
| Flecha o chevron | `ChevronLeft`/`Right` (lucide), `ProductCarousel.jsx` | `FiChevronRight`, `MobileMenuDrawer.jsx` | `FiArrowLeft`, `Checkout.jsx` |
| Éxito / check | `FiCheckCircle`, `Checkout.jsx` | SVG propio, `ProductDetailModal.jsx:146` | `✓` (texto), `ProductCard.jsx:183` |

Además, **la ficha de producto y el modal de vista rápida muestran el mismo
contenido con fuentes de íconos distintas** (compartir: `lucide` contra SVG
propio).

### C.3 Emojis literales

- **Total**: 58 líneas y 74 emojis.
- **No visibles**: 25 en comentarios de código, más `©`, que es un símbolo
  tipográfico y no un emoji (`Footer.jsx:50`), y `◀ ▶`, que son flechas
  geométricas y los conté como caracteres de texto en C.1.
- **Visibles**: 46 en total, **33 en la Tienda**, 12 en el Admin y 1 en un
  archivo sin uso.

**Tienda pública (33)**

| Archivo:línea | Emoji(s) | Función | ¿Compite con íconos vectoriales? |
|---|---|---|---|
| `widgets/layouts/ui/Layout.jsx:17,19,20` | 🎉×6, ❤️×2, 🔥×3, 🧦×2, 👣, 🎁×2, 🛍️×2 (18) | Decoración de la marquesina promocional | No: es una franja de texto animado, separada del navbar. Es un uso aislado y coherente con su tono. |
| `widgets/layouts/ui/Layout.jsx:70` | 🔥 | Resalta "Ofertas" en el navbar de desktop | **Sí**: está en la misma barra que el SVG propio y `HiOutlineBuildingStorefront`. Además, el ítem equivalente del menú mobile (`MobileMenuDrawer.jsx:22`, "OFERTAS") **no tiene emoji**, así que desktop y mobile no coinciden. |
| `pages/product/ui/ProductPage.jsx:563-565` | 📦 🛵 🤝 | Fila resumen del acordeón "Envíos" | **Sí, choque directo**: el acordeón vecino ("Detalles y Cuidados") usa el mismo patrón (fila de íconos y link) con íconos `lucide` en color `text-primary`. |
| `pages/envios-y-entregas/ui/EnviosYEntregas.jsx:37,47,58,67` | 📦 🛵 🤝 🏠 | Viñetas de la lista de modalidades | No dentro de la página, que no tiene otros íconos. **Sí frente a su página hermana** `/guia-cuidados`, que usa `lucide`. |
| `entities/product/config/careGuides.js:11,22,33` → título `h2` en `GuiaCuidados.jsx:22` | 🧦 👕 🧥 | Título de sección por categoría | **Sí, en la misma sección**: el `h2` lleva emoji y la tabla de abajo usa íconos `lucide`. Es leve, porque el emoji funciona como ilustración de la categoría y no como ícono de acción. |
| `pages/shopping/ui/ShoppingPage.jsx:142` | 🤔 | Estado vacío ("sin resultados") | Parcial: el otro estado vacío de la tienda (`CartDrawer.jsx:116`, carrito vacío) usa un **SVG**. Son dos estados vacíos con dos estilos distintos. |
| `pages/checkout/ui/Checkout.jsx:280,288,291` | 👤 🚚 📦 | Encabezados **del mensaje de WhatsApp** (no se ven en la web) | No aplica: es texto que se envía a WhatsApp, donde los emojis son la convención. **Uso correcto.** |

**Admin (12)**: 📸 en `ProductImagesModal.jsx:87`, ⚠️ en `:209`, 📥 en
`CustomersPage.jsx:51`, ⚠️ en `InventoryPage.jsx:80`, 🚚 📍 en
`OrdersPage.jsx:262-263`, 💾 en `ProductFormPage.jsx:78`, ⚙️ 📦 ➕ en
`ProductsListPage.jsx:73,79,85`, y ℹ️ ⚠️ como `icon` de toast en
`ProductImagesModal.jsx:29` y `OrdersPage.jsx:137`.

Son títulos y etiquetas de botón. **Compiten con `Tb`** en el mismo panel: por
ejemplo, los botones "⚙️ Categorías", "📦 Inventario" y "➕ Nuevo producto" de
`ProductsListPage.jsx` conviven con los íconos `Tb` del sidebar
(`TbSettings`, `TbBox`, `TbPlus` en `ProductAttributesForm.jsx`), que
representan esas mismas ideas.

---

## 6. Sección D — Tipografía (parcial) y espaciado

Incluyo solo lo que se pudo medir sin ambigüedad. El análisis de patrones de
espaciado queda **omitido a propósito**: no hay valores arbitrarios que
señalar (`p-[…]`: 0, `gap-[…]`: 0), y evaluar si los valores de la escala se
usan con coherencia exige comparar elemento por elemento con el renderizado,
cosa que no puedo hacer con el mismo rigor que en A a C.

**Tamaños de texto**: 263 usos (incluye archivos sin uso). Hay 13 valores
distintos: 11 de la escala de Tailwind y **2 arbitrarios**.

| Clase | Usos | Tienda | Admin |
|---|---|---|---|
| `text-sm` | 98 | 56 | 33 |
| `text-xs` | 52 | 37 | 15 |
| `text-lg` | 25 | 11 | 10 |
| `text-3xl` | 20 | 14 | 2 |
| `text-xl` | 18 | 8 | 10 |
| `text-2xl` | 13 | 7 | 6 |
| `text-base` | 11 | 8 | 3 |
| **`text-[10px]`** | 6 | 4 | 2 |
| `text-4xl` | 6 | 3 | 3 |
| `text-5xl` | 5 | 5 | 0 |
| **`text-[11px]`** | 4 | 4 | 0 |
| `text-7xl` / `text-6xl` | 2 / 3 | 2 / 0 | 0 / 0 |

- **Tamaños arbitrarios**: `text-[10px]`/`text-[11px]` aparecen en 10 lugares.
  - Tienda: `ProductCard.jsx:177,181,188,203`, `ProductDetailModal.jsx:118,236,252`
    y `Checkout.jsx:595`.
  - Admin: `ProductImagesModal.jsx:161` y `AdminLayout.jsx:170`.

  Clasificación: **inconsistencia real, baja**. Usan dos tamaños arbitrarios
  para el mismo papel (microetiquetas en mayúsculas), cuando la escala ya tiene
  `text-xs` (12px).
- **Pesos**: 221 usos y 7 pesos distintos.
  - Los tres más comunes: `font-bold` (95), `font-medium` (54) y
    `font-semibold` (53), que juntos son 202 de 221 (91,4 %).
  - `font-black` (10) y `font-extrabold` (5) se usan en titulares.
  - No encontré ningún caso fuera del patrón que merezca listarse aparte.

---

## 7. Conclusión: inconsistencias reales priorizadas

Van ordenadas por visibilidad para el cliente final, con la tienda pública
primero. El esfuerzo es una estimación sin diff: **chico** es menos de 1 hora y
pocas líneas; **mediano** implica varias piezas o una decisión de diseño
previa; **grande** es transversal.

| # | Inconsistencia | Escenario | Evidencia | Esfuerzo |
|---|---|---|---|---|
| 1 | La acción principal de compra usa 3-4 radios distintos a lo largo del recorrido (hero, tarjeta, modal, ficha, carrito, checkout), y "Seguir comprando" aparece con dos estilos distintos | Tienda | B.4: 7 elementos y 2 variantes de "Seguir comprando" | **Mediano**: hay que decidir un radio y aplicarlo en unos 8 lugares |
| 2 | La misma acción se dibuja con íconos de fuentes distintas (buscar, cerrar, compartir, flechas, check) | Tienda | C.2: 5 funciones duplicadas | **Mediano**: elegir una librería para la tienda y reemplazar unos 12 íconos |
| 3 | Emojis de envíos junto a íconos `lucide` de cuidados en la misma ficha, y páginas hermanas con sistemas distintos | Tienda | `ProductPage.jsx:563-565`, `EnviosYEntregas.jsx:37-67` frente a `careGuides.js` | **Chico**: 7 emojis, y los íconos equivalentes ya existen en las librerías instaladas |
| 4 | Etiqueta de franquicia con 3 colores distintos (tarjeta, ficha, modal) | Tienda | `ProductCard.jsx:203`, `ProductPage.jsx:301`, `ProductDetailModal.jsx:122` | **Chico**: 2 o 3 clases |
| 5 | El CTA del hero es `btn-accent` en un slide y `btn-primary` en el otro, con el mismo texto | Tienda | `HeroCarousel.jsx:39` frente a `:85` | **Chico**: 1 clase |
| 6 | Marquesina con `bg-error` y `text-primary-content` (color de error usado para una promoción, combinado con el texto de otro token) | Tienda (todas las páginas públicas) | `Layout.jsx:14` | **Chico** en código, pero requiere decidir qué color de marca va en la franja |
| 7 | `data-theme="autumn"` en `index.html` no corresponde a ningún CSS; el tema real es `light`, y el `BACKLOG.md` documenta "autumn" | Ambos | A.1 | **Chico**: 1 atributo y 1 línea del BACKLOG. Conviene hacerlo **antes** de la sesión de paleta de marca, para no partir de una suposición falsa |
| 8 | El 🔥 de "Ofertas" está en desktop pero no en mobile, y `error` se usa como color de promoción | Tienda | `Layout.jsx:68,70` frente a `MobileMenuDrawer.jsx:22,70` | **Chico** (a decidir junto con el punto 6) |
| 9 | Dos estados vacíos con estilos distintos (emoji 🤔 y SVG) | Tienda | `ShoppingPage.jsx:142`, `CartDrawer.jsx:116` | **Chico** |
| 10 | El buscador tiene un radio distinto al de los demás inputs | Tienda | `SearchBar.jsx:39` | **Chico** |
| 11 | La imagen principal tiene un radio distinto en la ficha y en el modal | Tienda | `ProductPage.jsx:227` frente a `ProductDetailModal.jsx:76` | **Chico** |
| 12 | Tamaños arbitrarios `text-[10px]` y `text-[11px]` para microetiquetas | Tienda (8) · Admin (2) | D | **Chico** |
| 13 | Dos íconos `ti ti-*` invisibles (sin fuente) en el dashboard | Admin | `AdminHome.jsx:59,124` | **Chico**: 2 reemplazos por `Tb` |
| 14 | El sidebar del admin usa `slate-*` fuera del tema | Admin | `AdminLayout.jsx` (10 clases) | **Chico o mediano**: depende de si se quiere mantener un sidebar oscuro |
| 15 | Emojis en botones y títulos del admin conviven con íconos `Tb` | Admin | C.3 (12 emojis) | **Chico o mediano** |
| 16 | Combinaciones de texto y fondo cruzadas en el admin (`bg-primary text-neutral-content`, `btn-primary text-white`) | Admin | `CustomersPage.jsx:74`, `AddEntityModal.jsx:55` | **Chico** |

**Lo que está bien y conviene conservar**:
- El 93,3 % del color pasa por el tema.
- Los colores de estado se usan de forma semántica en casi todos los casos:
  validación, eliminar, estados de orden, stock.
- Los overlays usan un valor único (`bg-black/60` ×3).
- Los acordeones, las miniaturas y los controles de carrusel tienen radios
  coherentes entre sí.
- El admin usa un solo set de íconos y el radio del tema en el 100 % de sus
  botones.
