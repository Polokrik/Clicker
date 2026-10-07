# Design Deslopifier

An installable agent skill for reviewing and improving generic AI-generated interfaces and image prompts.

## Install

Copy the `design-deslopifier` folder into the skills directory used by your agent or coding environment. Keep `SKILL.md`, `references/`, and `templates/` together.

Common examples:

```text
<project>/.agents/skills/design-deslopifier/
<project>/.claude/skills/design-deslopifier/
<project>/.github/skills/design-deslopifier/
```

The exact directory depends on the environment. The portable part is the folder itself and the front matter at the top of `SKILL.md`.

## Invoke

Examples:

```text
Use the design-deslopifier skill to audit this app, choose the correct intervention level, apply the changes, render mobile and desktop, and review the result.
```

```text
Use the design-deslopifier skill in image mode. Turn this visual direction into a concrete generation brief for a 16:9 hero image and review the result against the interface.
```

```text
Analyze these references without copying them. Extract the transferable design rules, define one original direction, and implement it across the app.
```

## Contents

- `SKILL.md`: trigger, workflow, rules, and output contract.
- `references/slop-patterns.md`: diagnostic library.
- `references/visual-direction-model.md`: art-direction framework.
- `references/app-review-checklist.md`: rendered interface QA.
- `references/image-review-checklist.md`: generated visual QA.
- `templates/design-brief.md`: compact design decision template.
- `templates/implementation-brief.md`: coding-agent handoff.
- `templates/image-generation-brief.md`: image prompt framework.

## Design basis

The skill was informed by the general principles discussed in Maya Brennan's article, "How to de-slopify your designs", while adding a repeatable implementation and render-review workflow. The package does not redistribute the article's images or wording.

Source:
https://uxdesign.cc/how-to-de-slopify-your-designs-4c40c57c1dc9
