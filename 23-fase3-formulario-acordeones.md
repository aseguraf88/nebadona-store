# Paso 23 — Fase 3, paso 3: formulario de creación en acordeones

## Contexto

Último paso de la Fase 3. Se construye `ProductCreateForm.jsx`, el
formulario de creación nuevo, y se conecta todo: `useProductForm.js` lee
la categoría que llega por `state` (paso 2) y `ProductFormPage.jsx`
muestra este formulario nuevo en vez del de siempre cuando está en modo
creación.

**El formulario de edición no se toca en nada** — sigue usando
`ProductAttributesForm.jsx` tal cual quedó en el paso 1.

## Antes de empezar

Corre `git status` y confirma que el árbol de trabajo está limpio (el
paso 2 —modal de categoría— ya debería estar commiteado, subido y
confirmado en producción). Si hay algo pendiente, detente y avisame.

## Parte 1 — Investigar y proponer (sin código todavía)

1. Volvé a leer `useProductForm.js` completo, `ProductFormPage.jsx`
   completo, y los 8 componentes de campos + el hook
   `useProductAttributes` del paso 1 — todos tal como están hoy.

2. **Cómo lee `useProductForm.js` la categoría del `state`:** proponé el
   cambio concreto. Tiene que:
   - Usar `useLocation()` para leer `location.state?.product_category`.
   - Solo aplicarlo en modo creación, no en edición.
   - Si la categoría recibida no existe en `productCategories`,
     ignorarla (arrancar con categoría vacía, como si no hubiera venido
     nada).
   - Aplicarse en el mismo lugar donde hoy se resetea `template` a
     `EMPTY_TEMPLATE` al entrar en modo creación.

3. **Qué íconos usar en los encabezados de las 8 secciones nuevas.** Las
   5 secciones que ya existían tenían íconos de `react-icons/tb`
   (`TbFileDescription`, `TbPhoto`, `TbCash`, `TbBox`, y "Organización"
   no tenía). Para Clasificación, Atributos Físicos e Identidad y Marca
   (las tres que salen de partir "Organización") y Visibilidad, elegí
   íconos razonables de ese mismo paquete — no traigas ningún ícono de
   otro origen (nada de `lucide-react` ni emojis; este proyecto ya tuvo
   una sesión entera dedicada a no mezclar más orígenes de íconos de los
   necesarios). Mostrame la lista antes de usarlos.

4. **Dónde van los botones que hoy viven en el encabezado de la tarjeta**
   ("Editar Galería", "+ Agregar Variante"). Como en un acordeón hacer
   clic en el título lo abre o cierra, esos botones tienen que ir dentro
   del contenido de la sección, no en el título. Confirmá dónde
   exactamente, con sentido visual (por ejemplo, arriba del todo dentro
   del `collapse-content`, antes de los campos).

5. **El indicador chico de completitud**, para las 3 secciones con campo
   obligatorio:
   - Información básica: completo si `template.title` tiene valor real
     (no el placeholder `'Titulo'`).
   - Clasificación: completo si `template.product_category` tiene
     valor.
   - Precio: completo si `template.price` tiene valor real (no el
     placeholder `'0000'`).
   Proponé cómo se ve (un check, un punto de color, lo que tenga sentido
   con el resto del proyecto) en el título del acordeón.

6. Mostrame todo lo anterior y esperá mi confirmación antes de escribir
   ningún componente.

## Parte 2 — Implementar (solo después de confirmar la Parte 1)

1. **`ProductCreateForm.jsx`** en `features/products/ui/`. Usa
   `useProductAttributes` (mismo hook del paso 1, nada de lógica
   duplicada) y arma las 8 secciones como acordeones **independientes**
   (`type="checkbox"`, no radio — cada uno se abre y cierra solo, no se
   cierran entre sí), en este orden:
   1. Información básica — **abierta por defecto**
   2. Clasificación — **abierta por defecto**
   3. Atributos físicos — cerrada
   4. Identidad y marca — cerrada
   5. Variantes y Stock — cerrada
   6. Imágenes — cerrada
   7. Precio — cerrada
   8. Visibilidad — cerrada

   Cada acordeón lleva `min-w-0` en los dos niveles (`.collapse` y
   `.collapse-content`), siguiendo la regla ya documentada en
   `CLAUDE.md` — aplicalo en las 8 secciones por igual, no solo en la de
   Variantes (que es la que tiene la tabla), para no tener que acordarse
   después cuál lo necesitaba y cuál no.

   Incluí `<ProductFormModals />` al final, igual que en
   `ProductAttributesForm.jsx`.

2. **`useProductForm.js`**: agregá la lectura del `state` según lo
   aprobado en la Parte 1, punto 2.

3. **`ProductFormPage.jsx`**: donde hoy siempre renderiza
   `<ProductAttributesForm ... />`, cambiá a mostrar
   `<ProductCreateForm ... />` cuando `!isEditMode`, y
   `<ProductAttributesForm ... />` cuando `isEditMode` — mismas props en
   los dos casos, si es posible, para que quede simple.

4. Mostrame los diffs completos, por archivo. No los apliques todavía.

## Lo que no se toca

`ProductAttributesForm.jsx`, los 8 componentes de campos y el hook del
paso 1 (se reusan, no se modifican), el modal del paso 2.

## Flujo

1. Mostrame la Parte 1 completa y esperá mi confirmación antes de la
   Parte 2.
2. Mostrame los diffs de la Parte 2. **No guardes** hasta que confirme.
3. Después de guardar, volvé a leer cada archivo y confirmá que quedó
   completo.
4. Corré `npm run build`. No levantes ningún servidor.
5. Recordame probar en el navegador, de punta a punta:
   - Desde el listado de productos, apretar "Nuevo producto", elegir una
     categoría (por ejemplo calcetines) y confirmar — la página de
     creación tiene que abrir con Información básica y Clasificación ya
     abiertas, y Clasificación con la categoría ya marcada.
   - Que Tipo se habilite solo con las opciones correctas de esa
     categoría, igual que en edición.
   - Abrir y cerrar varias secciones sin que cerrar una cierre las
     otras.
   - Cargar título y precio, y confirmar que Información básica y
     Precio muestran el indicador de completo; dejar Clasificación
     vacía en otra prueba y confirmar que no lo muestra.
   - Subir imágenes, agregar una variante con su SKU autogenerado, crear
     una Franquicia y un Tema nuevos desde los botones "+" — todo dentro
     de los acordeones correspondientes.
   - Guardar el producto de punta a punta y confirmar que redirige a la
     página de edición de siempre, con los datos correctos.
   - Entrar a `/admin/dashboard/products/nuevo` escribiendo la URL a
     mano (sin pasar por el modal) y confirmar que el formulario en
     acordeones igual aparece, solo que con Categoría vacía.
   - Editar un producto existente y confirmar que se ve exactamente
     igual que antes de este paso — sin acordeones, dos columnas como
     siempre.
   - Repetir los casos principales en 375px.
6. No des la tarea por cerrada hasta que confirme esas pruebas, y
   recordame borrar este archivo (`23-fase3-formulario-acordeones.md`)
   antes del commit.

Estoy en PowerShell de Windows. Respondeme en español neutro.
