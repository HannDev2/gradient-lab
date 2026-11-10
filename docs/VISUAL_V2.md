# Gradient Lab 2.0 — The Living Error Landscape

## Alcance y estado

Rama `feature/visual-v2`, basada en `main` (`3fbd1a9`). La versión pública se conserva. Entrega mediante PR; no fusionar ni publicar sin aprobación del usuario.

- [x] A. Diagnóstico, medidas/capturas iniciales y portada narrativa completa; revisar móvil y escritorio.
- [x] B. Refinar siete capítulos, diagramas y continuidad del movimiento.
- [x] C. Refinar laboratorio, estados y escena; conservar todo el comportamiento.
- [ ] D. Pruebas, comparación de rendimiento, capturas finales, informe y PR.
- [x] Secundario: presentación académica sobre el recorrido, si las fases principales están resueltas.

## Diagnóstico de la versión 1

La portada termina en una sola pantalla; su malla SVG no tiene iluminación, profundidad de materiales ni cámara interactiva completa. La narrativa del aprendizaje aparece como tres palabras, no como una relación explorable. El recorrido usa diagramas precisos pero algunas conexiones no atraviesan visualmente los pesos. Matriz, aportes y actualizaciones tienen poca continuidad espacial. En el laboratorio predominan escalas pequeñas de leyendas y lectura uniforme de instrumentos; el estado oscilante carece de un acceso directo. La superficie usa material sin iluminación y la trayectoria puede confundirse con la cuadrícula.

## Dirección y contrato

Se conserva el observatorio grafito, verde, cian y coral; fuentes locales existentes. Una única guía visual: Impeccable. Animate complementa timing, interrupción y reducción de movimiento. No se añaden dependencias de animación.

Portada en cinco momentos: entrada espacial; datos ocultos a gran escala; circuito de cuatro operaciones; relación entre gradiente y paisaje; invitación instrumental. Cada momento tiene composición y escala propias. El paisaje 3D existente se reutiliza solo en el hero, con carga diferida y render a demanda; no habrá varios renderizadores continuos. Atmósfera CSS y coordenadas SVG se detienen fuera de vista o con movimiento reducido. El scroll se mantiene nativo.

El núcleo matemático y el reducer no se modifican. La sección fija w₃ actual; el historial proyectado y el gradiente normalizado siguen etiquetados. Las fórmulas y valores finales nunca dependen del reloj de animación.

## Verificación requerida

`npm test`, `npm run test:e2e`, `npm run build`. Capturas antes/después en 360,390,768,1440,1920; escenas y capítulos representativos; pruebas de nuevas interacciones, teclado, modo presentación, movimiento reducido, pérdida de contexto y alternativa 2D. `scripts/visual-audit.mjs` registra tamaños gzip y observaciones de carga en el mismo entorno, sin confundir una muestra con benchmark estadístico.

## Evidencia

Las capturas y métricas se guardan en `docs/visual-v2/before` y `after`. Las interacciones pasan 32 pruebas unitarias y 22 pruebas de navegador; build aprobado. Se inspeccionaron portada, capítulos, laboratorio y presentación en móvil y escritorio. El cierre remoto y los resultados comparativos se registran en ESTADO_ACTUAL.md.
