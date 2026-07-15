# SPEC-01 Tasks — Project Bootstrap and Build System

**Status:** Complete
**Spec:** `spec.md`

---

## Task Checklist

- [ ] **TASK-01-A** — Initialize npm project and install dependencies
  - `package.json` with pinned Phaser 3, TypeScript, Vite
  - Scripts: `dev`, `build`, `preview`

- [ ] **TASK-01-B** — Configure TypeScript
  - `tsconfig.json` with `strict: true`, `resolveJsonModule`, path aliases
  - `tsc --noEmit` passes on minimal stub

- [ ] **TASK-01-C** — Configure Vite
  - `vite.config.ts` with path aliases mirroring tsconfig, asset includes, build output
  - `npm run build` exits cleanly

- [ ] **TASK-01-D** — Create HTML entry point
  - `index.html` with `#game-container`, viewport meta, script module reference
  - Dev server shows blank page with no console errors

- [ ] **TASK-01-E** — Create minimal main.ts entry stub
  - `src/main.ts` imports Phaser, no instantiation yet
  - Build and dev server both clean

- [x] **TASK-01-F** — Create source and asset folder skeleton
  - All `src/` and `assets/` subdirectories from architecture 4.1
  - Each empty directory has a `.gitkeep`

- [ ] **TASK-01-G** — Configure .gitignore
  - `node_modules/`, `dist/`, OS/IDE files excluded
  - `.gitkeep` files tracked

---

## Git Commit Suggestions

Each task maps to one commit. Suggested messages (Conventional Commits):

```
chore: initialize npm project with Phaser 3, TypeScript, and Vite
chore: configure TypeScript with strict mode and path aliases
chore: configure Vite with asset handling and path alias resolution
chore: add HTML entry point with game container and viewport meta
chore: add main.ts entry stub with Phaser import
chore: scaffold src/ and assets/ folder structure
chore: configure .gitignore for Node, Vite, and IDE artifacts
```
