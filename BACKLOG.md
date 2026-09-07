# Backlog — Nebadona Store

> Última auditoría de código: sept 2026. Método: inventario de hechos (con cita
> de archivo obligatoria) → comparación contra lista de referencia propia →
> priorización. Ver sección final para repetir el proceso.

## 🔴 Bloqueante para vender (resolver antes de operar con clientes reales)

- [ ] **Descuento automático de stock al confirmar que una orden fue pagada**
      Estado confirmado: *no encontrado* en el código. Hoy existe validación de
      stock disponible al crear el pedido, pero nada resta stock cuando la
      venta se cierra de verdad. Sin esto, se puede vender el mismo producto
      dos veces.
- [ ] **Cerrar el circuito de "marcar orden como pagada" en el panel admin**
      Estado confirmado: *parcial*. El modelo de órdenes ya tiene estados y
      `whatsapp_pending`, pero falta confirmar que el flujo de actualización
      manual (vos marcás "pagado" → la orden cambia de estado) esté completo
      de punta a punta.

## 🟡 Mejora futura (no bloquea vender, pero suma)

- [ ] Alertas de stock bajo
- [ ] Reportes básicos de qué se vende más
- [ ] Multiusuario con niveles de acceso (si en algún momento hay más de un vendedor)
- [ ] Historial de pedidos consultable por cliente
- [ ] Personalización visible del catálogo (branding/tema propio)
- [ ] Confirmar alcance real de "gestión de variantes" — la auditoría lo marcó
      *parcial*: hay stock y atributos, pero no un modelo de variante
      independiente tan explícito como se pensaba.

## 📋 Resuelto fuera del código (proceso manual, no requiere programar)

- [x] **Boleta electrónica** → Portal MiPyme gratuito del SII. Se emite a mano
      después de confirmar la transferencia por WhatsApp. No hace falta
      integración ni API por ahora.

## ❌ Descartado a propósito

- Integración de pasarela de pago (MercadoPago) — modelo de negocio es 100%
  WhatsApp + transferencia manual. Código eliminado en sept 2026.

## ⚠️ Pendiente de verificar a mano (dudas que dejó la última auditoría)

- El agente afirmó que existe un endpoint `POST /api/orders/whatsapp` en
  `BACKEND/src/routes/orderRoutes.js`. Confirmar que el nombre exacto es ese.
- La fila de "Categorías/franquicias/temas" se marcó `sí` justo después de que
  una de sus búsquedas internas fallara ("Search failed") sin que el agente lo
  avisara. Es probable que sea correcta igual (se cruza con código ya revisado
  en esta conversación), pero no se confirmó dos veces por una vía limpia.

## 🔍 Metodología para la próxima auditoría

No preguntar "¿cómo va el proyecto?" de una. Usar 3 etapas:

1. **Inventario de hechos** — pedir tabla con columna de archivo obligatoria;
   "no encontrado" en vez de asumir.
2. **Comparación** — contra una lista de referencia que doy yo, no una que
   el agente invente o saque de su propio criterio de "mercado".
3. **Priorización** — solo sobre los gaps ya confirmados en el paso 2, sin
   agregar funciones nuevas.

Pedir siempre que avise explícitamente si alguna búsqueda o lectura de archivo
falló, aunque igual llegue a una conclusión por otra vía.
