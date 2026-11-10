# Sistema de diseño — observatorio del error

Guía principal: Impeccable. El encargo fija la identidad y delega implementación: se conserva su observatorio oscuro sin abrir una ronda de preferencias redundante.

## Contrato visual

El propio cálculo es la imagen protagonista: conexiones que suman aportes y una malla parabólica que revela un valle. La primera pantalla combina título editorial ancho, frase breve, dos acciones y una superficie matemática con coordenadas; no usa fotografía ni ilustración de fondo.

- Fondo #0b0e0d, superficie #111713, divisores #2a342e.
- Texto #eff4e9, secundario #a8b5aa, verde #c5f86b, cian #79dacc, coral #ff9c88.
- Space Grotesk para titulares y texto; IBM Plex Mono para cifras, matrices y medidas, alojadas localmente.
- Escala de separación 4/8/12/16/24/32/48/64/96. Contenido máximo 1440px.
- Superficies planas y bordes finos. Instrumentos con números tabulares y ejes legibles. Verde expresa descenso o resultado actual; coral expresa residuo o divergencia.
- Recorrido: progreso lateral en escritorio, fila compacta en móvil; composiciones distintas para problema, red, comparación, matriz, actualización y resultado.
- Laboratorio: controles a la izquierda; paisaje y mediciones a la derecha. En móvil, orden controles → resultados → paisaje → gráficas.
- No hay etiquetas decorativas encima de titulares, tarjetas de marketing ni falsas métricas.

## Movimiento y acceso

Propósito: explicación y feedback. Cambios de capítulo: 240ms con `cubic-bezier(0.23,1,0.32,1)`; conexiones y actualización numérica responden al estado. La superficie no gira continuamente; cámara a demanda y movimiento reducido. Foco visible, áreas táctiles ≥44px, contraste de texto ≥4.5:1, alternativa 2D y tablas de datos accesibles.

## Verificación

Inspección conjunta escritorio/móvil, teclado, desbordamiento, consola, pérdida sincronizada, cámara y fallos WebGL. Corregir defectos en una pasada y confirmar. La compilación por sí sola no verifica diseño.
