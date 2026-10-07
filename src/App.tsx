import { useEffect, useMemo, useState } from 'react'
import { useGame } from './store/gameStore'
import { passiveRate } from './engine/economy'
import { isDue } from './engine/scheduler'
import { STR, UI_LANG } from './i18n/strings'
import { Tutorial, tutorialSeen } from './ui/Tutorial'
import { LanguagePicker } from './ui/LanguagePicker'
import { activePackId, choosePack, needsLanguageChoice, packs } from './content'
import { TabIcon } from './ui/components/TabIcon'
import { ForgeScreen } from './ui/screens/ForgeScreen'
import { RackScreen } from './ui/screens/RackScreen'
import { VeinsScreen } from './ui/screens/VeinsScreen'
import { WorkshopScreen } from './ui/screens/WorkshopScreen'
import { LessonScreen } from './ui/screens/LessonScreen'
import { PlacementScreen } from './ui/screens/PlacementScreen'
import { QuickRoundScreen } from './ui/screens/QuickRoundScreen'
import { ChallengeScreen, type ChallengeStart } from './ui/screens/ChallengeScreen'
import { challengeFromHash } from './engine/challenge'
import { WelcomeBackModal } from './ui/WelcomeBackModal'

type Tab = 'forge' | 'rack' | 'veins' | 'workshop'

const TABS: { id: Tab }[] = [{ id: 'forge' }, { id: 'rack' }, { id: 'veins' }, { id: 'workshop' }]

export default function App() {
  const { loaded, init, player, lesson, tickPassive } = useGame()
  const [tab, setTab] = useState<Tab>('forge')
  // Lien de défi reçu (#c=…), uniquement si son pack existe.
  const [incoming] = useState(() => {
    const c = challengeFromHash(location.hash)
    return c && packs[c.pack] ? c : null
  })
  const [chooseLanguage] = useState(needsLanguageChoice)
  const [challenge, setChallenge] = useState<ChallengeStart | null>(
    incoming && incoming.pack === activePackId ? { mode: 'incoming', challenge: incoming } : null,
  )
  const [challengeDismissed, setChallengeDismissed] = useState(false)
  const [placementOpen, setPlacementOpen] = useState(false)
  const [quickOpen, setQuickOpen] = useState(false)
  const [tutorialOpen, setTutorialOpen] = useState(() => !tutorialSeen() && !incoming)

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

  // Premier lancement via un défi : on prend directement la langue du défi.
  if (chooseLanguage && incoming) {
    choosePack(incoming.pack)
    return null
  }
  if (chooseLanguage) return <LanguagePicker />

  function closeChallenge() {
    setChallenge(null)
    history.replaceState(null, '', location.pathname + location.search)
  }

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
            ✦ {Math.floor(player.sparks).toLocaleString(UI_LANG)}
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
      ) : challenge ? (
        <ChallengeScreen start={challenge} onClose={closeChallenge} />
      ) : quickOpen ? (
        <QuickRoundScreen onClose={() => setQuickOpen(false)} />
      ) : placementOpen ? (
        <PlacementScreen onClose={() => setPlacementOpen(false)} />
      ) : (
        <>
          {tab === 'forge' && (
            <ForgeScreen
              onOpenVeins={() => setTab('veins')}
              onOpenPlacement={() => setPlacementOpen(true)}
              onOpenQuick={() => setQuickOpen(true)}
            />
          )}
          {tab === 'rack' && <RackScreen />}
          {tab === 'veins' && <VeinsScreen />}
          {tab === 'workshop' && <WorkshopScreen
              onReplayTutorial={() => setTutorialOpen(true)}
              onOpenPlacement={() => setPlacementOpen(true)}
              onStartChallenge={(scope) => setChallenge({ mode: 'create', scope })}
              onOpenQuick={() => setQuickOpen(true)}
            />}
        </>
      )}

      {!lesson && !placementOpen && !challenge && !quickOpen && (
        <nav className="tabbar">
          {TABS.map(({ id }) => (
            <button
              key={id}
              className={tab === id ? 'active' : ''}
              onClick={() => setTab(id)}
            >
              <TabIcon name={id} />
              {STR.tabs[id]}
              {id === 'forge' && dueCount > 0 && <span className="badge">{dueCount}</span>}
            </button>
          ))}
        </nav>
      )}

      {incoming && incoming.pack !== activePackId && !challengeDismissed && (
        <div className="modal-backdrop" role="alertdialog" aria-modal="true">
          <div className="modal">
            <h2>{incoming.name}</h2>
            <p className="muted" style={{ marginBottom: 16 }}>
              {STR.challenge.mismatch} ({packs[incoming.pack].name})
            </p>
            <button className="primary-btn" onClick={() => choosePack(incoming.pack)}>
              {STR.challenge.switchTo}
            </button>
            <button className="ghost-btn" style={{ marginTop: 10 }} onClick={() => setChallengeDismissed(true)}>
              {STR.challenge.ignore}
            </button>
          </div>
        </div>
      )}

      {tutorialOpen ? (
        <Tutorial onClose={() => setTutorialOpen(false)} />
      ) : (
        <WelcomeBackModal />
      )}
    </div>
  )
}
