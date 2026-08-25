# MercadoPago Webhook y Pruebas Locales

## 1. Qué se cambió en el backend

### `src/config/mercadoPagoConfig.js`
- Se creó el cliente de MercadoPago usando `MercadoPagoConfig`.
- Se exporta una API envolvente con los métodos usados en la app:
  - `preferences.create`
  - `payment.get`
- Esto mantiene la compatibilidad con el SDK y evita errores de importación.

### `src/controllers/orderControllers.js`
- Se usa `mercadopago.preferences.create(mpPayload)` para crear la preferencia.
- Se lee el resultado desde `result.body` o `result`, según el SDK.
- Se guarda el `preferenceId` en la orden, y se devuelve `paymentUrl`.

### `src/controllers/webHookControllers.js`
- Se corrigió la validación de firma de webhook:
  - `startsWith` en lugar de `startWith`
  - parseo correcto de `ts=` y `v1=` en la cabecera
  - validación segura con `crypto.timingSafeEqual`
- En desarrollo, si no hay `MERCADOPAGO_WEBHOOK_SECRET`, el webhook acepta la petición como prueba y no hace llamadas externas.
- Esto permite probar el endpoint localmente sin un webhook real.

## 2. Qué se probó

### Prueba local al endpoint webhook
- El servidor backend se arrancó en `http://localhost:3001`.
- Se envió una petición POST simulada a:
  - `http://localhost:3001/api/webhook`
- El backend devolvió:
  - `status: 200`
  - `{"message":"Webhook received (dev mode) — no external processing performed"}`

## 3. Qué es una simulación `curl`

- `curl` es una herramienta de línea de comandos para hacer peticiones HTTP.
- Una "simulación curl" significa crear manualmente la misma petición que haría el webhook: URL, método POST, cabeceras y cuerpo JSON.
- Es útil cuando probamos un endpoint localmente sin depender de la fuente real del webhook.

### Ejemplo de comando `curl` en Linux/Git Bash
```bash
curl -X POST http://localhost:3001/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"payment","topic":"payment","data":{"id":"123"}}'
```

### Nota para PowerShell
- En PowerShell, el alias `curl` llama a `Invoke-WebRequest`, no a cURL real.
- Si quieres usar el binario cURL, ejecuta:
```powershell
curl.exe -X POST http://localhost:3001/api/webhook -H "Content-Type: application/json" -d '{"type":"payment","topic":"payment","data":{"id":"123"}}'
```

## 4. Qué es `ngrok`

- `ngrok` es una herramienta que expone un servidor local a Internet mediante un túnel seguro.
- Se usa cuando el servicio externo (MercadoPago en este caso) debe enviar webhook a una URL pública.
- Ejemplo de uso:
```bash
ngrok http 3001
```
- `ngrok` genera una URL pública como `https://abcd1234.ngrok.io` y la reenvía a `http://localhost:3001`.
- Esto permite que MercadoPago entregue webhook reales a tu servidor local.

## 5. Qué es un `sandbox`

- Un `sandbox` es un entorno de prueba controlado.
- En MercadoPago, el sandbox permite crear pagos de prueba sin usar dinero real.
- Se usa con credenciales de prueba (`MP_ACCESS_TOKEN` de sandbox) y simula el comportamiento del entorno productivo.
- Es ideal para desarrollar y comprobar flujos antes de ir a producción.

## 6. Variables importantes en `.env`

El backend usa estas variables:
- `MONGO_DB_URI`
- `MONGO_DB_USER`
- `MONGO_DB_PASSWORD`
- `MONGO_DB_NAME`
- `JWT_SECRET`
- `FRONTEND_URL`
- `MP_ACCESS_TOKEN`
- `MERCADOPAGO_WEBHOOK_SECRET` (recomendado en producción)

## 7. Cómo probar el webhook localmente

1. Arranca el backend:
```bash
cd C:\Users\Alejandro\Desktop\NEBADONA\BACKEND
npm run dev
```
2. Simula la petición local con Node:
```bash
node -e "fetch('http://localhost:3001/api/webhook',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'payment',topic:'payment',data:{id:'123'}})}).then(async r=>{console.log('status',r.status); console.log(await r.text())}).catch(e=>{console.error(e)})"
```
3. O usa `curl.exe` en PowerShell:
```powershell
curl.exe -X POST http://localhost:3001/api/webhook -H "Content-Type: application/json" -d '{"type":"payment","topic":"payment","data":{"id":"123"}}'
```

## 8. Recomendación para producción vs desarrollo

### Opción 1: Aceptar y procesar datos reales de MercadoPago en producción
- Requiere `MERCADOPAGO_WEBHOOK_SECRET` configurado.
- Debes eliminar la excepción de dev para validación de firma.
- El backend debe verificar la firma del webhook y luego:
  - obtener el pago real desde MercadoPago,
  - encontrar la orden usando `external_reference`,
  - actualizar estado y stock según el pago.
- Ventajas:
  - seguridad real, validación de integridad.
  - respuesta a eventos reales de pago.
- Ideal para producción.

### Opción 2: Mantener la validación dev-friendly
- Excelente para desarrollo local y pruebas rápidas.
- Permite probar la ruta sin tener el webhook real de MercadoPago.
- Debe usarse solo en entornos no productivos.
- En producción, debes tener la validación estricta activada.

## 9. Recomendación final
- Mantén la lógica `dev-friendly` activada solo si `NODE_ENV !== 'production'`.
- En producción, configura `MERCADOPAGO_WEBHOOK_SECRET` y quita la excepción.
- Usa `ngrok` para pruebas de webhook reales desde MercadoPago si necesitas exponer `localhost`.
- Controla la diferencia entre:
  - entorno `sandbox` (pruebas sin dinero real),
  - entorno `production` (pagos reales).
