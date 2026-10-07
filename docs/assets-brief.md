# Brief d'assets — Word Forge

Direction visuelle et prompts pour générer les visuels du jeu avec une IA d'image.
Les prompts sont en anglais (les modèles d'image le comprennent mieux).

## Direction : « atelier éclairé par la forge »

- **Concept :** un atelier sombre où la seule lumière vient du métal chaud. La couleur = la chaleur du mot.
- **Médium :** illustration plate à aplats, éclairage de contour doux, léger grain de papier. **Pas** de photoréalisme, **pas** de rendu 3D brillant (ils jurent avec l'interface et font « IA générique »).
- **Palette stricte** (celle de l'app) : acier `#0b0e14` / `#121722`, braise `#ff6b35`, or `#ffd166`, gris acier `#9aa5b5`. Aucun violet, aucun néon.
- **Pas de texte, pas de logo, pas de signature** dans les images.

### Phrase d'ancrage (à coller au début de CHAQUE prompt)

> Flat-shaded editorial illustration, limited palette of deep steel navy (#0b0e14), ember orange (#ff6b35) and warm gold (#ffd166), soft rim lighting from a forge, subtle paper grain, hand-crafted look, no text, no logo, no watermark.

## Priorité : commencer par 2 images, pas 10

Teste la **cohérence** avec `ingot_0` et `ingot_4` avant de générer le reste. Si les deux ne semblent pas de la même famille, ajuste la phrase d'ancrage (ou fixe un « style reference » / seed dans ton outil), puis continue.

## 1. Lingots — 5 états de chaleur (les vrais personnages du jeu)

- **Usage :** remplace le trapèze gris. Un par palier de maîtrise.
- **Format :** PNG **fond transparent**, 1024 × 512, lingot centré avec ~15 % de marge, vue 3/4 légèrement du dessus, même taille et même angle sur les 5.
- **Fichiers :** `public/art/ingot_0.png` … `ingot_4.png`
- **Fond transparent :** si ton outil ne sait pas, génère sur fond uni vert pur `#00ff00` ou gris neutre, puis détoure (remove.bg, Photoshop, Photopea, etc.).

Gabarit (remplace `[STATE]`) :

> [ANCHOR PHRASE] A single metal ingot bar, trapezoid shape with beveled top face, three-quarter view from slightly above, centered, plain solid background, [STATE]. Consistent size and angle, crisp edges, no scene, no hands, no tools.

`[STATE]` pour chaque fichier :

| Fichier | Palier | `[STATE]` |
|---|---|---|
| `ingot_0` | Raw ore | cold bluish-grey unrefined metal, rough pitted surface, no glow |
| `ingot_1` | Heated | dull dark red glow along the edges, surface still rough |
| `ingot_2` | Forged | orange glowing metal, smoother surface, faint hammer marks |
| `ingot_3` | Tempered | bright orange-gold, polished with clear hammer marks, strong warm glow |
| `ingot_4` | Mastered | white-gold incandescent, mirror-polished, one small simple diamond-shaped engraved mark, radiant glow |

## 2. Scène de la forge (écran d'accueil / premier lancement)

- **Usage :** remplace l'illustration vide de l'écran « Your forge is ready ».
- **Format :** WebP ou PNG, **1080 × 1350 (4:5)**. Fichier : `public/art/forge_hero.webp`
- **Mise en page :** sujet dans la moitié supérieure, **le tiers inférieur reste sombre et calme** (le titre et le bouton se posent dessus).

> [ANCHOR PHRASE] A blacksmith's anvil in the upper center holding one glowing orange ingot, a forge opening glowing behind it, a few small sparks rising, deep dark workshop around it, empty dark space in the lower third, centered symmetrical composition, vertical 4:5.

## 3. Icône de l'app

- **Usage :** icône sur l'écran d'accueil Android.
- **Format :** PNG **1024 × 1024**, carré plein. Le sujet reste dans les **80 % centraux** (Android rogne les bords). Fichier : `public/art/app_icon.png` — je produis les tailles 192/512 et la version « maskable » à partir de lui.

> [ANCHOR PHRASE] App icon: a single glowing orange-gold ingot centered on a deep navy square background, soft ember radial glow behind it, bold simple silhouette readable at 48 pixels, subject within the central 80 percent, square 1:1.

## Contrôle qualité (avant de m'envoyer les fichiers)

- Pas de texte parasite, de signature ni de logo.
- Aucune main, aucun outil déformé, aucun objet répété.
- Les 5 lingots : même taille, même angle, même éclairage — seule la chaleur change.
- La palette respecte les 4 couleurs ci-dessus (pas de violet ni de turquoise).
- Lisible en petit : réduis l'image à ~100 px et vérifie qu'on reconnaît encore le sujet.

## Comment me les donner

Soit tu me les joins dans la conversation, soit tu les ajoutes dans `public/art/` sur `main` (GitHub : Add file → Upload files) avec **exactement** les noms ci-dessus. Je m'occupe ensuite de les intégrer (sprites des lingots, écran d'accueil, icône PWA) et de les optimiser en poids.
