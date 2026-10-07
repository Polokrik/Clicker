/** Icônes d'onglets : un seul jeu de traits, même épaisseur, héritent de la couleur. */
const PATHS: Record<string, string> = {
  // flamme
  forge: 'M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .3 1.2 1 2 2 2 0-3-1-5 1-8z',
  // barres empilées = lingots au râtelier
  rack: 'M4 8h16M4 12h16M4 16h16M7 8v8M17 8v8',
  // pioche
  veins: 'M5 6c4-3 10-3 14 0M12 5v15M9.5 20h5',
  // curseurs de réglage
  workshop: 'M5 7h14M5 12h14M5 17h14M9 5v4M15 10v4M8 15v4',
}

export function TabIcon({ name }: { name: string }) {
  return (
    <svg
      className="tab-icon"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
