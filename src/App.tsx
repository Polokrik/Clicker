import { useEffect, useMemo, useState } from 'react'
import { useGame } from './store/gameStore'
import { passiveRate } from './engine/economy'
import { isDue } from './engine/scheduler'
import { STR } from './i18n/strings'
import { ForgeScreen } from './ui/screens/ForgeScreen'
import { RackScreen } from './ui/screens/RackScreen'
import { VeinsScreen } from './ui/screens/VeinsScreen'
import { WorkshopScreen } from './ui/screens/WorkshopScreen'
import { LessonScreen } from './ui/screens/LessonScreen'
import { WelcomeBackModal } from './ui/WelcomeBackModal'

type Tab = 'forge' | 'rack' | 'veins' | 'workshop'

const TABS: { id: Tab; icon: string }[] = [
  { id: 'forge', icon: '🔨' },
  { id: 'rack', icon: '🧱' },
  { id: 'veins', icon: '⛏' },
  { id: 'workshop', icon: '⚒' },
]

export default function App() {
  const { loaded, init, player, lesson, tickPassive } = useGame()
  const [tab, setTab] = useState<Tab>('forge')

  useEffect(() => {
    void init()
  }, [init])

  // Revenu passif pendant que l'app est ouverte (tick 5 s).
  useEffect(() => {
    if (!loaded) return
    const interval = setInterval(() => tickPassive(5), 5_000)
    return () => clearInterval(interval)
  }, [loaded, tickPassive])

  const rate = useMemo(
    () => passiveRate(player.items, player.upgrades.anvil),
    [player.items, player.upgrades.anvil],
  )
  const dueCount = useMemo(
    () => Object.values(player.items).filter((i) => isDue(i)).length,
    [player.items],
  )

  if (!loaded) {
    return (
      <div className="app">
        <div className="resting">
          <h2>{STR.appName}</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="hud">
        <span className="hud-title">{STR.appName}</span>
        <span>
          <span className="hud-sparks">
            ✦ {Math.floor(player.sparks).toLocaleString('fr-FR')}
          </span>
          {rate > 0 && (
            <span className="hud-rate">
              +{rate.toFixed(1)}
              {STR.forge.perSec}
            </span>
          )}
        </span>
      </header>

      {lesson ? (
        <LessonScreen />
      ) : (
        <>
          {tab === 'forge' && <ForgeScreen onOpenVeins={() => setTab('veins')} />}
          {tab === 'rack' && <RackScreen />}
          {tab === 'veins' && <VeinsScreen />}
          {tab === 'workshop' && <WorkshopScreen />}
        </>
      )}

      {!lesson && (
        <nav className="tabbar">
          {TABS.map(({ id, icon }) => (
            <button
              key={id}
              className={tab === id ? 'active' : ''}
              onClick={() => setTab(id)}
            >
              <span className="tab-icon">{icon}</span>
              {STR.tabs[id]}
              {id === 'forge' && dueCount > 0 && <span className="badge">{dueCount}</span>}
            </button>
          ))}
        </nav>
      )}

      <WelcomeBackModal />
    </div>
  )
}
