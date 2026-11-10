# Guion de demostración — 4 minutos

## 0:00–0:25 · El experimento

Abrir la portada: «La idea no es adivinar precios. Es ver cómo el cálculo vectorial permite aprender de un error». Aclarar que los precios son hipotéticos. Pulsar **Comenzar experimento**.

## 0:25–0:55 · Predecir y destapar

Capítulo 1: señalar las entradas 100, 110 y 120; revelar el objetivo 135. Capítulo 2: inspeccionar una conexión. «Con pesos de 0.3, las contribuciones son 30, 33 y 36; al sumarlas obtenemos 99. Los pesos no tienen que sumar uno».

## 0:55–1:25 · Medir el error

Capítulo 3: comparar 99 con 135. «El error es −36: quedamos por debajo. La pérdida es ½(−36)² = 648. El error tiene signo; la pérdida cuadrática no». Alternar ambas vistas.

## 1:25–2:10 · Jacobiana y regla de la cadena

Capítulo 4: **Construir jacobiana**. «Una salida, tres pesos: una matriz de 1 × 3. Cada entrada mide la sensibilidad de la predicción a ese peso». Pulsar **Mover w2**: 0.01 cambia la salida en 1.10. «La regla de la cadena conecta la pérdida con la salida y la salida con los pesos. Multiplicamos cada sensibilidad por −36 y obtenemos (−3600,−3960,−4320)ᵀ».

## 2:10–2:45 · Corregir y comprobar

Capítulo 5: comparar ascender y descender; elegir **Descender** y **Actualizar los tres pesos**. «Restar un gradiente negativo aumenta estos pesos. Todos usan el mismo estado anterior». Pesos: 0.3360, 0.3396 y 0.3432. Capítulo 6: **Después**. La predicción pasa a 112.14, la pérdida a 261.2898: 59.68 % menos. «Mejoró, pero todavía no acertó».

## 2:45–3:40 · El laboratorio

Capítulo 7: abrir el escenario estable. Mostrar la superficie y rotar la cámara. «Tenemos tres pesos. Esta superficie usa w₁ y w₂, con w₃ fijo en el valor indicado. Es un valle: una observación no determina tres pesos únicos». Ejecutar un paso y un lote; señalar pérdida, predicción, gradiente e historial sincronizados. Explicar que el historial sobre la superficie es una proyección recalculada, mientras las gráficas temporales guardan pérdidas reales.

Seleccionar **Divergente** y ejecutar un lote. «Para estas entradas, el límite es 2/36500. Un paso demasiado grande cruza el valle y aumenta el error». Restablecer. Si no hay WebGL, usar la alternativa 2D y explicar las curvas de igual pérdida.

## 3:40–4:00 · Qué aprendimos

«La jacobiana mide sensibilidades; la regla de la cadena construye el gradiente; el descenso usa ese gradiente para ajustar los pesos. Esto demuestra mejora en un dato de entrenamiento, no generalización ni predicción financiera». Abrir **Fundamentos** para mostrar el cartel, las fuentes y los créditos.
