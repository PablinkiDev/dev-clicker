# Dev Clicker — Product Backlog hacia 1.0

**Versión actual:** alpha · **Objetivo de 1.0 (MVP final jugable):** un ciclo de partida completo, desde cero hasta el **primer prestigio** (vender la empresa y arrancar otra con ventajas), jugable por amigos sin explicación previa.

**Estrategia:** primero el **esqueleto del ciclo**, es decir, que se pueda llegar al prestigio aunque sea con poco contenido y números provisorios. Después se suman contenido y balance. Así se puede probar el ciclo completo cuanto antes, en vez de descubrir al final que el endgame no funciona.

Prioridad: **M** = imprescindible para 1.0 · **S** = debería estar · **C** = si sobra tiempo · **W** = después de 1.0
Tamaño: cantidad estimada de commits chicos.

---

## ✅ Hecho

- Clic, código, contratos con plazo, entrega, fallo con penalización, ofertas al azar con cooldown
- Editores (Nano → Cladex) con bonus, aspecto elegible, modo oscuro y accesibilidad
- Tecnologías HTML, CSS y JavaScript, con contratos JS
- Árbol personal: Escritura veloz, Código crítico y Pensamiento lógico
- Equipo: Dev, QA y DevOps con estrellas, candidatos, reemplazos y "Buscar otros"
- Oficinas: Habitación y Oficina pequeña
- Guardado en localStorage con migraciones (v18)
- **Hito A completo:** estadísticas, 5 etapas con ascenso, contratos escalados por etapa, oficina corporativa, modo infinito, venta de empresa, árbol de prestigio e historial
- **Hito B (salvo B4 y B10):** contratos por etapa, reputación que escala ofertas, TypeScript/React/Node.js, candidatos 4★–5★, árbol empresarial, Entrega continua, Captación automática y Concentración

---

## Hito A — Esqueleto del ciclo (llegar al prestigio) ✅

| # | Historia | Prioridad | Tamaño |
|---|----------|-----------|--------|
| A1 | **Estadísticas de partida:** dinero ganado total, contratos completados y fallados. Hacen falta para los ascensos, el valor de la empresa y el historial. | M | 1 |
| A2 | **Etapas (5):** datos de cada etapa con requisitos (capital acumulado, empleados, oficina y contratos) y una pantalla para **Ascender** manualmente con su barra de progreso. | M | 2 |
| A3 | **Etapa como llave:** las ofertas, mejoras y oficinas se desbloquean según la etapa. Al ascender, los contratos pegan un salto de código y de recompensas. | M | 1–2 |
| A4 | **Oficina corporativa** (3.ª oficina) | M | 1 |
| A5 | **Modo infinito y valor de la empresa:** después de Corporación, los contratos escalan sin techo y se muestra el valor de la empresa. | M | 1–2 |
| A6 | **Venta de empresa:** una pantalla con el resumen, los tokens que se ganan y una confirmación irreversible. El reset borra todo lo normal y conserva lo permanente. | M | 2 |
| A7 | **Árbol de prestigio:** 6 mejoras (Productividad, Rentabilidad e Innovación), con costo en tokens que se duplica por nivel y un máximo de 5 niveles. | M | 2 |
| A8 | **Historial** de empresas vendidas | S | 1 |

## Hito B — Contenido para que el ciclo dure

| # | Historia | Prioridad | Tamaño |
|---|----------|-----------|--------|
| B1 | **Contratos por etapa:** al menos 3 plantillas (fácil, media y difícil) por etapa y por lenguaje relevante, con clientes satíricos. | M | 3–4 |
| B2 | **La reputación escala las ofertas:** el tablón pasa de 3 a 5 ofertas y aumentan el tamaño y las recompensas (GDD §4). | M | 1 |
| B3 | **Tecnologías nuevas:** TypeScript, React y Node.js, con contratos propios. Las dependencias pasan a requerir nivel 3. | M | 3 |
| B4 | **Una base de datos** (SQL) para los contratos fullstack | S | 1–2 |
| B5 | **Candidatos de 4★ y 5★** según la etapa | M | 1 |
| B6 | **Árbol empresarial:** Trabajo en equipo (+automático) y Gestión del conocimiento (+XP) | M | 1–2 |
| B7 | **Entrega continua:** la entrega se hace sola al completar el código | M | 1 |
| B8 | **Captación automática:** se acepta solo el próximo contrato viable | S | 1 |
| B9 | **Concentración:** potenciador temporal de clics (hasta 60 s) con cooldown | S | 1–2 |
| B10 | Angular, NestJS, Java/Python, MongoDB, Git e IA como tecnologías | W | — |

## Hito D — Diversión (antes de la 1.0)

La 1.0 se atrasa a propósito: primero que enganche.

| # | Historia | Prioridad | Tamaño |
|---|----------|-----------|--------|
| D1 ✅ | **Números grandes:** abreviar ($40,9 B) para que el panel no se rompa | M | 1 |
| D2 ✅ | **Plazo fijo:** el plazo no crece con la etapa ni la reputación; crece el código. El tablón siempre ofrece al menos una oferta posible (anti-traba) | M | 1–2 |
| D3 ✅ | **Peso real de cada tecnología:** tiers de paga por tecnología + especialización (+líneas en sus contratos por nivel) | M | 1–2 |
| D4 ✅ | **Pestaña oculta = se sigue jugando.** Juego cerrado = no avanza (sin progreso offline, a propósito) | M | 1 |
| D5 ✅ | **☕ Café / 🐛 bug dorado:** aparece cada 2–4 min; al tocarlo, producción ×2 por 30 s | M | 1 |
| D6 ✅ | **Eventos al azar** (buenos, malos y con elección), cada 3–6 min | M | 2 |
| D7 ✅ | **Contratos especiales:** oferta dorada ×5 con condición rara (solo clics, sin automatización, plazo corto) | S | 1–2 |
| D8 ✅ | **Logros** (41 en 7 categorías, 3 secretos), cada uno +1 % de producción, permanentes | S | 2 |
| D9 ✅ | **Minijuegos** (3, opcionales, cada 6–10 min): code review, merge conflict y typing race. Premio: equipo ×1,5–×3 por 60 s + XP; sin castigo. Logros LGTM y Senior reviewer (43 en total) | S | 2–3 |
| D10 ✅ | **Música y efectos de sonido** generados con Web Audio (loop lo-fi + 11 efectos), con volumen de música, de efectos y silencio en Ajustes | M | 2 |
| D12 ✅ | **Más mejoras personales:** 8 nodos por etapa (Atajos, Gestión del tiempo, Ojo de halcón, Negociador, Crítico devastador, Memoria muscular, Flow state, Suerte de programador) | M | 1–2 |
| D11 | **Rebalancear** con la simulación actualizada a todo lo nuevo | M | 1–2 |

## Hito C — Listo para amigos (1.0)

| # | Historia | Prioridad | Tamaño |
|---|----------|-----------|--------|
| C1 ✅ | **Exportar e importar la partida en JSON**: sirve de backup y para que te pasen partidas con bugs | M | 1 |
| C2 | **Tutorial liviano:** pistas para la primera oferta, la primera entrega y la primera mejora | M | 1–2 |
| C3 ✅ | **Simulación de balance:** un script que juega solo con `gameReducer` y mide tiempos por etapa. Objetivo: el primer prestigio en 1–2 días casuales y un 2.º ciclo entre 25 y 40 % más rápido. | M | 2 |
| C4 ✅ | **Ajuste de números** según lo que muestre la simulación | M | 1–3 |
| C5 | **Pasada responsive / mobile** en todas las pantallas | S | 1–2 |
| C6 | **Deploy público** (GitHub Pages o Vercel), con la versión visible en el juego | M | 1 |
| C7 | **Forma de juntar feedback** (link a un form o a issues de GitHub, desde Ajustes) | S | 1 |
| C8 | Bug bash final y README actualizado | M | 1 |
| C10 | **Repensar el diseño de los árboles de Mejoras** (los nodos andan, pero el look no termina de convencer) | S | 1–2 |
| C9 ✅ | **Error boundary:** si algo se rompe, mostrar un mensaje con botón para recargar en vez de la pantalla azul | S | 1 |

**Total estimado para 1.0:** ~40 commits chicos.

---

## 📊 Primera simulación (C3) · para la C4

`npx tsx scripts/simulate.mts` (bot a 5 clics/s, vende con 4 tokens):

- Primer prestigio: **16 min**. **Nueva meta (decidida): 2–4 h de juego activo** → hay que estirar ~10×.
  Reparto sugerido: Freelancer 15–20 min · Estudio 25–35 · Startup 35–50 · Empresa tecnológica 45–60 · Corporación/infinito hasta vender 20–40.
- Segundo ciclo: 14 min (solo ~12 % más rápido; meta 25–40 %).
- Editores: Cladex comprado a los **3 min** · primer empleado al minuto (meta 5–8 min).
- Clics: solo **4 %** de las líneas (el GDD quiere que el clic siga importando).
- Contratos vencidos: 0 (los plazos sobran).

## 📌 Decisiones

1. **Requisitos de cada etapa:** etapa 2 = $12.000 acumulados + Oficina pequeña + 2 empleados (GDD); las siguientes escalan ×4–5 y se ajustan con la simulación.
2. **Oficina corporativa:** 12 empleados, $60.000.
3. **Valor de la empresa:** dinero ganado total + valor del equipo (el dinero en mano no cuenta, para que no se pueda inflar).
4. **Tokens:** 3 al primer desbloqueo y después 4, 5 y 6 por hitos de valor (GDD §10). *(propuesta, sin confirmar)*
5. **"Calidad" de los contratos:** queda para después de 1.0; QA solo da XP. *(propuesta, sin confirmar)*
6. **Editores al prestigiar:** se reinician, como todo lo demás (volvés a Nano).
