# Nebadona Store — Contexto para Claude Code

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
  mostralo primero completo. No asumas su contenido ni su schema.
- No declares un fix "resuelto" hasta que el usuario confirme que lo probó.
- Mostrá el diff antes de guardar cambios en archivos existentes.
- No agregues funciones ni cambies de tema sin que se pida explícitamente —
  nada de scope creep. Si algo parece un próximo paso lógico, mencionalo en
  una frase y esperá confirmación, no lo implementes solo.
- Sugerí un commit de checkpoint (`git add . && git commit -m "..."`) antes
  de aplicar un batch de cambios grande, y recordá que el usuario está en
  PowerShell de Windows (no asumir sintaxis de bash tipo `2>/dev/null`).
- Si una búsqueda o lectura falla, decilo explícitamente — no sigas como si
  hubiera funcionado.

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

## 🔧 Tarea en curso ahora mismo: panel de órdenes completo

`OrdersPage.jsx` era una maqueta con datos inventados, sin conexión real
al backend. Se está construyendo el CRUD completo: `getAllOrders` +
`updateOrderStatus` (con descuento/reposición de stock al entrar/salir de
"approved") en el backend, y el reemplazo completo de `OrdersPage.jsx` en
el frontend con datos reales, filtro por tabs funcional, y selector de
estado por orden. Ver `BACKLOG.md` para el detalle de archivo por archivo.
