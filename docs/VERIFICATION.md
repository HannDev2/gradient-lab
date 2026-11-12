# Registro de verificación

## Entorno y permisos

2026-11-10: se comprobó escritura en `gradient-lab/`, HTTPS al registro npm (200), puerto loopback y autenticación de GitHub CLI como HannDev2. `npm install` completó la instalación. Se inicializó Git únicamente dentro de esta carpeta, conservando el workspace y el cartel.

## Matemática y estado

`npm test`: 31 pruebas aprobadas. Coincidencia con todos los valores de aceptación del cartel; diferencias finitas para un ejemplo distinto; recurrencia del error; estabilidad lenta/estable/oscilante/frontera/divergente; entradas nulas; tasas cero; validación de dimensiones y números no finitos; overflow; reproducibilidad; reinicio y edición durante reproducción; tope de historial; geometría y proyección con w₃ fijo; contornos con sensibilidades subnormales y validación de sus intersecciones.

## Navegador

`npm run test:e2e`: 14 pruebas aprobadas, siete flujos en escritorio 1440×1000 y móvil emulado 390×844. Recorrido de siete capítulos con interacciones; atrás/reinicio; paso/lote/reproducción/pausa; valores calculados; edición y validación; divergencia; WebGL real con SwiftShader; cámara; alternancia 2D/3D; pérdida real de contexto en ejecución; operación con teclado; alternativa forzada sin WebGL y movimiento reducido. Axe revisa portada, jacobiana, laboratorio 2D y fundamentos: cero infracciones de las reglas WCAG 2 A/AA y 2.1 AA examinadas. No equivale a una auditoría manual con lector de pantalla.

Se inspeccionaron capturas de portada, jacobiana, red neuronal, descenso y laboratorio en ambas clases de pantalla. Se corrigieron ciclo de vida del contexto WebGL, campos con ruido de punto flotante, foco del enlace de salto, etiquetas superpuestas y posición de las acciones de entrenamiento. El detector de Impeccable advierte únicamente que Space Grotesk es frecuente; se conserva la tipografía del sistema documentado.

## Construcción y dependencias

TypeScript estricto y `npm run build`: aprobados. Fuentes latinas alojadas localmente. JavaScript inicial ~86 kB gzip; escena lazy ~250 kB gzip. Vite informa un chunk 3D superior a 500 kB sin comprimir; queda aislado en carga diferida. `npm audit`: cero vulnerabilidades en dependencias de producción y desarrollo al comprobar.

## Publicación

Build estático servido con Vite preview: 14 pruebas de navegador aprobadas; rutas hash, recursos, PDF y consola comprobados, incluido móvil de 320 px. Revisión independiente completada y hallazgos corregidos. Repositorio público creado en https://github.com/HannDev2/gradient-lab.

**Publicado y comprobado el 10 de noviembre de 2026.**

- Repositorio público: https://github.com/HannDev2/gradient-lab.
- Sitio HTTPS: https://hanndev2.github.io/gradient-lab/ (HTTP 200).
- Workflow de publicación de la aplicación: [42878988915](https://github.com/HannDev2/gradient-lab/actions/runs/42878988915), conclusión `success` en build y deploy. Código de aplicación: `8eb3289e9bfb52f21d2fefe20c1201d60670bbc2`.
- Pages configurado con `build_type: workflow`, HTTPS habilitado y base Vite `/gradient-lab/`.
- Suite completa contra Pages: `PLAYWRIGHT_BASE_URL=https://hanndev2.github.io/gradient-lab/ npm run test:e2e` → **14/14 aprobadas** (19.5 s). Incluye recarga hash, todos los capítulos, funcionamiento de controles, recursos estáticos/PDF, consola, WebGL/2D, pérdida de contexto, teclado, móvil de 320 px y Axe.
- La copia del cartel conserva el SHA-256 del archivo suministrado: `c5422466e098211bc5a4f9e3b54ac9cca15e45d841ad1ee15819a76bc979cad7`.

Las capturas de `docs/screenshots/` documentan la interfaz real. La experiencia pública conserva las interacciones, no depende de esas imágenes.

## Alcance pendiente de comprobación manual

No se probó en móviles físicos ni con lector de pantalla. Las pruebas de WebGL usan Chromium/SwiftShader; otros controladores pueden recurrir a la alternativa 2D. No se asignó licencia al trabajo original sin confirmación de ambos autores. El ejemplo sigue siendo una sola observación de entrenamiento y no demuestra generalización. Este documento se actualizará con evidencia antes de declarar publicación exitosa.

## Iteración visual v2 — comprobación local posterior

10 de noviembre de 2026, rama `feature/visual-v2`: 32/32 pruebas unitarias, 22/22 pruebas de navegador sobre build estático local y TypeScript/build aprobados. Se conservan los flujos previos y se comprueban portada de cinco momentos, transferencia de pesos, presentación por teclado, oscilación, liberación de Canvas fuera de vista y movimiento reducido. Detector Impeccable sin hallazgos activos; tipografía existente con excepción puntual documentada.

Inspección con capturas comparativas a 360, 390, 768, 1440 y 1920 px. Sin overflow de portada en esas anchuras. Revisión independiente sin defectos críticos o importantes. No se modificaron motor ni reducer, y el cartel mantiene su hash. JS inicial 87,391 → 91,468 B gzip; CSS 8,035 → 12,744 B; escena lazy 249,780 → 250,297 B. La portada 3D incorpora una descarga adicional en escritorio. Muestras locales de FCP y limitaciones en [ESTADO_ACTUAL.md](ESTADO_ACTUAL.md), junto con componentes, interacciones y capturas.

Esta comprobación no es un despliegue de v2. La versión pública de `main` se conserva hasta aprobación de la PR. El registro anterior corresponde a la publicación v1 y no se reetiqueta como validación pública de v2.

PR de entrega: [#1](https://github.com/HannDev2/gradient-lab/pull/1). Validación remota del código `5a065af`: [Actions 42911655754](https://github.com/HannDev2/gradient-lab/actions/runs/42911655754), job build `success`, incluidas instalación, pruebas unitarias, construcción y navegador/WebGL/accesibilidad. Deploy `skipped`; no se reemplazó Pages.

## Electric Observatory v3 — comprobación local

10 de noviembre de 2026 (México), `feature/visual-v3` basada en `a18e3b0` de v2. `npm test -- --reporter=dot`: **32/32**; `npm run build`: **aprobado**, incluye TypeScript; `CI=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:4173/gradient-lab/ npm run test:e2e`: **42/42** sobre build estático con Vite preview. Se conservan 22 ejecuciones anteriores y se añaden 20, repartidas entre escritorio y móvil emulado.

La presentación completa verifica diez escenas, cálculo real compartido, salida con estado conservado, reproducción/pausa/foco, restauración, ascenso sincronizado y cifras exactas. También se comprueban ayuda contextual mediante teclado/toque/Escape y SVG hasta primer draw. La prueba con RAF detenido reprodujo la carrera de foco de navegación; tras el guard de foco pasa tanto esa regresión como el flujo previo de teclado. No se aumentaron timeouts ni se retiraron aserciones para lograrlo.

Axe conserva cero infracciones en las vistas y reglas examinadas. La revisión independiente señaló y confirmó arreglos de snapshot y cifras; las revisiones adicionales de primer fotograma, ayudas y foco no encontraron defectos importantes. Revisión estática y pruebas automatizadas no sustituyen las inspecciones visuales de escritorio/móvil realizadas por el implementador.

Capturas comparativas v2/v3, vídeo real WebM y métricas se guardan en `docs/visual-v3/`. Cinco anchuras: 360/390/768/1440/1920 px. Datos y límites de interpretación en [informe actual](ESTADO_ACTUAL.md). Chromium usa SwiftShader; no se certifican FPS en GPU física. La grabación se realiza separada de la medida de cadencia.

`src/math`, `src/state`, `package.json` y lock permanecen idénticos a v2. El SHA-256 del cartel sigue siendo `c5422466e098211bc5a4f9e3b54ac9cca15e45d841ad1ee15819a76bc979cad7`. `git diff --check` aprobado. Excepción puntual de Space Grotesk conservada por el diseño documentado, sin desactivar archivos ni reglas completas.

La entrega v3 es una PR hacia `feature/visual-v2`; no es una publicación. El workflow admite esa base y omite preparación/empaquetado/deploy de Pages en PR. Se comprobó que `main` sigue en `3fbd1a954f5a84842b9eceda7102e2d80c87d104`, v2 en `a18e3b0cb81eaa4c682d68215079fe4efca991ae` y PR #1 abierta sin fusionar. El HTML público conserva SHA-256 `abf4f1170e748a5f7972ca5470ab9c2108af42f2c67b17693946e387e57902c6`.

Entrega v3: [PR #2 hacia feature/visual-v2](https://github.com/HannDev2/gradient-lab/pull/2), abierta y sin fusionar. [Verificaciones remotas de la PR](https://github.com/HannDev2/gradient-lab/pull/2/checks); los resultados locales anteriores corresponden al código `6b5af76b516cbf97603e8285a156a66c36f21e38`.

Corrección tras Actions [42967585060](https://github.com/HannDev2/gradient-lab/actions/runs/42967585060): 33/40 y siete fallos de navegador, aunque motor/build pasaban. Se eliminó la animación global en reduced-motion (antes duraba 0.01 ms), con prueba roja/verde y capturas específicas; CI sirve ahora el build con un navegador. Resultado local final: 42/42, sin ampliar timeouts ni omitir contraste. Los tamaños finales se distinguen de las muestras de FCP/cadencia del commit 6b5af76 en performance.json; la corrección posterior solo afecta visualmente a movimiento reducido.

Seguimiento remoto, 11 de noviembre: [42969208239](https://github.com/HannDev2/gradient-lab/actions/runs/42969208239) terminó con 39 aprobadas, dos flaky y un timeout acumulado. Las trazas registran screenshot de 18 s y montajes WebGL de 7–11 s; el flujo cinematográfico alcanza el laboratorio y conserva 112.14, pero excede 30 s. Se adapta solo CI a 60 s por prueba y 15 s por aserción. Las 42 pruebas y sus comprobaciones permanecen completas. El resultado remoto de la corrección debe consultarse en los checks de la PR; no se da por aprobado de antemano.

Validación local posterior del ajuste de presupuesto: `CI=1 npm run test:e2e`, con preview arrancado automáticamente por Playwright, **42/42 aprobadas en 2.4 min, sin reintentos**. El cambio afecta exclusivamente a configuración de pruebas y documentación; no modifica los bundles de aplicación medidos.

## Candidata v3 para exposición

Pasada de refinamiento sobre `feature/visual-v3`: **33/33 unitarias, 54/54 E2E locales sobre producción (3.2 min), TypeScript/build aprobados**. Se conservan las 42 E2E anteriores y se añaden doce ejecuciones: precisión sin escrituras por foco, ayudas sin solapamientos, dos demos reproducibles/aisladas, alta densidad software y hero en tres anchos. La conclusión divergente también pasa Axe. Tras la suite se afinó solo la posición de etiquetas/controles del hero; seis pruebas específicas de hero/primer fotograma/WebGL aprobadas y resultado remoto en los checks de PR #2. [Informe completo y límites de la candidata](VISUAL_V3_RC.md). El renderer continúa siendo SwiftShader, con mejora de cadencia medida a alta densidad; sin extrapolar a GPU física.
