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
