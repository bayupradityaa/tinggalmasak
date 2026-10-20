import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#242424] text-white p-6 font-sans">
      <div className="flex items-center justify-center gap-8 mb-8">
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img 
            src={viteLogo} 
            className="h-24 p-2 transition duration-300 hover:drop-shadow-[0_0_2em_#646cffaa]" 
            alt="Vite logo" 
          />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img 
            src={reactLogo} 
            className="h-24 p-2 transition duration-300 hover:drop-shadow-[0_0_2em_#61dafbaa] animate-[spin_20s_linear_infinite]" 
            alt="React logo" 
          />
        </a>
      </div>

      <h1 className="text-4xl sm:text-5xl font-bold mb-8 tracking-tight">Vite + React</h1>

      <div className="bg-[#1a1a1a] p-8 rounded-xl border border-neutral-800 flex flex-col items-center gap-4 shadow-md max-w-md w-full">
        <button
          onClick={() => setCount((count) => count + 1)}
          className="px-5 py-2.5 bg-[#1a1a1a] hover:border-[#646cff] active:scale-95 border border-transparent rounded-lg font-medium transition cursor-pointer text-sm"
        >
          count is {count}
        </button>
        <p className="text-sm text-neutral-400 text-center">
          Edit <code className="bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-200 font-mono">src/App.tsx</code> and save to test HMR
        </p>
      </div>

      <p className="text-neutral-500 text-sm mt-8">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}
