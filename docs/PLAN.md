# Gradient Lab — plan de implementación

**Objetivo:** aplicación educativa completa, precisa, accesible y públicamente verificable.

**Arquitectura:** motor puro de tres dimensiones; reducer único para laboratorio; contenido guiado separado; SVG para instrumentos; escena 3D cargada a demanda; publicación estática.

**Prioridad:** rigor matemático y recorrido completo, laboratorio sincronizado, visuales científicos protagonistas, revisión visual y publicación. Especificación: `MATH_SPEC.md`, `DESIGN_SYSTEM.md` y cartel original.

## Estado y aceptación

- [x] Fase 0. Inspeccionar workspace, skills, cartel, Git y herramientas. Cartel leído e incorporado; sin proyecto preexistente. Restricciones registradas en decisiones.
- [x] Fase 1. Establecer concepto, contenido, arquitectura y especificación matemática. Documentos iniciales creados.
- [x] Fase 2. Scaffold y motor. Escribir pruebas antes del motor; verificar resultados exactos, dimensiones, estabilidad, entradas inválidas y reinicio. `npm test` y TypeScript pasan.
- [x] Fase 3. Siete capítulos completos. Cada uno con visual, fórmula e interacción real; avanzar, retroceder y reiniciar con progreso persistente durante la sesión.
- [x] Fase 4. Laboratorio. Pesos/eta precisos, paso/lote/reproducción/pausa, presets lento/estable/divergente, historial, jacobiana, gradiente y escena correcta con alternativa 2D.
- [x] Fase 5. Refinamiento. Probar escritorio/móvil, teclado, movimiento reducido, fallos WebGL, overflow, gráficas y controles; inspección visual con capturas.
- [x] Fase 6. Build, pruebas finales y documentación. Configurar Actions con permisos mínimos, crear repositorio y publicar solo tras comprobaciones. Verificar sitio público y consola; aportar URLs y guion de demostración.

## Archivos y responsabilidades

`src/math/engine.ts` y pruebas: cálculo/validación/sección. `src/state/simulation.ts`: reducer y seguridad de reproducción. `src/content/chapters.ts`: pedagogía. `src/components/`: navegación, recorrido, laboratorio y gráficas. `src/scene/`: superficie. `src/App.tsx`: rutas hash. `src/styles.css`: tokens y responsive. `tests/`: interacciones y acceso. `.github/workflows/deploy.yml`: pruebas, build y Pages.

## Riesgos que se comprueban

1. Entradas vacías/no finitas conservan el último estado válido y muestran recuperación.
2. Entrenamiento divergente nunca rompe gráficas ni almacena NaN/Infinity.
3. Edición durante reproducción pausa y reinicia la trayectoria coherentemente.
4. Cambiar w₃ reconstruye sección y proyección sin falsear pérdida histórica.
5. Recarga hash, móvil, teclado, movimiento reducido y falta de WebGL conservan el acceso al contenido.

## Publicación

Permisos efectivos comprobados: escritura, red, servidor local y GitHub CLI autenticado. Build, 31 pruebas matemáticas y 14 pruebas de navegador aprobados localmente; Actions publicó desde main y las 14 pruebas se repitieron contra la URL pública con éxito. Repositorio: https://github.com/HannDev2/gradient-lab. Sitio verificado: https://hanndev2.github.io/gradient-lab/. Evidencia detallada en VERIFICATION.md; guion de demostración en DEMO.md.

## Iteración posterior

La evolución visual v2 se conserva en `feature/visual-v2` y PR #1. Su alcance y evidencia se registran en [VISUAL_V2.md](VISUAL_V2.md). Electric Observatory se desarrolla sobre ella en `feature/visual-v3`, con [contrato y comprobaciones v3](VISUAL_V3.md) e [informe actual](ESTADO_ACTUAL.md). La v1 pública permanece como referencia estable; el encargo v3 prohíbe fusionar o publicar todavía.
