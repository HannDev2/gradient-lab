# Desarrollo, mantenimiento y publicación

## Entorno local

Node.js 22.12 o posterior; el workflow usa Node.js 24.

```sh
npm ci
npm run dev
```

Abrir `http://127.0.0.1:5173/gradient-lab/`. El build se previsualiza con `npm run build` y `npm run preview` en el puerto 4173. Los puertos pueden variar si están ocupados; Vite muestra la URL real.

## Dónde modificar

| Cambio | Archivo |
|---|---|
| Datos iniciales y operaciones | `src/math/engine.ts` |
| Historial, presets, límites de pasos y reproducción | `src/state/simulation.ts` |
| Contenido y fundamentos | `src/content/chapters.ts` |
| Interacciones de capítulos | `src/components/Walkthrough.tsx` |
| Instrumentos y controles | `src/components/Laboratory.tsx` |
| Superficie y proyección | `src/scene/geometry.ts` |
| Cámara y recursos GPU | `src/scene/Landscape3D.tsx` |
| Paleta, tipografía y responsive | `src/styles.css` |
| Navegación hash | `src/App.tsx` |

Al cambiar el ejemplo, actualizar pruebas, especificación y textos pedagógicos juntos. El recorrido explica el ejemplo del cartel; los datos del laboratorio son editables y sus gráficas se calculan dinámicamente.

## Comprobaciones

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright usa Chrome del sistema cuando existe `/opt/google/chrome/chrome`; en otros entornos usa el Chromium descargado. Cubre escritorio y móvil emulado. `playwright-report/` contiene resultados y `test-results/` capturas/trazas; no se suben al repositorio.

Para probar la versión publicada, definir `PLAYWRIGHT_BASE_URL` con la URL terminada en `/gradient-lab/` y ejecutar `npm run test:e2e`; no se levanta un servidor local en ese caso.

## GitHub Pages

Repositorio esperado: `gradient-lab`; `vite.config.ts` declara base `/gradient-lab/`. Al renombrarlo hay que actualizar base, favicon y configuración de pruebas/URLs. Elegir **Settings → Pages → Source: GitHub Actions**.

Cada push a `main` ejecuta pruebas matemáticas, TypeScript, build y Playwright. Solo después se empaqueta `dist/` y se publica. Los pull requests se verifican sin desplegar. El job de build lee contenido y metadatos de Pages; el job de despliegue obtiene `pages: write` e `id-token: write`.

Los archivos estáticos y fuentes se alojan con el sitio. El cartel se incorpora como recurso con hash. No hay servicios de aplicación, claves, telemetría ni almacenamiento remoto.

## Límites deliberados

Una sola observación, modelo lineal de tres pesos sin sesgo; no generalización. Máximo 1000 pasos por trayectoria y parada automática frente a pérdida extrema o gradiente prácticamente nulo. Los controles admiten pesos/datos finitos entre −10⁶ y 10⁶ y tasa entre 0 y 1; los límites se muestran como errores de validación. La visualización adapta su dominio y escala vertical.

Los valores visibles en los campos se redondean a 12 cifras significativas para evitar ruido binario; el motor conserva la precisión de JavaScript. El módulo 3D se carga bajo demanda y representa unos 250 kB comprimidos. La versión 2D funciona sin WebGL.

No se ha asignado una licencia al trabajo original sin confirmación de sus autores. Las fuentes y dependencias conservan sus propias licencias.
