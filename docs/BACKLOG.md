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
| D11 ✅ | **Rebalanceo:** equipo con experiencia por etapa, ofertas dimensionadas a tu producción, requisitos y tokens nuevos | M | 1–2 |

## Hito E — Profundidad (después de la primera partida de prueba)

Primera partida real: ~1 h hasta poder vender (se sintió bien), pero las mejoras se compraban apenas se desbloqueaban y el segundo ciclo (56 min) no se sintió más fuerte. **Nueva meta: primer prestigio en 1–1,5 h.**

| # | Historia | Prioridad | Tamaño |
|---|----------|-----------|--------|
| E1 ✅ | **Precios que escalan:** empleados y "Buscar otros" ×etapa (1/3/15/80/400), la búsqueda se encarece ×1,5 cada vez hasta contratar, VS Code desde Estudio ($600 K) y Cladex desde Startup ($5 M), oficina corporativa $5 M | M | 1 |
| E2 ✅ | **Economía de XP:** la XP crece solo ^0,4 con el agrandado por producción y las mejoras cuestan ×1 / ×1,8 / ×1,8 / ×2 / ×4 según su etapa. Cada árbol se completa hacia el final de su etapa (75–100 %) | M | 1 |
| E3 ✅ | **Árbol Empresa:** de 4 a 10 nodos: Marketing (+★ por contrato), Code review obligatorio (+QA), Kubernetes (+DevOps), Headhunter (candidatos +1★), Home office (+2 puestos) e Inversores (interés sobre el dinero en mano) | M | 2 |
| E4 ✅ | **🤖 Macro de teclado** (Herramientas, con dinero): 1 clic/s desde Startup ($3 M) y 2 clics/s desde Empresa tec. ($40 M), con interruptor. Sus clics no son críticos ni cuentan para logros | S | 1 |
| E5 ✅ | **Prestigio que se siente:** experiencia de fundador (+10 % de producción por token ganado en la carrera), rama Arranque (Portfolio, Licencia vitalicia, Socio fundador, Procesos heredados), mejoras de +50 % hasta Nv.10, Capital semilla $25 K y Primeros contactos +30 ★, comparación de tiempos en el historial. 2.º ciclo: 32–49 % más rápido en la simulación | M | 2–3 |
| E6 ✅ | **Rebalanceo** a 1–1,5 h: con E1–E5 los números ya caen en la meta (ver simulación del Hito E); sin cambios extra | M | 1 |

## Hito F — Sistemas nuevos (ver docs/DISENO-1.0.md)

| # | Historia | Prioridad | Tamaño |
|---|----------|-----------|--------|
| F0 ✅ | 🔓 **Revelado progresivo:** lo que no se desbloqueó no se ve (pantallas, pestañas de Mejoras, Macro, minijuegos). Al desbloquearse aparece una tarjeta "¡Nuevo!" que explica la mecánica en una línea y la pantalla queda con ● hasta visitarla. Se guarda para toda la carrera. Cubre parte de C2 (tutorial) | M | 2 |
| F1 ✅ | 🃏 **Especializaciones:** al ascender se elige 1 de 3 cartas (una por estilo, 10 % rara). 15 cartas: 🖱 Manos rápidas (pianista, críticos, combo, recarga), 🤖 Automatizador (Scrum, Horas extra, plazos, Macro turbo, Crunch sin culpa), ⚖️ Equilibrado (pair, café, cliente fiel, mentoría, todo terreno). Se ven en Empresa → build/. Simulación: cada build gana con su estilo (clicker ~1 h 06 a 5 clics/s; idle mejor para el jugador tranquilo) | M | 3–4 |
| F2 ✅ | ⚡ **Habilidades activas:** barra al lado de Programar con Foco (1), 🏃 Hackatón (2), 🔥 Crunch (3), 👯 Pair programming (4) y ☕ Café doble (5). Se aprenden en el árbol personal (Nv.1–3), con tarjeta "¡Nuevo!". *Balance pendiente: en la simulación aceleran ~30 % el primer ciclo* | M | 3 |
| F3 ✅ | 🏺 **Artefactos y "Tu setup":** 16 artefactos (6 comunes, 4 raros, 3 épicos, 3 legendarios) con niveles 1–10, permanentes. 📦 Cajas: una por jefe, una por venta y compradas con tokens (3, 5, 7… ×1,5). Pantalla nueva Setup: escritorio con siluetas, apertura animada con brillo por rareza y colección. Mismo motor de efectos que las cartas. Simulación: 8 artefactos tras 3 runs | M | 5–6 |
| F4 ✅ | 👹 **Clientes jefe:** desde Estudio, cada 10 contratos llega un jefe al tablón (8 jefes con nombre y frase, algunos con condición): 2× código, 1,5× plazo, paga ×10, XP ×4 y 📦 1 caja. Perder no tiene multa. La Captación automática no los toma. Simulación: 4–5 jefes por run | M | 2–3 |
| F5 ✅ | 🏁 **Desafíos de run:** desde la 2.ª empresa se elige uno opcional al arrancar: 🙌 Manos atadas, 🦥 Equipo con sueño, ⏱ Contrarreloj (+75 % tokens; luego +50 %), 💸 Bootstrapped, 🐧 Nano para siempre, 🃏 Sin especializaciones (+50 %). 1.ª vez: +2 📦. Logros Masoquista y Sufrimiento profesional. *Cambio de diseño: Garage, Lobo solitario y Sin manos se reemplazaron porque trababan los requisitos de ascenso* | S | 2–3 |
| F6 ✅ | 🦄 **IPO:** desde las 12 ventas, botón "Salir a la bolsa" en Empresa (con progreso n/12 desde la primera venta). Pantalla final con la carrera en números y créditos, logro legendario "Leyenda de Silicon Valley" y modo leyenda (seguir jugando; "Ver mi carrera" la vuelve a abrir) | M | 2 |
| F7 ✅ | ⚖️ **Rebalanceo post-F:** los contratos se dimensionan sin el desafío (antes el desafío se anulaba solo y Contrarreloj hasta aceleraba la run). Contrarreloj pasa a plazos ×0,5 y +50 % tokens. Simulación de la carrera completa hasta la IPO (ver abajo) | M | 1 |

## Hito G — Contenido

| # | Historia | Prioridad | Tamaño |
|---|----------|-----------|--------|
| G1 ✅ | 👥 **5 profesiones nuevas:** 🎓 Pasante (barato, 40 % de un dev; cada 1–2 min sorprende o mete un bug), 🎨 Diseñador UX (+6 % paga/★, Estudio), 📋 PM (+4 % plazo/★ sin agrandar el código, máx. +100 %, Startup), 📊 Data Scientist (+2 % suerte/★, Startup), 🧑‍🏫 Tech Lead (+5 %/★ a todo lo de los demás, Empresa tec.). Un candidato por profesión de la etapa. 🌳 Campus: 24 puestos, $1.000 M, desde Corporación. Logros Ciudad universitaria y Equipo multidisciplinario. Simulación: sin cambios en el ritmo | M | 3–4 |
| G2 ✅ | 🎮 **5 minijuegos para no programadores:** 🐛 Aplastá bugs (topo, 20 s; metas 5/10/15; el 🦆 resta 2), 🔌 Conectá los servidores (3 racks de 3/4/5 cables, 30 s), 📦 Ordená el deploy (3 pipelines, un error tira ese deploy, 30 s), 🧠 Memoria de logos (6 pares, 45 s; ⭐ según errores), 💡 Simón dice del servidor (secuencias de 3/5/7). Los 3 de antes quedan marcados 🧑‍💻 para programadores. Panel de dev: lista para jugar cualquiera | M | 4–5 |
| G3 ✅ | 🎲 **Más variedad:** eventos de 30 a 48 (11 ligados a profesiones, 5 a artefactos —incluye ganar 📦—, 2 generales; solo salen si tenés esa profesión/artefacto). 15 clientes nuevos (3 por etapa; Freelancer pasa de 11 a 14 contratos). Los 8 jefes con pedido propio. Logros de 50 a 70 (categoría nueva 🏺 Colección: artefactos, cajas y cartas; más jefes, profesiones, desafíos, IPO, apuestas y minijuegos). Simulación: el bot llega a la IPO con 47/70 | M | 3–4 |
| G4 ✅ | 🎨 **Personalización:** 🏢 nombre y logo (emoji + color) de cada empresa: la primera arranca con un nombre gracioso al azar y se cambia en Empresa; desde la segunda se elige en la pantalla de empresa nueva (con el desafío). Se ve en Empresa, el explorador (o la barra de Nano), la venta, el historial y la IPO. 🧑‍💻 Perfil en Setup (se desbloquea con la primera contratación): avatar (piel, buzo, cabeza y cara; buzo negro/dorado, gorra, antenas, corona, anteojos de sol y bigote se ganan con logros), 13 títulos ganados con logros y 🐈🐕🦆 mascota que pasea por la pantalla (se acaricia) con 6 eventos propios. Logros Mascota feliz y Con facha (72) | M | 4–5 |
| G5 ✅ | ⚖️ **Rebalanceo post-G:** el 🧑‍🏫 Tech Lead estaba roto (uno 5★ en lugar de un dev daba +33 % de producción y lo óptimo era llenar la oficina de leads): pasa a +3 %/★ con tope de +60 %. Ahora uno 5★ da +14 % y lo ideal son 3–4 leads. El resto (profesiones, desafíos, mascotas, artefactos) quedó en rango | S | 1 |

## Hito H — UI y pulido

| # | Historia | Prioridad | Tamaño |
|---|----------|-----------|--------|
| H1 ✅ | ✨ **Animaciones de recompensa:** al cobrar, "+$X" y "+N XP" flotan sobre el HUD y el número rebota; cada compra hace un estallido de chispas donde tocaste; con el 🤖 Macro, un cursor hace clic solo sobre Programar a su ritmo | M | 2 |
| H2 ✅ | 🔔 **Centro de notificaciones:** campanita con contador de nuevas; panel con logros, ascensos, ventas, jefes, cajas, artefactos, eventos, pasantes, minijuegos y contratos vencidos (últimas 60, se guardan y sobreviven a las ventas) | S | 1–2 |
| H3 ✅ | 📊 **Estadísticas:** pestaña nueva en Empresa con los totales de la carrera y dos gráficos de barras (duración y tokens de cada empresa vendida, con detalle al pasar el mouse) | C | 2 |
| H4 ✅ | 🆕 **"¡Nuevo!":** en mejoras recién disponibles (con puntito en su pestaña), profesiones nuevas entre los candidatos y accesorios/títulos ganados; puntito en el menú de esa pantalla. Se marca visto al salir. Las partidas viejas arrancan sin nada "nuevo" | S | 1 |
| H5 | Molestias de UI (lista de Agustín, se va completando) | M | ? |
| H5.1 ✅ | 🏢 **Empresa a pantalla completa:** franja arriba (empresa, línea de etapas, pestañas) y tres columnas: dónde estás (etapa y tu run) · qué sigue (requisitos o venta) · tu carrera (IPO y últimas 3 ventas). Modo infinito y venta en una sola tarjeta. Historial completo en 📊. En el celular se apila con "qué sigue" primero. Sin cajas estiradas: se suman "Tu empresa hoy", "Qué trae [etapa]", "Logros cerca" y "Tus bonus permanentes" | M | 1 |

## Hito C — Listo para amigos (1.0)

| # | Historia | Prioridad | Tamaño |
|---|----------|-----------|--------|
| C1 ✅ | **Exportar e importar la partida en JSON**: sirve de backup y para que te pasen partidas con bugs | M | 1 |
| C2 ✅ | 🧭 **Tutorial liviano:** globitos en la primera partida (elegí este contrato → hacé clic o ESPACIO → entregalo con git push → gastá tu XP), salen del estado del juego y se van solos. El primer tablón ya no trae contratos especiales | M | 1–2 |
| C3 ✅ | **Simulación de balance:** un script que juega solo con `gameReducer` y mide tiempos por etapa. Objetivo: el primer prestigio en 1–2 días casuales y un 2.º ciclo entre 25 y 40 % más rápido. | M | 2 |
| C4 ✅ | **Ajuste de números** según lo que muestre la simulación | M | 1–3 |
| C5 ✅ | 📱 **Pasada mobile:** HUD compacto (4 columnas, sin subtítulos), menú de Nano en una fila deslizable (antes se partía y tapaba pantallas), terminal oculta en el celular (está la 🔔), avisos de logro arriba de los botones. Los árboles quedaron resueltos con C10 | S | 1–2 |
| C6 | **Deploy público** (GitHub Pages o Vercel), con la versión visible en el juego | M | 1 |
| C7 | **Forma de juntar feedback** (link a un form o a issues de GitHub, desde Ajustes) | S | 1 |
| C8 | Bug bash final y README actualizado | M | 1 |
| C10 ✅ | 🌌 **Árboles "constelación":** nodos redondos con anillo de nivel repartidos en todo el ancho, lo comprable late en violeta, panel de detalle a la derecha (abajo en el celular, y se desplaza solo al tocar) con el botón de comprar. Elegido entre 3 opciones | S | 1–2 |
| C9 ✅ | **Error boundary:** si algo se rompe, mostrar un mensaje con botón para recargar en vez de la pantalla azul | S | 1 |
| C11 ✅ | **Ayuda ❓ (y F1):** modal con cómo jugar y una wiki de todo el juego (contratos, equipo, mejoras, etapas, prestigio, extras y atajos). Las tablas salen de los datos del juego | M | 1 |
| C12 ✅ | **Guardado firmado y revisión de seguridad:** el guardado de localStorage va firmado (v19); una partida editada se carga igual, queda marcada para siempre y da el logro secreto "sudo give money" (nunca se borra). 28 tests con Vitest (`npm test`) del reducer, el guardado y las migraciones. `npm audit`: 0 vulnerabilidades. *Pendiente para C6: headers de seguridad (CSP) en el deploy* | M | 2–3 |
| C13 ✅ | **🛠 Panel de desarrollo** (solo `npm run dev`): etapa, dinero, XP, reputación, tokens, dinero ganado, velocidad del reloj ×1–×100, árboles al máximo, completar contrato y disparar eventos, minijuegos y bug dorado | M | 1 |

**Total estimado para 1.0:** ~40 commits chicos.

---

## 📊 Simulación después del rebalanceo (D11)

`npx tsx scripts/simulate.mts --cps N --cycles 2`. El bot incluye el bug dorado (atrapa el 60 %) y los minijuegos (juega el 60 %, 2 de 3 aciertos).

| Ritmo | 1.er prestigio | 2.º ciclo |
|---|---|---|
| 5 clics/s | 2 h 15 – 3 h 05 | 45–60 % más rápido |
| 3 clics/s | 2 h 40 – 4 h 15 | 45 % más rápido (con variación) |
| 1,5 clics/s | 3 h 15 – 3 h 45 | similar o algo más rápido |

- Reparto a 5 clics/s: Freelancer ~16 min · Estudio ~30 · Startup ~30–50 · Empresa tec. ~30–70 · Corporación hasta vender ~25.
- Hay bastante azar entre corridas (sobre todo por las estrellas de los candidatos).
- Clics vs. equipo: 41/59 a 5 clics/s y 19/81 a 1,5 clics/s. El jugador tranquilo ya no queda atrás.
- Todas las mejoras de XP quedan compradas al llegar a Corporación (las últimas se desbloquean recién ahí).

**Cambios del D11**
1. El **equipo gana experiencia por etapa** (contractScale^0,7; el clic usa ^0,5): antes los devs escribían lo mismo en Corporación que en Freelancer.
2. **Ofertas dimensionadas a tu producción:** si sos mucho más rápido que la oferta, el contrato crece (y paga y da XP en proporción) hasta ocupar un 30/45/60 % del plazo (fácil/media/difícil). Antes, al final, cada contrato duraba menos de 1 s (~7.000 por partida).
3. Las ofertas usan **tu ritmo real de clics** (medido en los últimos 30 s, entre 1 y 6) en vez de suponer 5.
4. Requisitos: Estudio $400 K / 30 contratos · Startup $8 M / 70 · Empresa tec. $100 M / 120 · Corporación $500 M / 180.
5. Primer hito de tokens: **$6 B** de valor (antes $110 M).

## 📊 Simulación del Hito E (E6)

6 corridas por ritmo (4 a 1,5 clics/s), 2 ventas cada una. El bot no hace "Buscar otros" ni juega eventos: un jugador real va ~2× más rápido (primera partida real: 1 h 07 donde el bot tardaba 2 h 16).

| Ritmo del bot | 1.ª venta (rango) | Mediana | 2.º ciclo |
|---|---|---|---|
| 5 clics/s | 1 h 38 – 2 h 49 | ~2 h 10 | ~1 h 08 (≈48 % más rápido) |
| 3 clics/s | 1 h 58 – 2 h 37 | ~2 h 10 | ~1 h 10 |
| 1,5 clics/s | 2 h 35 – 4 h 45 | ~3 h 10 | ~1 h 20 |

Estimado para un jugador real: **~1 h 05 la primera empresa y ~35 min la segunda.**

## 📊 Simulación post-Hito F (F7)

Carrera completa: 12 ventas, los 6 desafíos en las ventas 2–7, cajas compradas con los tokens que sobran.

| Bot | 1.ª venta | Run con Manos atadas / Equipo con sueño | Runs normales tardías | IPO |
|---|---|---|---|---|
| 5 clics/s mix | 1 h 04 – 1 h 25 | 45–50 min | 20–30 min | 6 h – 6 h 50 |
| 5 clics/s click | 1 h 23 | ~40 min | 22–40 min | ~7 h |
| 5 clics/s idle | 1 h 19 | ~54 min | 26–36 min | ~7 h 45 |
| 2 clics/s mix | 1 h 33 | 47 min – 1 h 05 | 30–42 min | ~9 h 10 |

Las runs tardías las frena la cantidad de contratos (30/70/120/180), no el dinero. Al llegar a la IPO: 11–14 de 16 artefactos y casi ningún legendario (queda colección para el modo leyenda).

## 📊 Simulación post-Hito G (G5)

Carrera completa (12 ventas, desafíos en las ventas 2–7), después del ajuste del Tech Lead:

| Bot | 1.ª venta | Runs tardías | IPO |
|---|---|---|---|
| 5 clics/s (click / idle / mix) | 1 h 09 – 1 h 23 | 20–45 min | 6 h 25 – 7 h 56 |
| 2 clics/s (click / idle / mix) | 1 h 43 – 2 h 39 | 25–60 min | 9 h 26 – 12 h |

Al llegar a la IPO el bot tiene 47–52 de 72 logros y 12–14 de 16 artefactos.

## 📌 Decisiones

1. **Requisitos de cada etapa:** etapa 2 = $12.000 acumulados + Oficina pequeña + 2 empleados (GDD); las siguientes escalan ×4–5 y se ajustan con la simulación.
2. **Oficina corporativa:** 12 empleados, $60.000.
3. **Valor de la empresa:** dinero ganado total + valor del equipo (el dinero en mano no cuenta, para que no se pueda inflar).
4. **Tokens:** 3 al primer desbloqueo y después 4, 5 y 6 por hitos de valor (GDD §10). *(propuesta, sin confirmar)*
5. **"Calidad" de los contratos:** queda para después de 1.0; QA solo da XP. *(propuesta, sin confirmar)*
6. **Editores al prestigiar:** se reinician, como todo lo demás (volvés a Nano).
