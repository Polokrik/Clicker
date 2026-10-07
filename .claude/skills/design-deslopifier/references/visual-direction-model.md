# Visual Direction Model

A visual direction is a system of decisions, not a mood-board label.

## Direction axes

Position the design deliberately on both axes.

- Digital <-> Organic
- Controlled <-> Expressive

Typical territories:

- **Digital + controlled:** precise product interface, grids, restrained motion.
- **Digital + expressive:** pixel art, early-web, Y2K, experimental software.
- **Organic + controlled:** editorial photography, tactile materials, restrained layouts.
- **Organic + expressive:** collage, irregular illustration, handmade texture, asymmetry.

Do not select an organic, expressive direction if the project has no suitable image or texture assets and generated substitutes would be unreliable.

## Required specification

```yaml
direction:
  name: ""
  concept: ""
  purpose: ""
  mood: ""
  audience: ""

composition:
  focal_point: ""
  structure: ""
  density: ""
  rhythm: ""
  alignment: ""
  asymmetry: ""

 typography:
  display_character: ""
  body_character: ""
  hierarchy: ""
  line_length: ""
  casing: ""

color:
  base: ""
  surfaces: ""
  primary_accent: ""
  secondary_accent: ""
  contrast_behavior: ""
  gradient_policy: ""

imagery:
  role: ""
  medium: ""
  subject: ""
  crop: ""
  texture: ""
  realism: ""
  relationship_to_layout: ""

geometry:
  dominant_shapes: ""
  radius_scale: ""
  border_behavior: ""
  shadow_behavior: ""

icons:
  family: ""
  stroke_or_fill: ""
  usage_rule: ""

motion:
  character: ""
  purpose: ""
  duration_range: ""
  reduced_motion: ""

avoid:
  - ""
  - ""
  - ""
```

## Reference translation

For each reference, extract observations without copying the full composition.

```yaml
reference_observations:
  composition: ""
  typography: ""
  palette: ""
  imagery: ""
  geometry: ""
  texture: ""
  motion_or_implied_motion: ""

transfer:
  keep:
    - ""
  adapt:
    - ""
  reject:
    - ""
```

## Coherence test

The direction is coherent only if the same concept explains:

- layout proportions;
- typography;
- color behavior;
- image treatment;
- component geometry;
- motion;
- what the design deliberately excludes.
