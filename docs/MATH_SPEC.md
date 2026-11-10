# Especificación matemática

Fuente primaria: `Cartel.pdf`. Precios ficticios en USD, sin sesgo. Vectores columna x,w ∈ ℝ³; predicción escalar.

| Magnitud | Definición | Caso inicial |
|---|---|---|
| Entradas | x | (100,110,120) |
| Objetivo | y | 135 |
| Pesos | w | (0.3,0.3,0.3) |
| Predicción | ŷ = w·x | 99 |
| Error | e = ŷ−y | −36 |
| Pérdida | L = e²/2 | 648 USD² |
| Jacobiana | J = [x₁ x₂ x₃] ∈ ℝ¹ˣ³ | [100 110 120] |
| Gradiente | ∇wL = Jᵀe | (−3600,−3960,−4320)ᵀ |
| Tasa | η | 0.00001 |
| Actualización simultánea | w' = w−η∇L | (0.3360,0.3396,0.3432) |
| Predicción posterior | w'·x | 112.14 |
| Error posterior | w'·x−y | −22.86 |
| Pérdida posterior | (w'·x−y)²/2 | 261.2898 |
| Reducción | 100(1−L'/L) | 59.6775 % → 59.68 % |

Los pesos no están normalizados ni obligados a sumar uno. La neurona no es un promedio ponderado normalizado.

## Estabilidad y límites numéricos

e(t+1) = (1−η‖x‖²)e(t). Para x≠0, 0<η<2/‖x‖² converge en la dirección identificable. ‖x‖²=36500 y el límite es 0.0000547945205479452. η=1/‖x‖² resuelve este único caso en un paso (salvo redondeo). η=2/‖x‖² mantiene la magnitud del error y alterna su signo. Valores mayores divergen si e≠0. η=0 conserva los pesos. x=0 produce gradiente cero y no permite aprender y≠0.

Validar longitud 3 y números finitos en toda frontera pública. Rechazar tasas negativas, iteraciones no enteras/fuera de límite y operaciones que excedan el dominio finito. El simulador detiene reproducción ante convergencia, divergencia extrema, límite de pasos o error numérico, conserva el último estado válido y explica el motivo.

## Superficie 3D

Coordenadas (w₁,L,w₂), sección con c=w₃ actual fijo:

L_c(a,b) = ½(x₁a+x₂b+x₃c−y)².

La Hessiana de la sección es vvᵀ, v=(x₁,x₂); es de rango 1 cuando v≠0. Hay un valle parabólico con dirección plana (x₂,−x₁), no un cuenco aislado. El vector en el plano de pesos es −e(x₁,x₂).

La trayectoria original cambia los tres pesos: sus puntos viven en diferentes secciones. En la sección actual se muestran las coordenadas históricas (w₁,w₂) con la pérdida **recalculada a c actual**, bajo la etiqueta «proyección del historial sobre w₃ actual». El marcador del estado actual sí tiene su pérdida real. Una explicación visible distingue proyección y trayectoria original. La gráfica temporal siempre usa las pérdidas originales reales. La escala vertical y cualquier recorte se etiquetan.

## Pruebas de aceptación

Valores de la tabla con tolerancia de punto flotante, diferencias finitas del gradiente, identidad de la recurrencia, cero tasa, cero gradiente, frontera oscilante, divergencia, reinicio, reproducibilidad, validación NaN/Infinity/dimensiones y corrección de la sección/proyección. Ninguna mejora en estos datos prueba generalización.
