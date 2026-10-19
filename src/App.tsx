import { useState } from 'react'

function App() {
  // Estado: cuántas líneas de código escribió el jugador
  const [lines, setLines] = useState(0)

  function program() {
    // Usamos la forma con función para partir siempre del valor más reciente
    setLines((prev) => prev + 1)
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-10 p-4">
      <header className="text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">Dev Tycoon</h1>
        <p className="font-mono text-sm text-muted">Etapa 1 · Freelancer</p>
      </header>

      <section className="text-center">
        <p className="font-mono text-sm text-faint">// líneas escritas</p>
        <p className="font-mono text-7xl font-extrabold text-green">
          {lines.toLocaleString('es-AR')}
        </p>
      </section>

      <button
        type="button"
        onClick={program}
        className="h-20 w-full max-w-md cursor-pointer rounded-2xl bg-linear-to-b from-[#6dffa0] to-[#2fd36b] text-2xl font-extrabold text-[#062312] shadow-[0_5px_0_#17803f] transition-[transform,box-shadow] duration-75 active:translate-y-1 active:shadow-[0_1px_0_#17803f]"
      >
        Programar
        <span className="block font-mono text-xs font-semibold opacity-70">+1 línea</span>
      </button>
    </main>
  )
}

export default App
