# XBot Documentation - Agent Guide

This project is a VitePress documentation site for XBot Robotics Team 488, teaching FRC programming to high school students.

## Project Structure

```
docs/
├── .vitepress/
│   └── config.mts          # VitePress config (sidebar, nav, theme)
├── index.md                # Landing page
├── curriculum/             # 13 learning modules
│   ├── index.md            # Curriculum overview
│   ├── 01-environment-setup.md
│   ├── 02-java-basics.md
│   └── ...
├── examples/               # Code examples with GitHub links
│   ├── index.md
│   ├── elevator-logic.md
│   └── ...
└── tooling/                # Tool guides
    ├── index.md
    ├── wpilib-overview.md
    └── ...
```

## Content Rules

### Target Audience
- High schoolers completely new to Java
- Short attention spans - keep sections concise
- Use tables, code blocks, and visuals over long paragraphs

### Curriculum Pages (`docs/curriculum/`)
- Each page covers ONE focused topic
- Must end with a 3-question multiple choice quiz
- Quiz format: use `- [ ]` for options, `<details><summary>Answer</summary>...</details>` for answers
- Include OS-specific instructions when relevant (Windows/macOS/Linux)

### Example Pages (`docs/examples/`)
- Always link to the live GitHub source
- Show simplified code with comments
- Explain the "why" behind patterns

### Tooling Pages (`docs/tooling/`)
- Focus on practical usage, not theory
- Include troubleshooting tables
- List installation steps per OS when applicable

### Writing Style
- NO emojis
- NO preamble or postamble in content
- Use code blocks with language tags (```java, ```bash)
- Use tables for comparisons
- Keep sections under 200 lines when possible

## Config Updates

When adding a new page, update `docs/.vitepress/config.mts`:
1. Add the page to the correct sidebar section
2. Use the path without `.md` extension: `link: '/curriculum/14-new-page'`
3. Keep sidebar items in logical order

## Commands

```bash
pnpm docs:dev       # Start dev server (localhost:5173)
pnpm docs:build     # Build for production
pnpm docs:preview   # Preview production build
```

## Config Notes

- Config file MUST be `.mts` (ESM-only VitePress requirement)
- No `base` path for local dev (add it back for GitHub Pages deploy)
- Sidebar links must match exact file paths (without `.md`)

## Source Repositories (for code references)

All source repositories are available locally as git submodules in `./references/`:

- `references/XbotEdu/` - Practice challenges
- `references/TeamXbot2026/` - Current robot code
- `references/TeamXbot2025/` - Last year's robot
- `references/SeriouslyCommonLib/` - Shared library
- `references/frc-docs/` - WPILib official documentation

When referencing code, prefer XBot's patterns over WPILib defaults if they differ.
Use `grep` and `glob` tools to search within these local repositories instead of web fetching.
