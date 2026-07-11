import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import { useGame } from './store/gameStore'
import { activePack, packs } from './content'

registerSW({ immediate: true })

// Interface de debug minimale (roadmap M1) : état du jeu et contenu en console.
declare global {
  interface Window {
    __forge?: { useGame: typeof useGame; activePack: typeof activePack; packs: typeof packs }
  }
}
window.__forge = { useGame, activePack, packs }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
