<div align="center">

```
 ____                 _____                              
|  _ \  _____   __   |_   _|   _  ___ ___   ___  _ __    
| | | |/ _ \ \ / /     | || | | |/ __/ _ \ / _ \| '_ \   
| |_| |  __/\ V /      | || |_| | (_| (_) | (_) | | | |  
|____/ \___| \_/       |_| \__, |\___\___/ \___/|_| |_|  
                           |___/          C L I C K E R  
```

**De `nano` en tu habitación a sacar tu corporación a la bolsa.**
Un juego web clicker / idle / tycoon con humor sobre el oficio de programar.

![Versión](https://img.shields.io/badge/versión-1.0.0-5af78e?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-0F172A?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8)

</div>

---

## 🧠 ¿De qué se trata?

Arrancás solo, con una terminal negra y un cliente que te escribe:

> *"Mi sobrino dijo que era fácil, pero se fue a jugar a la Play. ¿Me lo terminás?"*

Aceptás contratos, escribís las líneas que piden antes de que venza el plazo y hacés `git push` para cobrar. Con la plata y la experiencia mejorás tus herramientas, aprendés tecnologías, contratás a tu equipo, te mudás de oficina y ascendés de **Freelancer** a **Corporación**. Ahí vendés la empresa, ganás tokens para mejoras permanentes y arrancás otra, más fuerte. Después de varias ventas, salís a la bolsa: ese es el final.

```
aceptar contrato → programar → entregar → cobrar → mejorar → ascender → vender → repetir (pero más grande)
```

La primera venta lleva alrededor de una hora y el juego completo, entre 8 y 12.

## ✨ Lo que vas a encontrar

| | |
|---|---|
| 📋 **Tablón de ofertas** | Clientes ficticios con pedidos absurdos, cada uno con su avatar. Siempre hay uno fácil, uno medio y uno difícil, con una barra que estima si llegás a tiempo. |
| ⏱️ **Contratos con deadline** | El reloj corre desde que aceptás. Si se vence (o renunciás), el cliente "contrata a un primo". |
| ⭐ **Contratos especiales y 👹 jefes** | Ofertas doradas con reglas raras y clientes jefe enormes que dejan cajas de suministros. |
| 💻 **Seis editores** | Cada uno cambia toda la interfaz (ver abajo). |
| 🌳 **Mejoras** | Tecnologías, un árbol personal y uno de empresa en forma de constelación, habilidades activas y un Macro de teclado que clickea solo. |
| 👥 **Equipo** | Ocho profesiones de 1 a 5 estrellas, en un plano de oficina. Pago único, sin sueldos. |
| 🏢 **Etapas y cartas** | Cinco etapas; en cada ascenso elegís una carta de especialización que arma tu build. |
| 🪙 **Prestigio** | Vendés la empresa, ganás tokens, desbloqueás un árbol permanente y probás desafíos de run. |
| 🏺 **Tu setup** | Avatar, títulos, mascota y artefactos de escritorio que dan mejoras para siempre. |
| 🎲 **Sorpresas** | Eventos con decisiones, minijuegos, el bug dorado y más de 70 logros (algunos secretos). |
| 🔔 **Notificaciones y ayuda** | Una campanita con todo lo que pasó y una wiki con buscador (tecla F1). |
| 📱 **Celular** | Se juega igual en el teléfono. |
| 💾 **Guardado local** | La partida queda en el navegador, firmada, y se puede exportar o importar. |

### La escalera de editores

| Editor | Vibe | Bonus |
|---|---|---|
| **Nano** | Terminal negra, sin colores, sin mouse, sin miedo | 1 línea por clic |
| **Bloc de notas** | Windows 98, papel y bisel | +1 línea por clic (¡usás el mouse!) |
| **Notepad** | Windows XP, por fin hay colores | +5 % de crítico |
| **Sublimado Text** | Monokai, pestañas inclinadas y una licencia que nunca compraste | Los críticos valen ×3 |
| **Visual Estudio Code** | El IDE completo, con terminal y minimapa | +1 línea/seg automática |
| **Cladex Code** | Un agente de IA en la terminal | +3 líneas/seg: vos mirás, él programa |

> Y sí, el modo oscuro para los editores claros **se compra**. *(Igual en Ajustes hay una opción de accesibilidad que lo activa gratis, porque la accesibilidad no se cobra.)*

## 💬 Feedback

¿Lo jugaste? Contanos qué te pareció en el [formulario](https://forms.gle/7cdyT5M5PtiNfrRB7) (también está en Ajustes y en la ayuda). Si te gustó, podés [invitarme un café](https://link.mercadopago.com.ar/pablinkidev).

## 🚀 Cómo correrlo

Necesitás [Node.js](https://nodejs.org/) (versión LTS).

```bash
git clone <url-del-repo>
cd dev-clicker
npm install
npm run dev
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo (incluye el panel 🛠 de pruebas, que no existe en producción) |
| `npm run build` | Versión de producción en `dist/` |
| `npm run preview` | Sirve el build localmente |
| `npm test` | Tests de la lógica del juego (Vitest) |
| `npm run lint` | ESLint |
| `npx tsx scripts/simulate.mts --cps 5 --cycles 2 --build mix` | Simula partidas con un bot para medir el ritmo |

La versión sale del `package.json` y se ve en la terminal del juego, en Ajustes y en la ayuda.

## 🛠️ Stack

- **React 19 + TypeScript**: la interfaz, con el estado del juego tipado de punta a punta.
- **Vite**: servidor de desarrollo y build.
- **Tailwind CSS v4**: estilos, con la paleta de cada editor como variables CSS.
- **localStorage**: guardado sin backend.
- **Vitest**: tests del reducer, las cartas, el guardado y el tamaño de las ofertas.
- **Vercel**: deploy, con headers de seguridad (CSP y compañía) en `vercel.json`.

La regla del proyecto es **no sumar dependencias "por las dudas"**: cada librería nueva entra solo cuando resuelve un problema concreto.

## 🗂️ Estructura

```
src/
├── game/          # Lógica pura: reducer, fórmulas, ofertas, equipo, guardado, logros
├── data/          # Todo el contenido como datos: contratos, editores, árboles, jefes, eventos…
├── components/    # Piezas de UI (layout/, editor/, minigames/…)
├── screens/       # Ofertas, Equipo, Empresa, Setup, Mejoras, Ajustes
├── audio/         # Música y efectos generados en el navegador (no se descarga nada)
└── App.tsx
scripts/simulate.mts   # Bot que juega solo para balancear
docs/                  # Backlog, diseño de la 1.0 y preguntas del formulario
```

La lógica vive en **funciones puras** separadas de React (`gameReducer(estado, acción) → estado`): el azar se resuelve afuera y entra en las acciones. React solo dibuja. Así la economía se puede testear y simular sin abrir el navegador.

## 🔒 Seguridad

- El guardado va **firmado**: si alguien lo edita a mano, la partida no se borra, pero queda marcada (y hay un logro burlón).
- El panel de desarrollo solo existe con `npm run dev`; no llega al build.
- No hay secretos en el frontend: los únicos links externos son públicos (formulario, donaciones y auspicio).
- `vercel.json` agrega Content-Security-Policy, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` y HSTS.

## 🤝 Convenciones

- Commits con [Conventional Commits](https://www.conventionalcommits.org/es/): `feat:`, `fix:`, `refactor:`, `docs:`…
- Cada commit compila, pasa los tests y deja el juego jugable.
- Los números de balance viven en `src/data/`, nunca escritos a mano dentro del JSX.

## 📜 Aclaraciones

Los editores, clientes y empresas del juego son parodias ficticias. No hay ninguna relación con los productos reales a los que hacen guiño.

---

<div align="center">

Hecho por **Agustín** · con el apoyo de [**WEARESRV**](https://wearesrv.com/) · con mucho ☕ y algún que otro `!important` del que no está orgulloso.

```
> git push origin main
  remote: deploy exitoso 🚀  ·  v1.0.0
```

</div>
