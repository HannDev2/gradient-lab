# Instrucciones de Gradient Lab

- Leer `docs/MATH_SPEC.md`, `docs/DESIGN_SYSTEM.md` y `docs/PLAN.md` antes de cambiar el modelo o la experiencia.
- Mantener las fórmulas en `src/math`, el estado en `src/state`, el contenido en `src/content`, las gráficas en `src/components` y la escena en `src/scene`.
- El cartel `docs/Cartel.pdf` es la fuente primaria; no fijar resultados numéricos en la interfaz.
- Interfaz, errores y documentación de producto en español. Etiquetar todos los controles y respetar teclado y movimiento reducido.
- Un solo estado matemático para todos los instrumentos del laboratorio. Editar pesos o datos inicia una nueva trayectoria; cambiar eta conserva el historial.
- No proyectar pérdidas de estados con distintos w3 sobre una sola sección como si fueran su trayectoria. Recalcular explícitamente la sección con w3 actual y etiquetar cualquier proyección.
- Ejecutar pruebas matemáticas, comprobación TypeScript y build antes de publicar. No declarar despliegue exitoso sin evidencia remota.
- Actualizar el estado del plan y el informe de verificación con evidencia, sin convertir pendientes en logros.
- No añadir licencia, credenciales, telemetría ni servicios de servidor sin autorización correspondiente.
