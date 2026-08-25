# 🕵️ Auditoría de Software — Proyecto Nebadona

**Alcance:** `FRONTEND` (React 19 + Vite) y `BACKEND` (Node/Express + MongoDB).
**Fecha:** 2026-08-24
**Metodología:** Revisión estática manual de contextos, componentes, servicios, controladores y rutas. No se ejecutó build ni pruebas E2E.

> Los hallazgos se priorizan en 3 niveles: 🔴 Crítico, 🟡 Moderado, 🟢 Bajo. Cada ítem incluye archivo, evidencia y recomendación.

---

## 🔴 CRÍTICO

### 1. Capa de servicios acoplada a React (inyección de setters de estado)

**Archivo:** [FRONTEND/src/services/authServices.js](../src/services/authServices.js)

`loginService` y `registerService` reciben `reset`, `setRedirect`, `setUserInfo`/`checkSession` como parámetros y ejecutan lógica de UI (resetear formularios, redirigir) dentro de la capa de servicio:

```js
export const loginService = async (data, reset, setRedirect, setUserInfo) => { ... }
```

Esto rompe la separación de responsabilidades: un "servicio" debería ser una función pura de acceso a datos (I/O con la API), no un orquestador de efectos secundarios de componentes. Dificulta testear el servicio de forma aislada y acopla cualquier futura pantalla de login al mismo contrato de argumentos.

**Recomendación:** el servicio debe limitarse a `axios.post(...)` y devolver `{ success, data, message }`. La lógica de `reset()`, `setRedirect()` y actualización de contexto debe vivir en el componente/hook que consume el servicio.

---

### 2. Manejo de errores que oculta la causa raíz (silent failure)

**Archivos:** [authServices.js](../src/services/authServices.js), [CartContext.jsx](../src/context/CartContext.jsx)

Todos los `catch` de `authServices.js` descartan el error real y devuelven un mensaje genérico fijo (`'Error al loguearse.'`), sin loguearlo ni propagar el código de estado HTTP (401 vs 500 vs validación). En producción es imposible diagnosticar fallos de login/registro reales (ej. rate-limit del backend, caída de DB, etc.) porque el error se pierde por completo.

```js
} catch (error) {
    return { success: false, message: 'Error al loguearse.' }
}
```

**Recomendación:** capturar `error.response?.data?.message` como en el resto del código (`ProductContext.jsx` sí lo hace bien) y, en `import.meta.env.DEV`, loguear el error original para depuración.

---

### 3. Bug funcional: `updateProduct` descarta la normalización de colores

**Archivo:** [BACKEND/src/controllers/productsControllers.js](../../BACKEND/src/controllers/productsControllers.js) (función `updateProduct`)

```js
...(validateData.colors !== undefined ? { colors: colorData.colors } : {}),
...
...(validateData.colors !== undefined
    ? { colors: validateData.colors || [] }   // <- sobrescribe la línea anterior
    : {}),
```

La clave `colors` se define dos veces en el mismo objeto spread; la segunda ocurrencia gana y **descarta silenciosamente** el resultado de `normalizeColorPayload`. Esto significa que la normalización de colores (hex válido, `selected`, `percentage`, etc.) nunca se aplica al actualizar un producto, generando datos inconsistentes entre creación y edición.

**Recomendación:** eliminar la segunda entrada duplicada y dejar solo `colors: colorData.colors`.

---

### 4. Falta de límites explícitos en la carga de imágenes / payloads

**Archivo:** [BACKEND/src/server.js](../../BACKEND/src/server.js)

```js
app.use(express.json({ limit: '50mb' }))
```

Un límite de 50MB para JSON (usado para imágenes en base64 hacia Cloudinary) combinado con un `rateLimit` general de 200 req/15min por IP permite que un atacante envíe múltiples payloads de 50MB, agotando memoria/CPU del proceso Node (vector de Denial of Service). No hay validación de tamaño de imagen individual antes de intentar el `cloudinary.uploader.upload`.

**Recomendación:** bajar el límite a algo acorde al caso real (ej. 8–10MB), validar tamaño/tipo de imagen en el esquema Zod antes de subir, y considerar `multipart/form-data` + `multer` con límites de archivo en vez de base64 en JSON.

---

## 🟡 MODERADO

### 5. `ProductContext` como "God Context" (violación de responsabilidad única)

**Archivo:** [FRONTEND/src/context/ProductContext.jsx](../src/context/ProductContext.jsx)

Un solo contexto gestiona: productos, producto individual, categorías, temas de diseño, nombres de franquicia, y el CRUD completo de cada una de esas 4 entidades (~20 funciones, un solo `error` compartido para todo). Cualquier componente que solo necesite `productCategories` se re-renderiza también cuando cambian `products` o `designThemes`, ya que todos comparten el mismo `value` del provider.

**Recomendación:** dividir en `ProductContext`, `TaxonomyContext` (categorías/temas/franquicias) o, mejor aún, migrar a hooks de datos por entidad (`useProducts`, `useProductCategories`, etc.) para evitar recomputar renders no relacionados.

### 6. Duplicación masiva de lógica CRUD (DRY)

**Archivo:** [ProductContext.jsx](../src/context/ProductContext.jsx)

`createProductCategory/updateProductCategory/deleteProductCategory`, `createDesignTheme/updateDesignTheme/deleteDesignTheme` y el equivalente de `franchiseNames` repiten prácticamente el mismo patrón (validar nombre → axios call → actualizar estado → retornar `{success, message}`) tres veces casi carácter por carácter.

**Recomendación:** extraer una factoría genérica, p. ej. `createEntityCrud(apiUrl, setState)` que devuelva `{create, update, remove}` reutilizable por las 3 entidades, reduciendo ~150 líneas duplicadas.

### 7. Componente "Dios" en el dashboard (`DashboardProductsSection`)

**Archivo:** [FRONTEND/src/features/dashboard/products/sections/DashboardProductsSection.jsx](../src/features/dashboard/products/sections/DashboardProductsSection.jsx)

Un único componente concentra **20+ `useState`** y decenas de handlers para: edición de producto, subida/reordenamiento de imágenes, y CRUD completo de categorías/franquicias/temas con sus respectivos modos "editing". Es difícil de mantener, testear o dividir en responsabilidades claras.

**Recomendación:** extraer hooks personalizados (`useProductTemplate`, `useTaxonomyEditor`) y separar cada bloque de edición (categorías/franquicias/temas) en su propio componente controlado, ya reutilizando el mismo sub-componente para las 3 taxonomías.

### 8. Código muerto / componentes huérfanos

**Archivos:**

- [FRONTEND/src/components/AdminDashboard/TableProductDashboard/TableProductDashboard.jsx](../src/components/AdminDashboard/TableProductDashboard/TableProductDashboard.jsx)
- [FRONTEND/src/components/AdminDashboard/TableProductDashboard/TableProducts.jsx](../src/components/AdminDashboard/TableProductDashboard/TableProducts.jsx)

Ninguno de estos dos archivos es importado desde ningún otro punto del proyecto (el enrutamiento real usa `features/dashboard/products/sections/DashboardProductsSection.jsx`). `TableProducts.jsx` además duplica lógica de borrado de producto (`deleteProduct` + toasts) que ya vive en el dashboard activo, lo que genera riesgo de que alguien edite el archivo equivocado a futuro.

**Recomendación:** eliminar ambos archivos (y la carpeta `TableProductDashboard/` si queda vacía).

### 9. `key` inestable / basada en índice en listas

**Archivos:**

- [FRONTEND/src/components/ProductList/ProductList.jsx](../src/components/ProductList/ProductList.jsx): `key={product._id || product.name}`
- [FRONTEND/src/components/ShopSidebar/ShopSidebar.jsx](../src/components/ShopSidebar/ShopSidebar.jsx): `key={index}` en el listado de `availableSockTypes`

Usar el nombre del producto como fallback de `key` puede producir colisiones si dos productos comparten nombre; usar el índice del array como `key` en listas que se filtran/reordenan (checkboxes de filtro) puede causar que React reutilice mal el estado del DOM (checkbox marcado en la fila equivocada).

**Recomendación:** en `ProductList`, confiar únicamente en `_id` (viene de Mongo, siempre existe); en `ShopSidebar`, usar el propio string del tipo (`key={type}`) ya que son valores únicos (vienen de un `Set`).

### 10. Bug de referencia en la animación del carrito

**Archivo:** [FRONTEND/src/components/Navbar/Cart.jsx](../src/components/Navbar/Cart.jsx)

```js
useEffect(() => {
    if (itemsQuantity > 0 && itemsQuantity > previousItemsQuantity.current) {
        setIsBouncing(true)
        const timeout = setTimeout(() => setIsBouncing(false), 400)
        return () => clearTimeout(timeout)
    }
    previousItemsQuantity.current = itemsQuantity
}, [itemsQuantity])
```

Cuando la condición de "bounce" se cumple, la función retorna antes de llegar a `previousItemsQuantity.current = itemsQuantity`, por lo que la referencia **nunca se actualiza** mientras la cantidad siga aumentando en llamadas sucesivas. El efecto visual funciona "por casualidad" pero la lógica de comparación queda desincronizada.

**Recomendación:** actualizar el ref siempre, independientemente de la rama tomada:

```js
useEffect(() => {
    if (itemsQuantity > previousItemsQuantity.current) {
        setIsBouncing(true)
        const timeout = setTimeout(() => setIsBouncing(false), 400)
        previousItemsQuantity.current = itemsQuantity
        return () => clearTimeout(timeout)
    }
    previousItemsQuantity.current = itemsQuantity
}, [itemsQuantity])
```

### 11. Prop drilling extenso en filtros de la tienda

**Archivos:** [ShoppingPage.jsx](../src/pages/ShoppingPage.jsx) → [ShopSidebar.jsx](../src/components/ShopSidebar/ShopSidebar.jsx) / [ResultsToolbar.jsx](../src/components/ResultsToolbar/ResultsToolbar.jsx)

`ShopSidebar` recibe **10 props** (3 arrays de datos + 3 arrays de selección + 3 setters + `toggleFilter`), todas originadas en `ShoppingPage`. Es un caso clásico de _prop drilling_ que además acopla `ShopSidebar` a la forma exacta del estado del padre.

**Recomendación:** extraer un hook `useShopFilters()` que encapsule el estado y exponga `{filters, toggleFilter, clearAll}`, o mover el estado de filtros a un contexto ligero (`ShopFiltersContext`) consumido directamente por `ShopSidebar`/`ResultsToolbar`.

### 12. Falta de tipado/validación de props (sin PropTypes ni TypeScript)

**Archivo:** [FRONTEND/package.json](../package.json)

El proyecto no usa TypeScript ni `prop-types`. Componentes con formas de datos complejas (`product`, filtros del sidebar, `template` del dashboard) no tienen ningún contrato explícito, lo que aumenta el riesgo de errores en tiempo de ejecución al pasar props incorrectas, especialmente en un dashboard con ~20 estados.

**Recomendación:** al menos incorporar `prop-types` para los componentes públicos más complejos, o evaluar una migración incremental a TypeScript comenzando por `context/` y `services/`.

### 13. Cobertura de pruebas mínima

**Archivo:** [BACKEND/tests/colorNormalization.test.js](../../BACKEND/tests/colorNormalization.test.js)

Todo el proyecto (frontend + backend) tiene un único archivo de test, cubriendo solo la normalización de colores. No existen pruebas de contratos de API, controladores de autenticación/carrito/órdenes, ni pruebas de componentes React.

**Recomendación:** priorizar pruebas para `authControllers`, `cartControllers` y el flujo de `webHookControllers` (validación de firma), dado que son las áreas con mayor riesgo de negocio (dinero, sesiones).

### 14. `console.log` de depuración en código de producción (backend)

**Archivo:** [BACKEND/src/controllers/cartControllers.js](../../BACKEND/src/controllers/cartControllers.js)

```js
console.log('USUARIO YA TIENE CARRITO')
console.log('USUARIO NO TIENE CARRITO')
console.log('UPDATE CART', productId, quantity)
```

Quedan `console.log` de depuración (incluida una etiqueta invertida: se imprime "USUARIO NO TIENE CARRITO" dentro de la rama donde el producto **sí** se encontró en el carrito, lo cual es engañoso al leer logs). Ensucian los logs de producción y pueden filtrar IDs de producto/cantidades en la consola del servidor.

**Recomendación:** eliminarlos o reemplazarlos por un logger condicionado a `NODE_ENV !== 'production'`.

### 15. `catch` que descarta el error real (backend)

**Archivo:** [BACKEND/src/controllers/cartControllers.js](../../BACKEND/src/controllers/cartControllers.js) (`addToCart`)

```js
} catch (error) {
    res.json({ message: 'ERROR' })
}
```

A diferencia del resto de controladores (que sí devuelven `error.message` y un status code), `addToCart` traga la excepción, responde `200` por defecto (no se especifica `status`) con el mensaje genérico `'ERROR'`. El cliente no puede distinguir un error de validación de un fallo de servidor, y el status HTTP es incorrecto.

**Recomendación:** homologar con el resto de controladores: `res.status(500).json({ message: '...', error: error.message })`.

---

## 🟢 BAJO

### 16. Duplicación de SVGs inline en `Navbar.jsx`

**Archivo:** [FRONTEND/src/components/Navbar/Navbar.jsx](../src/components/Navbar/Navbar.jsx)

Varios íconos (menú hamburguesa, lupa) se definen como `<svg>` inline repetidos en distintos componentes de navegación, en vez de usar `react-icons` (ya usado en otras partes del mismo archivo, ej. `HiOutlineBuildingStorefront`) o extraer un componente `Icon`.

**Recomendación:** reemplazar los SVG manuales por iconos de `react-icons` para consistencia visual y menos código repetido.

### 17. Comentarios "ruido" con emojis y marcas de versión

**Archivos:** [ProductCard.jsx](../src/components/ProductCard/ProductCard.jsx), [ShoppingPage.jsx](../src/pages/ShoppingPage.jsx)

Comentarios como `// 🔥 NUEVO: Prevenimos la navegación...` o `// ✨ LA MAGIA ANTI-ACENTOS` mezclan bitácora de cambios (propia de un commit/PR) con documentación de código. Con el tiempo se vuelven ruido porque no se actualizan ("NUEVO" ya no lo es).

**Recomendación:** usar el historial de Git para el "qué cambió" y dejar en el código solo comentarios que expliquen el "por qué" de una decisión no evidente.

### 18. Nombres inconsistentes: mezcla de `camelCase` y `snake_case`

**Archivos:** [ProductContext.jsx](../src/context/ProductContext.jsx), modelos backend

Campos de producto como `product_category`, `design_theme`, `franchise_name`, `sock_type` conviven con `imageUrl`, `compareAtPrice`, `isActive` en camelCase dentro del mismo esquema/objeto. No es un error funcional, pero rompe la convención de nombres de JavaScript/JSON (camelCase) y dificulta la lectura/autocompletado.

**Recomendación:** unificar a camelCase en una futura versión del esquema (`productCategory`, `designTheme`, `franchiseName`, `sockType`), migrando datos existentes si aplica.

### 19. Mensajes de error con errores de tipeo expuestos al usuario

**Archivo:** [BACKEND/src/controllers/cartControllers.js](../../BACKEND/src/controllers/cartControllers.js)

Varios mensajes contienen "econtrado" en lugar de "encontrado" (`'Carrito no econtrado'`, `'Producto no econtrado'`), visibles directamente en las respuestas de la API y potencialmente en el frontend.

**Recomendación:** corregir la ortografía; considerar centralizar los mensajes de error en un archivo de constantes para evitar duplicar (y volver a tipear mal) el mismo string en múltiples controladores.

### 20. Manipulación directa del DOM fuera de refs de React

**Archivo:** [FRONTEND/src/components/Navbar/Cart.jsx](../src/components/Navbar/Cart.jsx)

```js
document.activeElement.blur()
```

Acceder a `document.activeElement` directamente es un patrón imperativo que evita el modelo declarativo de React. Funciona, pero rompe el paradigma usado en el resto del componente (que sí usa `useRef` para el botón).

**Recomendación:** usar el `ref` ya existente del elemento activo (`buttonRef.current?.blur()`) en vez de `document.activeElement`.

---

## 📊 Resumen ejecutivo

| Prioridad   | Cantidad | Foco principal                                                                         |
| ----------- | -------- | -------------------------------------------------------------------------------------- |
| 🔴 Crítico  | 4        | Acoplamiento servicio/UI, manejo de errores, bug de datos, límite de payload (DoS)     |
| 🟡 Moderado | 11       | God Context/Componente, duplicación CRUD, código muerto, prop drilling, falta de tests |
| 🟢 Bajo     | 5        | Convenciones de nombres, comentarios ruidosos, duplicación de íconos, typos            |

**Próximos pasos sugeridos (orden recomendado):**

1. Corregir el bug de `updateProduct` (colores) y el `catch` silencioso de `addToCart` — son cambios de bajo esfuerzo y alto impacto en correctitud.
2. Eliminar los archivos huérfanos (`TableProductDashboard/`).
3. Desacoplar `authServices.js` de la UI y homogeneizar el manejo de errores en todos los servicios.
4. Planificar la refactorización de `ProductContext` y `DashboardProductsSection` (dividir responsabilidades) antes de seguir agregando features al dashboard.
