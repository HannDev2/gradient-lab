# Gradient Lab 3.0 — Electric Observatory

Base: `feature/visual-v2`, `a18e3b0`. Rama de trabajo: `feature/visual-v3`. PR incremental hacia v2; no fusionar ni publicar. Encargo aprobado: luz, profundidad, escala y coreografía más expresivas; conservar motor, estado, funciones, créditos y precisión.

## Diagnóstico y contrato

La v2 usa una superficie opaca verde, líneas de escaso contraste y una cámara distante. La atmósfera apenas se distingue; el cierre verde es plano. La presentación amplía capítulos pero no dirige la exposición completa. La v3 convierte la sección real de pérdida en un campo luminoso: valle cian, alturas verdes, contorno visible y trayectoria localizada. El resplandor pertenece a geometría/datos, no a todas las cajas.

Primera vista: título monumental a la izquierda; superficie dominante y luz cian/verde a la derecha; cifras y vector reales en primer plano. Entrada utilizable de 2.6 s: entorno, contorno, marcador, letras e instrumentos en tiempos distintos. Ambiente lento en tres capas, visible solo mientras la sección está activa; nada de partículas aleatorias o rotación constante.

Presentación: puesta en escena inmersiva de todo el proyecto (entrada + siete capítulos + entrenamiento real + conclusiones/créditos), reutilizando contenido, experimentos y visualizaciones existentes. Flechas, selector de escena, salida, reinicio y reproducción automática opcional con pausa. No avanzar automáticamente al entrar. Pausar al ocultar la pestaña o perder foco; movimiento reducido sin secuencias de desplazamiento. Mantener el modo académico anterior.

Guía principal: Impeccable; Animate complementa movimiento. El brief fija la nueva dirección y delega ejecución: se implementa directamente, sin torneo de conceptos ni otra ronda de aprobación visual. No añadir dependencias ni postprocesado. `src/math` y `src/state` permanecen intactos.

## Plan y comprobaciones

- [x] A. Rama, diagnóstico y baseline v2: capturas existentes verificadas y medidas nuevas de cadencia/carga.
- [x] B. Hero, atmósfera, malla emisiva, entrada y cierre espacial. Comprobar 360/390/768/1440/1920 px.
- [x] C. Conexiones, jacobiana y descenso expresivos, nuevas transiciones de cifras y presentación completa.
- [x] D. Control room, color según estabilidad real, trayectoria y marcador legibles; una escena a demanda.
- [x] E. Unitarias, E2E existentes y nuevos, build; revisión independiente, inspección conjunta desktop/móvil y correcciones. Capturas inicio/3s/paso/transición/circuito/descenso/estable/divergente/presentación/reducido; vídeo WebM y métricas.
- [ ] F. Informe, rama remota y PR hacia `feature/visual-v2`. Confirmar main/v2 y Pages intactos.

## Evidencia que debe cerrar la entrega

Pruebas de navegación de presentación, datos exactos, reproducción/pausa, salida y restauración del laboratorio. Axe, teclado, reduced-motion, fallback/context loss. Comparación de gzip, carga y cadencia rAF con renderer identificado; no llamar FPS reales de GPU a los intervalos de rAF ni suponer 60 FPS en hardware físico.

Riesgos a observar: texto sobre geometría, glow que borre malla, movimiento fuera de vista, trabajo continuo del Canvas, interferencia del modo cinematográfico con el estado del laboratorio, scroll móvil y aparición de cifras intermedias sin distinguirlas del valor matemático.

## Trazabilidad del encargo

| Requisito del brief | Evidencia principal |
|---|---|
| Conservar v2/main, arquitectura y cálculo | Rama v3 basada en `a18e3b0`; comparación sin cambios en motor, reducer o dependencias. Informe de entrega y comprobación de referencias remotas. |
| Luz, profundidad, escala y hero protagonista | `electric.css`, materiales en `Landscape3D`, capturas `visual-v3/before/hero-1440.png` y `after/hero-1440.png`, variantes de 360 a 1920 px. |
| Entrada de 2–3 s sin bloqueo | Coreografía de 2.6 s, vídeo WebM; SVG hasta primer draw verificado en navegador. |
| Fondo vivo con niveles de intensidad | `Atmosphere`, perspectiva, profundidad lenta, luz reactiva y barrido; pausa por visibilidad, reduced-motion y capturas de portada completa. |
| Matemáticas animadas reales | `ChapterExperiment`, conexión de sensibilidad, ascenso/descenso, snapshot único y regresión de valores exactos. Sin deformación de vértices. |
| Control room y ayudas técnicas | Laboratorio estable/divergente, métricas y ayudas de fórmula/unidad con teclado/toque/Escape; pruebas y capturas `lab-*`. |
| Cierre y presentación integral | Cierre SVG, `Cinema`: entrada + siete capítulos + entrenamiento compartido + conclusiones/créditos. Capturas `cinema-*` y vídeo. |
| Acceso, movimiento reducido y fallback | Suites anteriores y v3: teclado, foco, Axe, móvil, fallo WebGL/context loss, SVG/2D y pausa. Sin pruebas físicas de hardware o lector de pantalla. |
| Rendimiento y entrega verificables | Gzip/FCP/cadencia/idle en los JSON de ambas fases; informe actual, pruebas completas, build y PR incremental. No se supone 60 FPS. |

La entrega detallada, límites y resultados están en [ESTADO_ACTUAL.md](ESTADO_ACTUAL.md). El informe de v2 permanece en su rama y commit de base.
