# Backlog — Nebadona Store

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

## 🔴 Bloqueante real antes de vender en serio (verificar YA)

- [ ] **Descuento automático de stock al confirmar una orden pagada** —
      confirmado pendiente por vos mismo. Este es el riesgo real: sin esto,
      se puede vender el mismo producto dos veces.
- [ ] **Circuito de "marcar orden como pagada" en el panel admin** — última
      auditoría real de código lo marcó *parcial*. Verificar estado actual
      antes de asumir que está resuelto.

## 🟠 Seguridad — pedido, nunca confirmado que se haya aplicado

- [ ] Límites de payload (2mb) + rate limiting en `BACKEND/src/server.js`
- [ ] Whitelist de CORS + hardening de JWT (`authMiddleware.js`)

Nota: barato de aplicar, pero no es lo que te va a explotar primero con poco
tráfico inicial. Prioridad después de los dos puntos rojos de arriba.

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

## 🔍 Prompt para verificar el estado real antes de publicar

```
Necesito confirmar el estado real de 4 cosas antes de publicar. Para cada 
una, mostrame el archivo y la línea que lo prueba — si no hay evidencia 
clara, decime "no encontrado", no asumas.

1. ¿Existe código que descuente stock de una variante cuando una orden 
   cambia a estado pagado/confirmado?
2. ¿Existe un endpoint o función en el admin para marcar una orden como 
   pagada, y actualiza el estado de la orden de punta a punta?
3. En BACKEND/src/server.js, ¿cuáles son los límites actuales de 
   express.json() y express.urlencoded()? ¿Hay rate limiting configurado?
4. En BACKEND/src/server.js, ¿cómo está configurado cors() actualmente? 
   ¿Acepta cualquier origen o tiene una whitelist?
```
