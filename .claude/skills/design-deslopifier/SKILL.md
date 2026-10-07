---
name: design-deslopifier
description: Review, redesign, and visually direct AI-generated apps, websites, dashboards, prototypes, slides, and image prompts that feel generic, cluttered, formulaic, or obviously AI-generated. Use when creating or refining interfaces, defining art direction, reviewing rendered screenshots, improving vibe-coded products, or preparing image-generation briefs. Diagnose before editing, remove before adding, define one coherent visual system, implement deliberately, then render and review again.
---

# Design Deslopifier

## Goal

Turn generic AI-generated output into a deliberate, product-specific design.

Do not merely make a design "modern", "premium", or "less AI". Identify the exact causes of the weak result, decide whether the problem is structural or visual, select one coherent direction, and apply concrete changes.

The goal is not more decoration. The goal is for every visible element to have a reason to exist.

## Modes

Choose the mode from the user's request and available inputs.

### App mode

Use for apps, websites, dashboards, prototypes, components, HTML, CSS, React, mobile interfaces, and screenshots of interfaces.

### Image mode

Use for hero images, illustrations, posters, social visuals, backgrounds, key art, and prompts for image-generation models.

### Combined mode

Use when a generated visual must be integrated into an interface. The image and interface must share composition, palette, visual language, crop strategy, and intended hierarchy.

## Non-negotiable rules

1. Diagnose before changing.
2. Fix structure before surface styling.
3. Remove before adding.
4. Give each screen or section one clear job.
5. Define one visual direction before choosing components.
6. Use explicit decisions for typography, color, spacing, geometry, imagery, and motion.
7. Do not use cards as the default grouping mechanism.
8. Do not replace one AI-design cliché with another.
9. A reference must influence the system and composition, not just decoration.
10. Render, inspect, and revise. Valid code is not proof of good design.
11. Preserve working behavior unless the task explicitly requires changing it.
12. Do not imitate a living designer or reproduce a protected composition. Extract general visual characteristics and make a new design.

## Inputs to inspect

Use all inputs that are actually available:

- product goal and audience;
- source code and current design system;
- screenshots or rendered pages;
- target screen sizes and input method;
- brand palette, typography, logo, and assets;
- reference images supplied by the user;
- existing content and real data;
- technical and accessibility constraints.

If details are missing, make only the smallest reasonable assumptions and label them.

## Core workflow

### 1. Understand the artifact

State briefly:

- what the artifact is;
- who uses it;
- the primary task;
- the primary action;
- the target platform and viewport;
- the implementation constraints;
- the available brand and visual assets.

Do not begin with aesthetic suggestions if the purpose of the screen is unclear.

### 2. Inspect the current result

Prefer a rendered output over code-only inspection.

Check:

- first-viewport composition;
- focal point and reading order;
- information architecture;
- density and repetition;
- alignment and spacing rhythm;
- typography and line lengths;
- palette and contrast;
- component logic;
- imagery and crop behavior;
- copy and button wording;
- responsive behavior;
- empty, loading, error, hover, focus, and selected states;
- accessibility and reduced-motion behavior.

If code can be run, render at the relevant desktop and mobile sizes. If it cannot be run, say that the review is based on the supplied material.

### 3. Diagnose concrete slop signals

Use `references/slop-patterns.md`.

For each important issue, give:

- **Signal:** what is visible;
- **Impact:** why it weakens this artifact;
- **Correction:** the concrete design change;
- **Priority:** critical, important, or polish.

Avoid vague feedback such as "needs more personality" or "make it cleaner".

### 4. Separate structural and surface problems

Classify issues before editing.

#### Structural

Examples: weak hierarchy, incorrect grouping, too many sections, card grid replacing information architecture, unclear primary action, broken responsive composition.

#### Surface

Examples: generic palette, default typography, inconsistent icons, excessive rounding, weak image treatment, decorative gradients.

Always resolve structural issues first.

### 5. Select the intervention level

#### Level 1: Cleanup

Choose when the underlying composition works.

Typical actions:

- remove redundant elements;
- reduce unnecessary containers;
- improve hierarchy and spacing;
- replace placeholders with real content;
- define deliberate fonts, colors, icons, and states.

#### Level 2: Art direction

Choose when the artifact works but has no identity.

Typical actions:

- define a visual concept;
- translate references into reusable rules;
- redesign the hero or principal interaction;
- establish typography, imagery, geometry, and motion;
- introduce one strong visual anchor.

#### Level 3: Redesign

Choose when the composition or information architecture is fundamentally weak.

Typical actions:

- rebuild the screen structure;
- produce a simple wireframe or layout plan;
- redefine the component hierarchy;
- create a visual system before implementation;
- rebuild priority screens rather than polishing a weak layout.

Do not preserve a weak structure merely because code already exists.

### 6. Define one visual direction

Use `references/visual-direction-model.md` and complete `templates/design-brief.md` internally before implementation.

The direction must specify:

- concept and mood;
- focal point;
- composition and density;
- typography character;
- palette behavior;
- geometry and surfaces;
- imagery medium and crop;
- icon family;
- motion character;
- explicit elements to avoid.

Do not combine unrelated aesthetics. If alternatives are requested, make them clearly distinct.

### 7. Create a minimal system

Define reusable tokens or equivalent rules for:

- colors;
- type scale;
- spacing scale;
- layout widths;
- radii;
- borders;
- shadows;
- motion durations and easing;
- responsive breakpoints;
- focus and state styling.

Avoid arbitrary values unless they are required by an existing design system.

### 8. Implement deliberately

In app mode:

- preserve the project's framework and conventions;
- preserve working behavior;
- prefer semantic HTML and accessible controls;
- improve the visible structural problems first;
- use real copy and data when available;
- avoid unnecessary dependencies;
- keep the first viewport as one composition;
- use each section for one clear job;
- make responsive behavior intentional, not just stacked;
- do not refactor unrelated application logic.

Use `templates/implementation-brief.md` when handing work to another coding agent.

In image mode:

- define purpose and placement before writing the prompt;
- specify subject, composition, viewpoint, medium, lighting, palette, texture, realism, background, crop, and aspect ratio;
- reserve empty space only when the layout requires it;
- avoid generated text unless text is the actual subject and the model supports it reliably;
- avoid generic AI symbols, random circuitry, purple neon, floating glass panels, and meaningless holograms unless the chosen direction requires them;
- ensure the image can be cropped for the intended component.

Use `templates/image-generation-brief.md`.

### 9. Render and review again

Compare the new result against the diagnosis, not against vague taste.

Verify:

- primary task is clearer;
- focal point appears sooner;
- unnecessary elements were removed;
- hierarchy no longer depends on nested cards;
- chosen visual direction is visible across the whole system;
- typography and text wrapping work at target sizes;
- imagery affects the composition rather than filling a placeholder;
- mobile and desktop both feel intentionally designed;
- interaction states remain usable;
- no clipping, overflow, unreadable contrast, or excessive motion was introduced.

If the result still looks generic, do not add polish blindly. Revisit the composition or visual direction.

### 10. Perform the final removal pass

Ask:

- Can any element be removed without reducing understanding or function?
- Does every container communicate grouping or interaction?
- Does every icon help recognition or action?
- Could this design belong to any unrelated product?
- Is there one memorable, product-specific idea?
- Is the writing human, concise, and specific?
- Is the main action obvious without explanatory copy?

## Anti-cliché guardrails

Do not correct:

- a purple gradient by adding grain;
- a generic card grid by changing only the font;
- a weak layout by adding an illustration;
- an empty hero by adding floating shapes;
- poor hierarchy by increasing every heading;
- a bland design by combining many visual styles;
- an arbitrary interface by adding more metrics;
- a weak reference interpretation by copying the reference more literally.

## Reference handling

When the user provides references:

1. Describe observable characteristics objectively.
2. Separate composition, typography, color, imagery, geometry, texture, and motion.
3. Identify which characteristics support the product's goal.
4. Discard characteristics that are decorative or inappropriate.
5. Translate the selected characteristics into original rules.
6. Never claim exact replication unless the user owns the source and explicitly requests it.

A useful reference analysis looks like this:

```yaml
composition: asymmetrical editorial frame with one dominant visual
hierarchy: oversized display title, minimal supporting copy
geometry: sharp frames with one irregular accent shape
palette: restrained neutral base with one saturated accent
imagery: tightly cropped photography that drives the layout
texture: subtle print-like imperfection
motion: short reveals tied to navigation, not ambient decoration
avoid:
  - unrelated gradients
  - repeated feature cards
  - decorative badges
```

## Required response format

Keep the response proportional to the task. For a review or redesign, structure it as follows.

### Diagnosis

A concise explanation of why the current result feels generic, cluttered, or weak.

### Intervention level

Cleanup, art direction, or redesign, with one sentence explaining why.

### Remove or simplify

Prioritized elements to remove, merge, or demote.

### Visual direction

One coherent paragraph, followed by explicit design rules.

### Changes

Concrete changes to structure, typography, color, imagery, components, writing, motion, and responsiveness.

### Implementation

Apply the changes when tools and project access permit. Otherwise provide a specific implementation brief without pretending the changes were applied.

### Render review

State what was inspected, what improved, and any remaining limitation.

## Completion criteria

The work is complete only when:

- the screen has one clear primary purpose;
- the first viewport reads as one composition;
- the primary action is obvious;
- repetition is intentional;
- cards and containers have functional reasons;
- typography, palette, spacing, geometry, imagery, and motion are explicitly chosen;
- the visual anchor affects the composition;
- copy is specific and human;
- mobile and desktop are considered;
- accessibility is preserved;
- the design has at least one product-specific idea;
- the rendered result has been checked when rendering is possible;
- remaining limitations are stated honestly.
