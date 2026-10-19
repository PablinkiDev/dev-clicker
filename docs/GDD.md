# Dev Tycoon Clicker — Game Design Document

> *Game Design Document — versión maestra 3.0 (consolidación de 27 rondas)*
>
> Especificación de producto, gameplay, economía, interfaz, MVP y roadmap de implementación. Preparado para compartir con colaboradores y asistentes de programación/diseño.
>
> **Fecha de corte:** 18 de octubre de 2026. Estado general: diseño funcional acordado; balance económico, arte y varias dependencias técnicas todavía sujetos a pruebas.

## Índice

- [Cómo leer este documento](#cómo-leer-este-documento)
- [1. Visión y principios de diseño](#1-visión-y-principios-de-diseño)
- [2. Alcance del primer MVP](#2-alcance-del-primer-mvp)
- [3. Núcleo jugable y recursos](#3-núcleo-jugable-y-recursos)
- [4. Contratos y generador de ofertas](#4-contratos-y-generador-de-ofertas)
- [5. Plantilla y profesiones](#5-plantilla-y-profesiones)
- [6. Oficinas, capacidad y etapas](#6-oficinas-capacidad-y-etapas)
- [7. Árbol de tecnologías](#7-árbol-de-tecnologías)
- [8. Árbol personal (normal, se reinicia al prestigiar)](#8-árbol-personal-normal-se-reinicia-al-prestigiar)
- [9. Árbol empresarial (normal, se reinicia al prestigiar)](#9-árbol-empresarial-normal-se-reinicia-al-prestigiar)
- [10. Prestigio: venta de empresa](#10-prestigio-venta-de-empresa)
- [11. Fórmulas técnicas y balance experimental](#11-fórmulas-técnicas-y-balance-experimental)
- [12. UX/UI, estilo y accesibilidad](#12-uxui-estilo-y-accesibilidad)
- [13. Pantallas y componentes para diseñar con Claude](#13-pantallas-y-componentes-para-diseñar-con-claude)
- [14. Stack inicial y decisiones técnicas](#14-stack-inicial-y-decisiones-técnicas)
- [15. Roadmap incremental por commits](#15-roadmap-incremental-por-commits)
- [16. Definición de terminado y QA](#16-definición-de-terminado-y-qa)
- [17. Pendientes y prioridades inmediatas](#17-pendientes-y-prioridades-inmediatas)
- [18. Resumen para compartir con Claude (brief de diseño)](#18-resumen-para-compartir-con-claude-brief-de-diseño)

## Cómo leer este documento

| Marca        | Significado                                                                                  |
|--------------|----------------------------------------------------------------------------------------------|
| **CONFIRMADO** | Decisión expresamente aceptada durante la planificación. Puede evolucionar tras playtesting. |
| **PROPUESTA** | Diseño sugerido pendiente de validación. No presentarlo como requisito cerrado.              |
| **EXPERIMENTAL** | Número o fórmula preliminar a calibrar en simulaciones y pruebas.                            |
| **PENDIENTE** | Decisión no tomada o ambigüedad que debe resolverse.                                         |

**Regla de colaboración:** no introducir nuevas funcionalidades o dependencias sin una necesidad clara; implementar una capacidad por commit, explicando su objetivo y cómo probarla.

## 1. Visión y principios de diseño

Dev Tycoon Clicker es un juego web híbrido clicker/idle/tycoon, con humor y sátira del trabajo de desarrollo de software. El jugador empieza solo, escribiendo líneas de código y aceptando contratos, y termina al frente de una corporación tecnológica. Puede vender la empresa en el endgame y comenzar otro ciclo con ventajas permanentes.

- **CONFIRMADO** — Web para escritorio y celular desde la primera versión.
- **CONFIRMADO** — Progresión de semanas, con objetivo de alcanzar el primer prestigio tras 1–2 días de juego casual activo (objetivo de balance, no garantía).
- **CONFIRMADO** — Recompensas frecuentes y objetivos grandes fragmentados en pequeños; evitar decenas de minutos de clics sin novedades.
- **CONFIRMADO** — Gestión ligera: decisiones significativas, sin saturación de menús, salarios ni administración individual tediosa.
- **CONFIRMADO** — Humor satírico en clientes, proyectos y eventos.
- **CONFIRMADO** — Primera versión con UI moderna y agradable; sprites, personajes y oficinas isométricas se posponen hasta después del MVP funcional.
- **CONFIRMADO** — Priorizar gameplay, economía y claridad antes de construir el apartado artístico.

## 2. Alcance del primer MVP

El MVP incluye UN CICLO COMPLETO desde cero hasta desbloquear y ejecutar el primer prestigio. No implica desarrollar todas las ramas futuras ni contenido artístico final.

| Incluido                                              | No prioritario / fuera del MVP                                         |
|-------------------------------------------------------|------------------------------------------------------------------------|
| Clic manual, código, dinero, reputación, XP           | Pixel art isométrico definitivo y animación elaborada                  |
| Contratos con temporizador, riesgo y recompensas      | Backend, cuentas y multijugador                                        |
| Empleados: Desarrollador, QA y DevOps                 | Microtransacciones; gestión pesada                                     |
| Tres oficinas / cinco etapas empresariales            | Otras profesiones y ramas Mobile, ML, Game Dev como contenido completo |
| Árboles de tecnologías, personal, empresa y prestigio | Motores 2D complejos sin necesidad                                     |
| Guardado local + importar/exportar JSON               | Ranking online y sincronización remota                                 |
| Tutorial guiado del primer contrato                   | Largas secuencias de tutorial                                          |

## 3. Núcleo jugable y recursos

**Ciclo básico** (CONFIRMADO): aceptar contrato → generar exactamente el código requerido (clic y producción automática) → detener producción al alcanzar el objetivo → entregar (manualmente al principio) → recibir dinero, reputación y experiencia → invertir en tecnología, habilidades, empleados u oficinas → nuevos contratos.

| Recurso             | Obtención                                       | Uso                                                                       |
|---------------------|-------------------------------------------------|---------------------------------------------------------------------------|
| Código              | Clic manual y empleados durante contrato activo | Progreso del contrato; vuelve a cero al completarlo                       |
| Dinero              | Solo contratos completados                      | Contratar/reemplazar empleados, comprar oficinas y posibles equipamientos |
| Reputación          | Contratos completados; disminuye por fallos     | Eleva dificultad/tamaño/recompensas de ofertas                            |
| Experiencia (XP)    | Contratos exitosos y pequeña cantidad al fallar | Moneda gastable directamente en tecnologías y habilidades normales        |
| Tokens de inversión | Vender empresa una vez activado el prestigio    | Comprar mejoras permanentes del árbol de prestigio                        |

- **CONFIRMADO** — 1 código por clic inicial. La producción manual sigue siendo relevante en fases posteriores mediante mejoras, críticos y multiplicadores.
- **CONFIRMADO** — Solo se genera código cuando hay contrato activo y pestaña activa.
- **CONFIRMADO** — La producción se detiene exactamente en el objetivo: si contrato pide 15.000, no se acumulan 50.000.
- **CONFIRMADO** — Al finalizar un contrato, código vuelve a cero (no hay excedentes entre proyectos).
- **CONFIRMADO** — Al cambiar de pestaña/cerrar sesión, se pausan producción y cuenta regresiva; sin ganancias offline.
- **PROPUESTA** — Mantener la lógica económica en funciones puras, separadas del rendering React.

## 4. Contratos y generador de ofertas

- **CONFIRMADO** — El jugador elige entre ofertas generadas aleatoriamente, con mínimo una fácil, una intermedia y una difícil; cantidad visible de 3 a 5 según reputación.
- **CONFIRMADO** — Los contratos tienen tecnologías, niveles tecnológicos, determinadas profesiones y calidad mínima como requisitos cuando corresponda.
- **CONFIRMADO** — Los contratos son temporizados: la cuenta regresiva comienza al aceptarlos; existe un proyecto activo inicialmente.
- **CONFIRMADO** — Antes de aceptar, ver código requerido, tiempo límite, recompensa, requisitos y estimación de viabilidad según producción actual.
- **CONFIRMADO** — Ofertas similares repetibles con cooldown aproximado de 3–5 minutos. Deben existir alternativas disponibles.
- **CONFIRMADO** — La dificultad y los requisitos crecen por etapas; las tecnologías determinan clase de proyecto y la reputación escala tamaño/recompensa.
- **CONFIRMADO** — Los contratos evolucionan desde segundos hasta varios minutos; el diseño escala a proyectos grandes para reducir entregas repetitivas.
- **CONFIRMADO** — Entrega manual al principio; autoentrega desbloqueable mediante árbol empresarial. Autocontratos es otra mejora posterior.
- **CONFIRMADO** — Éxito: dinero, reputación y XP; fracaso por agotamiento del tiempo: penalizaciones leves y porcentuales de dinero/reputación, más una pequeña ganancia de XP.
- **CONFIRMADO** — Clientes ficticios con nombres y diálogos humorísticos; no depender de marcas reales.

| Ejemplo experimental        | Código    | Plazo    | Dinero        | XP      |
|-----------------------------|-----------|----------|---------------|---------|
| Cambiar color de botón      | 25–45     | 25–35 s  | \$70–140      | 8–15    |
| Web sencilla                | 80–150    | 45–75 s  | \$180–400     | 20–45   |
| Web interactiva             | 250–500   | 60–120 s | \$500–1.200   | 50–100  |
| Sistema de gestión complejo | 800–2.000 | 2–4 min  | \$1.500–4.000 | 120–300 |

**EXPERIMENTAL** — Valores de prueba, no reglas definitivas. Primer contrato guiado propuesto: “Mi sobrino sabe HTML”, 25 código, 30 s, \$100, +10 XP y +2 reputación.

## 5. Plantilla y profesiones

| Profesión MVP | Rol confirmado                           | Ideas de escalado                        |
|---------------|------------------------------------------|------------------------------------------|
| Desarrollador | Generación automática de código          | Producción según estrellas               |
| QA            | Mejora calidad de proyecto y XP recibido | Calidad para requisitos y bonificaciones |
| DevOps        | Mejora la producción automática          | Bonificación a generadores               |

- **CONFIRMADO** — Contratación de pago único; NO hay salarios periódicos.
- **CONFIRMADO** — Calidad de 1 a 5 estrellas; mejores empleados son significativamente más caros y potentes.
- **CONFIRMADO** — Se compran profesionales de mayor calidad reemplazando otros si la capacidad está llena; al reemplazar NO se recupera dinero.
- **CONFIRMADO** — La capacidad máxima depende solamente de la oficina; sin cupos adicionales por profesión.
- **CONFIRMADO** — El equipo adquirido se conserva al comprar una oficina superior.
- **CONFIRMADO** — Producción de código agregada en una reserva global durante el contrato activo; inicialmente no se asignan empleados a proyectos individuales.
- **PENDIENTE** — Fórmula final de producción/precio de cinco estrellas y si los aumentos de calidad requieren estar presentes en un contrato como requisitos duros.

**EXPERIMENTAL** — Desarrollador ★: \$2.600 y +2 código/s; QA ★: \$3.500 y +10 % XP/calidad; DevOps ★: \$4.500 y +25 % automático. Estos números son referencias, no balance final.

## 6. Oficinas, capacidad y etapas

- **CONFIRMADO** — Tres escenarios de oficina durante el MVP.
- **CONFIRMADO** — Habitación inicial: jugador + 2 empleados adicionales.
- **CONFIRMADO** — Segunda oficina: 6 empleados.
- **CONFIRMADO** — Las oficinas se compran con DINERO, sin requisito adicional para comprarlas.
- **CONFIRMADO** — Las cinco etapas empresariales se ascienden MANUALMENTE al completar capital acumulado, empleados, oficina y contratos.
- **CONFIRMADO** — Ascender desbloquea ofertas y mejoras, sin regalo directo de producción; cada escenario visual permanece igual hasta comprar otra oficina.
- **CONFIRMADO** — Transición de etapa introduce salto relevante en código requerido y recompensas.
- **PENDIENTE** — Tercera oficina: precio y capacidad; umbrales exactos de cada etapa.

| Etapa                   | Perfil                                  | Oficina orientativa | Desbloqueos                                   |
|-------------------------|-----------------------------------------|---------------------|-----------------------------------------------|
| 1\. Freelancer          | Manual, HTML/CSS y primeros clientes    | Habitación          | Primer desarrollador, primeras mejoras        |
| 2\. Estudio             | Contratos más complejos                 | Oficina pequeña     | Automatizaciones y mayor calidad de empleados |
| 3\. Startup             | Contratos fullstack y equipo optimizado | Oficina pequeña     | Tecnologías avanzadas y escalamientos         |
| 4\. Empresa tecnológica | Contratos empresariales                 | Oficina corporativa | Mejoras avanzadas                             |
| 5\. Corporación         | Contratos gigantescos                   | Oficina corporativa | Acceso al modo infinito                       |
| Modo infinito           | Valor de empresa cada vez mayor         | Oficina corporativa | Venta y tokens de inversión                   |

**EXPERIMENTAL** — Primer ascenso podría pedir \$12.000 de capital generado, oficina pequeña y 2 empleados; precio tentativo de oficina pequeña: \$12.000. No es una especificación cerrada.

## 7. Árbol de tecnologías

**CONFIRMADO** — Fundamentos como tronco común y, en MVP, únicamente las ramas Frontend y Backend. Las tecnologías se adquieren y suben hasta niveles (se propuso un máximo de cinco), gastando XP. Subir niveles desbloquea contratos más complejos y aumenta recompensas de contratos asociados.

- **CONFIRMADO** — El jugador comienza con HTML y CSS.
- **CONFIRMADO** — Las dependencias normales requieren tecnología prerequisito al nivel 3.
- **CONFIRMADO** — Elección libre entre ramas disponibles, una vez cumplidas dependencias.
- **CONFIRMADO** — JavaScript participa de Frontend y Backend; TypeScript requiere JavaScript; React requiere JavaScript; Angular requiere TypeScript.
- **CONFIRMADO** — Backend MVP incluye Node.js, Java y Python; bases de datos MySQL, PostgreSQL y MongoDB.
- **CONFIRMADO** — Agregar Git, NestJS y herramientas de IA (referencias a ChatGPT/Claude) como nodos o capacidades transversales por diseñar.
- **PROPUESTA** — Node.js requiere JavaScript nivel 3; NestJS requiere Node.js nivel 3 + TypeScript nivel 3.
- **PENDIENTE** — Costos XP de cada nivel y prerequisitos específicos de Java, Python, bases de datos, Git e IA; la marca de herramientas de IA podría adaptarse a personajes genéricos antes de lanzar.

| Tecnología / nodo            | Dependencia sugerida       | Efecto previsto                              | Estado                       |
|------------------------------|----------------------------|----------------------------------------------|------------------------------|
| HTML / CSS                   | Inicial                    | Contratos web básicos                        | Confirmado inicial           |
| JavaScript                   | Fundamentos / HTML-CSS     | Contratos interactivos y camino a frameworks | Dependencia exacta pendiente |
| TypeScript                   | JavaScript nivel 3         | Desbloqueos TS / Angular / NestJS            | Confirmado                   |
| React                        | JavaScript nivel 3         | Contratos React y mejores recompensas        | Confirmado                   |
| Angular                      | TypeScript nivel 3         | Contratos Angular y mejores recompensas      | Confirmado                   |
| Node.js                      | JavaScript nivel 3         | Backend web y APIs                           | Propuesta                    |
| NestJS                       | Node.js 3 + TypeScript 3   | Contratos backend complejos                  | Propuesta                    |
| Java / Python                | Fundamentos + rama backend | Contratos backend alternativos               | Pendiente                    |
| MySQL / PostgreSQL / MongoDB | Backend / bases de datos   | Contratos persistentes y fullstack           | Pendiente                    |
| Git                          | Fundamentos                | Productividad y/o requisitos de proyectos    | Pendiente                    |
| IA asistida                  | Dependencias por definir   | Bonificaciones de desarrollo                 | Pendiente                    |

## 8. Árbol personal (normal, se reinicia al prestigiar)

**CONFIRMADO** — Mejoras principales y subramas de productividad manual, críticos y concentración. Los clics conservan importancia en juego avanzado. Habrá críticos mejorables y potenciadores temporales de hasta 60 segundos. Bonificaciones de XP aquí y en Empresa.

| Habilidad candidata | Niveles | Costo XP inicial | Efecto sugerido                                                      |
|---------------------|---------|------------------|----------------------------------------------------------------------|
| Escritura veloz     | 5       | 30               | +1 código/clic por nivel                                             |
| Código crítico      | 5       | 75               | +2 puntos porcentuales de probabilidad crítica por nivel             |
| Pensamiento lógico  | 5       | 100              | +5 % XP por nivel                                                    |
| Concentración       | 5       | 250              | Potenciador temporal de producción, nivel modifica duración o efecto |

**EXPERIMENTAL** — Costos de ramas personales y empresariales crecen suavemente: ceil(costo_base × 1,5^(nivel−1)). No duplicar como el prestigio. Falta definir límites para críticos y cooldown de potenciadores.

## 9. Árbol empresarial (normal, se reinicia al prestigiar)

**CONFIRMADO** — Tres subramas Productividad, Calidad y Automatización. Mejoras generales de plantilla, no microgestión por persona. Más importante en fases avanzadas. XP multiplicativa entre grupos Personal/Empresa/QA, con límites configurables.

| Habilidad candidata      | Niveles | Costo XP inicial | Efecto sugerido                                     |
|--------------------------|---------|------------------|-----------------------------------------------------|
| Trabajo en equipo        | 5       | 150              | +5 % producción automática por nivel                |
| Testing avanzado         | 5       | 200              | Mejora calidad de los contratos                     |
| Gestión del conocimiento | 5       | 250              | +5 % XP por nivel                                   |
| Entrega continua         | 1       | 500              | Entrega automática al alcanzar el código objetivo   |
| Captación automática     | 1       | 1.500            | Acepta siguiente contrato viable con reglas seguras |

**CONFIRMADO** — La automatización se desbloquea progresivamente. Autoentrega y autoaceptación son capacidades separadas. Los costos y niveles de la tabla son experimentales.

## 10. Prestigio: venta de empresa

- **CONFIRMADO** — Tras etapa Corporación se abre modo infinito de requisitos crecientes y el jugador elige cuándo vender.
- **CONFIRMADO** — Vender reinicia código, dinero, reputación, XP, empleados, oficinas, tecnologías, habilidades y automatizaciones normales; conserva mejoras permanentes, tokens sobrantes e historial.
- **CONFIRMADO** — Moneda: Tokens de inversión. Primer prestigio inmediato: 3 tokens.
- **CONFIRMADO** — Los tokens adicionales se consiguen por hitos cada vez más costosos de valor empresarial.
- **CONFIRMADO** — Tres subramas: Productividad, Rentabilidad e Innovación.
- **CONFIRMADO** — Mejoras de multiplicadores y ventajas iniciales de recursos; dependencias, máximo de 5 niveles y costos por nivel duplicados.
- **CONFIRMADO** — No hay respec de puntos permanentes; todas las ramas deben ser viables.
- **CONFIRMADO** — Bonos del mismo tipo se SUMAN antes de multiplicar con otros grupos.
- **CONFIRMADO** — Segundo ciclo debe ser sensiblemente más veloz (~25–40 % como objetivo de balance) pero mantiene las cinco etapas.
- **CONFIRMADO** — Pantalla de venta muestra resumen detallado; historial de cada empresa vendida.

| Subrama       | Ejemplos propuestos                                                                        | Costo / escalado                       |
|---------------|--------------------------------------------------------------------------------------------|----------------------------------------|
| Productividad | Código heredado (+10 % manual/nivel), Equipo experimentado (+10 % automático/nivel)        | Base 1 token; nivel n = base × 2^(n−1) |
| Rentabilidad  | Contratos premium (+10 % dinero/nivel), Aprendizaje acelerado (+10 % XP/nivel)             | Base 1 token; nivel n = base × 2^(n−1) |
| Innovación    | Capital semilla (+\$250 iniciales/nivel), Primeros contactos (+5 reputación inicial/nivel) | Base 1 token; nivel n = base × 2^(n−1) |

**EXPERIMENTAL** — Hitos de tokens ejemplo: 3 al desbloquear, luego 4/5/6 con umbrales de valor acelerados. Definir si “valor empresarial” es capital histórico, beneficio neto o métrica compuesta, evitando exploits de gasto/recompra.

## 11. Fórmulas técnicas y balance experimental

| Regla                            | Definición                                                                                          |
|----------------------------------|-----------------------------------------------------------------------------------------------------|
| Tiempo teórico de contrato       | código requerido / código por segundo; considerar clic manual estimado, empleados y multiplicadores |
| Costo habilidad personal/empresa | ceil(costo_base × 1,5^(nivel−1)) — propuesta aceptada de costos suaves                              |
| Costo prestigio                  | costo_base × 2^(nivel−1), máximo nivel 5                                                            |
| Acumulado prestigio              | costo_base × (2^nivel−1)                                                                            |
| XP entre fuentes                 | XPbase × Mpersonal × Mempresa × MQA, con topes por grupo                                            |
| Producción máxima de contrato    | min(código objetivo, código actual + producción durante deltaTime)                                  |
| Pausa                            | si document.visibilityState no es visible, suspender progreso y timers                              |

**EXPERIMENTAL** — Referencia de ritmo: 10–20 s por contrato inicial, 1 código/clic, primer desarrollador a los 5–8 min, primer prestigio tras 1–2 días de juego casual activo. Balancear con playtesting; una simulación previa de 177 contratos/30 min reveló exceso de microtareas y no equivale a una economía validada.

**Riesgos principales:** generación aleatoria de contratos inviables; exceso de clics por entrega; escalado incorrecto entre oficina y etapa; inflación de XP; prestigio con inversiones irreversibles que parezcan trampas. Diseñar siempre un camino de avance accesible.

## 12. UX/UI, estilo y accesibilidad

- **CONFIRMADO** — MVP con estética de web moderna, UI responsive PC/móvil, sin sprites ni assets artísticos especiales.
- **CONFIRMADO** — Prioridad a menú usable, legible y atractivo: estadísticas, tarjeta de contrato, botón Programar, progreso, temporizador, menú sencillo de habilidades/empleados/oficinas.
- **CONFIRMADO** — Evitar exceso de menús y complejidad técnica visible.
- **CONFIRMADO** — Animaciones satisfactorias, principalmente de UI; música de fondo y sonidos opcionales con controles de volumen y silencio.
- **CONFIRMADO** — Arte final futuro: pixel art con oficina isométrica/pseudoisométrica; idealmente assets gratuitos con licencias verificadas, sin obligación de dibujar desde cero.
- **PROPUESTA** — Modo oscuro con panel superior de Código/Dinero/XP/Reputación, zona central de programación y tarjeta de contrato, navegación accesible a tienda/árbol/oficinas/prestigio.
- **PROPUESTA** — Animaciones CSS ligeras: números flotantes, barra de progreso, microinteracciones y celebraciones; respetar preferencia de movimiento reducido.

## 13. Pantallas y componentes para diseñar con Claude

| Pantalla / sección   | Necesidades                                                                                                     |
|----------------------|-----------------------------------------------------------------------------------------------------------------|
| Juego principal      | Cabecera con recursos, Programar, contrato activo, timer, progreso exacto, objetivo próximo y retroalimentación |
| Tablón de contratos  | 3–5 ofertas segmentadas por dificultad, requisitos, estimación de tiempo, recompensas y cooldown                |
| Empleados            | 3 profesiones, estrellas 1–5, producción/bono, precio, capacidad, compra/reemplazo                              |
| Árbol de habilidades | Pestañas Tecnologías / Personal / Empresa / Prestigio; nodos, nivel, costo, dependencias y bloqueo              |
| Oficinas             | Escenario actual placeholder, capacidad y precio para próxima oficina                                           |
| Ascenso empresarial  | Objetivos de capital/empleados/oficina/contratos, avance y botón Ascender                                       |
| Prestigio            | Venta con resumen de empresa, tokens ganables, hito siguiente y confirmación irreversible                       |
| Ajustes/guardado     | Volumen, reducir movimiento, exportar/importar JSON y restauración de partida                                   |
| Tutorial             | Primera oferta y primera entrega guiadas, no más que breves pistas                                              |

**Guía para Claude:** diseñar responsive de escritorio y teléfono, comenzar por una única pantalla central y no crear visualizaciones artísticas isométricas durante el MVP. Preferir diseño limpio con jerarquía, contraste y estados de interacción.

## 14. Stack inicial y decisiones técnicas

**CONFIRMADO** — Empezar pequeño: React + TypeScript + Vite + CSS convencional. No incorporar Zustand, Tailwind, Phaser, Motion ni bases de datos de manera preventiva; añadirlas solo ante problemas concretos.

- Primer estado con useState; separar progresivamente componentes cuando haya necesidad.
- Extraer fórmulas a funciones puras testeables antes de que crezcan demasiado.
- Ciclo de simulación pausado cuando pestaña está oculta.
- Guardado local mediante localStorage y exportación/importación JSON; validar versión y estructura del archivo antes de cargar.
- Trabajar con Git, commits pequeños y una función terminada/probada por commit.
- Vitest puede incorporarse cuando exista lógica de economía para probar; no es requisito del commit 1.

## 15. Roadmap incremental por commits

| Commit                              | Entrega jugable / verificable                                                                    |
|-------------------------------------|--------------------------------------------------------------------------------------------------|
| 01 — feat: add basic click counter  | Proyecto Vite React TS, contador de líneas con useState y botón Programar; estilo moderno básico |
| 02 — feat: add click upgrades       | Mejora manual de código por clic con regla simple                                                |
| 03 — feat: add first contract       | Contrato único de 25 líneas y progreso acotado al objetivo                                       |
| 04 — feat: add contract rewards     | Entrega, reinicio de código y dinero/XP/reputación                                               |
| 05 — feat: add contract timer       | Cuenta regresiva, pausa en pestaña oculta y penalización por fallo                               |
| 06 — feat: add contract offers      | Seleccionar entre ofertas fáciles/intermedias/difíciles                                          |
| 07 — feat: add developer            | Primer empleado genera código automáticamente mientras el contrato está activo                   |
| 08 — feat: add employee capacity    | Habitación con dos puestos y reglas de compra                                                    |
| 09 — feat: add first skill upgrades | Gastar XP en mejoras normales                                                                    |
| 10 — feat: add local save           | Persistencia local, esquema de datos y carga segura                                              |

Hitos posteriores del MVP (orden sugerido, no commits fijos): contratos aleatorios/cooldown; QA y DevOps; estrellas y reemplazos; tecnologías Frontend/Backend; árboles completos; 3 oficinas; 5 etapas y ascensos; automatización; guardado JSON import/export; tablero responsive; tutorial; modo infinito; historial/venta/prestigio; simulación económica y pruebas de regresión.

## 16. Definición de terminado y QA

- Cada commit compila y permite continuar jugando sin romper funciones previas.
- El motor nunca genera código por encima del requisito ni mientras no hay contrato activo.
- Los temporizadores no avanzan al ocultar pestaña y el jugador no recibe progreso offline.
- Se pueden recibir recompensas correctas; fallos aplican pérdidas leves y alguna XP.
- No se generan situaciones sin contratos viables de manera indefinida.
- Las compras respetan dinero/XP/tokens disponibles, capacidad y dependencias.
- La partida se recupera luego de refrescar; importación JSON malformada no destruye el guardado anterior.
- El primer prestigio reinicia todo lo normal y preserva solo progreso permanente definido.
- Interfaz usable en celular, teclado y escritorio; indicadores claros y animación no invasiva.

## 17. Pendientes y prioridades inmediatas

1. Implementar commit 01: proyecto React+TypeScript+Vite con contador +1 y CSS moderno.
2. No extender el stack hasta surgir necesidades reales.
3. Elegir distribución UI del gameplay principal y luego componentes de contratos.
4. Definir contratos iniciales y fórmulas como archivos de datos, no embebidos en JSX.
5. Probar tiempos de 15–30 minutos de juego antes de construir todas las etapas.
6. Balancear costos de tecnologías, personal, empresa, empleados, oficinas y tokens mediante simulaciones.
7. Cerrar tercera oficina, requisitos de ascensos 2–5 y prerequisitos exactos del árbol de tecnologías.
8. Integrar guardado/versionado, exportación e importación de JSON antes de avanzar demasiado.
9. Una vez jugable el primer ciclo, buscar sprites gratuitos y evaluar estilo isométrico final.

## 18. Resumen para compartir con Claude (brief de diseño)

Diseñar una interfaz moderna y responsive de videojuego clicker llamado Dev Tycoon Clicker. Tono humorístico de programación. El gameplay parte de escribir líneas de código, aceptar contratos con límite de tiempo, recibir dinero/reputación/XP, contratar empleados, progresar en cuatro árboles y vender la empresa para prestigiar. Para el MVP NO dibujar escenas pixel art: usar paneles modernos, tipografía clara, jerarquía de recursos, estados de contratos y componentes accesibles. La futura dirección artística es oficina isométrica pixel art, pero no debe complicar el primer prototipo. Prioridad: diversión, legibilidad, feedback inmediato y navegación liviana tanto en escritorio como móvil.

No generar una arquitectura masiva ni incorporar dependencias sin justificación. La primera implementación concreta solicitada es un botón Programar que incrementa el contador de código +1 en React usando useState.

---

*GDD maestro · 18 oct 2026 · Documento vivo*