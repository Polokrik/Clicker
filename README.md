# La Forge des Mots ⚒

Jeu mobile web de type clicker/idle pour l'apprentissage des langues, fondé sur
la répétition espacée (**FSRS**), le rappel actif progressif et l'apprentissage
par chunks. Les mots sont des lingots : on les martèle pour les chauffer, ils
refroidissent avec la courbe de l'oubli, et les mots maîtrisés génèrent un
revenu passif d'étincelles.

Première déclinaison : **français → anglais** (A1–B1).

## Lancer

```bash
npm install
npm run dev        # développement
npm run build      # production (PWA installable, 100 % offline-first)
npm test           # vitest (moteur, file, économie, contenu)
```

## Architecture

| Dossier | Rôle |
|---|---|
| `src/engine/` | Moteur pur, testé : wrapper ts-fsrs, mapping réponse→grade, file de sélection, tiers, économie, Levenshtein |
| `src/content/` | Schémas Zod + packs de contenu JSON statiques |
| `src/store/` | État de jeu Zustand + persistance IndexedDB (idb-keyval), export/import JSON |
| `src/ui/` | Écrans (Forge, Râtelier, Filons, Atelier, Leçon) et les 5 exercices |
| `src/audio/` | TTS Web Speech API avec fallback silencieux |
| `src/i18n/` | Textes d'interface centralisés |

### Multilingue

Le contenu vit dans des **packs par paire de langues** :
`src/content/packs/fr-en/` (manifeste `pack.json` + une veine par fichier
`veins/*.json`). Les items utilisent des champs génériques (`translation`,
`example_translation`), la langue étant portée par le pack
(`sourceLang`/`targetLang`/`ttsLang`). Décliner le jeu vers une autre langue =
déposer un nouveau dossier de pack, zéro changement de code.

### Concepts clés (voir la spec complète)

- **Chaleur = retrievability FSRS × 100** : le refroidissement affiché est la
  courbe de l'oubli du modèle, re-forger un item dû restaure sa chaleur.
- **5 tiers cognitifs** pilotés par la `stability` FSRS : QCM → cloze → saisie
  clavier (tolérance typo Levenshtein ≤ 1) → construction de phrase → audio.
  Un échec ne fait jamais redescendre de tier.
- **Veines** : leçons en 3 phases (Prospection → Extraction → Versement dans
  la file FSRS globale, interleaving total).
- **Économie** : étincelles par frappe (combo, soufflet), revenu passif des
  items Trempés+ (enclume, plafond hors-ligne étendu par la cheminée).
  Les upgrades n'achètent jamais de la connaissance.

### Debug

`window.__forge` expose le store (`useGame.getState()`) et les packs en console.

## État de la roadmap

- ✅ M1 — Moteur (FSRS, file, grades, IndexedDB, offline, simulation 30 j en tests)
- ✅ M2 — Les 5 types d'exercices
- ✅ M3 — Veines (12 veines de contenu réel, ~110 items, 3 filons)
- ✅ M4 — Économie, forge, « Pendant ton absence », habillage
- 🔜 M5 — Alliages, sons, équilibrage (playtest des seuils de temps et coûts)
