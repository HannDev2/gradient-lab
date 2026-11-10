# Decisiones

1. **Aplicación aislada en `gradient-lab/`.** El workspace inicial está vacío salvo montajes internos de solo lectura; `.git` en la raíz no es un repositorio utilizable. No se alteran esos montajes ni archivos ajenos.
2. **Fuente primaria incorporada.** El usuario añadió `Cartel.pdf`; se leyó texto e imagen y se conserva copia en `docs/`. La interfaz no reutiliza escudos o logotipo NVIDIA. Solo se enlaza el documento original como fuente académica.
3. **Skills.** Ponytail guía el alcance; Impeccable es la única guía visual principal; Animate complementa únicamente timing y movimiento; planificación y TDD organizan arquitectura y pruebas; Agent Reach orienta comprobaciones GitHub y lectura de fuentes, usando la integración oficial disponible. No se activan guías visuales superpuestas ni se instalan skills.
4. **Autonomía.** El usuario entregó especificación detallada y pidió continuar integralmente sin interrumpir decisiones rutinarias. Esa instrucción sustituye las rondas de aprobación de diseño de las skills. El concepto fijado en el encargo prevalece sobre variantes aleatorias.
5. **Stack solicitado.** Vite, React, TypeScript estricto, SVG para gráficas y Three.js/React Three Fiber bajo demanda. Fórmulas semánticas con texto/HTML legible; no se añade KaTeX para fórmulas que no lo necesitan.
6. **Una fuente de verdad.** Reducer puro para estado e historial. Inputs y pesos inician un nuevo experimento; eta modifica el siguiente paso sin reescribir pérdidas anteriores.
7. **Sección y proyección honestas.** Ver `MATH_SPEC.md`: recalcular el historial sobre w₃ actual y etiquetar la proyección; las pérdidas temporales permanecen reales.
8. **Rutas hash.** Compatible con recarga directa en Pages. Sin backend, cuentas, telemetría ni cotizaciones reales.
9. **Licencia pendiente.** No se asume consentimiento de ambos autores para una licencia del trabajo original. Se conservan avisos de dependencias.
10. **Restricciones iniciales.** Shell sin acceso de red ni sockets loopback; npm no resuelve DNS. GitHub CLI informa token inválido, pero la integración GitHub reconoce HannDev2. `HannDev2/gradient-lab` devuelve 404 al comenzar. No confundir esto con un despliegue.

11. **Permisos recuperados.** Tras la actualización del usuario, red, loopback, instalación npm y autenticación GitHub CLI funcionan. Se mantiene el stack solicitado.
12. **Pruebas de revisión.** Revisor independiente confirmó cartel e historial y señaló overflow en contornos con entradas subnormales; se reemplazó la división ilimitada por intersecciones normalizadas dentro del dominio y se añadieron regresiones. El ciclo WebGL distingue desmontaje normal de pérdida real.
13. **Detector visual.** Advierte uso frecuente de Space Grotesk; se conserva la decisión tipográfica documentada, combinada con IBM Plex Mono solo para datos. No hay otros hallazgos deterministas.
