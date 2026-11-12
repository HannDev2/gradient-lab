# Informe de trabajo y estado actual — Gradient Lab 3.0

Actualizado el 11 de noviembre de 2026 (México). **Electric Observatory — The Living Error** vive en `feature/visual-v3`, basada en `feature/visual-v2` (`a18e3b0`). La entrega es incremental hacia v2. No se fusiona PR #1, no se modifica `main` y no se publica la v3.

## Resultado e inicio local

La portada, el recorrido y el laboratorio se transformaron en un observatorio luminoso: superficie matemática dominante, negro profundo, verde ionizado, cian y coral/ámbar según estabilidad. La entrada coreografiada dura 2.6 segundos y mantiene las acciones disponibles. La nueva presentación expone **todo el proyecto en diez escenas**; el modo académico anterior sigue disponible.

Desde la carpeta del repositorio:

```sh
npm ci
npm run dev
```

Portada: `http://127.0.0.1:5173/gradient-lab/`. Presentación: `http://127.0.0.1:5173/gradient-lab/#/presentacion`. Acceso visible: «Ver el proyecto en escena». Flechas para escenas, reproducción opcional, Espacio para pausar, Escape para salir, selector, restauración y pantalla completa opcional. Al entrar no avanza sola. Salir conserva el entrenamiento; restaurar lo reinicia explícitamente.

El sitio público [Gradient Lab](https://hanndev2.github.io/gradient-lab/) conserva la v1. El [informe de v2](https://github.com/HannDev2/gradient-lab/blob/a18e3b0cb81eaa4c682d68215079fe4efca991ae/docs/ESTADO_ACTUAL.md) se conserva en su commit y rama, junto con [la PR #1](https://github.com/HannDev2/gradient-lab/pull/1).

## Cambios implementados

| Área | Resultado |
|---|---|
| Hero | Título monumental, campo 3D más grande, cámara de aproximación breve, color ligado a pérdida real, malla luminosa, contorno que se dibuja, halo del marcador y trayectoria iluminada. Las etiquetas de rangos quedan separadas del título. SVG permanece hasta el primer fotograma WebGL para evitar un campo vacío. |
| Atmósfera | Campos de luz, retícula de medición en perspectiva, profundidad en capas, reacción al cursor y barrido lento. Intensidades distintas según sección; pausa fuera de vista y con pestaña oculta. Sin partículas aleatorias. |
| Recorrido | Energía en conexiones de aportes, respuesta del nodo de suma, fuentes de cada entrada de la jacobiana, barras simultáneas de pesos y distinción entre ascenso y descenso. Se conservan las siete interacciones educativas. |
| Laboratorio | Métricas mayores, aparición suave de cifras exactas, controles activos, líneas más visibles y ayudas contextuales de predicción/pérdida/error con teclado, toque y cierre con Escape; estado crítico con luz coral/ámbar procedente de la estabilidad calculada. Se conservan edición, presets, paso, lote, reproducción, validación e historial. |
| Cierre | Sección matemática SVG real sobre un campo oscuro luminoso, con la interacción y transferencia de pesos existentes. Sustituye el verde plano de v2. |
| Presentación | Introducción, siete capítulos, entrenamiento compartido en vivo y conclusión con créditos, cartel y fuentes. Avance opcional de 16 s por escena, operaciones automáticas reales, pausa por foco/visibilidad e interacción manual. Scroll nativo y consola persistente en móvil. |

`Cinema.tsx` y `electric.css` son los módulos principales nuevos. `App` carga la presentación bajo demanda; `ChapterExperiment`, contenido y visualizaciones se reutilizan. `Landscape3D` amplía materiales y geometría visual; `LiveNumber` anima la aparición del resultado exacto. `scripts/visual-v3-audit.mjs` guarda comparación y grabación; `tests/visual-v3.spec.ts` aporta regresiones. El workflow incorpora PR hacia v2 y mantiene deploy omitido en PR.

Stack conservado: React 19, TypeScript estricto, Vite, Three.js/React Three Fiber, SVG, CSS y fuentes locales. **Ninguna dependencia añadida; motor y reducer intactos.** Impeccable guía el diseño, Animate la coreografía, Ponytail el alcance y las skills de verificación/revisión aportan comprobaciones. FFmpeg se usó como herramienta de grabación, sin formar parte de la aplicación.

## Rigor y degradación

Los vértices no se deforman para producir efectos. La altura y el color corresponden a la pérdida real de la sección con w₃ actual. El tubo luminoso sigue los centros de la aproximación poligonal existente, evaluada en ocho subsegmentos por actualización; su grosor es una marca visual. La flecha permanece normalizada en el plano de pesos. La proyección histórica está etiquetada y las gráficas temporales conservan pérdidas originales.

Un mismo snapshot controla pesos y paisaje en ascenso/descenso, incluida reproducción automática. Las cifras visibles no interpolan valores ficticios: la transición de aparición conserva siempre L=e²/2. La escena de entrenamiento usa el reducer de `App`; no hay otro simulador.

Canvas a demanda, sin rotación constante ni postprocesado. Material emisivo, Fresnel aditivo ligero y una textura local de halo sustituyen bloom pesado. Hero SVG por defecto en teléfonos, 3D opcional y alternativa 2D ante fallo/context loss. DPR limitado a 1 en móvil/movimiento reducido y 1.5 en escritorio. Movimiento reducido elimina desplazamientos, pausa ambiente y aplica cámara/marcador inmediatamente.

## Verificación local

- `npm test -- --reporter=dot`: **32/32 aprobadas**.
- `npm run build`: **aprobado**, incluida comprobación TypeScript estricta.
- `CI=1 npm run test:e2e`: **42/42 aprobadas en 2.4 min, sin reintentos** sobre build estático local, con preview automático, escritorio 1440×1000 y móvil emulado 390×844.
- Se conservan las 22 ejecuciones anteriores y se añaden 20: diez escenas, navegación, cálculos, reproducción/pausa/foco, salida con estado conservado, restauración, ascenso sincronizado, cifras exactas y paisaje visible hasta primer draw, ayudas de métricas, foco sin carreras de navegación y ausencia completa de animaciones en movimiento reducido. Axe sin infracciones en las vistas y reglas examinadas; no equivale a una auditoría manual completa.
- Revisión independiente de código: se señalaron y corrigieron snapshot de ascenso y cifras intermedias inconsistentes. Revisión adicional del primer fotograma sin defectos importantes; la inspección visual la realizó el implementador.
- `git diff --check` aprobado. Sin diferencias en `src/math`, `src/state`, `package.json` o lock respecto de v2. Cartel conservado, SHA-256 `c5422466e098211bc5a4f9e3b54ac9cca15e45d841ad1ee15819a76bc979cad7`.

El detector manual Impeccable no encontró hallazgos activos. Space Grotesk se mantiene por la decisión documentada, con excepción puntual `overused-font=space grotesk`; se registró también en la raíz del workspace para el hook que informa rutas `gradient-lab/src/...`. No se desactivaron reglas completas ni archivos.

Durante la validación se corrigieron etiquetas sobre el título, separación del acceso cinematográfico, el hueco previo al primer draw, repetición de paso al reanudar, sincronización de ascenso y lecturas numéricas. Las pruebas de primer fotograma y ayuda contextual fallaron antes de los arreglos y pasaron después. La suite también detectó que el RAF de navegación podía quitar el foco a un control recién seleccionado: se reprodujo con el reloj de navegador y se corrigió conservando el foco del usuario, sin perder saltos explícitos a referencias. Localmente, ocho navegadores saturaban SwiftShader y dos permitían completar la suite. La primera ejecución remota con dos workers dio 33/40 y siete fallos: tiempo de interacción y contraste durante revelaciones. Se corrigió reduced-motion con animation:none en lugar de una duración de 0.01 ms, se añadió una regresión que falló antes y pasó después, y CI pasó a servir el build estático con un solo worker. La suite local dio 42/42 con esa configuración. La revisión independiente de esta corrección no encontró riesgos importantes. La siguiente ejecución remota ([42969208239](https://github.com/HannDev2/gradient-lab/actions/runs/42969208239)) pasó 39 pruebas, tuvo dos reintentos y agotó el tiempo total en el recorrido cinematográfico: sus trazas muestran capturas de 14–18 s e inicializaciones WebGL de 7–11 s; el recorrido sí alcanzó el laboratorio con el resultado correcto. Por ello, únicamente en CI, el presupuesto por prueba pasa de 30 a 60 s y la espera de aserciones de 5 a 15 s. No se omiten pasos, aserciones ni efectos; esto adapta el tiempo de comprobación al renderizado software, sin afirmar una mejora de rendimiento.

## Comparación visual y animaciones

Las carpetas [antes](visual-v3/before/) y [después](visual-v3/after/) contienen capturas reales de builds v2/v3. Se capturó inicio, después de tres segundos y portada completa a 360/390/768/1440/1920 px; paso, circuito, dirección, laboratorio estable/divergente y presentación a 390/1440 px, además de movimiento reducido. No hay overflow de portada en esas cinco anchuras ni errores de consola durante el recorrido de captura.

| Vista | V2 | V3 |
|---|---|---|
| Hero escritorio | [Antes](visual-v3/before/hero-1440.png) | [Después](visual-v3/after/hero-1440.png) |
| Hero ancho | [Antes](visual-v3/before/hero-1920.png) | [Después](visual-v3/after/hero-1920.png) |
| Portada móvil | [Antes](visual-v3/before/home-390.png) | [Después](visual-v3/after/home-390.png) |
| Circuito activo | [Antes](visual-v3/before/circuit-1440.png) | [Después](visual-v3/after/circuit-1440.png) |
| Laboratorio estable | [Antes](visual-v3/before/lab-Estable-1440.png) | [Después](visual-v3/after/lab-Estable-1440.png) |
| Laboratorio divergente | [Antes](visual-v3/before/lab-Divergente-1440.png) | [Después](visual-v3/after/lab-Divergente-1440.png) |
| Presentación | [Académica v2](visual-v3/before/presentation-1440.png) | [Cinematográfica v3](visual-v3/after/cinema-intro-1440.png) |

Presentación: [jacobiana](visual-v3/after/cinema-jacobian-1440.png), [descenso](visual-v3/after/cinema-descent-1440.png), [entrenamiento real](visual-v3/after/cinema-live-1440.png), [conclusión](visual-v3/after/cinema-end-1440.png), [móvil](visual-v3/after/cinema-intro-390.png), [movimiento reducido](visual-v3/after/reduced-390.png), [ayuda contextual móvil](visual-v3/after/lab-help-390.png), [jacobiana sin animación](visual-v3/after/reduced-jacobian-390.png).

**[Grabación WebM de la experiencia](visual-v3/after/video/presentation.webm)**: 23.04 s, 1440×1000, VP9 a 25 fotogramas/s de grabación, 9.18 MB. Captura real del navegador con entrada, una iteración, circuito, jacobiana, descenso, entrenamiento y conclusión. Se graba aparte de las medidas de cadencia para no añadir el coste del codificador al benchmark. Reproducción: descargar/abrir en un navegador compatible; no se carga al entrar en la aplicación.

## Rendimiento medido

Builds de producción v2/v3, tamaños gzip en bytes (columna v3 actualizada tras la corrección de movimiento reducido):

| Recurso | V2 | V3 | Diferencia |
|---|---:|---:|---:|
| JavaScript inicial | 91,468 B | 92,568 B | +1,100 B |
| CSS inicial | 12,744 B | 18,056 B | +5,312 B |
| Escena diferida | 250,297 B | 251,556 B | +1,259 B |
| Presentación diferida nueva | — | 3,283 B | Solo al abrirla |

JS + CSS iniciales: **+6,412 B gzip (6.2 %)**. Recursos observados en portada: 161,244 → 167,676 B en teléfono y 411,841 → 419,533 B con 3D de escritorio/tableta. La escena sigue en un chunk separado; Vite mantiene el aviso por superar 500 kB sin comprimir.

FCP local, una carga por anchura y fase. La muestra v3 corresponde al commit 6b5af76; los cambios visuales posteriores afectan únicamente a movimiento reducido:

| Anchura | V2 | V3 |
|---|---:|---:|
| 360 px | 1064 ms | 1164 ms |
| 390 px | 292 ms | 220 ms |
| 768 px | 372 ms | 472 ms |
| 1440 px | 408 ms | 672 ms |
| 1920 px | 500 ms | 652 ms |

No se afirma una mejora de carga: cuatro muestras aumentan y la de 390 px disminuye. Son muestras locales, sin red móvil ni distribución estadística. Recursos de fuentes están incluidos según lo solicitado por el navegador; el PDF no se descarga al entrar.

En 1440 px, intervalos rAF durante una muestra de entrada de 2.2 s: v2 mediana 16.7 ms, p95 16.7 ms, 1 intervalo >33.34 ms (130 muestras); v3 mediana 16.7 ms, p95 50 ms, 19 intervalos >33.34 ms (89 muestras). El coste de inicio es mayor en SwiftShader. Esto mide cadencia del navegador, **no FPS efectivos de GPU**. Tras estabilizar, hubo **0 llamadas de dibujo adicionales en 400 ms** en todas las anchuras; en teléfonos el hero permanece en SVG.

Los tamaños actualizados están en finalBundles del JSON; bundles conserva los recursos exactos del muestreo original. Las capturas de movimiento reducido se actualizaron después de corregirlo, sin repetir la grabación de movimiento completo. Datos completos, renderer y nombres/hash de bundles: [v2](visual-v3/before/performance.json) y [v3](visual-v3/after/performance.json). La grabación está separada del muestreo de cadencia. No se convierten estos resultados en una promesa de rendimiento en hardware físico.

## Entrega y publicación

PR abierta: **[#2 — Electric Observatory y presentación cinematográfica](https://github.com/HannDev2/gradient-lab/pull/2)**, de `feature/visual-v3` hacia `feature/visual-v2`. Código, pruebas y evidencia visual guardados en `6b5af76b516cbf97603e8285a156a66c36f21e38`; los commits siguientes completan enlaces y corrigen movimiento reducido/configuración de CI. Los resultados de Actions se consultan en [las verificaciones de la PR](https://github.com/HannDev2/gradient-lab/pull/2/checks).

El workflow verifica instalación, motor/estado, tipos, build y navegador; el deploy queda omitido en PR. Se comprobó después de subir la rama: `main` sigue en `3fbd1a954f5a84842b9eceda7102e2d80c87d104`, v2 en `a18e3b0cb81eaa4c682d68215079fe4efca991ae` y PR #1 continúa abierta sin fusionar. El HTML público conserva SHA-256 `abf4f1170e748a5f7972ca5470ab9c2108af42f2c67b17693946e387e57902c6`. Esta entrega no sustituye el sitio publicado.

## Limitaciones conocidas

Chromium usa SwiftShader en este entorno; incluso sin forzar ANGLE no se obtuvo GPU física. Los intervalos rAF no son FPS efectivos de GPU y no certifican 60 FPS en escritorio de gama media. La entrada presenta intervalos largos en renderizado software. No se probó en móviles físicos, Safari/Firefox, lector de pantalla ni redes móviles reales. La accesibilidad automatizada no cubre toda la experiencia asistiva. La licencia del trabajo original sigue pendiente y el ejemplo no demuestra generalización.
