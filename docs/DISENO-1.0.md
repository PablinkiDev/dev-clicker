# Dev Clicker — Diseño de la 1.0

> Estado: **aprobado** (22/10/2026). Quedan abiertas la condición de la IPO y la lista de UI.

## 1. Visión

La beta funciona: el ciclo se entiende y la primera run dura lo que queríamos (~1–1,5 h). El primer tester lo resumió así: *"me gustó, es bastante simple, le falta contenido"*.

La 1.0 sale **a lo grande**: todo lo de este documento entra antes de lanzar.

### Pilares

1. **Dopamina constante.** Siempre hay algo a punto de pasar: una compra, un evento, una caja o un logro. Nunca más de 1–2 minutos sin una recompensa.
2. **Decisiones, no solo progreso.** Hoy todos compran todo en el mismo orden. En la 1.0, cada run se arma distinta: clicker, idle o mixta.
3. **Colección entre runs.** Algo que se junta a lo largo de muchas ventas: artefactos, logros y un setup propio.
4. **Para cualquiera.** Temática de programación, pero jugable sin saber programar.

### Duración

| Capa | Meta |
|---|---|
| Primera run | 1–1,5 h |
| Runs siguientes | bajan hasta 20–30 min |
| Juego completo (final: IPO) | **8–12 h**, en unas 10–15 ventas |
| 100 % (todos los logros y artefactos al máximo) | 20 h o más, para los fanáticos |

---

## 2. Cadencia de recompensas (el "reloj de la dopamina")

| Cada… | Pasa… | Hoy | 1.0 |
|---|---|---|---|
| clic | número que vuela, crítico | ✅ | + combos visuales |
| 20–60 s | contrato entregado ("ka-ching") | ✅ | ✅ |
| 1–3 min | algo para comprar | ✅ (E1/E2) | ✅ |
| 2–4 min | 🐛 bug dorado | ✅ | ✅ |
| 3–6 min | 🎲 evento | ✅ | + eventos nuevos |
| 6–10 min | 🎮 minijuego | ✅ (3) | 8 minijuegos |
| ~10 contratos | 👹 **cliente jefe** → caja de artefacto | ❌ | **nuevo** |
| cada ascenso (~15 min) | 🃏 **elegir una especialización** | ❌ | **nuevo** |
| cada venta | tokens + 📦 **caja garantizada** + desafío nuevo | parcial | **nuevo** |
| 10–15 ventas | 🦄 IPO: final del juego | ❌ | **nuevo** |

---

## 3. Hito F — Sistemas nuevos

### F1. 🃏 Especializaciones (las builds)

Al **ascender de etapa** aparecen **3 cartas**, una de cada estilo, y elegís **una**. Son 4 elecciones por run, una por ascenso. Al vender la empresa se pierden y en la próxima run elegís de nuevo.

| Estilo | Idea | Ejemplos de cartas |
|---|---|---|
| 🖱 **Manos rápidas** (clicker) | el clic manda | "Dedos de pianista": clics ×2 · "Combo": cada 10 clics seguidos, +50 % · "Crítico en cadena": un crítico hace más probable el siguiente |
| 🤖 **Automatizador** (idle) | el equipo manda | "Scrum de verdad": equipo ×2 · "Turno noche": el equipo sigue sin contrato y acumula código para el próximo · "Contratación masiva": devs −30 % de precio |
| ⚖️ **Equilibrado** (mixto) | lo mejor de los dos | "Pair programming": cada clic suma 2 s de producción del equipo · "Café para todos": Concentración también potencia al equipo |

- Cada estilo tiene un mazo de unas 8 cartas y salen 3 al azar (una por estilo), así que **cada run es distinta**.
- Las cartas se **apilan**: elegir 4 veces Manos rápidas arma una build clicker pura.
- ✅ **Cartas raras:** 10 % de chance, borde dorado, mucho más fuertes (tipo Hades).

### F2. ⚡ Habilidades activas

Una **barra de habilidades** al lado del botón Programar (hoy solo está 🎯 Foco). Se desbloquean en el árbol personal; las cartas de Manos rápidas las potencian.

| Habilidad | Efecto | Recarga |
|---|---|---|
| 🎯 Concentración | clics ×2 (×3 con Flow state) | 2 min (ya existe) |
| 🏃 Hackatón | clics ×5 durante 10 s | 5 min |
| 🔥 Crunch | equipo ×3 durante 30 s, después ×0,5 durante 30 s | 4 min |
| 👯 Pair programming | durante 20 s, cada clic suma 1 s de producción del equipo | 3 min |
| ☕ Café doble | recarga las demás habilidades | 10 min |

- Atajos de teclado 1, 2, 3, 4 y 5.

### F3. 🏺 Artefactos — "Tu setup"

Objetos de tu escritorio que dan mejoras **permanentes** (sobreviven a las ventas). Se coleccionan a lo largo de todo el juego: es el motor de las 8–12 h.

**Cómo se consiguen:** 📦 **cajas de suministros**:
- 👹 al ganarle a un cliente jefe,
- 1 garantizada en cada venta,
- comprándolas con tokens (precio creciente).

**Cómo funcionan:**
- Cada caja da un artefacto al azar según su rareza. Los repetidos **suben de nivel** el artefacto (Nv.1 a Nv.10).
- **Rarezas:** ⚪ común · 🔵 raro · 🟣 épico · 🟡 legendario. Abrir la caja tiene animación y sonido: es un momento de dopamina.
- **Pantalla "Tu setup":** un escritorio dibujado donde aparecen los artefactos que tenés. Es la **personalización** principal (ver G4).

**Primeros ~20 artefactos (borrador):**

| Artefacto | Rareza | Efecto (por nivel) | Estilo |
|---|---|---|---|
| ⌨️ Teclado mecánico | común | +clics | 🖱 |
| 🖱 Mouse gamer | común | +probabilidad de crítico | 🖱 |
| 🖥 Monitor ultrawide | común | +producción del equipo | 🤖 |
| ☕ Taza infinita | común | Concentración dura más | 🖱 |
| 🪴 Plantita | común | +XP | ⚖️ |
| 🎧 Auriculares con cancelación de ruido | raro | eventos malos más cortos | ⚖️ |
| 🪑 Silla ergonómica | raro | recarga de habilidades más rápida | 🖱 |
| 📚 Libro de patrones de diseño | raro | +dinero por contrato | ⚖️ |
| 🦆 **Patito de goma** | épico | los contratos piden menos código | ⚖️ |
| 🤖 Servidor en el placard | épico | +velocidad de la Macro de teclado | 🤖 |
| 🧲 Imán de nevera "It works on my machine" | épico | más contratos especiales | ⚖️ |
| 💻 Laptop con stickers | épico | +tokens al vender | ⚖️ |
| 🏆 Trofeo de hackatón | legendario | Hackatón ×10 | 🖱 |
| 🔮 Bola de cristal de Stack Overflow | legendario | ganás siempre la primera apuesta de cada run | ⚖️ |
| … | | | |

✅ **Todos los artefactos están activos siempre** (sin límite de equipados): las decisiones ya están en las cartas.

### F4. 👹 Clientes jefe

Cada ~10 contratos aparece en el tablón un **cliente jefe**: una oferta enorme con reloj estricto, una condición especial y un nombre propio (por ejemplo "El Banco Que Usa COBOL", "La Startup Que Pivotea Cada Hora" o "El Cliente Que Quiere Que Sea Como Facebook").

- **Si ganás:** dinero ×10 y una 📦 caja de suministros.
- **Si perdés:** solo se pierde la oportunidad (no hay castigo extra).
- Hay un jefe por etapa y otros en el modo infinito, con dificultad creciente.

### F5. 🏁 Desafíos de run

Al empezar una empresa nueva (después de la primera venta), podés elegir un desafío opcional:

| Desafío | Regla | Premio |
|---|---|---|
| 🙌 Manos atadas | tus clics escriben ×0,25 | +75 % de tokens |
| 🦥 Equipo con sueño | el equipo produce ×0,5 | +75 % de tokens |
| ⏱ Contrarreloj | plazos ×0,5 | +50 % de tokens |
| 💸 Bootstrapped | los contratos pagan ×0,6 | +50 % de tokens |
| 🐧 Nano para siempre | no podés cambiar de editor | +50 % de tokens |
| 🃏 Sin especializaciones | no hay cartas al ascender | +50 % de tokens |

> Cambio al implementar: "Garage", "Lobo solitario" y "Sin manos" se reemplazaron porque trababan la partida (los requisitos de ascenso piden oficina y empleados, y sin clics no se puede arrancar).

- Completar cada desafío por primera vez da **2 📦 cajas extra**, y hay logros por completar uno y todos.

### F6. 🦄 Final: la IPO

✅ **Vender 12 empresas** habilita la **salida a la bolsa**:
- una pantalla final con estadísticas de toda tu carrera, créditos y un logro legendario;
- después podés **seguir jugando** ("modo leyenda"), con todo lo que juntaste.

---

## 4. Hito G — Contenido

### G1. 👥 Profesiones nuevas (de 3 a 8) ✅

Cada una **cambia una mecánica**; no es solo otro "+%".

| Profesión | Qué hace | Desde |
|---|---|---|
| 🎓 Pasante | muy barato, produce poco; a veces mete un bug (−código), a veces sorprende | Freelancer |
| 🎨 Diseñador UX | +paga por contrato (el cliente "ve" lo lindo) | Estudio |
| 📋 Project Manager | +plazo en todos los contratos | Startup |
| 📊 Data Scientist | mejora las chances de eventos buenos y apuestas | Startup |
| 🧑‍🏫 Tech Lead | potencia a todos los demás empleados (+% por estrella) | Empresa tec. |

✅ **4.ª oficina: 🌳 Campus**, con 24 puestos (28 con Home office), desde Corporación. *"Tobogán, cervecería artesanal y nadie sabe dónde queda tu escritorio."*

### G2. 🎮 Minijuegos para no programadores (de 3 a 8) ✅

| Minijuego | Cómo se juega |
|---|---|
| 🐛 Aplastá bugs | topo: los bugs asoman del código, tocalos antes de que se escondan |
| 🔌 Conectá los servidores | unir cables del mismo color sin cruzarlos |
| 📦 Ordená el deploy | arrastrar los pasos al orden correcto (test → build → deploy) |
| 🧠 Memoria de logos | encontrar pares de íconos de tecnologías |
| 💡 Simón dice del servidor | repetir una secuencia de luces que se alarga |

- Los 3 actuales (code review, merge conflict y typing race) siguen, pero se marcan como "🧑‍💻 para programadores".
- ✅ Por ahora **no** se eligen los minijuegos en Ajustes: aparecen todos.

### G3. Más variedad en lo que ya existe

- **Eventos:** de 30 a ~45, incluidos eventos ligados a profesiones y artefactos.
- **Contratos:** clientes nuevos por etapa, y que los jefes tengan textos propios.
- **Logros:** de 43 a ~70, para artefactos, desafíos, jefes, especializaciones y la IPO.

### G4. 🎨 Personalización (sin editores)

Los editores quedan como están. La personalización nueva va por otro lado:

| Qué | Cómo |
|---|---|
| 🏢 **Nombre de tu empresa** | lo elegís al empezar cada run (con sugerencias graciosas al azar). Aparece en el título, la venta y el historial |
| 🎨 **Logo** | un emoji y un color de fondo. Se ve en el panel y en el historial |
| 🧑‍💻 **Tu avatar** | personaje simple: buzo, color, accesorios (gorro, anteojos, auriculares). Algunos accesorios se desbloquean con logros |
| 🖥 **Tu setup** | el escritorio con tus artefactos (F3) |
| 🏷 **Títulos** | un título que se gana con logros y elegís mostrar ("Cazador de bugs", "Rey de las startups") |
| 🐈 **Mascota de la oficina** | gato, perro o pato. Camina por la pantalla y a veces dispara un evento propio ("el gato se acostó en el teclado") |

---

## 5. Hito H — UI y pulido

Ya anotados:
- **C10:** rediseño de los árboles de mejoras.
- **C5:** pasada responsive y mobile.
- **C2:** tutorial liviano para la primera vez.

Propuestas nuevas:
- Números que "saltan" al ganar dinero o XP, barras que se llenan con animación y efectos al comprar.
- **Centro de notificaciones:** historial de lo que pasó (logros, eventos, cajas), para no perderse nada.
- **Pantalla de estadísticas** con gráficos de la carrera.
- Un **indicador "¡Nuevo!"** en todo lo que se desbloquea.

❓ **Lista de molestias de UI:** se define más adelante.

---

## 6. Orden propuesto

| Hito | Contenido | Commits (estimado) |
|---|---|---|
| **F** | F2 habilidades → F1 especializaciones → F4 jefes → F3 artefactos → F5 desafíos → F6 IPO | 20–25 |
| **G** | G4 personalización → G1 profesiones → G2 minijuegos → G3 variedad | 15–20 |
| **H** | UI y pulido | 8–12 |
| **C** (lo que queda) | tutorial, deploy, feedback, bug bash | 4–6 |
| | **Rebalanceo** después de F y después de G | 2–4 |

Total: unos **50–65 commits**.

## 7. Decisiones

| # | Tema | Decisión |
|---|---|---|
| 1 | Cartas raras | ✅ Sí, 10 % |
| 2 | Artefactos equipados | ✅ Todos activos |
| 3 | Condición de la IPO | ✅ 12 ventas |
| 4 | Campus | ✅ Sí, 24 puestos |
| 5 | Elegir minijuegos | ✅ Por ahora no |
| 6 | Molestias de UI | ❓ Más adelante |

## 8. Riesgos y cómo los cuidamos

1. **🧮 Multiplicadores apilados.** Cada sistema tiene un **presupuesto de poder** (cuánto puede multiplicar como máximo) y la simulación se actualiza en cada hito para verificarlo.
2. **🤯 Saturar al jugador nuevo.** Los sistemas se **revelan de a uno**, con un aviso "🔓 ¡Nuevo!": cartas en el primer ascenso, jefes desde Estudio, cajas en la primera venta, desafíos en la segunda run.
3. **⚖️ Build clicker viable.** La simulación tiene un bot clicker y uno idle, y los dos tienen que llegar al prestigio en tiempos parecidos.
4. **💾 Partidas guardadas.** Tests automáticos (Vitest) del reducer, el guardado y las migraciones antes de sumar estado nuevo.
5. **📱 Celular.** Minijuegos y barra de habilidades diseñados para el dedo desde el principio.
