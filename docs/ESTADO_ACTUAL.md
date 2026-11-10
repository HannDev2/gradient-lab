# Informe de trabajo y estado actual — Gradient Lab 2.0

Actualizado el 10 de noviembre de 2026. Rama `feature/visual-v2`, basada en `main` (`3fbd1a9`). La versión estable pública se conserva y la v2 se entrega para revisión mediante PR; no se fusiona ni se publica sin aprobación expresa.

## Resultado

Se implementaron las cuatro áreas visuales prioritarias: portada narrativa, recorrido de siete capítulos, laboratorio y escena matemática. También se incorporó el modo presentación sobre el recorrido existente. Se reutiliza la aplicación y no se añadieron dependencias ni se modificaron `src/math` o `src/state`.

La v1 continúa en https://hanndev2.github.io/gradient-lab/ y su entrega histórica figura en [VERIFICATION.md](VERIFICATION.md). El repositorio es https://github.com/HannDev2/gradient-lab. El estado local probado de v2 es independiente del despliegue estable.

## Trabajo realizado

| Área | Implementación |
|---|---|
| Portada | Cinco momentos con composición propia: hero 3D, datos y objetivo oculto, circuito de aprendizaje, dirección del gradiente e invitación instrumental. Atmósfera de coordenadas y luz, tipografía monumental y revelaciones ligadas a visibilidad. |
| Recorrido | Conexiones que atraviesan los pesos, selección con aporte destacado, sensibilidad bajo cada columna de la jacobiana, regla de la cadena alineada y barras de actualización simultánea. Se conservan los siete capítulos y su contenido. |
| Laboratorio | Mediciones y leyendas mayores, controles agrupados, selección directa de cuatro regímenes, factor q y gráfico de errores reales con signo. Se conservan paso, lote, reproducción, pausa, edición, validación e historial. |
| Escena | Iluminación, material rugoso, malla y suelo de referencia, marcador con anillo y proyección vertical. La trayectoria tiene prioridad de dibujo para no quedar tapada por la superficie. |
| Presentación | Ampliación de los mismos diagramas; flechas izquierda/derecha, Escape, restauración y acceso a comparación antes/después. Sin sistema de diapositivas duplicado. |

Interacciones nuevas: observar/restaurar una iteración desde el hero; revelar el objetivo; explorar cuatro operaciones; comparar ascenso y descenso; probar w₁ y transferirlo al laboratorio; cargar entrenamiento oscilatorio; activar presentación académica.

## Componentes y tecnología

- Nuevos: `Home.tsx`, `Atmosphere.tsx` y `visual-v2.css`.
- Extendidos: `App`, `Walkthrough`, `Laboratory`, `Landscape`, `SurfacePreview`, `Network` en `Plots` y `Landscape3D`.
- Geometría: `makeLandscape` interpola pesos y evalúa alturas sobre la sección actual; prueba de regresión añadida en `geometry.test.ts`.
- Evidencia reproducible: `scripts/visual-audit.mjs` y `tests/visual-v2.spec.ts`.
- Stack conservado: React 19, TypeScript estricto, Vite, SVG, Three.js/React Three Fiber, CSS y fuentes locales. Impeccable es la guía visual principal; Animate complementa movimiento, Ponytail limita complejidad, y se usaron verificación y revisión independiente.

## Rigor, rendimiento y acceso

El marcador y los vértices intermedios vuelven a evaluar L con w₃ actual. La línea visible es una aproximación poligonal de ocho subsegmentos por actualización, no una nueva trayectoria de entrenamiento. La etiqueta de historial proyectado y la explicación se conservan; las gráficas temporales mantienen las pérdidas originales. No se deforma el valle ni se modifica el gradiente para obtener un efecto visual.

Un único Canvas se renderiza a demanda. El hero lo desmonta fuera de vista y al ocultar la pestaña; la atmósfera se pausa. En teléfonos el hero empieza en SVG, con 3D opcional. Movimiento reducido suprime barridos/desplazamientos y aplica inmediatamente cámara y marcador. Se conservan foco, teclado, rutas hash, alternativa 2D y manejo de pérdida de contexto.

Tamaños gzip medidos sobre builds de producción:

| Recurso | Antes | Después | Diferencia |
|---|---:|---:|---:|
| JavaScript inicial | 87,391 B | 91,468 B | +4,077 B (4.7 %) |
| CSS inicial | 8,035 B | 12,744 B | +4,709 B (58.6 %) |
| Escena diferida | 249,780 B | 250,297 B | +517 B (0.2 %) |

JS + CSS iniciales aumentan unos 8.8 kB gzip, aproximadamente 9.2 %. En escritorio la portada ahora carga además la escena 3D diferida (~250 kB), que antes se descargaba al entrar al laboratorio. En teléfonos esa descarga requiere activar 3D. El aviso de Vite por chunk mayor de 500 kB sin comprimir permanece; el módulo continúa separado.

Muestras de FCP en Chromium local, una carga por anchura y fase:

| Anchura | FCP antes | FCP después | Overflow de portada |
|---|---:|---:|---|
| 360 px | 608 ms | 1040 ms | No |
| 390 px | 164 ms | 288 ms | No |
| 768 px | 180 ms | 376 ms | No |
| 1440 px | 228 ms | 368 ms | No |
| 1920 px | 200 ms | 392 ms | No |

No se afirma una mejora de velocidad: estas muestras aumentan y no constituyen un benchmark estadístico ni una prueba en red móvil. Transferencia de recursos de portada: 152,458 B antes; 161,244 B después en teléfonos y 411,841 B en escritorio/tableta con 3D. El script incluye una espera de 1.2 s para observación/captura; `observedLoadMs` no es un tiempo hasta interacción. Datos completos: [antes](visual-v2/before/performance.json) y [después](visual-v2/after/performance.json).

## Verificación y problemas corregidos

- `npm test -- --reporter=dot`: **32/32 aprobadas**.
- `npm run build`: **aprobado**, incluye TypeScript estricto.
- `PLAYWRIGHT_BASE_URL=http://127.0.0.1:4173/gradient-lab/ npm run test:e2e`: **22/22 aprobadas** sobre build servido con Vite preview, en escritorio 1440×1000 y móvil emulado 390×844.
- Se conservan las 14 comprobaciones anteriores y se añaden ocho ejecuciones de nuevas interacciones, presentación, oscilación, liberación de WebGL fuera de vista y movimiento reducido. Axe conserva cero infracciones en las vistas y reglas examinadas; no equivale a auditoría manual completa.
- Revisión independiente de código sin hallazgos críticos o importantes. No sustituye la inspección visual realizada por el implementador.
- `git diff --check` aprobado; sin diferencias en motor/reducer. SHA-256 del cartel original conservado: `c5422466e098211bc5a4f9e3b54ac9cca15e45d841ad1ee15819a76bc979cad7`.

Durante el desarrollo se corrigieron un `className` duplicado que impedía compilar, la interpolación que no satisfacía la nueva prueba geométrica, el nombre accesible del botón Derivar, un identificador SVG repetido, el semestre partido en móvil y la prioridad de dibujo de la trayectoria. Se repitieron pruebas secuencialmente después de una colisión de archivos temporales provocada por dos procesos Playwright simultáneos; ese fallo de ejecución no se presenta como fallo del producto.

Detector Impeccable: cero hallazgos activos en `src`. Se conserva Space Grotesk mediante la excepción puntual `overused-font` por la identidad existente documentada; no se desactivaron archivos ni reglas completas. No quedan hallazgos deterministas sin resolver en el alcance revisado.

## Capturas comparativas

Se guardaron portada y hero a 360, 390, 768, 1440 y 1920 px. Los capítulos 2, 4 y 5, los estados lento/estable/divergente y la alternativa 2D se compararon a 390 y 1440 px. Se añadieron capturas de oscilación y presentación; las cuatro secciones narrativas posteriores al hero tienen capturas individuales. Se inspeccionaron composición, etiquetas, móvil, geometría y estados.

| Vista | Antes | Después |
|---|---|---|
| Hero escritorio | [v1](visual-v2/before/hero-1440.png) | [v2](visual-v2/after/hero-1440.png) |
| Portada completa móvil | [v1](visual-v2/before/home-390.png) | [v2](visual-v2/after/home-390.png) |
| Jacobiana | [v1](visual-v2/before/chapter-4-1440.png) | [v2](visual-v2/after/chapter-4-1440.png) |
| Laboratorio estable | [v1](visual-v2/before/lab-stable-1440.png) | [v2](visual-v2/after/lab-stable-1440.png) |

Más capturas: [reto](visual-v2/after/reto.png), [circuito](visual-v2/after/mecanismo.png), [dirección](visual-v2/after/direccion.png), [tu turno](visual-v2/after/tu-turno.png), [oscilación](visual-v2/after/lab-oscillating-1440.png), [presentación](visual-v2/after/presentation-1440.png), [2D móvil](visual-v2/after/lab-2d-390.png).

## Entrega y publicación

PR: en preparación. El enlace y estado remoto se incorporarán al abrirla. El workflow omite despliegue en eventos `pull_request`; la v2 no reemplaza todavía Pages. Se comprobó que `main` remoto continúa en `3fbd1a954f5a84842b9eceda7102e2d80c87d104`.

## Limitaciones y siguientes decisiones

No se probó en móviles físicos, Safari/Firefox, lectores de pantalla ni GPU física; WebGL se comprueba con Chromium/SwiftShader. No se certifican FPS en hardware modesto ni métricas de campo. La mejora visual conserva un coste adicional de descarga en escritorio. El caso sigue siendo una observación didáctica y no demuestra generalización. Créditos, bibliografía, cartel y decisión de licencia pendiente se conservan.

La siguiente decisión del usuario es revisar la PR y aprobar, si procede, su fusión y publicación. No es necesario rehacer la aplicación ni reinstalar dependencias para revisar esta entrega.
