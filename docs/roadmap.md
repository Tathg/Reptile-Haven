# Roadmap — Implementation Specifications
## Reptile Haven — Idle Terrarium Management Game
**Version:** 1.0
**Date:** July 2026
**Status:** Active — awaiting task generation

---

## Change Log

| Version | Date | Change |
|---------|------|--------|
| 0.1 | July 2026 | Placeholder stub |
| 1.0 | July 2026 | Full implementation specification list written |

---

## How to Read This Document

Each specification is a self-contained unit of implementation work.
They are ordered by dependency — each spec only depends on specs above it.
Complexity ratings: **Low** (1–2 files, isolated logic), **Medium** (3–5 files,
cross-layer), **High** (6+ files, multi-system, or significant state coordination).

Requirement traceability IDs reference `requirements.md`.
Architecture references reference `architecture.md`.

---

## LAYER 0 — Project Scaffold

---

### SPEC-01 — Project Bootstrap and Build System

**Purpose**
Initialize the project workspace with all tooling, configuration, and folder structure
required before any game code can be written or run.

**Dependencies**
None. This is the starting point for all other specs.

**Systems Involved**
None (tooling only).

**Estimated Complexity**
Low

**Acceptance Criteria**
- `package.json` exists with Phaser 3, TypeScript, and Vite as dependencies, all pinned to exact versions.
- `vite.config.ts` is configured with correct entry point (`index.html`) and asset handling.
- `tsconfig.json` has `strict: true` enabled and paths configured to match the `src/` structure.
- `index.html` mounts the Phaser canvas and references the Vite entry point.
- `npm run dev` starts a local dev server without errors.
- `npm run build` produces a production bundle without errors.
- All folders defined in the architecture folder structure exist (empty is acceptable for asset folders).
- `.gitignore` excludes `node_modules/`, `dist/`, and any IDE-specific files.

---

### SPEC-02 — TypeScript Type System

**Purpose**
Define all TypeScript interfaces and enums that form the contract layer for the entire
codebase. No runtime logic. Every subsequent spec imports from this layer.

**Dependencies**
SPEC-01

**Systems Involved**
`src/types/` (all files)

**Estimated Complexity**
Medium

**Acceptance Criteria**
- `GameState.ts` defines `GameState` and all sub-state interfaces: `TerrariumState`,
  `PlacedDecoration`, `ReptileInstance`, `BreedingState`, `HatchlingState`,
  `InventoryState`, `InventoryItem`, `ReptipediaState`, `AchievementState`,
  `ChestState`, `SettingsState`.
- `SpeciesDefinition.ts` defines `SpeciesDefinition`, `MorphDefinition`,
  `ReptipediaEntry`, and `AnimationKeyMap`.
- `DecorationDefinition.ts` defines `DecorationDefinition`.
- `AchievementDefinition.ts` defines `AchievementDefinition` and the
  `AchievementConditionType` union/enum.
- `ChestDefinition.ts` defines chest type definitions and `ChestLoot`.
- `BalanceConfig.ts` defines the full typed shape of `balance.json`.
- `GameEvents.ts` defines the `GameEvent` enum and a payload type map covering
  all events listed in architecture section 3.7.
- TypeScript compiler reports zero errors across all type files.
- No `any` types are used.


---

## LAYER 1 — Core Infrastructure

---

### SPEC-03 — Utility Modules

**Purpose**
Implement the three pure utility modules that all systems and tests depend on.
These have zero game-specific dependencies and can be built and tested in isolation.

**Dependencies**
SPEC-01, SPEC-02

**Systems Involved**
`src/utils/Random.ts`, `src/utils/TimeUtils.ts`, `src/utils/IdGenerator.ts`

**Estimated Complexity**
Low

**Acceptance Criteria**
- `Random.ts` exposes a `weightedRandom(items: { weight: number }[])` function that
  selects an item proportional to its weight. Given deterministic inputs, output is deterministic.
- `Random.ts` has no dependency on `Math.random` directly — it accepts an optional
  RNG function parameter to allow test injection.
- `TimeUtils.ts` exposes: `nowMs(): number`, `toIsoDateString(ms: number): string`,
  `isSameCalendarDay(msA: number, msB: number): boolean`.
- `IdGenerator.ts` exposes `generateId(): string` producing a unique string ID
  (UUID v4 or equivalent). IDs are URL-safe strings.
- All three modules have unit tests covering normal cases and edge cases.
- No imports from `src/core/`, `src/systems/`, or `src/scenes/`.

---

### SPEC-04 — Event Bus

**Purpose**
Implement the typed event bus that decouples all game systems and scenes.
All inter-system and scene-to-system communication routes through this.

**Dependencies**
SPEC-01, SPEC-02 (GameEvents.ts)

**Systems Involved**
`src/core/EventBus.ts`

**Estimated Complexity**
Low

**Acceptance Criteria**
- `EventBus` class exposes typed `emit`, `on`, and `off` methods.
- The `on` method is generic: the callback receives the correct payload type
  for the given `GameEvent` key, inferred from the payload type map in `GameEvents.ts`.
- `emit` accepts a `GameEvent` and its corresponding typed payload. Mismatched
  payload types are a TypeScript compile error.
- Multiple listeners can subscribe to the same event.
- `off` correctly removes only the specified listener without affecting others.
- `EventBus` has no dependency on Phaser.
- Unit tests verify: emit reaches all subscribers, off removes the correct one,
  payload types are passed through unchanged.

---

### SPEC-05 — Registry (Service Locator)

**Purpose**
Implement the Registry singleton that all scenes and systems use to obtain
typed references to managers and systems. Resolves the Phaser scene injection problem.

**Dependencies**
SPEC-01, SPEC-04

**Systems Involved**
`src/core/Registry.ts`

**Estimated Complexity**
Low

**Acceptance Criteria**
- `Registry` exposes `register(key, instance)` and `get(key)` methods.
- `get` is typed: given a constructor type `T`, it returns an instance of `T`.
  Requesting an unregistered type throws a descriptive error.
- `Registry` is a module-level singleton — there is no exported class constructor.
  It cannot be instantiated more than once.
- `Registry.reset()` method exists for use in tests to clear all registrations.
- Unit tests verify: register + get round-trip, get before register throws, reset clears.

---

### SPEC-06 — Configuration Manager and Data Files

**Purpose**
Implement ConfigManager and author all six `src/data/` JSON files. This is the
single configuration surface for all game content and balance values.

**Dependencies**
SPEC-01, SPEC-02, SPEC-05

**Systems Involved**
`src/core/ConfigManager.ts`, all files in `src/data/`

**Estimated Complexity**
Medium

**Acceptance Criteria**
- `balance.json` contains all keys defined in the `BalanceConfig.ts` type, with
  placeholder values for every `[CONFIGURABLE]` item from `requirements.md`.
- `species.json` contains entries for all 9 MVP species (REP-05) with all required
  `SpeciesDefinition` fields populated, including `reptipedia` entries (PED-03),
  at least one morph per species, and placeholder `spriteKey`/`animationKeys`.
- `decorations.json` contains entries for at least one background, one substrate,
  and a small curated set of decorations, each with a `decorationScore` weight.
- `achievements.json` contains all MVP achievement examples from ACH-08 plus at
  least two additional achievements covering all six `AchievementConditionType` values.
- `chests.json` defines `daily` and `achievement` chest types with weighted loot tables
  containing coin, decoration, and surprise egg entries.
- `locales/en.json` contains keys for all player-facing strings needed by MVP UI,
  using a namespaced key format (e.g. `hud.coins`, `reptile.hungry`).
- `ConfigManager` loads all six files at startup and validates each against its
  TypeScript interface. A missing required field throws with the field name and file.
- `ConfigManager` exposes typed accessors for all config categories.
- Calling `ConfigManager` accessors with an invalid ID returns `undefined` (not throws).
- NFR-07: any invalid config file stops the game at startup with a clear console error.


---

### SPEC-07 — Save Manager

**Purpose**
Implement the persistence layer. All game state flows in and out of LocalStorage
through this single component. Includes schema versioning and corruption recovery.

**Dependencies**
SPEC-01, SPEC-02, SPEC-03, SPEC-05

**Systems Involved**
`src/core/SaveManager.ts`

**Estimated Complexity**
Medium

**Acceptance Criteria**
- `SaveManager.save(state: GameState)` serializes state to JSON and writes to
  the key `reptile_haven_save_v1`. The write is a full replacement (SAV-01, NFR-05).
- `SaveManager.load()` returns a `GameState` if valid data exists, `null` otherwise.
- On load, if `schemaVersion` does not match the current version, migration functions
  run in sequence to bring the save up to date (SAV-07).
- If `JSON.parse` throws or the result fails basic shape validation, `load()` returns
  `null` and logs a console warning. It does not throw (SAV-08).
- `SaveManager.clear()` removes the LocalStorage key.
- `SaveManager` registers `visibilitychange` and `beforeunload` listeners that write
  `lastSeenTimestamp = Date.now()` and re-save on each event (SAV-04).
- `SaveManager` exposes a `CURRENT_SCHEMA_VERSION` constant.
- Unit tests cover: save + load round-trip, corrupt JSON returns null,
  old schema version triggers migration, clear removes data, schema version mismatch
  without a migration function throws a descriptive error.

---

### SPEC-08 — Locale Manager

**Purpose**
Implement the locale system. All player-facing strings route through this manager.
Enables zero-code language addition in Phase 2.

**Dependencies**
SPEC-01, SPEC-05, SPEC-06 (en.json)

**Systems Involved**
`src/core/LocaleManager.ts`

**Estimated Complexity**
Low

**Acceptance Criteria**
- `LocaleManager.t(key: string, params?: Record<string, string>): string` resolves
  a dot-notation key against the active locale file (NFR-15).
- Parameter interpolation replaces `{{paramName}}` tokens in the string value.
- If a key is not found, `t` returns the key string itself and logs a console warning.
  It does not throw.
- The active locale is `en` in MVP. The locale file is loaded once at startup.
- `LocaleManager` has no Phaser dependency.
- Unit tests cover: successful key lookup, parameter interpolation, missing key
  returns key string, nested key resolution.


---

## LAYER 2 — Game Systems (Pure Logic)

These systems have no Phaser dependency. They can be built and tested entirely
outside of any scene. They read `GameState` and `ConfigManager`, mutate state,
and emit events on `EventBus`.

---

### SPEC-09 — Idle System

**Purpose**
Implement the pure idle catch-up function. This is the most critical testable
piece of game logic — it must be deterministic and side-effect-free (IDL-07).

**Dependencies**
SPEC-02, SPEC-03, SPEC-06

**Systems Involved**
`src/systems/IdleSystem.ts`

**Estimated Complexity**
Medium

**Acceptance Criteria**
- `applyOfflineTime(state: GameState, elapsedSeconds: number, config: BalanceConfig): GameState`
  is a pure function. It accepts state and config, returns a new state. No mutations
  of the input, no event emissions, no side effects (IDL-07, NFR-06).
- Applies hunger decay to every `ReptileInstance` in `state.reptiles` using each
  species' `hungerDecayRate` from config (IDL-02, REP-09).
- Hunger never goes below 0.
- If a reptile's Hunger was above 0 before and reaches 0 during offline time,
  `hungerAtZeroSince` is set to the timestamp when it would have hit zero (IDL-02).
- Applies Cleanliness decay to `state.terrarium.cleanliness` using the base rate
  and per-reptile multiplier from config (IDL-02, TER-03, TER-04).
- Cleanliness never goes below 0.
- Applies breeding timer progress: if `state.breeding` is set and
  `startedAt + durationMs <= lastSeenTimestamp + elapsedMs`, marks breeding as
  complete by clearing `state.breeding` and populating `state.pendingHatchling` (IDL-02, BRD-04).
- Morph for pending hatchling is rolled using `weightedRandom` from `Random.ts`.
- Accumulates passive coin generation for all reptiles where Happiness (derived
  from post-idle Hunger and Cleanliness) exceeds the threshold, for the capped
  elapsed duration (IDL-02, ECO-05).
- Elapsed time is capped to `config.idle.maxOfflineCapSeconds` before all calculations (IDL-04).
- Health degradation is NOT applied during idle (health only degrades in the active tick loop
  where `hungerAtZeroSince` can be checked against the configured delay).
- Idle gains never produce negative outcomes — no value can become worse than its
  minimum floor (IDL-06).
- `lifetimeCoinsEarned` is incremented by any coins accumulated during idle.
- Unit tests cover: zero elapsed time returns identical state, hunger decays correctly
  over N seconds, cleanliness decays with population scaling, breeding completes when
  timer expires, breeding does NOT complete when timer has not elapsed, coin
  accumulation above happiness threshold, coin accumulation below threshold yields zero,
  offline cap is respected, multiple reptiles processed independently.

---

### SPEC-10 — Reptile System

**Purpose**
Implement the active-session reptile logic: hunger decay tick, happiness derivation,
health degradation/recovery, and feed action handling (REP-09 through REP-14, FED-01 through FED-07).

**Dependencies**
SPEC-02, SPEC-04, SPEC-05, SPEC-06, SPEC-09

**Systems Involved**
`src/systems/ReptileSystem.ts`

**Estimated Complexity**
Medium

**Acceptance Criteria**
- `ReptileSystem` is a class instantiated with `EventBus` and `ConfigManager` references
  obtained from `Registry`.
- `tick(state: GameState, deltaSeconds: number)` applies hunger decay to all reptiles
  using species `hungerDecayRate`. Hunger floor is 0 (REP-09).
- `tick` applies health degradation to any reptile whose `hungerAtZeroSince` exceeds the
  configured delay threshold (REP-11). Health floor is 0 (REP-13).
- `tick` applies health recovery to any reptile with Hunger above 0 and Health below 100 (REP-12).
- `tick` emits `REPTILE_HUNGRY` exactly once when a reptile's Hunger crosses below
  the hungry threshold — not on every tick while hungry.
- `tick` emits `REPTILE_DISTRESSED` exactly once when a reptile's Health reaches 0.
- `computeHappiness(reptile, cleanliness, decorationScore, config)` is a pure function
  returning a 0–100 value using the configurable formula (REP-10).
- On `PLAYER_FEED_REPTILE` event: validates reptile exists, increases Hunger by
  `feedAmount` (capped at 100), determines coin reward based on hunger thresholds,
  credits coins via `EconomySystem`, emits `REPTILE_FED` (FED-01 through FED-07).
- On `PLAYER_FEED_ALL` event: feeds every reptile in the terrarium (FED-01, UI-07).
- Does not directly emit any UI events — only game state events.
- Unit tests cover: hunger decay over multiple ticks, health degradation after delay,
  health recovery when fed, happy threshold events fire once not repeatedly,
  feed reward for hungry reptile, feed no-reward for well-fed reptile,
  `computeHappiness` formula with known inputs.

---

### SPEC-11 — Terrarium System

**Purpose**
Implement Cleanliness decay, Decoration Score calculation, and the clean action
(TER-03 through TER-09, CLN-01 through CLN-07).

**Dependencies**
SPEC-02, SPEC-04, SPEC-05, SPEC-06

**Systems Involved**
`src/systems/TerrariumSystem.ts`

**Estimated Complexity**
Low

**Acceptance Criteria**
- `tick(state: GameState, deltaSeconds: number)` applies Cleanliness decay scaled by
  current reptile population. Cleanliness floor is 0 (TER-03, TER-04).
- `tick` emits `TERRARIUM_DIRTY` exactly once when Cleanliness crosses below the
  dirty threshold — not on every tick while dirty.
- `computeDecorationScore(placedDecorations, config): number` is a pure function
  returning a score based on placed decoration weights from config (TER-05).
- On `PLAYER_CLEAN_TERRARIUM` event: validates action is available (Cleanliness
  below threshold), resets Cleanliness to 100, credits coins via `EconomySystem`,
  increments `AchievementState.progress` for `terrarium_cleaned_count` key,
  emits `TERRARIUM_CLEANED` (CLN-01 through CLN-04).
- On `PLAYER_PLACE_DECORATION`: validates the player owns the decoration
  (InventoryState quantity > 0), appends to `placedDecorations`, decrements
  inventory quantity, emits `TERRARIUM_CLEANLINESS_CHANGED` (as decoration placement
  may affect score — not strictly required but makes scene reactivity cleaner).
- On `PLAYER_REMOVE_DECORATION`: removes from `placedDecorations` by index,
  increments inventory quantity back.
- Unit tests cover: cleanliness decay with 1 reptile vs. 4 reptiles, dirty event
  fires once, decoration score with known inputs, clean action resets cleanliness,
  clean action rejected above threshold, decoration place/remove inventory tracking.


---

### SPEC-12 — Economy System

**Purpose**
Implement the single source of truth for all coin operations: passive generation,
active rewards, purchases, and balance guard (ECO-01 through ECO-09).

**Dependencies**
SPEC-02, SPEC-04, SPEC-05, SPEC-06, SPEC-10

**Systems Involved**
`src/systems/EconomySystem.ts`

**Estimated Complexity**
Medium

**Acceptance Criteria**
- `EconomySystem` is the only module that directly mutates `GameState.coins`
  and `GameState.lifetimeCoinsEarned`.
- `credit(state, amount, source)` increases `coins` and `lifetimeCoinsEarned` by
  `amount`, emits `COINS_CHANGED` with new balance and delta.
- `debit(state, amount)` decreases `coins` by `amount` only if balance ≥ amount.
  Returns `true` on success, `false` if insufficient. Emits `COINS_CHANGED` on success.
- `tick(state, deltaSeconds)` accumulates passive coin generation for each reptile
  whose derived Happiness exceeds the threshold, using the config formula.
  Fractional accumulation is tracked — coins are only credited when a full unit
  accrues (ECO-04).
- On `PLAYER_PURCHASE_SPECIES`: validates coins sufficient and terrarium not at
  population cap (REP-19), debits coins, creates a new `ReptileInstance` with
  random gender, appends to `state.reptiles`, emits `REPTILE_ACQUIRED`,
  emits `PURCHASE_SUCCESS`. On failure emits `PURCHASE_FAILED_INSUFFICIENT_FUNDS` (REP-17, ECO-06).
- On `PLAYER_PURCHASE_DECORATION`: validates coins sufficient, debits coins,
  increments inventory quantity for that decoration. Emits `PURCHASE_SUCCESS`
  or `PURCHASE_FAILED_INSUFFICIENT_FUNDS` (ECO-06).
- `coins` can never go below 0 (ECO-08).
- Unit tests cover: credit increases balance and lifetime total, debit succeeds with
  sufficient funds, debit fails with insufficient funds (balance unchanged),
  purchase species — success and failure paths, purchase decoration — success and
  failure paths, population cap blocks species purchase, passive tick accumulation.

---

### SPEC-13 — Breeding System

**Purpose**
Implement breeding pair validation, timer management, morph rolling, hatchling
resolution, and breeding cooldown (BRD-01 through BRD-13).

**Dependencies**
SPEC-02, SPEC-03, SPEC-04, SPEC-05, SPEC-06, SPEC-12

**Systems Involved**
`src/systems/BreedingSystem.ts`

**Estimated Complexity**
High

**Acceptance Criteria**
- On `PLAYER_START_BREEDING` event: validates pair eligibility — same species,
  opposite genders, no active breeding, no cooldown on either reptile.
  On success: writes `BreedingState` to `GameState.breeding` with `startedAt = Date.now()`
  and `durationMs` from species config. Emits `BREEDING_STARTED` (BRD-01, BRD-02, BRD-03).
- On failure: emits `PURCHASE_FAILED_INSUFFICIENT_FUNDS` is NOT used here — emits a
  distinct `BREEDING_START_FAILED` event with a reason string.
- `tick(state, nowMs)` checks if `breeding.startedAt + breeding.durationMs <= nowMs`.
  On completion: rolls morph via `weightedRandom`, creates `HatchlingState`,
  writes to `state.pendingHatchling`, clears `state.breeding`, emits `BREEDING_COMPLETE` (BRD-04 through BRD-07).
- `tick` does nothing if `state.breeding` is null or `state.pendingHatchling` is
  already occupied (the hatchling must be resolved before another can complete).
- On `PLAYER_RESOLVE_HATCHLING` event with `decision: 'keep'`: validates population
  not at cap. If cap not reached, creates a new `ReptileInstance` from hatchling species,
  appends to `state.reptiles`, clears `pendingHatchling`, sets breeding cooldown on
  both parent reptiles, emits `HATCHLING_RESOLVED`, emits `REPTILE_ACQUIRED` (BRD-09, BRD-10, BRD-11, BRD-13).
- On `PLAYER_RESOLVE_HATCHLING` with `decision: 'sell'`: credits coins via `EconomySystem`
  with `hatchling.sellValue`, clears `pendingHatchling`, sets cooldown, emits
  `HATCHLING_RESOLVED` (BRD-09, BRD-11).
- A pending hatchling notification persists until resolved — nothing auto-clears it (BRD-12).
- Unit tests cover: eligibility validation (same species, genders, no active breeding,
  cooldown), breeding completion when timer expires, morph assignment, keep path
  (adds reptile), keep rejected at population cap, sell path (awards coins),
  cooldown set on both parents, second breed blocked during cooldown.

---

### SPEC-14 — Reptipedia System

**Purpose**
Track species unlock state. Subscribe to REPTILE_ACQUIRED and unlock the corresponding
Reptipedia entry. Feed unlock count to achievements (PED-01 through PED-07).

**Dependencies**
SPEC-02, SPEC-04, SPEC-05

**Systems Involved**
`src/systems/ReptipediaSystem.ts`

**Estimated Complexity**
Low

**Acceptance Criteria**
- On `REPTILE_ACQUIRED` event: checks if species ID is already in
  `state.reptipedia.unlockedSpeciesIds`. If not, adds it and emits
  `REPTIPEDIA_ENTRY_UNLOCKED` (PED-04, PED-05).
- `REPTIPEDIA_ENTRY_UNLOCKED` is emitted only once per species — never again
  even if more of the same species are acquired.
- The unlock count is available as `state.reptipedia.unlockedSpeciesIds.length`
  for use by the achievement system.
- Unit tests cover: first acquisition unlocks entry and emits event, second
  acquisition of same species does not re-emit, multiple different species tracked independently.

---

### SPEC-15 — Achievement System

**Purpose**
Reactive, event-driven achievement evaluation. All achievements are config-driven.
No polling (ACH-01 through ACH-08).

**Dependencies**
SPEC-02, SPEC-04, SPEC-05, SPEC-06, SPEC-12

**Systems Involved**
`src/systems/AchievementSystem.ts`

**Estimated Complexity**
Medium

**Acceptance Criteria**
- `AchievementSystem` subscribes to all events that may satisfy achievement conditions
  on construction.
- On each relevant event, evaluates all non-unlocked achievements whose
  `conditionType` matches the event. Does not evaluate already-unlocked achievements (ACH-07).
- Supported condition types (ACH-02): `species_unlocked_count` (check `reptiles` count
  for unique species IDs), `group_completed` (check all species in a group are owned),
  `hatchlings_produced` (check progress counter), `coins_earned_total`
  (check `lifetimeCoinsEarned`), `terrarium_cleaned_count` (check progress counter),
  `reptipedia_entries_unlocked` (check `reptipedia.unlockedSpeciesIds.length`).
- On unlock: adds achievement ID to `state.achievements.unlockedIds`, awards coins and/or
  chests via `EconomySystem.credit` and `ChestSystem.awardChest`, emits `ACHIEVEMENT_UNLOCKED` (ACH-04, ACH-05).
- Progress-based conditions (hatchlings_produced, terrarium_cleaned_count) read and
  update `state.achievements.progress[achievementId]`.
- Unit tests cover: each condition type evaluates correctly, already-unlocked achievement
  is not re-evaluated, reward coins credited on unlock, reward chest awarded on unlock,
  partial progress tracked correctly.

---

### SPEC-16 — Chest System

**Purpose**
Manage chest awarding, queuing, and loot resolution including the surprise egg
routing path (CHE-01 through CHE-08).

**Dependencies**
SPEC-02, SPEC-03, SPEC-04, SPEC-05, SPEC-06, SPEC-12, SPEC-13

**Systems Involved**
`src/systems/ChestSystem.ts`

**Estimated Complexity**
Medium

**Acceptance Criteria**
- `checkDailyChest(state, config)` called on startup: compares current calendar date
  to `state.lastDailyChestDate`. If different, awards one daily chest and updates
  `lastDailyChestDate` (CHE-01, CHE-02).
- `awardChest(state, type)` adds a `ChestState` to `state.chestQueue` if queue length
  is below `config.chests.maxQueueSize`. If at cap, the chest is silently dropped
  (the queue cap protects against exploit accumulation, not loss of entitled rewards —
  the cap should be generous enough that normal play never hits it) (CHE-03).
- On `PLAYER_OPEN_CHEST`: validates queue is non-empty, shifts first chest from queue,
  performs weighted loot roll against the chest type's loot table (CHE-04, CHE-05).
- Loot outcomes: `coins` — credits via `EconomySystem`, `decoration` — increments
  inventory quantity, `surprise_egg` — creates `HatchlingState` with random species
  and morph roll, writes to `state.pendingHatchling` if null, otherwise queues as
  `ChestState` of type `'surprise_egg'` (CHE-06).
- On surprise egg loot: emits `BREEDING_COMPLETE` with hatchling payload (architecture 3.4).
- Emits `CHEST_OPENED`, `CHEST_LOOT_RESOLVED` with loot details.
- Unit tests cover: daily chest awarded when date differs, daily chest not re-awarded
  same day, queue cap respected, open chest — coin loot, decoration loot, surprise egg
  loot (pending slot empty), surprise egg queued when pending slot occupied.


---

## LAYER 3 — Phaser Bootstrap and Asset Pipeline

---

### SPEC-17 — Phaser Configuration and Scale

**Purpose**
Configure the Phaser `Game` instance with correct canvas dimensions, scale mode,
responsive behavior, and input settings (UI-03, UI-04, UI-05, NFR-02, NFR-03).

**Dependencies**
SPEC-01, SPEC-02

**Systems Involved**
`src/config/GameConfig.ts`, `src/config/ScaleConfig.ts`, `src/main.ts`

**Estimated Complexity**
Low

**Acceptance Criteria**
- `GameConfig.ts` exports a `Phaser.Types.Core.GameConfig` object. Scale mode is
  read from a constant in `ScaleConfig.ts` (not hardcoded in GameConfig).
- Scale mode is `Phaser.Scale.FIT` with `autoCenter: Phaser.Scale.CENTER_BOTH`,
  ensuring the canvas fits the viewport on both desktop and mobile (UI-03).
- `parent` is a well-known DOM element ID that exists in `index.html`.
- Input config includes touch input enabled (`input.touch: true`) (UI-04).
- The scene list registered in `GameConfig` matches the full scene roster from
  architecture section 3.3.
- `main.ts` creates the Phaser game with `GameConfig` and does nothing else.
- Running `npm run dev` renders a blank Phaser canvas in the browser without errors.
- Canvas resizes correctly when the browser window is resized.

---

### SPEC-18 — Asset Manager and Placeholder Assets

**Purpose**
Implement AssetManager and populate the asset folders with named placeholder assets
that match the naming convention in architecture section 4.7. Enables all subsequent
scenes to load and reference assets without depending on final art.

**Dependencies**
SPEC-01, SPEC-02, SPEC-05, SPEC-06

**Systems Involved**
`src/core/AssetManager.ts`, `assets/` folder contents

**Estimated Complexity**
Medium

**Acceptance Criteria**
- Placeholder sprite sheets exist for all 9 species under `assets/images/reptiles/`,
  named exactly as their `spriteKey` values in `species.json`. Each has at least 3 frames
  mapped to `idle`, `eat`, and `distressed` animations.
- Placeholder sprites exist for all decorations referenced in `decorations.json`.
- Placeholder backgrounds and substrates exist for all items in `decorations.json`
  that are categorized as backgrounds or substrates.
- Placeholder UI icons exist for all HUD actions: `icon-feed`, `icon-clean`,
  `icon-shop`, `icon-reptipedia`, `icon-achievements`, `icon-chest`.
- One placeholder ambient MP3 exists at `assets/sounds/ambient/terrarium-loop.mp3`.
- Placeholder SFX MP3s exist for: `feed`, `clean`, `chest-open`, `hatch`, `achievement`, `purchase`.
- `AssetManager` exposes a typed `KEYS` constant mapping logical names to Phaser
  asset key strings.
- `AssetManager.validateKeys(configManager)` cross-references all `spriteKey` values
  in loaded species config against loaded Phaser assets and logs warnings for any gaps (NFR-07).
- All placeholder assets load without Phaser errors in `PreloadScene`.

---

### SPEC-19 — BootScene and PreloadScene

**Purpose**
Implement the two startup scenes that initialize the entire application:
load assets, instantiate all managers and systems, apply idle catch-up, and
transition to the appropriate next scene (SAV-02, IDL-01 through IDL-05).

**Dependencies**
SPEC-03 through SPEC-18

**Systems Involved**
`src/scenes/BootScene.ts`, `src/scenes/PreloadScene.ts`

**Estimated Complexity**
High

**Acceptance Criteria**
- `BootScene` starts, loads a minimal splash/logo asset, then immediately transitions
  to `PreloadScene`.
- `PreloadScene` shows a progress bar that accurately reflects asset load progress (NFR-01).
- `PreloadScene` instantiates all managers in order: `Registry`, `EventBus`,
  `ConfigManager`, `SaveManager`, `LocaleManager`, `AudioManager`, `AssetManager`.
  Registers all in `Registry`.
- `PreloadScene` instantiates all systems: `ReptileSystem`, `TerrariumSystem`,
  `EconomySystem`, `BreedingSystem`, `ChestSystem`, `AchievementSystem`,
  `ReptipediaSystem`. Registers all in `Registry`.
- `PreloadScene` loads `GameState` via `SaveManager`. If null (no save), creates a
  fresh `GameState` with the starter reptile from config (REP-16) and initial
  starter decorations added to inventory.
- `PreloadScene` calls `IdleSystem.applyOfflineTime` with elapsed time since
  `lastSeenTimestamp`. Updated state is stored as the active game state.
- `PreloadScene` calls `ChestSystem.checkDailyChest` after idle catchup.
- `PreloadScene` transitions to `MainMenuScene` if this is the first run (no prior
  save existed), otherwise to `GameScene`.
- On transition, `SaveManager.save` is called with the post-catchup state.
- If `ConfigManager` throws a validation error, the progress bar stops and a
  descriptive error message is shown in place of the game (NFR-07).
- Total time from game start to `GameScene` ready is under 5 seconds on broadband (NFR-01).


---

## LAYER 4 — Core Game Scene

---

### SPEC-20 — GameScene: Terrarium Renderer

**Purpose**
Implement the primary game scene. Renders the terrarium background, substrate,
placed decorations, and reptile sprites. Runs the game tick loop. This is the
permanent visual home of all gameplay (TER-07, TER-08, TER-10, UI-01).

**Dependencies**
SPEC-17, SPEC-18, SPEC-19

**Systems Involved**
`src/scenes/GameScene.ts`

**Estimated Complexity**
High

**Acceptance Criteria**
- `GameScene` renders the terrarium background layer using `state.terrarium.backgroundId`.
- `GameScene` renders the substrate layer using `state.terrarium.substrateId`.
- `GameScene` renders all `placedDecorations` as sprites at their stored (x, y) positions.
- `GameScene` renders a sprite for each `ReptileInstance` in `state.reptiles`.
  Each sprite plays its `idle` animation by default.
- Reptile sprites are positioned within the terrarium bounds. Positions are either
  persisted per reptile or algorithmically distributed — defined and consistent.
- `GameScene.update(time, delta)` calls `ReptileSystem.tick`, `TerrariumSystem.tick`,
  `EconomySystem.tick`, and `BreedingSystem.tick` each frame with `delta / 1000` (seconds).
- The tick loop is throttled — systems update on a configurable interval (e.g. every
  500ms) rather than every 16ms frame to avoid floating point drift. The interval is
  a constant in `GameConfig` or `balance.json`.
- On `REPTILE_FED` event: the corresponding reptile sprite plays the `eat` animation,
  then returns to `idle`.
- On `REPTILE_DISTRESSED` event: the sprite switches to the `distressed` animation.
- On `TERRARIUM_CLEANED` event: a brief particle or visual effect plays.
- On `REPTILE_ACQUIRED` event: the new reptile sprite is added to the scene.
- `GameScene` is never stopped or destroyed during a session (architecture 3.2).
- The terrarium canvas fills the screen with correct aspect ratio on both desktop
  and mobile (UI-03).

---

### SPEC-21 — Main HUD

**Purpose**
Implement the persistent heads-up display: coin balance, chest badge, and navigation
buttons for all overlay scenes (UI-02, ECO-02, CHE-08).

**Dependencies**
SPEC-20

**Systems Involved**
`src/ui/HUD.ts` (used within `GameScene`)

**Estimated Complexity**
Medium

**Acceptance Criteria**
- `HUD` is a Phaser Container displayed permanently over the terrarium.
- Coin balance is visible at all times and updates on every `COINS_CHANGED` event (ECO-02).
- Chest badge shows the count of items in `state.chestQueue`. Updates on `CHEST_AWARDED`
  and `CHEST_OPENED` events. Shows 0 as no badge (CHE-08).
- Navigation buttons are present and tappable: Shop, Reptipedia, Achievements, Clean.
- Clean button is visually distinct (highlighted or pulsing) when Cleanliness is below
  the dirty threshold. It is greyed out otherwise (CLN-01, CLN-07).
- Each button tap emits the corresponding player intent event via EventBus or launches
  the corresponding overlay scene.
- All buttons meet the 44×44 CSS pixel minimum touch target (UI-05).
- Breeding timer is shown in HUD when `state.breeding` is active, formatted as
  a countdown (UI-16).
- Pending hatchling indicator (egg icon) is shown in HUD when `state.pendingHatchling`
  is non-null. Tapping it launches `HatchlingOverlayScene` (UI-10, BRD-06).

---

### SPEC-22 — Reptile Interaction and Detail Card

**Purpose**
Implement tap-to-select reptile interaction and the reptile detail card popup
showing stats and action buttons (UI-06, UI-07, UI-08, UI-09).

**Dependencies**
SPEC-20, SPEC-21

**Systems Involved**
`src/ui/ReptileCard.ts`, `src/ui/StatBar.ts` (used within `GameScene`)

**Estimated Complexity**
Medium

**Acceptance Criteria**
- Tapping a reptile sprite opens `ReptileCard` for that reptile (UI-06).
- `ReptileCard` displays: reptile name, species name, and three `StatBar` components
  for Hunger, Happiness (derived), and Health.
- `StatBar` fills proportionally to 0–100 value. Color is green above the green
  threshold, yellow above yellow threshold, red below yellow threshold (UI-08).
- Each `StatBar` includes a text label or icon — color is never the only indicator (NFR-14).
- `ReptileCard` includes a "Feed" button. Tapping it emits `PLAYER_FEED_REPTILE`
  and plays the eat animation on the sprite (FED-01, FED-04).
- `ReptileCard` includes a "Breed" button. Tapping it closes the card and opens
  `BreedingOverlayScene` with this reptile pre-selected.
- `ReptileCard` closes when tapping outside it or tapping the reptile again.
- A hunger indicator icon floats above reptile sprites whose Hunger is below the
  hungry threshold (UI-09). It disappears when Hunger is restored.
- A "Feed All" button in the HUD or ReptileCard area emits `PLAYER_FEED_ALL` (UI-07).
- All text in `ReptileCard` is sourced from `LocaleManager` (NFR-15).


---

## LAYER 5 — Overlay Scenes

---

### SPEC-23 — Shop Overlay Scene

**Purpose**
Implement the species and decoration shop (UI-11 through UI-14, ECO-06, ECO-07).

**Dependencies**
SPEC-20, SPEC-21

**Systems Involved**
`src/scenes/overlays/ShopOverlayScene.ts`, `src/ui/ConfirmDialog.ts`

**Estimated Complexity**
Medium

**Acceptance Criteria**
- `ShopOverlayScene` launches on top of `GameScene` without stopping it (architecture 3.2).
- Shows two tabs: Species and Decorations.
- Species tab: lists all non-event species from config. Each item shows name, rarity,
  cost, and a species illustration.
- Items the player cannot afford are visually dimmed but still visible with cost shown (UI-12).
- Species the player already owns show an "Owned" label instead of a Buy button (UI-13).
- Decoration tab: lists all decorations. Items the player owns (quantity > 0) show
  current owned count.
- Tapping a purchasable item opens `ConfirmDialog` with item name, cost, and
  Confirm/Cancel buttons (UI-14).
- `ConfirmDialog` confirms: emits `PLAYER_PURCHASE_SPECIES` or
  `PLAYER_PURCHASE_DECORATION`. The overlay listens for `PURCHASE_SUCCESS` or
  `PURCHASE_FAILED_INSUFFICIENT_FUNDS` and updates the display accordingly.
- Coin balance in the overlay updates reactively on `COINS_CHANGED`.
- All text sourced from `LocaleManager`.
- Scene closes cleanly — `GameScene` resumes full interactivity.

---

### SPEC-24 — Breeding Overlay Scene

**Purpose**
Implement the pair selection UI and display the active breeding countdown (UI-15, UI-16, BRD-01, BRD-02).

**Dependencies**
SPEC-20, SPEC-21, SPEC-22

**Systems Involved**
`src/scenes/overlays/BreedingOverlayScene.ts`

**Estimated Complexity**
Medium

**Acceptance Criteria**
- `BreedingOverlayScene` shows the current state: if `state.breeding` is active,
  displays both parent names and a live countdown timer to hatch. No pair selection
  is available while breeding is in progress (BRD-02).
- If no breeding is active, shows a list of valid compatible pairs: same species,
  opposite genders, neither on cooldown.
- Each listed pair shows both reptile names, species, and genders.
- Reptiles on cooldown are listed separately as "resting" with time remaining.
- Tapping a valid pair emits `PLAYER_START_BREEDING`. On `BREEDING_STARTED` event,
  the scene updates to show the active countdown.
- On `BREEDING_START_FAILED`, a descriptive error message is shown (distinct failure
  event from SPEC-13 acceptance criteria).
- The countdown timer in HUD (SPEC-21) and in this overlay both reflect remaining time.
- All text sourced from `LocaleManager`.

---

### SPEC-25 — Hatchling Overlay Scene

**Purpose**
Implement the hatchling reveal and keep/sell resolution screen (BRD-06, BRD-09, BRD-10, BRD-11, CHE-06, UI-17).

**Dependencies**
SPEC-20, SPEC-21, SPEC-13, SPEC-16

**Systems Involved**
`src/scenes/overlays/HatchlingOverlayScene.ts`

**Estimated Complexity**
Medium

**Acceptance Criteria**
- `HatchlingOverlayScene` is launched automatically when `BREEDING_COMPLETE` is emitted
  (by BreedingSystem or ChestSystem).
- Displays the hatchling's species name, illustration, and morph name (if morph is not
  the base variant) (UI-17).
- Shows two buttons: Keep and Sell. Sell button shows coin value.
- If terrarium is at population cap, Keep button is disabled with a tooltip explaining
  why (BRD-10).
- Tapping Keep emits `PLAYER_RESOLVE_HATCHLING { decision: 'keep' }`.
- Tapping Sell emits `PLAYER_RESOLVE_HATCHLING { decision: 'sell' }`.
- On `HATCHLING_RESOLVED`: scene closes. If another pending hatchling resolves from
  a queued surprise egg, the scene reopens for the next one.
- The hatchling cannot be dismissed without resolving — no close button (BRD-12).
- All text sourced from `LocaleManager`.

---

### SPEC-26 — Chest Overlay Scene

**Purpose**
Implement chest opening animation and loot reveal (CHE-03, CHE-04, CHE-07, CHE-08).

**Dependencies**
SPEC-20, SPEC-21, SPEC-16

**Systems Involved**
`src/scenes/overlays/ChestOverlayScene.ts`

**Estimated Complexity**
Medium

**Acceptance Criteria**
- `ChestOverlayScene` launches when the player taps the chest badge in HUD (CHE-07).
- Displays the count of waiting chests. Each chest can be opened individually.
- Tapping "Open" emits `PLAYER_OPEN_CHEST`.
- On `CHEST_OPENED` event: a brief chest-opening animation plays before loot is revealed.
  Animation must complete before loot is shown (CHE-07).
- Loot reveal shows: coins amount, decoration name + icon, or "Surprise Egg!" with
  species name — depending on result.
- Audio `sfx/chest-open` plays on open (AUD-02).
- If loot is a surprise egg, after dismissing the loot reveal, `HatchlingOverlayScene`
  launches automatically.
- Coin and decoration loot is credited via the event — the scene does not apply loot
  directly. It only listens for `CHEST_LOOT_RESOLVED`.
- After all chests are opened or the player closes, scene stops cleanly.
- All text sourced from `LocaleManager`.

---

### SPEC-27 — Reptipedia Overlay Scene

**Purpose**
Implement the species encyclopedia — the primary educational feature (PED-01 through PED-07).

**Dependencies**
SPEC-20, SPEC-21, SPEC-14

**Systems Involved**
`src/scenes/overlays/ReptipediaOverlayScene.ts`

**Estimated Complexity**
Medium

**Acceptance Criteria**
- `ReptipediaOverlayScene` shows all 9 MVP species in a scrollable/paginated list.
- Locked species (not in `state.reptipedia.unlockedSpeciesIds`) show a silhouette or
  greyed illustration with name replaced by "???" (PED-04).
- Tapping an unlocked species opens its detail panel with: illustration, common name,
  scientific name, geographic origin, habitat, temperature range (with icon), diet
  (with icon), lifespan (with icon), and 1–2 fact lines (PED-03, PED-06).
- Tapping a locked species shows a brief "Obtain one to unlock" message.
- The unlock state is read from `state.reptipedia` on scene open and updated when
  `REPTIPEDIA_ENTRY_UNLOCKED` fires while the scene is open.
- Groups are visually indicated (gecko, lizard, turtle, snake, chameleon sections).
- All content text sourced from `LocaleManager` for UI chrome; species fact text
  comes from `ConfigManager` (species data is not localised in MVP).
- Scene closes cleanly on back/close button.

---

### SPEC-28 — Achievements Overlay Scene

**Purpose**
Implement the achievement panel — progress tracking and unlock display (ACH-04, ACH-06, ACH-07).

**Dependencies**
SPEC-20, SPEC-21, SPEC-15

**Systems Involved**
`src/scenes/overlays/AchievementsOverlayScene.ts`, `src/ui/NotificationBanner.ts`

**Estimated Complexity**
Medium

**Acceptance Criteria**
- `AchievementsOverlayScene` lists all achievements from config.
- Unlocked achievements show: name, description, reward received, and a "completed" state.
- Locked achievements show: name and description visible, reward shown as "?" (ACH-06).
- Progress-based achievements show a progress indicator (e.g. "7 / 10").
- `NotificationBanner` is a separate Phaser UI component that appears briefly (e.g. 3 seconds)
  at the top of `GameScene` (not blocking the terrarium) when `ACHIEVEMENT_UNLOCKED` fires,
  whether or not the panel is open (ACH-04).
- `NotificationBanner` shows achievement name and a brief congratulatory string from locale.
- Audio `sfx/achievement` plays on unlock (AUD-02).
- The panel updates reactively when `ACHIEVEMENT_UNLOCKED` fires while open.
- All text sourced from `LocaleManager`.


---

## LAYER 6 — Decoration Placement

---

### SPEC-29 — Terrarium Decoration Placement UI

**Purpose**
Implement the interactive decoration placement, repositioning, and removal flow
within the terrarium (TER-08, TER-09, TER-11, TER-12).

**Dependencies**
SPEC-20, SPEC-21, SPEC-23

**Systems Involved**
`src/scenes/GameScene.ts` (placement mode), `src/scenes/overlays/ShopOverlayScene.ts`

**Estimated Complexity**
High

**Acceptance Criteria**
- After purchasing a decoration, it appears in the player's inventory. A "Decorate"
  mode button is accessible from the HUD or shop.
- In decoration mode, inventory items are listed. Dragging/tapping an inventory item
  places a preview sprite at a default position in the terrarium.
- The player can drag the placed decoration to any position within the terrarium bounds.
- Tapping a placed decoration while in decoration mode shows options: Move (re-drag),
  Remove (returns to inventory and emits `PLAYER_REMOVE_DECORATION`).
- Confirming placement emits `PLAYER_PLACE_DECORATION` with the decoration ID and
  final (x, y) position.
- After placement, inventory quantity decrements. If quantity reaches 0, the item
  is no longer available to place but existing placed items remain.
- Background and substrate selection is available — tapping a background/substrate
  from inventory replaces the current layer immediately (no drag required).
- Background/substrate selection emits a new `PLAYER_CHANGE_BACKGROUND` or
  `PLAYER_CHANGE_SUBSTRATE` event handled by `TerrariumSystem`.
- Exiting decoration mode saves state.
- Touch drag input works correctly on mobile (UI-04).

---

## LAYER 7 — Audio

---

### SPEC-30 — Audio Manager Integration

**Purpose**
Implement AudioManager with full SFX and ambient audio wiring, and persist the
mute preference (AUD-01 through AUD-05).

**Dependencies**
SPEC-18, SPEC-19, SPEC-20

**Systems Involved**
`src/core/AudioManager.ts`

**Estimated Complexity**
Low

**Acceptance Criteria**
- `AudioManager` wraps Phaser's sound manager. It depends on a Phaser scene being
  active — it is initialized in `GameScene` after `PreloadScene` completes loading.
- `playAmbient()` starts `terrarium-loop.mp3` in looped mode (AUD-01).
- `stopAmbient()` fades out the ambient track.
- `playSfx(key)` plays the corresponding SFX file. If the key doesn't exist, logs
  a warning and does not throw.
- `AudioManager` subscribes to: `REPTILE_FED` → `sfx/feed`, `TERRARIUM_CLEANED` →
  `sfx/clean`, `CHEST_OPENED` → `sfx/chest-open`, `BREEDING_COMPLETE` → `sfx/hatch`,
  `ACHIEVEMENT_UNLOCKED` → `sfx/achievement`, `PURCHASE_SUCCESS` → `sfx/purchase`.
- `setMuted(muted: boolean)` mutes/unmutes all sound and updates
  `state.settings.audioEnabled`. Save is triggered.
- On startup, `audioEnabled` is read from `state.settings`. Audio starts muted if false.
- A mute/unmute toggle button exists in the HUD (AUD-03).
- Audio preference persists across sessions via the save system (AUD-04).
- The game is fully functional with audio off — no gameplay depends on audio.

---

## LAYER 8 — First-Run Experience

---

### SPEC-31 — Main Menu Scene

**Purpose**
Implement the title screen shown only to first-time players. Sets the tone and
leads into the game (architecture 3.2).

**Dependencies**
SPEC-17, SPEC-18, SPEC-19

**Systems Involved**
`src/scenes/MainMenuScene.ts`

**Estimated Complexity**
Low

**Acceptance Criteria**
- `MainMenuScene` shows the game title and a "Start" button.
- Visual presentation uses the project's warm earthy palette and at least one
  reptile illustration (vision section 9).
- Tapping "Start" transitions to `GameScene`.
- This scene is only shown when no prior save exists (architecture 3.2).
- Returning players never see this scene — `PreloadScene` skips it when a save is found.
- All text sourced from `LocaleManager`.

---

## LAYER 9 — Integration and Polish

---

### SPEC-32 — End-to-End Save and Idle Verification

**Purpose**
Verify the full save/load/idle cycle works correctly as an integrated system:
close the game, wait, reopen, confirm offline time was applied accurately (SAV-01
through SAV-08, IDL-01 through IDL-07).

**Dependencies**
All prior specs.

**Systems Involved**
`SaveManager`, `IdleSystem`, `PreloadScene`, all game systems

**Estimated Complexity**
Medium

**Acceptance Criteria**
- Saving state, clearing page, and reloading correctly restores all fields defined
  in `GameState` including: reptiles, breeding, pendingHatchling, chestQueue,
  inventory, reptipedia, achievements, settings.
- Offline time is correctly computed from `lastSeenTimestamp` on load.
- Offline time cap is respected — artificially advancing the timestamp beyond the cap
  does not produce more gains than the cap allows.
- Corruption test: manually setting invalid JSON in LocalStorage causes the game
  to start fresh without crashing (SAV-08).
- Schema migration test: a save with `schemaVersion: 0` (one below current) is
  migrated and loaded successfully.
- `visibilitychange` event writes `lastSeenTimestamp` — switching tabs and returning
  correctly captures the gap.
- `beforeunload` event writes `lastSeenTimestamp` — closing the tab captures the gap.

---

### SPEC-33 — Performance Verification

**Purpose**
Verify the game meets performance requirements on target platforms (NFR-01 through NFR-04).

**Dependencies**
All prior specs.

**Systems Involved**
All (measurement only, no new code expected)

**Estimated Complexity**
Low

**Acceptance Criteria**
- Production build (`npm run build`) completes without errors.
- Gzipped JS + CSS bundle does not exceed 2 MB (NFR-04). Measured with build output.
- Browser DevTools profiler shows the game running at 60 fps on desktop Chrome
  during normal gameplay (NFR-02).
- Browser DevTools profiler shows ≥ 30 fps on mobile Chrome with CPU throttling
  set to 4× slowdown (NFR-03 proxy).
- `PreloadScene` to `GameScene` transition completes within 5 seconds on a simulated
  Fast 3G connection in DevTools (NFR-01 proxy).
- No memory leaks observed in a 5-minute play session measured via DevTools Heap Snapshot.

---

### SPEC-34 — Accessibility Audit

**Purpose**
Verify WCAG 2.1 AA contrast compliance and non-color state communication (NFR-12, NFR-13, NFR-14).

**Dependencies**
SPEC-21, SPEC-22, SPEC-23, SPEC-27, SPEC-28

**Systems Involved**
All UI components

**Estimated Complexity**
Low

**Acceptance Criteria**
- All text rendered by Phaser UI components (HUD, ReptileCard, overlays) has a
  contrast ratio of at least 4.5:1 against its background (NFR-12).
- Stat bars (StatBar component) display a text label or icon alongside color
  to convey state — color is never the sole indicator (NFR-14).
- The hunger floating icon above reptile sprites is not color-only — it uses an
  icon or shape in addition to any color tint.
- The clean indicator in HUD communicates state via shape/icon change, not only color.
- All interactive HUD buttons are reachable by keyboard Tab navigation where
  Phaser's DOM overlay or input system permits (NFR-13).
- Note: full WCAG validation requires manual testing with assistive technologies
  and is beyond the scope of this spec.

---

*End of implementation specifications.*
*Total: 34 specifications across 9 layers.*
*Next step: generate implementation tasks from these specifications.*
*Each task maps to one spec. Task order follows spec layer order.*
