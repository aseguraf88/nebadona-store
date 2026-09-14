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
      correcto, talla/color visibles en el carrito.
      ⚠️ **Sin confirmar todavía**: el mismo flujo logueado, y que el
      checkout (mensaje de WhatsApp + PDF) muestre talla/color en vez de
      solo el SKU crudo. No dar por cerrado del todo hasta probar esos dos.

## ✅ Verificado con evidencia real (sept 2026) — mejor de lo esperado

- [x] CORS: whitelist de un solo origen vía `FRONTEND_URL`, credentials
      explícito. Sin acción necesaria.
- [x] Rate limiting: ya implementado con `express-rate-limit` (general
      200/15min, auth 10/15min). Sin acción necesaria.

## 🟢 Fix trivial pendiente (una línea, sin riesgo)

- [ ] Bajar `express.json` y `express.urlencoded` de 50mb/20mb a 2mb en
      `server.js` líneas 53-54. Ya no hace falta excepción para imágenes
      (se suben directo a Cloudinary).

## 🟡 Puede publicarse SIN esto — usar proceso manual como interino

- [ ] **Descuento automático de stock al confirmar pago** — el prerrequisito
      que faltaba (que la orden supiera qué variante exacta se vendió) ya
      está resuelto. Ahora es un cambio más chico: en el endpoint de
      "marcar como pagado" (ver punto siguiente), restar `quantity` del
      `variant.stock` correspondiente en `ProductModel`. Interino válido
      mientras tanto: restar el stock a mano en `ProductFormPage` después
      de cada venta confirmada por WhatsApp.
- [ ] **Endpoint de "marcar orden como pagada"** — confirmado que no existe
      ninguna ruta más allá de crear la orden (`POST /api/orders/whatsapp`).
      El enum de status en `OrderModel.js` está listo, falta el código que
      transicione entre estados. Al construirlo, conviene que dispare el
      descuento de stock del punto anterior en la misma operación (ver
      idempotencia: no descontar dos veces si se marca "pagado" más de una
      vez por error).

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
- [ ] `syncCartWithBackend`: un carrito viejo en `localStorage` de antes de
      este cambio (sin `sku`) va a fallar el sync al loguearse. No
      bloqueante mientras el sitio no esté publicado — revisar antes del
      lanzamiento si hay usuarios de prueba con carritos viejos guardados.

## 🟡 Puede esperar sin riesgo real (post-lanzamiento)

- [ ] Alertas de stock bajo
- [ ] Reportes básicos de qué se vende más
- [ ] Multiusuario con niveles de acceso
- [ ] Historial de pedidos consultable por cliente
- [ ] Personalización visible del catálogo (branding/tema)
- [ ] Pasada de responsividad completa (mobile/tablet) en las pantallas del
      dashboard — prerrequisito para la futura app con Capacitor, no urgente
      para publicar si el uso diario del dashboard es principalmente en PC

## 📋 Resuelto fuera del código

- [x] Boleta electrónica → Portal MiPyme gratuito del SII, emisión manual

## ❌ Descartado a propósito

- Integración de pasarela de pago (MercadoPago)

## 📱 Decisión de alcance (registrada para no repetir la discusión)

App móvil nativa (Play Store / App Store, vía Capacitor): pausada hasta
después de publicar la web. Prerrequisito cuando se retome: la web tiene que
estar ya responsiva, porque Capacitor envuelve el mismo código web tal cual
está — no arregla nada visual por sí solo.