# Architecture Document
## Reptile Haven — Idle Terrarium Management Game
**Version:** 1.1
**Date:** July 2026
**Status:** Active
**Scope:** MVP (Phase 1)

---

## Change Log

| Version | Date | Change |
|---------|------|--------|
| 1.0 | July 2026 | Initial architecture document |
| 1.1 | July 2026 | Resolved 11 post-review gaps: defined InventoryState, ReptipediaState, AchievementState, SettingsState, ChestState, ReptipediaEntry, AnimationKeyMap; added lifetimeCoinsEarned to GameState; documented EconomySystem as REPTILE_ACQUIRED emitter; documented surprise egg routing via ChestSystem → pendingHatchling; introduced Registry service locator; updated dependency rules and folder structure accordingly. |

---

## Table of Contents

1. Architectural Principles
2. High-Level Architecture Overview
3. Game Architecture
   - 3.1 Core Gameplay Loop
   - 3.2 Game Flow and Scene Transitions
   - 3.3 Scenes
   - 3.4 Game Systems
   - 3.5 Entities and Data Models
   - 3.6 Managers
   - 3.7 Event Bus
   - 3.8 Data Flow Diagram
4. Software Architecture
   - 4.1 Folder Structure
   - 4.2 Module Responsibilities
   - 4.3 Dependency Rules
   - 4.4 Configuration System
   - 4.5 Save System
   - 4.6 Locale System
   - 4.7 Asset Organization
5. Phase 2 Expansion Points

---

## 1. Architectural Principles

These principles govern every structural decision in this document.
They derive directly from the requirements (NFR-08 through NFR-11) and the vision.

1. **Single source of truth.** All runtime game state lives in one `GameState` object. No system owns its own private state slice.
2. **Systems are stateless services.** Game systems receive state and config as inputs, return or mutate state as output. They do not hold state themselves.
3. **Decoupled via event bus.** Systems communicate side effects through a typed event bus, never through direct cross-system imports.
4. **Config-driven, not code-driven.** Adding a new species, decoration, or achievement requires only a config entry. Zero code changes.
5. **Idle function is pure.** The function that applies offline time to game state is deterministic and has no side effects. It can be called in any context, including tests.
6. **UI is a view layer only.** Phaser scenes and UI panels read from state and emit player intent events. They do not compute game logic.
7. **Design for Phase 2 without building it.** Interfaces and boundaries are placed where social and backend systems will eventually attach. No stub implementations are shipped.


---

## 2. High-Level Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   Phaser 3 Game                      │  │
│  │                                                      │  │
│  │   ┌─────────────┐     ┌──────────────────────────┐  │  │
│  │   │   Scenes    │────▶│      Event Bus           │  │  │
│  │   │  (View Layer│◀────│  (typed, decoupled)      │  │  │
│  │   │   + Input)  │     └──────────┬───────────────┘  │  │
│  │   └─────────────┘                │                   │  │
│  │                                  │                   │  │
│  │   ┌───────────────────────────────────────────────┐  │  │
│  │   │              Game Systems                     │  │  │
│  │   │  ReptileSystem │ BreedingSystem │ EconomySystem│  │  │
│  │   │  TerrariumSystem │ ChestSystem  │ IdleSystem   │  │  │
│  │   │  AchievementSystem │ ReptipediaSystem          │  │  │
│  │   └───────────────────────┬───────────────────────┘  │  │
│  │                            │ read / write              │  │
│  │   ┌────────────────────────▼──────────────────────┐  │  │
│  │   │               GameState                       │  │  │
│  │   │   (single serializable object — the truth)    │  │  │
│  │   └────────────────────────┬──────────────────────┘  │  │
│  │                            │                           │  │
│  │   ┌────────────────────────▼──────────────────────┐  │  │
│  │   │              Managers                         │  │  │
│  │   │  SaveManager │ ConfigManager │ AudioManager   │  │  │
│  │   │  LocaleManager │ AssetManager                 │  │  │
│  │   └───────────────────────────────────────────────┘  │  │
│  │                                                      │  │
│  │   ┌───────────────────────────────────────────────┐  │  │
│  │   │              Data Layer (config/)             │  │  │
│  │   │  species.json │ decorations.json │ balance.json│  │  │
│  │   │  achievements.json │ chests.json │ locales/   │  │  │
│  │   └───────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│                      LocalStorage                           │
└─────────────────────────────────────────────────────────────┘
```

**Layer responsibilities at a glance:**

| Layer | What it does | What it never does |
|-------|--------------|--------------------|
| Scenes | Renders state, handles input, plays animations | Computes game logic |
| Event Bus | Routes typed events between scenes and systems | Holds state |
| Systems | Applies game rules, mutates GameState, emits events | Renders anything |
| GameState | Holds all runtime data as a plain serializable object | Executes logic |
| Managers | Cross-cutting services (save, config, audio, locale) | Game rules |
| Data Layer | JSON/TS config files read at startup | Runtime mutation |


---

## 3. Game Architecture

### 3.1 Core Gameplay Loop

The gameplay loop maps directly to the vision (Section 5) and is implemented as a
continuous tick-based update cycle while the game is open, plus a one-time idle
catch-up calculation on startup.

```
STARTUP
  └─ Load config
  └─ Load save (or init new game)
  └─ Apply idle catch-up (IdleSystem.applyOfflineTime)
  └─ Validate achievements
  └─ Launch BootScene → PreloadScene → GameScene

ACTIVE SESSION (Phaser update loop, ~60fps)
  ├─ Tick timers (hunger decay, cleanliness decay, breeding timer, coin accumulation)
  ├─ Evaluate stat thresholds → emit events as needed
  ├─ Process queued player actions (feed, clean, breed, open chest, purchase)
  ├─ Evaluate achievements reactively on relevant events
  └─ Auto-save on state change

PAGE UNLOAD / VISIBILITY HIDDEN
  └─ Write last-seen timestamp
  └─ Save current state
```

The tick rate for game-logic timers (decay, accumulation) is deliberately slower
than the render frame rate. All decay and generation values are expressed as rates
per real-world second. The update loop accumulates delta time and applies changes
in configurable intervals to avoid floating-point drift.

---

### 3.2 Game Flow and Scene Transitions

```
BootScene
   │  Initialize Phaser, register plugins, load minimal assets
   ▼
PreloadScene
   │  Load all game assets (sprites, audio, fonts)
   │  Load and validate config files
   │  Show loading progress bar
   ▼
MainMenuScene  (first-time players only)
   │  Show title, "Start" button
   │  On returning players, skip directly to GameScene
   ▼
GameScene  ◀────────────────────────────────────────┐
   │  Primary scene — always active                 │
   │  Renders terrarium, reptiles, HUD              │
   │  Manages active overlays as child scenes       │
   │                                                │
   ├──▶ ShopOverlayScene      (opened/closed in place)
   ├──▶ BreedingOverlayScene  (opened/closed in place)
   ├──▶ HatchlingOverlayScene (opened/closed in place)
   ├──▶ ChestOverlayScene     (opened/closed in place)
   ├──▶ ReptipediaOverlayScene(opened/closed in place)
   └──▶ AchievementsOverlayScene (opened/closed in place)
```

Key design choices:
- `GameScene` is never destroyed during a session. Overlays are launched as
  additional Phaser scenes running in parallel, rendered on top via scene depth.
  This avoids the complexity of scene data passing and keeps the terrarium always
  visible behind overlays (as required by UI-01).
- `MainMenuScene` is only shown once per first-time player. Returning players
  (save data exists) go directly to `GameScene` after `PreloadScene`.

---

### 3.3 Scenes

| Scene | Responsibility |
|-------|----------------|
| `BootScene` | Phaser configuration, plugin registration, load splash screen |
| `PreloadScene` | Asset loading, config loading and validation, first-run detection |
| `MainMenuScene` | Title screen for new players only |
| `GameScene` | Terrarium rendering, reptile sprites, HUD, ambient audio |
| `ShopOverlayScene` | Species and decoration purchase UI |
| `BreedingOverlayScene` | Pair selection UI and active timer display |
| `HatchlingOverlayScene` | Hatchling reveal, keep/sell decision |
| `ChestOverlayScene` | Chest opening animation and loot reveal |
| `ReptipediaOverlayScene` | Species encyclopedia panels |
| `AchievementsOverlayScene` | Achievement list and progress |

All overlay scenes:
- Are launched with `scene.launch()` and closed with `scene.stop()`.
- Communicate with `GameScene` exclusively via the event bus.
- Never read from or write to `GameState` directly. They emit player intent events
  (e.g. `PLAYER_FEED_REPTILE`, `PLAYER_PURCHASE_SPECIES`) which systems handle.


---

### 3.4 Game Systems

Each system is a stateless class (or module of pure functions) that operates on
`GameState` and emits events via the event bus. Systems are instantiated once
at game startup and hold only references to shared services (EventBus, ConfigManager).

#### ReptileSystem
- Applies hunger decay to all reptiles per tick delta
- Calculates Happiness from Hunger, Cleanliness, and Decoration Score (formula from config)
- Applies Health degradation when Hunger has been at zero past configured threshold
- Applies Health recovery when Hunger is above zero
- Handles feed action: validates, updates Hunger, determines coin reward, emits events
- Emits: `REPTILE_HUNGER_CHANGED`, `REPTILE_HAPPINESS_CHANGED`, `REPTILE_HEALTH_CHANGED`,
  `REPTILE_FED`, `REPTILE_HUNGRY` (threshold crossed), `REPTILE_DISTRESSED`

#### TerrariumSystem
- Applies Cleanliness decay per tick delta, scaled by current population
- Calculates Decoration Score from placed decoration data and config weights
- Handles clean action: resets Cleanliness, awards coins, emits event
- Emits: `TERRARIUM_CLEANLINESS_CHANGED`, `TERRARIUM_CLEANED`, `TERRARIUM_DIRTY`
  (threshold crossed)

#### BreedingSystem
- Validates breed pair eligibility (same species, opposite gender, not already breeding)
- Initiates breeding: records pair IDs, start timestamp, and duration in GameState
- Checks breeding completion on each tick (compares current time to start + duration)
- On completion: rolls morph via weighted random, creates pending hatchling in GameState
- Handles keep/sell decision: adds reptile to terrarium or awards coins, clears breeding slot
- Applies and tracks cooldown period per pair
- Emits: `BREEDING_STARTED`, `BREEDING_COMPLETE`, `HATCHLING_RESOLVED`

#### EconomySystem
- Accumulates passive coin generation per tick based on reptile Happiness and config formula
- Handles all coin credit and debit operations (single point of truth for balance changes)
- Increments `GameState.lifetimeCoinsEarned` on every coin credit
- Guards against negative balance on purchases
- Handles `PLAYER_PURCHASE_SPECIES`: validates coins, deducts cost, creates a new
  `ReptileInstance` via `IdGenerator` and species config, appends to `GameState.reptiles`,
  emits `REPTILE_ACQUIRED` then `COINS_CHANGED`
- Handles `PLAYER_PURCHASE_DECORATION`: validates coins, deducts cost, increments
  `InventoryState` quantity for that decoration, emits `COINS_CHANGED`
- Emits: `COINS_CHANGED`, `PURCHASE_SUCCESS`, `PURCHASE_FAILED_INSUFFICIENT_FUNDS`,
  `REPTILE_ACQUIRED`

#### ChestSystem
- Checks daily login chest eligibility on startup (compares calendar date to last chest date)
- Awards chests from other sources (achievement rewards) via event
- Handles open-chest action: performs weighted loot roll against config table, applies reward
- Manages chest queue: enforces max queue size, never drops chests already in queue
- **Surprise egg routing:** if loot roll yields a surprise egg, `ChestSystem` creates a
  `HatchlingState` (random eligible species, morph rolled immediately) and writes it to
  `GameState.pendingHatchling`, then emits `BREEDING_COMPLETE`. This reuses the existing
  hatchling resolution path (`HatchlingOverlayScene`, keep/sell logic) without duplication.
  If `GameState.pendingHatchling` is already occupied, the egg is queued as a `ChestState`
  of type `'surprise_egg'` and resolves after the current hatchling is cleared.
- Emits: `CHEST_AWARDED`, `CHEST_OPENED`, `CHEST_LOOT_RESOLVED`, `BREEDING_COMPLETE`
  (when loot is a surprise egg)

#### IdleSystem
- Exposes a single pure function: `applyOfflineTime(state, elapsedSeconds, config) → GameState`
- Applies: hunger decay for all reptiles, Cleanliness decay, breeding timer progress,
  passive coin accumulation — all calculated from elapsed seconds
- Caps elapsed time at configured maximum before applying
- Has no side effects. Does not emit events (caller emits if needed after applying)
- This function is the primary unit-testable piece of game logic

#### AchievementSystem
- Loads achievement definitions from config at startup
- Subscribes to relevant events on the event bus
- On each relevant event, evaluates matching achievement conditions against GameState
- Unlocks achievement: marks it in GameState, awards reward, emits notification event
- Emits: `ACHIEVEMENT_UNLOCKED`

#### ReptipediaSystem
- Tracks which species entries are unlocked in GameState
- Subscribes to `REPTILE_ACQUIRED` to unlock the corresponding entry
- Exposes unlock count for achievement evaluation
- Emits: `REPTIPEDIA_ENTRY_UNLOCKED`


---

### 3.5 Entities and Data Models

These are the core TypeScript types that define game state. They are plain serializable
objects — no classes, no methods. Logic lives in systems; data lives here.

#### GameState (root save object)
```
GameState {
  schemaVersion: number
  lastSeenTimestamp: number          // Unix ms, written on every save and unload
  coins: number
  lifetimeCoinsEarned: number        // cumulative total — never decremented; used by achievements
  terrarium: TerrariumState
  reptiles: ReptileInstance[]
  breeding: BreedingState | null
  pendingHatchling: HatchlingState | null
  chestQueue: ChestState[]
  lastDailyChestDate: string | null  // ISO date string "YYYY-MM-DD"
  inventory: InventoryState
  reptipedia: ReptipediaState
  achievements: AchievementState
  settings: SettingsState
}
```

#### TerrariumState
```
TerrariumState {
  cleanliness: number                // 0–100
  backgroundId: string               // ref to decoration config
  substrateId: string                // ref to decoration config
  placedDecorations: PlacedDecoration[]
}

PlacedDecoration {
  decorationId: string
  x: number
  y: number
}
```

#### ReptileInstance
```
ReptileInstance {
  id: string                         // uuid, stable across saves
  speciesId: string                  // ref to species config
  name: string                       // player-assigned or default
  gender: 'male' | 'female'
  morphId: string | null             // ref to morph config entry, null = base morph
  hunger: number                     // 0–100
  health: number                     // 0–100
  hungerAtZeroSince: number | null   // timestamp, used for health degradation
  breedingCooldownUntil: number | null // timestamp
}
// Note: Happiness is derived (not stored) — computed by ReptileSystem on demand
```

#### BreedingState
```
BreedingState {
  maleId: string
  femaleId: string
  speciesId: string
  startedAt: number                  // Unix ms
  durationMs: number                 // from config, captured at breed start
}
```

#### HatchlingState
```
HatchlingState {
  speciesId: string
  morphId: string | null
  sellValue: number                  // from config, captured at hatch time
}
```

#### SpeciesDefinition (config, not save state)
```
SpeciesDefinition {
  id: string
  name: string
  scientificName: string
  group: 'gecko' | 'lizard' | 'turtle' | 'snake' | 'chameleon'
  rarity: 'common' | 'uncommon' | 'rare' | 'special_event'
  shopCost: number
  hatchSellValue: number
  hungerDecayRate: number            // units/second
  breedingDurationMs: number
  breedingCooldownMs: number
  morphs: MorphDefinition[]
  reptipedia: ReptipediaEntry
  spriteKey: string
  animationKeys: AnimationKeyMap
}

MorphDefinition {
  id: string
  name: string
  weight: number                     // relative probability weight
  spriteKey: string
}
```

#### InventoryState
```
InventoryState {
  items: InventoryItem[]
}

InventoryItem {
  decorationId: string               // ref to decoration config
  quantity: number                   // how many the player owns (unplaced)
}
```
When a decoration is purchased: quantity increments.
When placed in terrarium: quantity decrements (minimum 0 — cannot place what you don't own).
When removed from terrarium: quantity increments back.
This model supports owning multiples of the same decoration without duplicating config data.

#### ReptipediaState
```
ReptipediaState {
  unlockedSpeciesIds: string[]       // species IDs whose entries are accessible
}
```
An entry is added when `REPTILE_ACQUIRED` fires for a species not already in this list.
Once added, it is never removed (PED-05).

#### AchievementState
```
AchievementState {
  unlockedIds: string[]              // achievement IDs that have been earned
  progress: Record<string, number>   // keyed by achievementId, for multi-step conditions
}
```
`progress` enables tracking partial progress on achievements like "clean 10 times"
without storing a separate counter for each condition type in GameState.

#### SettingsState
```
SettingsState {
  audioEnabled: boolean
}
```
MVP shape only. Phase 2 adds `localeKey: string` to this object.
`audioEnabled` defaults to `true` on first run and is persisted via the main save (AUD-04).

#### ChestState
```
ChestState {
  type: 'daily' | 'achievement' | 'surprise_egg'  // determines loot table; surprise_egg
                                                   // is a pending hatchling-in-queue
  awardedAt: number                  // Unix ms timestamp — for display/sorting only
}
```

#### ReptipediaEntry (embedded in SpeciesDefinition)
```
ReptipediaEntry {
  commonName: string
  scientificName: string
  geographicOrigin: string
  habitatType: string
  temperatureRange: string           // e.g. "24–32°C"
  primaryDiet: string
  averageLifespan: string            // e.g. "10–15 years"
  facts: string[]                    // 1–2 concise real-world facts (PED-03)
}
```

#### AnimationKeyMap (embedded in SpeciesDefinition)
```
AnimationKeyMap {
  idle: string                       // Phaser animation key for idle loop
  eat: string                        // triggered on feed action
  distressed: string                 // triggered at 0 Health
}
```
All three keys are required. Additional animation keys (e.g. `breed`) may be added
in future phases without breaking existing definitions.

#### AchievementDefinition (config, not save state)
```
AchievementDefinition {
  id: string
  name: string
  description: string
  conditionType: AchievementConditionType
  conditionValue: number | string
  rewardCoins: number
  rewardChests: number
}
```

---

### 3.6 Managers

Managers are singleton services instantiated at boot. They are not systems — they do
not apply game rules. They provide shared infrastructure to both systems and scenes.

#### SaveManager
- Serializes `GameState` to JSON and writes to LocalStorage
- Deserializes and validates on load; handles missing or corrupt data (SAV-08)
- Migrates save data when `schemaVersion` has changed
- Writes last-seen timestamp on `visibilitychange` and `beforeunload` events
- Exposes: `save(state)`, `load(): GameState | null`, `clear()`

#### ConfigManager
- Loads and parses all JSON config files at startup
- Validates each file against its TypeScript schema; throws a descriptive error on failure (NFR-07)
- Exposes typed accessors: `getSpecies(id)`, `getAllSpecies()`, `getBalance()`,
  `getDecorations()`, `getAchievements()`, `getChestTable(type)`, etc.
- Config is read-only at runtime — never mutated

#### AudioManager
- Wraps Phaser's Sound Manager with typed methods for game events
- Respects the muted preference from SettingsState
- Exposes: `playAmbient()`, `stopAmbient()`, `playSfx(key)`, `setMuted(muted)`

#### LocaleManager
- Loads the active locale JSON file at startup (English only in MVP)
- Exposes: `t(key: string, params?: Record<string, string>): string`
- All player-facing strings route through this — never concatenated inline (NFR-15)

#### AssetManager
- Wraps Phaser's loader with typed keys matched to config sprite references
- Validates that all sprite keys referenced in species config exist as loaded assets
- Exposes the asset key registry to scenes for safe sprite creation

#### Registry (Service Locator)
- A singleton class in `src/core/Registry.ts` that holds typed references to all
  managers and systems after they are created in `PreloadScene`.
- All scenes and systems obtain dependencies via `Registry.get(ManagerClass)` rather
  than through constructor arguments or global imports.
- Rationale: Phaser scenes do not use conventional constructors for dependency injection.
  Threading dependencies through `scene.init()` data payloads is fragile and breaks
  overlay scenes (launched with `scene.launch()`). The Registry provides a clean,
  typed resolution point without coupling the instantiation order to scene lifecycle.
- `Registry` is the only singleton that is globally accessible. All other classes are
  obtained through it.
- Example usage: `Registry.get(SaveManager).save(state)`


---

### 3.7 Event Bus

The event bus is a typed, in-process publish/subscribe channel. It replaces all
direct cross-system and scene-to-system calls.

**Design:**
- Implemented as a simple typed EventEmitter (using Phaser's built-in emitter or a
  lightweight custom class wrapping Node's EventEmitter pattern).
- Events are defined as a single typed enum/const map (`GameEvent`).
- Every event has a defined payload type. No untyped `any` payloads (NFR-11).
- Systems subscribe during initialization and unsubscribe on destroy.

**Event categories:**

```
// Player intent (emitted by scenes, consumed by systems)
PLAYER_FEED_REPTILE          payload: { reptileId: string }
PLAYER_FEED_ALL
PLAYER_CLEAN_TERRARIUM
PLAYER_START_BREEDING        payload: { maleId: string, femaleId: string }
PLAYER_RESOLVE_HATCHLING     payload: { decision: 'keep' | 'sell' }
PLAYER_OPEN_CHEST
PLAYER_PURCHASE_SPECIES      payload: { speciesId: string }
PLAYER_PURCHASE_DECORATION   payload: { decorationId: string }
PLAYER_PLACE_DECORATION      payload: { decorationId: string, x: number, y: number }
PLAYER_REMOVE_DECORATION     payload: { placedIndex: number }

// State change (emitted by systems, consumed by scenes and other systems)
REPTILE_FED                  payload: { reptileId: string, coinsEarned: number }
REPTILE_HUNGRY               payload: { reptileId: string }
REPTILE_DISTRESSED           payload: { reptileId: string }
REPTILE_ACQUIRED             payload: { reptileId: string, speciesId: string }
TERRARIUM_CLEANED            payload: { coinsEarned: number }
TERRARIUM_DIRTY
BREEDING_STARTED             payload: { maleId: string, femaleId: string }
BREEDING_COMPLETE            payload: { hatchling: HatchlingState }
HATCHLING_RESOLVED           payload: { decision: 'keep' | 'sell' }
COINS_CHANGED                payload: { newBalance: number, delta: number }
CHEST_AWARDED                payload: { source: string }
CHEST_OPENED                 payload: { loot: ChestLoot }
ACHIEVEMENT_UNLOCKED         payload: { achievementId: string }
REPTIPEDIA_ENTRY_UNLOCKED    payload: { speciesId: string }

// System (emitted by managers)
GAME_SAVED
GAME_LOADED
IDLE_CATCHUP_APPLIED         payload: { elapsedSeconds: number }
```

---

### 3.8 Data Flow Diagram

```
Player taps "Feed" on reptile
          │
          ▼
   GameScene emits
   PLAYER_FEED_REPTILE { reptileId }
          │
          ▼
   ReptileSystem (listener)
   ├─ Reads GameState.reptiles[id]
   ├─ Reads ConfigManager.getBalance().feedHungerAmount
   ├─ Validates: reptile exists
   ├─ Mutates: reptile.hunger += feedHungerAmount (capped at 100)
   ├─ Determines coin reward (config threshold check)
   ├─ Calls EconomySystem.credit(coins)
   │       └─ Mutates GameState.coins
   │       └─ Emits COINS_CHANGED
   ├─ Emits REPTILE_FED { reptileId, coinsEarned }
   └─ SaveManager.save(GameState)
          │
          ▼
   GameScene (listener on REPTILE_FED)
   ├─ Plays eat animation on reptile sprite
   ├─ Shows floating coin reward text
   └─ Updates HUD coin display (listener on COINS_CHANGED)
```

The same pattern applies to every player action. Scenes produce intent; systems
produce outcomes; scenes reflect outcomes.


---

## 4. Software Architecture

### 4.1 Folder Structure

```
ReptileHaven0.1/
├── .kiro/                         # Kiro IDE configuration
├── assets/
│   ├── fonts/
│   ├── images/
│   │   ├── reptiles/              # Sprite sheets per species (e.g. leopard-gecko.png)
│   │   ├── decorations/           # Decoration sprites
│   │   ├── ui/                    # HUD icons, buttons, panels, chest sprites
│   │   └── backgrounds/           # Terrarium background and substrate textures
│   └── sounds/
│       ├── ambient/               # Background loop(s)
│       └── sfx/                   # Feed, clean, chest, hatch, achievement sounds
├── docs/
│   ├── vision.md
│   ├── requirements.md
│   ├── architecture.md            # This document
│   └── roadmap.md
├── src/
│   ├── main.ts                    # Vite entry point — creates Phaser.Game instance
│   ├── config/
│   │   ├── GameConfig.ts          # Phaser.Types.Core.GameConfig
│   │   └── ScaleConfig.ts         # Responsive scale mode settings
│   ├── data/
│   │   ├── species.json           # All species definitions
│   │   ├── decorations.json       # All decoration definitions
│   │   ├── achievements.json      # All achievement definitions
│   │   ├── chests.json            # Chest types and loot tables
│   │   ├── balance.json           # All [CONFIGURABLE] gameplay values
│   │   └── locales/
│   │       └── en.json            # All player-facing strings
│   ├── types/
│   │   ├── GameState.ts           # GameState and all sub-state interfaces
│   │   ├── SpeciesDefinition.ts   # Config data types for species
│   │   ├── DecorationDefinition.ts
│   │   ├── AchievementDefinition.ts
│   │   ├── ChestDefinition.ts
│   │   ├── BalanceConfig.ts       # Typed shape of balance.json
│   │   └── GameEvents.ts          # GameEvent enum + all event payload types
│   ├── core/
│   │   ├── Registry.ts            # Service locator singleton — typed dependency resolution
│   │   ├── EventBus.ts            # Typed event emitter singleton
│   │   ├── SaveManager.ts
│   │   ├── ConfigManager.ts
│   │   ├── AudioManager.ts
│   │   ├── LocaleManager.ts
│   │   └── AssetManager.ts
│   ├── systems/
│   │   ├── ReptileSystem.ts
│   │   ├── TerrariumSystem.ts
│   │   ├── BreedingSystem.ts
│   │   ├── EconomySystem.ts
│   │   ├── ChestSystem.ts
│   │   ├── IdleSystem.ts          # Pure function — no class required
│   │   ├── AchievementSystem.ts
│   │   └── ReptipediaSystem.ts
│   ├── scenes/
│   │   ├── BootScene.ts
│   │   ├── PreloadScene.ts
│   │   ├── MainMenuScene.ts
│   │   ├── GameScene.ts
│   │   └── overlays/
│   │       ├── ShopOverlayScene.ts
│   │       ├── BreedingOverlayScene.ts
│   │       ├── HatchlingOverlayScene.ts
│   │       ├── ChestOverlayScene.ts
│   │       ├── ReptipediaOverlayScene.ts
│   │       └── AchievementsOverlayScene.ts
│   ├── ui/
│   │   ├── HUD.ts                 # Coin display, chest badge, action buttons
│   │   ├── ReptileCard.ts         # Reptile stat panel popup
│   │   ├── StatBar.ts             # Reusable hunger/happiness/health bar component
│   │   ├── NotificationBanner.ts  # Achievement unlock notification
│   │   └── ConfirmDialog.ts       # Purchase confirmation dialog
│   └── utils/
│       ├── Random.ts              # Weighted random, seeded random utilities
│       ├── TimeUtils.ts           # Timestamp helpers, date comparison
│       └── IdGenerator.ts         # UUID generation for reptile IDs
├── tests/
│   ├── systems/
│   │   ├── IdleSystem.test.ts
│   │   ├── ReptileSystem.test.ts
│   │   ├── BreedingSystem.test.ts
│   │   ├── EconomySystem.test.ts
│   │   └── AchievementSystem.test.ts
│   ├── core/
│   │   ├── SaveManager.test.ts
│   │   └── Registry.test.ts
│   └── utils/
│       └── Random.test.ts
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── .gitignore
├── LICENSE
├── README.md
└── CHANGELOG.md
```


---

### 4.2 Module Responsibilities

#### `src/main.ts`
Entry point. Creates the Phaser `Game` instance with `GameConfig`. Starts `BootScene`.
Imports nothing from `systems/` or `core/` directly — all bootstrapping happens in scenes.

#### `src/config/`
Phaser-level configuration only (canvas size, scale mode, scene list, physics settings).
Not to be confused with `src/data/` which holds game balance and content config.

#### `src/data/`
Static JSON files defining all game content and balance. These files are the single
configuration surface for designers and playtesters. No TypeScript logic lives here.

| File | Contains |
|------|----------|
| `species.json` | All 9 MVP species + morph definitions |
| `decorations.json` | All decoration items with costs, categories, and decoration scores |
| `achievements.json` | All achievement definitions with conditions and rewards |
| `chests.json` | Chest types (daily, achievement) and their weighted loot tables |
| `balance.json` | All timing, rate, threshold, and formula constants |
| `locales/en.json` | All player-visible strings, keyed for LocaleManager |

#### `src/types/`
Pure TypeScript interfaces and enums. Zero runtime logic. Every other module imports
types from here rather than defining inline types. This is the contract layer.

#### `src/core/`
Singleton managers, instantiated once in `PreloadScene` and registered in `Registry`.
Scenes and systems obtain all dependencies through `Registry.get(ClassName)`.
No game rules live here — only infrastructure.

#### `src/systems/`
Stateless game logic. Each system class receives `GameState` and emits events.
Systems have no knowledge of Phaser, scenes, or rendering.
`IdleSystem.ts` is an exception: it exports a pure function, not a class.

#### `src/scenes/`
Phaser scene classes. Handle rendering, animation, and player input only.
All game logic is delegated to systems via EventBus events.

#### `src/ui/`
Reusable Phaser UI components (not HTML elements — these are Phaser GameObjects
and Containers). Instantiated by scenes; stateless display components that accept
data and emit events.

#### `src/utils/`
Pure utility functions with no dependencies on game state or Phaser.
Safe to import from any layer including tests.

---

### 4.3 Dependency Rules

These rules prevent circular dependencies and maintain clean layer separation.

```
Allowed import directions (→ means "may import from"):

utils        → (nothing game-specific)
types        → (nothing)
data/        → (nothing — JSON, not TS)
core/        → types, utils
systems/     → types, utils, core/EventBus, core/ConfigManager, core/Registry
scenes/      → types, utils, core/ (including Registry for dependency resolution)
ui/          → types, utils, core/LocaleManager

Forbidden:
systems/     ✗ must NOT import from scenes/ or ui/
core/        ✗ must NOT import from systems/ or scenes/
             ✗ (exception: Registry holds typed references but does not import behavior)
types/       ✗ must NOT import from anywhere
```

The critical rule: **systems never import scenes; scenes never call system methods.**
All communication is via EventBus. This makes systems fully testable outside Phaser.

---

### 4.4 Configuration System

All `[CONFIGURABLE]` values from the requirements live in `src/data/balance.json`
and are typed by `src/types/BalanceConfig.ts`.

`ConfigManager` loads and validates this file at startup (NFR-07). Any missing or
wrong-type field throws a descriptive error before the game reaches `GameScene`.

Example structure of `balance.json`:
```json
{
  "idle": {
    "maxOfflineCapSeconds": 86400
  },
  "hunger": {
    "feedAmount": 30,
    "hungryCoinThreshold": 40,
    "feedCoinReward": 5,
    "wellfedThreshold": 80
  },
  "health": {
    "degradationDelaySeconds": 3600,
    "degradationRatePerSecond": 0.005,
    "recoveryRatePerSecond": 0.01
  },
  "cleanliness": {
    "baseDecayRatePerSecond": 0.002,
    "perReptileMultiplier": 0.0005,
    "dirtyThreshold": 30,
    "cleanCoinReward": 10
  },
  "economy": {
    "passiveCoinHappinessThreshold": 50,
    "passiveCoinRatePerSecondPerReptile": 0.05
  },
  "breeding": {
    "maxActivePairs": 1
  },
  "terrarium": {
    "maxPopulation": 8
  },
  "chests": {
    "maxQueueSize": 10
  },
  "ui": {
    "statBarGreenThreshold": 70,
    "statBarYellowThreshold": 35
  }
}
```

Species-specific values (hunger decay rate, breeding duration, costs) live in
`species.json` alongside their species definition, not in `balance.json`.
This keeps all data about a species in one place (NFR-08).


---

### 4.5 Save System

#### Storage Key
A single LocalStorage key holds the entire serialized `GameState` as JSON.
Key: `reptile_haven_save_v1` (version suffix allows clean migration if key format changes).

#### Write Strategy
Writes are full replacements (`JSON.stringify` of entire `GameState`), never partial.
This satisfies NFR-05 (atomic writes): a failed write leaves the previous full save
intact rather than producing a partially-updated record.

Saves are triggered:
1. After every player action that mutates state (feed, clean, purchase, etc.)
2. On `visibilitychange` (tab hidden) and `beforeunload` (tab/window close)
3. After idle catch-up is applied on startup

#### Schema Migration
`GameState.schemaVersion` is an integer incremented with each breaking change.
`SaveManager.load()` checks the version and runs migration functions in sequence:
```
migrations = {
  1: (oldState) => ({ ...oldState, newField: defaultValue })
  // future migrations added here
}
```
The current schema version is defined as a constant in `SaveManager.ts`.

#### Corruption Handling
If `JSON.parse` throws, or if the resulting object fails type validation,
`SaveManager.load()` returns `null`. The caller (`PreloadScene`) then initializes
a fresh `GameState`. A warning is logged to the browser console.

#### Idle Timestamp
`lastSeenTimestamp` is written on every save, on `visibilitychange`, and on
`beforeunload`. On load, `IdleSystem.applyOfflineTime` receives:
```
elapsedSeconds = (Date.now() - state.lastSeenTimestamp) / 1000
elapsedSeconds = Math.min(elapsedSeconds, balance.idle.maxOfflineCapSeconds)
```

---

### 4.6 Locale System

All player-facing strings are defined in `src/data/locales/en.json` as a flat or
nested key-value map.

`LocaleManager.t(key, params?)` resolves a key and performs simple parameter
interpolation (e.g. `"reptile.hungry": "{{name}} is hungry!"` → `"Sunny is hungry!"`).

Rules:
- No string is ever built by concatenation in game code.
- Number formatting (coins, timers) uses locale-aware formatters via `LocaleManager`.
- Adding a language in Phase 2 requires only: adding a new locale file and a
  language selector. Zero code changes in systems or scenes (NFR-16).

---

### 4.7 Asset Organization

Assets follow a naming convention that matches config file references exactly.
This allows `AssetManager` to validate at startup that every sprite key referenced
in `species.json` and `decorations.json` exists as a loaded Phaser asset.

#### Reptile Sprites
Path pattern: `assets/images/reptiles/{species-id}.png`
Each file is a sprite sheet. Animation frame data is defined in Phaser's atlas format
or inline in the asset loader. Animation keys are listed per species in `species.json`.

Required animation states per reptile (minimum MVP set):
- `idle` — slow breathing or subtle movement loop
- `eat` — triggered on feed
- `distressed` — triggered at 0 Health

#### Decoration Sprites
Path pattern: `assets/images/decorations/{decoration-id}.png`
Decorations are static sprites. No animation required in MVP.

#### Background and Substrate Textures
Path pattern: `assets/images/backgrounds/{id}.png`
Full-width textures that tile or fill the terrarium background layer.

#### UI Assets
Path pattern: `assets/images/ui/{element-name}.png`
Icons, panel frames, button states. Follow a consistent naming scheme:
`icon-feed.png`, `icon-clean.png`, `btn-primary.png`, `panel-card.png`, etc.

#### Audio
Path pattern:
- `assets/sounds/ambient/terrarium-loop.mp3`
- `assets/sounds/sfx/{event-name}.mp3`

Event name examples: `feed`, `clean`, `chest-open`, `hatch`, `achievement`, `purchase`.

All audio provided in MP3 format as the universal browser-compatible format.
OGG fallback is optional for broader compatibility.

---

## 5. Phase 2 Expansion Points

This section documents the boundaries where Phase 2 systems will attach. No stub
code is shipped in MVP. These are architectural seams — places where the MVP design
deliberately avoids closing the door.

### 5.1 Backend and Cloud Save

`SaveManager` is the only component that touches persistence. In Phase 2, it gains
a second strategy alongside LocalStorage: a remote API client. The interface it
exposes — `save(state)`, `load()`, `clear()` — does not change. Callers (scenes,
systems) are unaffected.

The `GameState` object is already fully serializable JSON with a versioned schema.
No structural changes to `GameState` are needed to support cloud sync.

Expected Phase 2 addition:
```
SaveManager
  ├── LocalStorageAdapter  (MVP — ships)
  └── RemoteApiAdapter     (Phase 2 — added here)
```

### 5.2 Authentication

Authentication is entirely absent from the MVP codebase. In Phase 2, an `AuthManager`
is added to `src/core/`. It handles login state and provides a user identity token
to `SaveManager`'s remote adapter.

No other manager or system needs to know whether a user is authenticated. The
identity is a concern only at the persistence boundary.

### 5.3 Social Systems

The social feature set (friend visits, gifting, activity feed, leaderboards) requires
a new module group in Phase 2:

```
src/
  social/                     (Phase 2 — does not exist in MVP)
    SocialManager.ts
    FriendSystem.ts
    GiftSystem.ts
    FeedSystem.ts
    LeaderboardSystem.ts
```

The existing event bus already includes player-facing events (purchases, achievements,
hatchlings resolved) that a future `FeedSystem` can subscribe to for activity
generation. No event bus changes are required to add this.

`GameState` will gain a `social` sub-object in Phase 2. Because `schemaVersion` is
incremented and migrations are applied on load, existing saves upgrade cleanly.

### 5.4 Multiple Terrariums

`GameState` currently holds a single `terrarium: TerrariumState`. In Phase 2 this
becomes `terrariums: TerrariumState[]` with an `activeTerrariumIndex`. All systems
that currently reference `state.terrarium` are updated to reference
`state.terrariums[state.activeTerrariumIndex]`.

This is a contained, predictable refactor. The migration function handles existing
saves: `{ terrariums: [oldState.terrarium], activeTerrariumIndex: 0 }`.

### 5.5 Premium Currency (Gems)

`GameState` already includes a `settings` sub-object reserved for future preferences.
In Phase 2, `GameState` gains a `gems: number` field and `EconomySystem` gains gem
credit/debit methods alongside the existing coin methods.

The shop UI (ShopOverlayScene) is structured to show item costs in either coins or
gems. In MVP, all items cost coins and the gem display is simply absent. In Phase 2,
gem-priced items are added to `decorations.json` and `species.json` with a `gemCost`
field. The shop reads this field; if absent, the item is coins-only.

### 5.6 Localization

Adding Spanish (or any language) in Phase 2 requires:
1. Adding `src/data/locales/es.json` with the same key structure as `en.json`
2. Adding a language selector to `SettingsState` and the settings UI
3. `LocaleManager` loads the selected locale file on init

Zero changes to any system, scene, or game logic. The locale key structure is the
only contract.

### 5.7 Event Species and Seasonal Content

Event species are added to `species.json` with a `availability` field:
```json
{
  "availability": {
    "type": "event",
    "eventId": "halloween_2026",
    "startDate": "2026-10-01",
    "endDate": "2026-11-01"
  }
}
```
`ConfigManager` filters event species by the current date. In MVP, no species have
this field, so the filter is a no-op. The infrastructure is ready; the feature is
not activated until Phase Growth.

---

*Architecture document complete.*
*Next step: Roadmap — break the architecture into ordered implementation tasks.*
*Every implementation decision must be traceable to a requirement in `requirements.md`.*
*Every module listed here must be traceable to a system or manager defined above.*
