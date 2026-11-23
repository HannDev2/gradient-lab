# Recursos del README

Identidad: Electric Observatory V3. Fondo `#050b0d`, texto `#effcf0`, verde `#c4ff62`, cian `#5cf5e3`; los mismos tokens de `src/electric.css`.

- `hero.svg`: título Space Grotesk 700 convertido a trazados desde la fuente local del proyecto; marca original y sección real de la pérdida con w₃ = 0.3. La malla evalúa L = ½(100w₁ + 110w₂ + 36 − 135)². Es una ilustración estática; las etiquetas y el contexto están en el README.
- `one-step.svg`: resultado del ejemplo del cartel, con η = 0.00001. Pérdida 648 → 261.2898, predicción 99 → 112.14, reducción redondeada 59.68 %. Fuente: `docs/MATH_SPEC.md` y `src/math/engine.ts`.
- `creators.svg`: créditos de Hanniel Cardoso Jaramillo y Angel Joseph Estrada Santos.
- `observatory.gif`: fragmento de la grabación existente `docs/visual-v3/after/video/presentation.webm`, de 6 a 18 segundos. 800×556, 6 fps, 12 segundos, 128 colores. La grabación documenta el recorrido V3 previo al refinamiento; los controles actuales se consultan en el sitio publicado. Con movimiento reducido se muestra automáticamente una captura estática mediante `picture`. Captura alternativa y vídeo completo también se enlazan junto al GIF.

Los SVG incluyen título, descripción y fondo propio; no dependen de fuentes remotas, scripts ni animaciones SVG. Las capturas originales se reutilizan desde `docs/visual-v3/`.

Para regenerar el GIF con FFmpeg:

```sh
ffmpeg -y -ss 6 -t 12 -i docs/visual-v3/after/video/presentation.webm \
  -vf 'fps=6,scale=800:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle' \
  -loop 0 assets/readme/observatory.gif
```

Validación: Markdown procesado por la API de GitHub, SVG renderizados con librsvg, previsualización local a 966 y 390 px en temas claro/oscuro. Las cuatro vistas cargan todas sus imágenes sin desbordamiento horizontal; la previsualización local no sustituye el renderizador matemático de GitHub ni una prueba en un teléfono físico.
