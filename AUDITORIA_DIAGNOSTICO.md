# Diagnóstico de auditoría técnica y de seguridad

## Resumen ejecutivo

El proyecto presenta una base funcional razonable para un e-commerce con inventario y pagos, pero su arquitectura actual no está completamente alineada con estándares de escalabilidad y seguridad. El frontend y el backend tienen indicadores claros de crecimiento orgánico: existen módulos por dominio, pero con mezclas de responsabilidades y lógica duplicada; además, hay evidencia de configuración sensible expuesta en archivos locales y puntos de validación débil en flujos críticos como webhook de pagos.

Se detectaron hallazgos relevantes en 4 dimensiones:
- Arquitectura: organización por feature/domain, pero acoplamiento elevado y falta de separación clara entre dominio, infraestructura y presentación.
- Código muerto: archivos legacy, comentarios obsoletos, imports sin uso y logs de depuración en producción.
- Calidad: componentes monolíticos, context providers con demasiadas responsabilidades y lógica compleja en render y efectos.
- Seguridad: secretos expuestos, validación parcial de firmas, CORS/configuración sensible y payloads grandes sin control adecuado.

La aplicación compila en frontend (`vite build` exit code 0) y no presenta un bloqueo inmediato de ejecución, pero los riesgos documentados son significativos y requieren intervención antes de escalar a producción con tráfico real.

---

# 🔴 PRIORIDAD ALTA (Crítico)

## 1) Secretos reales expuestos en archivos locales de entorno
- Archivos afectados:
  - [BACKEND/.env](BACKEND/.env)
  - [BACKEND/src/config/configdb.js](BACKEND/src/config/configdb.js)
  - [FRONTEND/.env](FRONTEND/.env)
- Problema:
  El proyecto incluye archivos `.env` con credenciales reales o sensibles: MongoDB, JWT, MercadoPago y Cloudinary. Aunque muchos proyectos usan `.env` localmente, la presencia de estos valores directamente en el repo/workspace expone secretos críticos y facilita exfiltración, reutilización o inyección si se comparte el proyecto o se hace un despliegue accidental.
  El mismo archivo de configuración de base de datos sugiere lectura directa desde entorno sin validación de presencia ni fall-fast.
- Riesgo:
  - Exposición de credenciales de producción.
  - Posibilidad de acceso no autorizado a MongoDB y servicios externos.
  - Compromiso del JWT y de pagos.
- Solución propuesta:
  - Eliminar cualquier `.env` del repositorio y añadir una regla robusta en `.gitignore` (`*.env`, `.env.*` y excepciones solo para plantillas).
  - Usar `.env.example` como base con placeholders no secretos.
  - Integrar rotación de secretos y almacenamiento seguro (Azure Key Vault, secret manager, GitHub Actions secrets, etc.).
  - Validar al inicio de la app que todas las variables necesarias existan y sean válidas; no permitir ejecución silenciosa con `undefined`.

## 2) Validación de firma de webhook de MercadoPago omitida en entorno no productivo
- Archivos afectados:
  - [BACKEND/src/controllers/webHookControllers.js](BACKEND/src/controllers/webHookControllers.js)
  - [BACKEND/src/routes](BACKEND/src/routes)
- Problema:
  El flujo de webhook utiliza validación parcial de firma y desactiva lógica crítica en entornos distintos de `production`. Eso genera una situación peligrosa: si se ejecuta en un entorno de pruebas, staging o local sin configuración rigurosa, el servidor puede aceptar eventos no autenticados o manipulados.
  La lógica de validación debe ser obligatoria en todos los entornos, y el comportamiento de desarrollo no debe exponer un bypass operativo.
- Riesgo:
  - Replay o spoofing de eventos de pagos.
  - Persistencia de órdenes falsas o inconsistencia financiera.
  - Exposición del sistema a abuso si el entorno de pruebas se conecta a tráfico real.
- Solución propuesta:
  - Requerir validación de firma para todo evento, sin excepciones por entorno.
  - Usar un mecanismo de verificación estricta con timestamp + signature + secreto asociado.
  - Añadir reintentos controlados, logging de auditoría, idempotencia y validación del payload.
  - Bloquear el flujo si la firma no coincide, independientemente de `NODE_ENV`.

## 3) Payloads grandes y consumo desprotegido de memoria / DoS
- Archivos afectados:
  - [BACKEND/src/server.js](BACKEND/src/server.js)
  - [BACKEND/src/controllers/productsControllers.js](BACKEND/src/controllers/productsControllers.js)
- Problema:
  El backend expresa JSON con límites muy altos (`express.json({ limit: '50mb' })`) y `urlencoded` con `20mb`. Esto permite cargas masivas y hace más accesible el abuso por ataques de DoS o abuso de recursos. Si además no se limita la tasa de llamadas por IP y no se valida tamaño del contenido por endpoint, la API se vuelve más frágil.
- Riesgo:
  - Saturación de memoria.
  - Coste computacional alto.
  - Exposición a abuso de endpoints de importación/subida.
- Solución propuesta:
  - Redefinir límites por endpoint (por ejemplo, 1-5MB para JSON general y un valor más pequeño para upload/imports especializados).
  - Añadir rate limiting por IP y por sesión.
  - Validar tamaño y tipo de payload antes de procesar.
  - Usar `helmet`, `rateLimit`, y sanitización de contenido según el tipo de petición.

## 4) Configuración de seguridad insuficiente en la capa HTTP
- Archivos afectados:
  - [BACKEND/src/server.js](BACKEND/src/server.js)
  - [BACKEND/src/middleware/authMiddleware.js](BACKEND/src/middleware/authMiddleware.js)
- Problema:
  La aplicación se apoya en CORS y JWT, pero no se evidencia una estrategia de defensa consistente alrededor de encabezados, origenes y validación de permisos. La configuración parece permitir un rango demasiado amplio o no está protegida contra orígenes no esperados; además, los middleware de autenticación no muestran validación de fail-fast robusta ni normalización de errores.
- Riesgo:
  - Cross-origin abuse si CORS se configura con orígenes demasiado amplios.
  - Sesiones simuladas o tokens alterados con mayor superficie de ataque.
  - Dificultad para detectar y responder a abuso.
- Solución propuesta:
  - Definir una lista explícita de `allowedOrigins` y reject all default.
  - Separar `credentials` y `methods` según entorno.
  - Definir una política de JWT con expiración, issuer, audience y validación estricta.
  - Añadir middleware de logging y métricas para detección temprana de abuso.

---

# 🟡 PRIORIDAD MEDIA (Importante)

## 5) El contexto de productos es un God Object y concentra demasiadas responsabilidades
- Archivo afectado:
  - [FRONTEND/src/entities/product/model/ProductContext.jsx](FRONTEND/src/entities/product/model/ProductContext.jsx)
- Problema:
  Este provider gestiona productos, categorías, temas, franquicias, CRUD completo, estados de carga, búsquedas y errores. Tiene demasiadas responsabilidades en una sola capa y se vuelve difícil de mantener, depurar y testear.
  La lógica del contexto está casi mezclando dominio, UI state y uso de servicio.
- Riesgo:
  - Acoplamiento excesivo.
  - Re-renders innecesarios.
  - Duplicación de lógica y dificultades para ejecutar pruebas aisladas.
- Solución propuesta:
  - Dividir en varios hooks y contextos específicos: `useProducts`, `useProductCategories`, `useFranchises`, `useProductCrud`.
  - Mover la consulta y normalización a servicios o adapters bien definidos.
  - Reducir el estado global a lo estrictamente necesario; usar query cache o react-query/swr si la app crece.

## 6) Componente de tienda y catálogo excesivamente monolítico
- Archivos afectados:
  - [FRONTEND/src/pages/shopping/ui/ShoppingPage.jsx](FRONTEND/src/pages/shopping/ui/ShoppingPage.jsx)
  - [FRONTEND/src/widgets/catalog](FRONTEND/src/widgets/catalog)
  - [FRONTEND/src/app/App.jsx](FRONTEND/src/app/App.jsx)
- Problema:
  `ShoppingPage` combina lógica de filtros, normalización, ordenamiento, render conditionals, búsqueda, estados de UI y callbacks dentro de un mismo componente. Además, llama a `console.log` en un flujo que se ejecuta en producción, lo que aumenta ruido y puede exponer datos sensibles.
- Riesgo:
  - Complejidad alta y difícil mantenimiento.
  - Re-render y performance degradada al recomputar datos pesados.
  - Entorno más propenso a errores de sincronización de estado.
- Solución propuesta:
  - Extraer lógica a hooks: `useProductFilters`, `useNormalizedProducts`, `useCatalogSorting`.
  - Separar el render en subcomponentes (toolbar, sidebar, empty state, results).
  - Eliminar logs de depuración y mover el filtro/orden al nivel de un selector o utilitario puramente funcional.

## 7) Código muerto y archivos legacy activos en el flujo del repo
- Archivos afectados:
  - [BACKEND/src/controllers/productsControllers_OLD.js](BACKEND/src/controllers/productsControllers_OLD.js)
  - [BACKEND/src/models/ProductModel_OLD.js](BACKEND/src/models/ProductModel_OLD.js)
  - [BACKEND/src/schemas/productSchema_OLD.js](BACKEND/src/schemas/productSchema_OLD.js)
  - [FRONTEND/src/app/App.jsx](FRONTEND/src/app/App.jsx)
- Problema:
  Existen archivos legacy claramente no integrados al flujo activo. También hay rutas comentadas en la app principal, indicando no uso real o migración incompleta. Esto aumenta ruido y dificulta la comprensión del sistema.
- Riesgo:
  - Confusión de mantenimiento.
  - Duplicación de lógica y errores por evolución paralela.
  - Mayor costo de onboarding y de pruebas.
- Solución propuesta:
  - Eliminar los archivos `*_OLD` si no están referenciados.
  - Consolidar rutas y feature flags en un solo árbol de navegación.
  - Ser estricto con la política “no dejar dead code en mainline”.

## 8) Importación sin uso y funciones huérfanas
- Archivos afectados:
  - [FRONTEND/src/entities/product/model/ProductContext.jsx](FRONTEND/src/entities/product/model/ProductContext.jsx)
  - [FRONTEND/src/shared/lib/colors/colorUtils.js](FRONTEND/src/shared/lib/colors/colorUtils.js)
- Problema:
  En el contexto de productos se importa `normalizeProductColorData`, pero no existe uso real del valor dentro del archivo. Esto sugiere lógica de soporte o refactorización incompleta.
  Además, hay evidencia de varios métodos y estados redactados sin un objetivo concreto o con duplicación funcional.
- Riesgo:
  - Detección más difícil de los realmente activos.
  - Carga de módulos innecesarios.
  - Mantenimiento más costoso por heurísticas inexactas.
- Solución propuesta:
  - Revisar imports con análisis estático y eliminar los no usados.
  - Eliminar utilidades sin uso o moverlas a las capas que sí necesitan dicha transformación.
  - Añadir lint rules estrictas para detectar imports huérfanos.

## 9) Contextos complejos de carrito y usuario con riesgo de sincronización desfasada
- Archivos afectados:
  - [FRONTEND/src/entities/cart/model/CartContext.jsx](FRONTEND/src/entities/cart/model/CartContext.jsx)
  - [FRONTEND/src/entities/user/model/UserContext.jsx](FRONTEND/src/entities/user/model/UserContext.jsx)
- Problema:
  El carrito mezcla persistencia local, sincronización con backend, cálculo de totales y estados para usuario autenticado/invitado. El modelo de usuario también integra sesión, perfil, perfiles y permisos. Hay riesgo de sincronización inconsistente cuando cambia el estado de autenticación, especialmente si el usuario alterna entre invitado y autenticado.
- Riesgo:
  - Carrito duplicado o perdido.
  - Estado inconsistente entre UI y backend.
  - Bugs difíciles de reproducir.
- Solución propuesta:
  - Reducir la responsabilidad del provider y crear un guard de sincronización.
  - Centralizar la derivación de estado en un reducer o state machine.
  - Separar persistencia local de sincronización remota y definir reglas claras de prioridad.

## 10) Logging de depuración en código de producción
- Archivos afectados:
  - [FRONTEND/src/pages/shopping/ui/ShoppingPage.jsx](FRONTEND/src/pages/shopping/ui/ShoppingPage.jsx)
  - [BACKEND/src/controllers/productsControllers.js](BACKEND/src/controllers/productsControllers.js)
  - [BACKEND/src/controllers/cartControllers.js](BACKEND/src/controllers/cartControllers.js)
- Problema:
  Hay `console.log` con contenido de negocio, datos de productos o estados de actualización en endpoints y páginas que se usan en producción. Esto supone ruido de logs, posible exposición de información y mala práctica de diagnóstico.
- Riesgo:
  - Pérdida de privacidad o fuga de información de negocio.
  - Dificultad para monitorear logs con ruido irrelevante.
  - Riesgo de uso accidental de información sensible.
- Solución propuesta:
  - Eliminar todos los logs de depuración y reemplazarlos por logger estructurado con niveles y rotación segura.
  - Usar `debug` o un logger centralizado con configuración por entorno.

## 11) Arquitectura del repo: mezcla de capas y patrón no uniforme
- Archivos afectados:
  - [FRONTEND/src](FRONTEND/src)
  - [BACKEND/src](BACKEND/src)
- Problema:
  La estructura intenta parecer feature/domain oriented, pero no hay una disciplina uniforme de separación entre entidad, feature, UI, servicios, infraestructura y API. En la práctica se observa acoplamiento entre entidades y navegación, y mezcla de lógica de negocio con efectos de UI y acceso remoto.
- Riesgo:
  - Escalabilidad limitada.
  - Cambios más costosos con cada agregado funcional.
  - baja reutilización y alta propagación de cambios.
- Solución propuesta:
  - Definir un estándar claro: `app`, `pages`, `widgets`, `features`, `entities`, `shared`, `services`, `infrastructure`.
  - Mantener entidades dominadas por modelos y validaciones; mover llamadas a API a capas de servicio específicas; dejar UI solo para presentación.
  - Adoptar un patrón consistente de importación y dependencia por capas.

---

# 🟢 PRIORIDAD BAJA (Mantenimiento)

## 12) Comentarios de código y bloques comentados no funcionales
- Archivos afectados:
  - [FRONTEND/src/app/App.jsx](FRONTEND/src/app/App.jsx)
  - [FRONTEND/src/pages](FRONTEND/src/pages)
  - [BACKEND/src/controllers](BACKEND/src/controllers)
- Problema:
  Hay rutas comentadas y fragmentos de código comentado que no forman parte del flujo activo. Esto sugiere migraciones incompletas o código de prueba que quedó visible.
- Solución propuesta:
  - Eliminar comentarios periodísticos y bloques de código inactivos.
  - Mantener comentarios solo para decisiones complejas o requisitos de negocio no obvios.

## 13) Inconsistencias de nomenclatura y dominio entre frontend y backend
- Archivos afectados:
  - [FRONTEND/src](FRONTEND/src)
  - [BACKEND/src](BACKEND/src)
- Problema:
  Hay mezclas como `franchise_name`, `product_category`, `sock_type`, `ProductCategory`, `designThemes`, etc. Las nomenclaturas no están completamente normalizadas entre el backend y el frontend.
- Solución propuesta:
  - Definir un contrato único de DTOs y modelos compartidos o adaptadores explícitos.
  - Normalizar claves y tipos para evitar inferencias complejas o mapeos manuales.

## 14) Estructura de carpetas potencialmente inconsistente con estándares de industria
- Archivos afectados:
  - [FRONTEND/src](FRONTEND/src)
  - [BACKEND/src](BACKEND/src)
- Problema:
  La estructura se percibe como un intento de FSD/feature-based, pero no está aplicada con rigor. Hay carpetas de dominio y capas mezcladas; falta una convención clara para “feature domain logic”, “shared infrastructure”, y “pure business rules”.
- Solución propuesta:
  - Restructurar con una convención definida:
    - `app/` para bootstrapping y providers
    - `pages/` para composición por pantalla
    - `widgets/` para secciones reutilizables
    - `features/` para flujo funcional específico
    - `entities/` para modelos y dominio
    - `shared/` para utilidades y componentes cross-cutting
  - Mantener la política “dependencies point inward” para evitar acoplamiento superficial.

## 15) Ausencia de aislamiento de validaciones y servicios externos
- Archivos afectados:
  - [BACKEND/src/controllers/productsControllers.js](BACKEND/src/controllers/productsControllers.js)
  - [BACKEND/src/controllers/webHookControllers.js](BACKEND/src/controllers/webHookControllers.js)
  - [FRONTEND/src/entities/product/api/productServices.js](FRONTEND/src/entities/product/api/productServices.js)
- Problema:
  La lógica de negocio, validación de archivos, carga de media y comunicación con pagos está muy concentrada. Esto hace más difícil aislar fallas, reutilizar el código y mantener pruebas unitarias.
- Solución propuesta:
  - Separar validadores, servicios de terceros, adaptadores de almacenamiento y flujo de dominio.
  - Encapsular llamadas a Cloudinary/MercadoPago en servicios específicos y reusable.

---

## Recomendación de reestructuración sugerida

Para escalar el proyecto sin perder mantenibilidad, se recomienda adoptar una estructura más clara y disciplinada:

```text
FRONTEND/src/
  app/
    providers/
    routes/
    layout/
  pages/
    home/
    shop/
    cart/
    checkout/
  widgets/
    catalog/
    cart/
    header/
  features/
    auth/
    products/
    checkout/
  entities/
    product/
    cart/
    user/
  shared/
    api/
    lib/
    ui/
    utils/

BACKEND/src/
  app/
    server.js
    app.js
  domain/
    product/
    cart/
    user/
    order/
  infrastructure/
    db/
    storage/
    payment/
    auth/
  interfaces/
    controllers/
    routes/
    middleware/
  shared/
    utils/
    validators/
    errors/
```

Esto permitiría:
- Separar dominio de infraestructura.
- Hacer pruebas más deterministas.
- Reducir acoplamiento entre UI, negocio y servicios.
- Facilitar auditoría de seguridad y maintainability.

---

## Conclusión

El proyecto tiene base funcional y modular, pero la evolución actual ha introducido complejidad innecesaria, acoplamiento de responsabilidades y varios puntos que deben tratarse antes de producción. Los hallazgos más críticos son los secretos expuestos, la validación débil del webhook de pago y la configuración de payloads y CORS. La mayoría del resto de problemas son de mantenibilidad y calidad, pero sí afectan directamente la sostenibilidad del producto a mediano plazo.

Se recomienda una fase de saneamiento técnico con prioridad en:
1. Rotación y protección de secretos.
2. Reforzamiento de autenticación y validación de webhook.
3. Reorganización de capa de frontend/backend.
4. Eliminación de dead code y logs de depuración.
5. Consolidación de reglas de validación y nomenclatura.
