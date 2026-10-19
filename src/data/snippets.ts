// Líneas de código que se van "escribiendo" en el editor. Son decorado: se repiten en loop.

const TIA_NORMA = [
  '<!-- hecho con amor y sin dormir -->',
  '<!DOCTYPE html>',
  '<html lang="es">',
  '<head>',
  '  <title>La web de Norma</title>',
  '  <link rel="stylesheet" href="estilos-final-v3-AHORA-SI.css">',
  '</head>',
  '<body>',
  '  <header class="hero">',
  '    <h1>Bienvenidos a mi página web</h1>',
  '    <marquee>¡¡TORTAS!!</marquee> <!-- lo pidió ella -->',
  '  </header>',
  '  <main>',
  '    <img src="gato-con-lentes.jpg" alt="Michi">',
  '    <p>Hacemos tortas por encargo</p>',
  '    <!-- TODO: preguntarle qué es un "footer" -->',
  '    <button onclick="alert(\'hola\')">Contacto</button>',
  '    <p>Pedidos por WhatsApp (no por mail)</p>',
  '  </main>',
  '  <footer>© 2026 Norma Corp</footer>',
  '</body>',
  '</html>',
  '<!-- no tocar, funciona y no sé por qué -->',
  '<!-- listo para producción™ -->',
  '<!-- sobrino: te debo un fernet -->',
]

const GENERIC_HTML = [
  '<nav class="navbar">',
  '  <a href="/">Inicio</a>',
  '  <a href="/nosotros">Nosotros</a>',
  '</nav>',
  '<section class="hero hero--grande">',
  '  <!-- el cliente quiere "algo así pero distinto" -->',
  '  <h1>Bienvenidos</h1>',
  '  <p>Lorem ipsum, como dijo el cliente</p>',
  '</section>',
  '<section class="grid">',
  '  <article class="card">',
  '    <h2>Producto destacado</h2>',
  '    <span class="precio">$ consultar</span>',
  '  </article>',
  '</section>',
  '<style>',
  '  .grid { display: grid; gap: 1rem; }',
  '  .card { border-radius: 12px; } /* moderno™ */',
  '</style>',
  '<!-- responsive: rezar -->',
  '<footer>Hecho por un genio incomprendido</footer>',
]

const GENERIC_CSS = [
  '/* boton-mas-grande.css — v47 */',
  '.btn-comprar {',
  '  font-size: 64px;',
  '  padding: 2rem 6rem;',
  '  background: linear-gradient(gold, orange);',
  '  animation: titilar 0.3s infinite;',
  '  z-index: 999999; /* por las dudas */',
  '}',
  '@keyframes titilar {',
  '  50% { opacity: 0; }',
  '}',
  '.btn-comprar:hover {',
  '  transform: scale(1.5) rotate(3deg);',
  '  cursor: pointer !important; /* perdón */',
  '}',
  '.inversores { display: none; }',
]

/** Las líneas que corresponden a un contrato */
export function snippetsFor(contractId: string, lang: 'html' | 'css' = 'html'): string[] {
  if (contractId === 'mi-sobrino') return TIA_NORMA
  return lang === 'css' ? GENERIC_CSS : GENERIC_HTML
}
