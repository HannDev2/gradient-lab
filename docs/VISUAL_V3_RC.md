# Candidata académica v3 — refinamiento y verificación

Encargo: conservar Electric Observatory y las diez escenas; pulir cifras, ayudas, demostración reproducible, hero y coste de entrada. Rama y PR existentes; sin fusionar ni publicar. Implementación directa conforme a la autonomía delegada por el usuario.

Se reutilizan componentes, reducer y estilos. Se descarta rediseñar o añadir dependencias. La demostración usa el mismo reducer en un estado temporal explícito: entrar en presentación mantiene el laboratorio; iniciar una demo carga los originales en esa demostración y salir conserva el laboratorio del usuario.

- [x] `shared.tsx`: precisión de lectura contextual, valor completo al editar y ninguna escritura por enfocar/desenfocar. Regresión de ida y vuelta y valores próximos a cero.
- [x] `Laboratory.tsx` / `electric.css`: ayuda de una métrica a la vez, en fila propia sin superponer cifras, controles o gráficas; teclado, Escape y cierre exterior. Regresión geométrica móvil/escritorio.
- [x] `Cinema.tsx`: inicio explícito de demo del cartel o divergente desde originales; un paso estable y tres divergentes, estado y conclusión identificados, pausa/reanudación sin pasos duplicados. Regresión desde un laboratorio modificado y repetición reproducible.
- [x] Captura conjunta de hero a 768/1440/1920 y ayudas a 390/1440; corregir defectos de composición observados en una tanda y confirmar.
- [x] Medir entrada antes/después con tres cargas a 1440 y muestras a 768/1920, alta densidad, renderer, cadencia, tareas largas, tamaño de framebuffer y dibujo en reposo. Optimizar solo cuellos de botella observados, conservando el impacto visual.
- [x] Conservar las 42 E2E; ejecutar regresiones, suite matemática, E2E, Axe y producción. Preparar la actualización del informe y PR #2 con evidencia y límites; comprobar el resultado remoto en los checks de esa PR.

Riesgos a comprobar: redondeo que escriba en el estado; Escape que confirme un borrador; ayudas tras scroll/zoom; reanudación duplicada; demo que contamine datos del usuario; conclusión que atribuya el resultado estable a una trayectoria divergente; etiquetas sobre el título en tablet; software presentado como GPU física.

## Resultado de la pasada

La candidata conserva la entrada de 2.6 s, emisión, Fresnel, malla y diez escenas. Se pulen las superficies existentes; no se añaden dependencias ni cambios en `src/math` o `src/state`.

- Cifras: predicción/error a dos decimales y pérdida a cuatro; notación científica cuando un valor no nulo quedaría mostrado como cero. Pesos en controles a seis decimales de lectura, sin ceros sobrantes; al enfocar se expone `String(value)`, el valor completo disponible en JavaScript. Foco/desenfoque o Escape no redondean ni escriben en la simulación. Las cifras siguen siendo resultados calculados, sin interpolaciones ficticias.
- Ayudas: una fila de detalle dentro del flujo, después de las métricas y antes del paisaje. No flotan sobre resultados, controles o gráficas. Botón con estado expandido, Escape, cierre exterior y desplazamiento mínimo al abrir. La regresión comprueba intersecciones geométricas en ambas pantallas y Axe.
- Presentación: «Demostrar el cartel» y «Demostrar divergencia» son acciones explícitas. Crean una demostración temporal usando el reducer existente; el laboratorio personalizado se conserva al entrar/salir. El recorrido normal continúa compartiendo el laboratorio. El enlace académico «Abrir este experimento» conserva su acción explícita de cargar el escenario elegido.
- La secuencia del cartel muestra un paso automático y mantiene 112.14 / 261.2898 para explicarlo. El contraste divergente usa η=0.00008, tres pasos, q=-1.920 y una conclusión calculada que dice «más pérdida». Antes del entrenamiento divergente, los capítulos exponen el caso del cartel. Repetir una demo vuelve a sus originales; restaurarla conserva el laboratorio.
- Si el navegador agrupa avisos temporales, se consumen los pendientes hasta el límite del guion; reanudar no repite pasos. Se verifica repetición y restauración desde pesos/datos/tasa personalizados, pausa/reanudación y conclusión divergente. La ampliación de restauración pasó en ambas pantallas (2/2, 20.4 s).
- Hero: separación de título y etiquetas en tablet, encuadre más ancho de cámara cuando la escena es estrecha, clave con fondo legible. Composición de escritorio conservada; el paisaje continúa siendo protagonista.

## Entrada: medida y optimización

Referencia: build v3 `f9bbf46`. Comparación de producción local, Chromium, viewport de 1000 px de alto y densidad de dispositivo 2. Tres cargas independientes a 1440 y una a 768/1920; sin vídeo, pruebas ni otros navegadores del proyecto ejecutándose durante las muestras. El renderer de todas ellas se identifica como **SwiftShader**. No se obtuvo GPU física.

Se limita el DPR interno a 1 únicamente cuando WebGL identifica SwiftShader, llvmpipe o software. En GPU no identificada como software se conserva el máximo 1.5; móviles/movimiento reducido continúan en 1. No cambian luces, materiales, superficie ni duración. No se fuerza un backend software para la auditoría. Si el navegador oculta la identificación, se mantiene el límite anterior.

| Medida | Antes | Candidata |
|---|---:|---:|
| Framebuffer 1440, alta densidad | 1332×945 | 888×630 |
| Píxeles por fotograma | 1,258,740 | 559,440 (−55.6 %) |
| Mediana de p95 rAF, tres cargas 1440 | 50.0 ms | 33.4 ms |
| Mediana de intervalos >33.34 ms, 1440 | 31 | 13 |
| Mediana FCP, 1440 | 196 ms | 204 ms |
| Mayor tarea larga, mediana entre las tres cargas | 269 ms | 244 ms |
| p95 rAF 768, una carga | 33.3 ms | 16.8 ms |
| p95 rAF 1920, una carga | 50.0 ms | 33.4 ms |
| Dibujos en 500 ms de reposo, todos los anchos | 0 | 0 |

La cadencia rAF **no mide FPS efectivos de GPU**. La entrada mejora en estas muestras software de alta densidad; no se extrapola a GPU física, densidad 1, redes móviles ni dispositivos reales. FCP no mejora en la mediana de 1440 y quedan tareas de más de 200 ms. Durante la entrada puede haber más dibujos, porque se completan más fotogramas: el ahorro está en los píxeles por dibujo, no en eliminar la coreografía. Las muestras únicas no constituyen una distribución estadística.

Datos íntegros: [antes](visual-v3/rc/before/performance.json) y [después](visual-v3/rc/after/performance.json). El JSON aclara el ajuste posterior de posición de la clave de ejes, que no cambia materiales/DPR. Tamaños finales gzip se adjuntan al JSON de después. El chunk Three.js conserva el aviso de Vite por superar 500 kB sin comprimir y sigue diferido.

Recursos finales gzip, mismo método local (nivel 6): JS inicial 92,568 → 92,774 B; CSS 18,056 → 18,122 B; escena diferida 251,556 → 251,698 B; Cinema diferido 3,283 → 3,974 B. El aumento inicial de esta pasada es **272 B gzip (0.25 %)**. Los nombres y tamaños completos están en `finalBundles` del JSON.

## Evidencia visual

| Superficie | Antes | Candidata |
|---|---|---|
| Hero 768 | [Antes](visual-v3/rc/before/hero-768.png) | [Después](visual-v3/rc/after/hero-768.png) |
| Hero 1440 | [Antes](visual-v3/rc/before/hero-1440.png) | [Después](visual-v3/rc/after/hero-1440.png) |
| Hero 1920 | [Antes](visual-v3/rc/before/hero-1920.png) | [Después](visual-v3/rc/after/hero-1920.png) |
| Ayuda móvil | [Antes](visual-v3/rc/before/readouts-390.png) | [Después](visual-v3/rc/after/readouts-390.png) |
| Ayuda escritorio | [Antes](visual-v3/rc/before/readouts-1440.png) | [Después](visual-v3/rc/after/readouts-1440.png) |

Presentación: [elección explícita](visual-v3/rc/after/cinema-start-390.png), [cartel](visual-v3/rc/after/demo-stable-1440.png), [divergencia](visual-v3/rc/after/demo-divergent-1440.png), [conclusión real](visual-v3/rc/after/demo-result-1440.png). La grabación v3 anterior se conserva como evidencia de la transformación; no se presenta como grabación de los controles nuevos.

## Verificación y validación manual

Pruebas de regresión antes del arreglo: cifra pequeña mostrada como cero; pesos largos sin precisión contextual; ayuda sobre métricas; control de demo inexistente; framebuffer software a DPR 1.5. Las comprobaciones de estas causas se mantienen en `shared.test.ts` y `refinement.spec.ts`. Se conservan las 42 E2E anteriores y se añaden 12 ejecuciones (seis casos en dos pantallas). La revisión independiente de código no encontró defectos importantes; fue estática, no sustituyó las inspecciones de navegador.

**33/33 unitarias** y **54/54 E2E locales sobre build estático (3.2 min), sin reintentos**. Incluyen Axe en laboratorio y cierre divergente, además de las rutas y movimiento reducido anteriores. TypeScript y build de producción aprobados. Tras esa suite se ajustó únicamente la posición de etiquetas/controles del hero estrecho; su confirmación específica de **6/6** (hero, primer fotograma y WebGL en ambas pantallas) y los checks remotos de la PR completan la evidencia. [Checks de la PR #2](https://github.com/HannDev2/gradient-lab/pull/2/checks). No se fusiona ni publica.

Validación manual preparada para el expositor:

1. `npm ci`, `npm run dev`, abrir `/gradient-lab/#/presentacion`.
2. Pulsar **Demostrar el cartel**. Dejar avanzar las diez escenas o seleccionar Entrenamiento en vivo y Reproducir. Comprobar 99 → 112.14, 648 → 261.2898 y 59.68 % en el cierre; los pesos tras el paso son 0.3360, 0.3396 y 0.3432.
3. Volver a la primera escena y pulsar **Demostrar divergencia**. En entrenamiento, Reproducir muestra tres pasos: la pérdida crece hasta 32462.5311, con conclusión identificada. Pausar/continuar no repite pasos.
4. Salir y comprobar que el laboratorio personalizado sigue intacto. Probar los tres botones de ayuda con teclado/toque y Escape, un peso con muchos decimales y movimiento reducido.
5. Pendiente de la validación humana: equipo de exposición con GPU física, móvil físico y navegador objetivo. No se garantiza ausencia absoluta de errores ni 60 FPS a partir de pruebas automatizadas.

El formulario y la animación de cifras fueron verificados sin modificar el motor. Space Grotesk mantiene su excepción intencional ya documentada; no se añadieron supresiones ni se ejecutaron auditorías globales repetidas.
