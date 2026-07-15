# SPEC-01 — Project Bootstrap and Build System

**Source:** `docs/roadmap.md` → LAYER 0
**Requirements:** CON-01, CON-07, NFR-04, NFR-11
**Architecture:** Section 4.1 (Folder Structure), Section 4.4 (Config System)
**Complexity:** Low
**Status:** Awaiting approval

---

## Purpose

Initialize the project workspace with all tooling, configuration, and folder structure
required before any game code can be written or run. Every subsequent spec depends on
this foundation existing and building cleanly.

---

## Scope

- Node.js project initialization
- Dependency installation (Phaser 3, TypeScript, Vite)
- TypeScript compiler configuration
- Vite build configuration
- HTML entry point
- Source and asset folder skeleton
- `.gitignore`

**Out of scope for this spec:**
- Any TypeScript source files beyond `main.ts` stub
- Any game logic or configuration data
- Any assets

---

## Task Breakdown

See `tasks.md` for the checklist view.

### TASK-01-A — Initialize npm project and install dependencies

**Description**
Create `package.json` and install all required dependencies with pinned exact versions.
Includes Phaser 3, TypeScript, Vite, and the Vite plugin for legacy browser support.
Also includes development tooling: `typescript` compiler and type declarations.

**Expected Outcome**
`package.json` exists with all dependencies at pinned versions.
`node_modules/` is populated.
`npm run dev` and `npm run build` are recognized as scripts (they will fail until
further tasks are done, but the commands must be defined).

**Dependencies**
None.

**Acceptance Criteria**
- `package.json` has a `name`, `version`, `private: true`, and a `scripts` block.
- Scripts defined: `dev` (`vite`), `build` (`tsc && vite build`), `preview` (`vite preview`).
- `phaser` is in `dependencies` at an exact version (no `^` or `~`).
- `typescript`, `vite` are in `devDependencies` at exact versions.
- `@types/node` is in `devDependencies`.
- Running `npm install` from a clean checkout installs all packages without errors.

---

### TASK-01-B — Configure TypeScript

**Description**
Create `tsconfig.json` with strict mode, correct module settings for a browser Vite
project, and path aliases that match the `src/` folder structure defined in the
architecture.

**Expected Outcome**
`tsc --noEmit` runs without errors on an empty `src/main.ts`.
TypeScript strict mode is active.

**Dependencies**
TASK-01-A

**Acceptance Criteria**
- `tsconfig.json` sets `strict: true`.
- `target` is `ES2020` or higher.
- `module` is `ESNext`, `moduleResolution` is `Bundler` or `Node`.
- `resolveJsonModule: true` (required for importing JSON config files in later specs).
- `skipLibCheck: true` (Phaser types are complex; this avoids false positives).
- `baseUrl` is `"."` and `paths` includes at minimum:
  `"@types/*"`, `"@core/*"`, `"@systems/*"`, `"@scenes/*"`, `"@ui/*"`, `"@utils/*"`,
  `"@data/*"` — all mapping to their respective `src/` subdirectories.
- Running `tsc --noEmit` on a minimal `src/main.ts` (`export {}`) exits with code 0.
- No `any` suppressions in the config itself.

---

### TASK-01-C — Configure Vite

**Description**
Create `vite.config.ts` configuring Vite for a Phaser 3 + TypeScript browser project.
Includes asset handling, path alias resolution (mirroring `tsconfig.json` paths),
and build output settings.

**Expected Outcome**
`npm run build` produces a `dist/` folder with a bundled, optimized output.

**Dependencies**
TASK-01-A, TASK-01-B

**Acceptance Criteria**
- `vite.config.ts` uses `defineConfig` from `vite`.
- Path aliases in Vite match the `paths` defined in `tsconfig.json` so imports like
  `import { foo } from '@core/EventBus'` resolve correctly in both tsc and Vite.
- `assetsInclude` covers image and audio formats used by the project:
  `['**/*.png', '**/*.mp3', '**/*.ogg']`.
- `build.outDir` is `'dist'`.
- `build.target` is `'es2020'` or equivalent.
- `npm run build` with only `src/main.ts` present exits without errors.
- `npm run dev` starts a local server (default port 5173) without errors.

---

### TASK-01-D — Create HTML entry point

**Description**
Create `index.html` as the Vite entry point. It provides the DOM container that
Phaser attaches its canvas to and loads the TypeScript entry module.

**Expected Outcome**
Opening the dev server in a browser shows a blank page with no console errors.
Phaser is not initialized yet — just the HTML shell.

**Dependencies**
TASK-01-A, TASK-01-C

**Acceptance Criteria**
- `index.html` is at the project root (Vite default).
- Contains a `<div id="game-container"></div>` element. The ID matches what will
  be used in the Phaser `GameConfig.parent` field in a later spec.
- References `src/main.ts` via `<script type="module" src="/src/main.ts"></script>`.
- Has correct `<meta charset>` and `<meta name="viewport">` tags for mobile
  responsiveness.
- Has a `<title>Reptile Haven</title>`.
- No hardcoded styles inline that would conflict with Phaser's canvas placement.
- Opening `http://localhost:5173` in a browser shows a blank page with no console errors.

---

### TASK-01-E — Create minimal main.ts entry stub

**Description**
Create `src/main.ts` as the Vite entry module. At this stage it is a stub that
proves the build pipeline works end-to-end. It does not initialize Phaser yet —
that belongs to a later spec (SPEC-17). It simply imports Phaser to verify the
dependency resolves correctly.

**Expected Outcome**
The dev server serves the page without errors. Phaser is importable.
Browser console is clean.

**Dependencies**
TASK-01-A, TASK-01-B, TASK-01-C, TASK-01-D

**Acceptance Criteria**
- `src/main.ts` exists and contains at minimum one import from `phaser`.
- The file does not instantiate any game objects — it is a stub only.
- `npm run dev` serves without TypeScript or module resolution errors.
- `npm run build` produces `dist/` without errors.
- Browser DevTools console is clean when opening the dev server page.
- `tsc --noEmit` passes with exit code 0.

---

### TASK-01-F — Create source and asset folder skeleton

**Description**
Create all empty directories defined in the architecture folder structure under
`src/` and `assets/`. Empty folders ensure the structure is established and visible
in version control via `.gitkeep` files.

**Expected Outcome**
The full folder skeleton from architecture section 4.1 exists. Any developer
cloning the repo sees the intended structure immediately.

**Dependencies**
TASK-01-A

**Acceptance Criteria**
- The following `src/` subdirectories exist: `config/`, `data/`, `data/locales/`,
  `types/`, `core/`, `systems/`, `scenes/`, `scenes/overlays/`, `ui/`, `utils/`.
- The following `assets/` subdirectories exist: `fonts/`, `images/`, `images/reptiles/`,
  `images/decorations/`, `images/ui/`, `images/backgrounds/`, `sounds/`,
  `sounds/ambient/`, `sounds/sfx/`.
- Each empty directory contains a `.gitkeep` file so it is tracked by Git.
- The `docs/` directory already exists and contains the project documentation —
  no changes needed there.

---

### TASK-01-G — Configure .gitignore

**Description**
Create or verify `.gitignore` covers all generated, OS-specific, and IDE-specific
files that must not be committed to the repository.

**Expected Outcome**
`git status` on a fresh install shows only source files, not `node_modules/`
or `dist/`.

**Dependencies**
TASK-01-A

**Acceptance Criteria**
- `node_modules/` is ignored.
- `dist/` is ignored.
- `.DS_Store` (macOS) is ignored.
- `Thumbs.db` (Windows) is ignored.
- Common IDE files are ignored: `.vscode/settings.json` (but NOT `.vscode/extensions.json`
  if present — that is shareable), `.idea/`.
- `.gitkeep` files are NOT ignored (they must be tracked).
- `src/` and `assets/` files are NOT ignored.
- Running `git status` after `npm install` does not list `node_modules/` as untracked.
