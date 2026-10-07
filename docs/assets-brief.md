# Brief d'assets — Word Forge

> **À jour : la section V3 en bas remplace la direction, la phrase d'ancrage et les prompts de lingots des sections précédentes.** (Gardées pour l'historique.)

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

---

## V2 — direction « mascotte kawaii animée » (remplace la section 1)

Le premier test (barre de métal réaliste et texturée) est une bonne image, mais **hors direction** : trop réaliste et trop sérieuse pour un jeu qu'on veut attachant. Nouveau parti pris : **le lingot est un petit personnage**.

**Principe technique : 2 images au lieu de 5, et le visage est dessiné par le code.**
- Le corps est généré **sans visage** (grande face avant lisse et vide). Les yeux et la bouche sont dessinés en SVG par l'app : ils clignent, sourient quand on réussit, font la grimace quand on rate, et restent parfaitement cohérents.
- Deux corps seulement : `ingot_cold.png` (acier froid) et `ingot_hot.png` (incandescent). L'app les fond l'un dans l'autre selon la chaleur, et ajoute lueur et étincelles. Les 5 paliers se distinguent par ces effets, pas par 5 images à garder cohérentes.

**Phrase d'ancrage V2** (remplace l'ancienne) :

> Cute kawaii game-asset illustration, thick clean dark-navy outline, soft cel shading with two tones, rounded chunky squat shapes, small highlight glints, limited palette of steel blue-grey, ember orange (#ff6b35) and warm gold (#ffd166), plain flat background, no text, no logo, no watermark.

**Corps du lingot** (même prompt, seule la matière change) :

> [ANCHOR V2] A chunky rounded metal ingot mascot, bevelled trapezoid shape with soft rounded edges, large smooth blank front face with NO eyes, NO mouth and NO face, three-quarter front view, centered with generous margin, [STATE].

| Fichier | `[STATE]` |
|---|---|
| `ingot_cold.png` | cold steel blue-grey metal, matte, small pale highlight glints |
| `ingot_hot.png` | glowing incandescent orange-gold metal, bright warm core, tiny sparks around it |

Format identique : PNG fond transparent, 1024 × 512, **même cadrage, même taille, même angle** sur les deux (c'est ce qui permet le fondu).

**À éviter :** un visage généré dans l'image (on le dessine nous-mêmes), des bras/jambes (ça complique l'animation), du texte.

La scène de la forge et l'icône (sections 2 et 3) restent valables : remplace seulement la phrase d'ancrage par la V2 pour qu'elles soient de la même famille.

---

## V3 — direction retenue : « le mineur » (flat vector sombre, façon documentaire animé)

**Pourquoi un mineur plutôt qu'un lingot-mascotte :** le jeu parle déjà de veines, de minerai et de forge. Un petit mineur attachant porte cette histoire, peut réagir à tes réponses (content, dépité, fier) et donne un visage constant à l'app.

**Pourquoi ce style et pas un style « Duolingo » clair :** l'app est sombre (acier/braise). Un rendu vectoriel plat à fort contraste sur fond sombre, avec lueurs, s'y intègre. Un fond blanc éclatant la casserait. On reprend des **caractéristiques générales** (formes géométriques arrondies, aplats, fort contraste, lueur, yeux simples), sans citer ni copier un studio précis : n'écris pas le nom d'une marque ou d'un studio dans les prompts.

### Phrase d'ancrage V3 (à coller au début de CHAQUE prompt)

> Flat vector illustration, bold geometric rounded shapes, no outlines, solid color fills with subtle soft gradients, strong contrast on a deep navy background (#0b0e14), warm glowing light from ember orange (#ff6b35) and gold (#ffd166), steel blue-grey accents, simple friendly character design, tiny paper-grain texture, no text, no logo, no watermark.

### Le personnage — à fixer UNE fois

Donne-lui **deux traits distinctifs** et garde-les à l'identique partout (c'est ce qui évite le look « générique ») :
- un **casque jaune-or avec une grosse lampe frontale** qui éclaire ;
- une **trace de suie sur la joue** et de petites bottes trop grandes.

**Planche de référence (génère-la en premier) :**

> [ANCHOR V3] Character reference sheet of a small cute miner: round head, big simple dot eyes, oversized gold hard hat with a large glowing headlamp, soot smudge on the cheek, chunky overalls, oversized boots, holding a small pickaxe. Front view, full body, centered, plain solid dark background, generous margin.

**Poses (génère-les en utilisant la planche comme IMAGE DE RÉFÉRENCE** — fonction « character reference » / « image prompt » / « consistent character » selon ton outil — sinon la cohérence sera mauvaise) :

| Fichier | Moment dans le jeu | Description à ajouter au prompt |
|---|---|---|
| `miner_idle.png` | accueil, attente | standing relaxed, small smile, headlamp lit |
| `miner_happy.png` | bonne réponse | arms up, big open smile, eyes closed in joy, a few gold sparkles |
| `miner_oops.png` | mauvaise réponse | sheepish look, hand scratching head, small sweat drop, headlamp dimmer |
| `miner_cheer.png` | veine terminée | jumping, holding up a glowing orange-gold ingot, big smile |

Format : PNG **fond transparent**, 1024 × 1024, personnage centré avec ~12 % de marge, **même cadrage et même échelle** sur les 4.

### Autres assets (même ancre V3)

- **Lingot (accessoire, plus un personnage)** — `ingot.png`, 1024×512, transparent :
  > [ANCHOR V3] A single chunky gold-orange metal ingot, simple bevelled trapezoid, soft glow, small highlight, three-quarter view, centered, plain background.
- **Scène d'accueil** — `forge_hero.webp`, 1080×1350 (4:5), tiers inférieur sombre et vide :
  > [ANCHOR V3] Inside a mine tunnel, a glowing orange vein of ore in the rock wall, a wooden mine cart on rails in the foreground, dark tunnel fading into navy, warm light, empty dark space in the lower third, vertical 4:5.
- **Icône de l'app** — `app_icon.png`, 1024×1024, sujet dans les 80 % centraux :
  > [ANCHOR V3] App icon: the miner's round head with the gold hard hat and glowing headlamp, centered on a deep navy square, warm radial glow, bold simple silhouette readable at 48 pixels, square 1:1.

### Ordre conseillé (ne génère pas tout d'un coup)
1. La **planche de référence** seule. Valide que tu aimes ce personnage.
2. `miner_idle` et `miner_happy` avec la planche en référence : vérifie que c'est bien le même personnage.
3. Seulement ensuite les autres poses et la scène.

### Animation (côté code, je m'en charge)
Respiration au repos, saut + étincelles à la réussite, secousse légère à l'erreur, lampe frontale qui pulse. Changement de pose selon la réponse. Tout est coupé si l'utilisateur a réduit les animations.
