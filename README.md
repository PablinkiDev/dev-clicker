<div align="center">

```
 ____                 _____                              
|  _ \  _____   __   |_   _|   _  ___ ___   ___  _ __    
| | | |/ _ \ \ / /     | || | | |/ __/ _ \ / _ \| '_ \   
| |_| |  __/\ V /      | || |_| | (_| (_) | (_) | | | |  
|____/ \___| \_/       |_| \__, |\___\___/ \___/|_| |_|  
                           |___/          C L I C K E R  
```

**De `nano` en tu habitación a vender tu corporación tech.**
Un juego web clicker / idle / tycoon con humor sobre el oficio de programar.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-0F172A?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8)
![Estado](https://img.shields.io/badge/estado-en_desarrollo-ffcb6b?style=for-the-badge)

</div>

---

## 🧠 ¿De qué se trata?

Arrancás solo, con una terminal negra y un cliente que te escribe:

> *"Mi sobrino dijo que era fácil, pero se fue a jugar a la Play. ¿Me lo terminás?"*

Aceptás contratos, escribís las líneas de código que piden antes de que venza el plazo y hacés `git push` para cobrar. Con la plata y la experiencia mejorás tus herramientas, aprendés tecnologías, contratás a tu equipo y te mudás de oficina. Al final podés **vender la empresa** y empezar de nuevo con ventajas permanentes.

```
aceptar contrato → programar → entregar → cobrar → mejorar → repetir (pero más grande)
```

## ✨ Lo que vas a encontrar

| | |
|---|---|
| 📋 **Tablón de ofertas** | Clientes ficticios con pedidos absurdos. Siempre hay uno fácil, uno medio y uno difícil, con una estimación de si llegás a tiempo. |
| ⏱️ **Contratos con deadline** | El reloj corre desde que aceptás. Si se vence, el cliente "contrata a un primo". |
| 💻 **Editores que evolucionan** | Tu entorno de trabajo cambia a medida que progresás (ver abajo). |
| 🌳 **Árboles de mejora** | Tecnologías, habilidades personales y de empresa, todo pagado con XP. |
| 👥 **Equipo** | Desarrolladores, QA y DevOps de 1 a 5 estrellas. Pago único, sin sueldos. |
| 🏢 **Oficinas y etapas** | De Freelancer a Corporación, pasando por cinco etapas empresariales. |
| 🪙 **Prestigio** | Vendés la empresa, ganás Tokens de inversión y empezás un nuevo ciclo más rápido. |
| 💾 **Guardado local** | Tu partida queda en el navegador y podés exportarla o importarla como JSON. |

### La escalera de editores

Cada editor se compra con dinero, cambia toda la interfaz y suma un bonus:

| Editor | Vibe | Bonus |
|---|---|---|
| **Nano** | Terminal negra, sin colores, sin mouse, sin miedo | 1 línea por clic |
| **Bloc de notas** | Windows 98, papel y bisel | +1 línea por clic (¡usás el mouse!) |
| **Notepad** | Windows XP, por fin hay colores | +5% de crítico |
| **Sublimado Text** | Monokai y un recordatorio de licencia eterno | Los críticos valen x3 |
| **Visual Estudio Code** | El IDE completo, con terminal | +1 línea/seg automática |
| **Cladex Code** | Un agente de IA en la terminal | +3 líneas/seg: vos mirás, él programa |

> Y sí, el modo oscuro para los editores claros **se compra**. Tus ojos te lo agradecen. *(Igual hay una opción de accesibilidad en Ajustes que lo activa gratis, porque la accesibilidad no se cobra.)*

## 🚀 Cómo correrlo

Necesitás [Node.js](https://nodejs.org/) (versión LTS).

```bash
git clone <url-del-repo>
cd dev-tycoon
npm install
npm run dev
```

Abrí la URL que muestra Vite en la terminal y a programar.

| Comando | Qué hace |
|---|---|
| `npm run dev` | Levanta el servidor de desarrollo |
| `npm run build` | Genera la versión de producción en `dist/` |
| `npm run preview` | Sirve el build localmente para probarlo |

## 🛠️ Stack

- **React + TypeScript**: la interfaz, con el estado del juego tipado de punta a punta.
- **Vite**: servidor de desarrollo y build.
- **Tailwind CSS**: estilos, con los temas de cada editor como variables.
- **localStorage + JSON**: guardado, sin backend (por ahora).

La regla del proyecto es **no sumar dependencias "por las dudas"**: cada librería nueva entra solo cuando resuelve un problema concreto.

## 🗂️ Estructura (prevista)

```
src/
├── game/          # Lógica pura del juego: fórmulas, economía, generador de ofertas
├── data/          # Contratos, editores, árboles y empleados como datos
├── components/    # Piezas de UI (ActivityBar, ContractPeek, CodeView, Terminal…)
├── screens/       # Código, Ofertas, Equipo, Mejoras, Ajustes
└── App.tsx
docs/
├── GDD.md         # Game Design Document
└── prototipo/     # Demo HTML de referencia visual
```

La lógica del juego vive en **funciones puras** separadas de React (`tick(estado, dt) → estado`). React solo dibuja. Así la economía se puede testear y simular sin abrir el navegador.

## 🎨 Prototipo

En [`docs/prototipo/`](docs/prototipo/) hay una demo HTML jugable que define cómo se ve y se siente el juego: los seis editores, el tablón, el árbol de mejoras y el equipo. **Es una referencia visual, no código para copiar**: está hecha a propósito en un solo archivo y con manipulación directa del DOM.

Abrila directo en el navegador. La barra 🧪 de abajo a la izquierda permite saltar entre editores y darte dinero o XP para probar.

## 🤝 Convenciones

- Commits con [Conventional Commits](https://www.conventionalcommits.org/es/): `feat:`, `fix:`, `refactor:`, `docs:`…
- Cada commit compila y deja el juego jugable.
- Los números de balance viven en `src/data/`, nunca escritos a mano dentro del JSX.

## 📜 Aclaraciones

Los editores, clientes y empresas del juego son parodias ficticias. No hay ninguna relación con los productos reales a los que hacen guiño.

---

<div align="center">

Hecho por **Agustín** · con mucho ☕ y algún que otro `!important` del que no está orgulloso.

```
> git push origin main
  remote: deploy exitoso 🚀
```

</div>