# Requirements Document
## Reptile Haven — Idle Terrarium Management Game
**Version:** 1.0
**Date:** July 2026
**Status:** Active
**Scope:** MVP (Phase 1) — Single-player, no backend, LocalStorage

---

## Document Purpose

This document defines all functional and non-functional requirements for the MVP.
Every requirement is traceable to the vision document (`vision.md`).
All numerical balance values referenced here (marked `[CONFIGURABLE]`) must be
defined in external config files or typed constant modules — never hardcoded inline.

---

## Table of Contents

1. Constraints and Boundaries
2. Save System
3. Reptile System
4. Terrarium System
5. Feeding Mechanic
6. Cleaning Mechanic
7. Breeding System
8. Economy System
9. Chest System
10. Reptipedia System
11. Achievement System
12. Idle Progression System
13. User Interface
14. Audio
15. Non-Functional Requirements
16. Out of Scope (MVP)

---

## 1. Constraints and Boundaries

| ID | Requirement |
|----|-------------|
| CON-01 | The game runs entirely in a web browser. No server-side logic in MVP. |
| CON-02 | All game state is persisted in browser LocalStorage. |
| CON-03 | No user accounts, authentication, or registration of any kind. |
| CON-04 | No network requests required to play the game. |
| CON-05 | No social features: no friend lists, no visits, no gifts, no feeds, no leaderboards. |
| CON-06 | No premium currency (Gems) activation. Infrastructure may be scaffolded but not exposed. |
| CON-07 | The game must be fully playable on modern desktop and mobile browsers (Chrome, Firefox, Safari, Edge). |
| CON-08 | All balance values must be defined in config files or constant modules, never hardcoded. |

---

## 2. Save System

| ID | Requirement |
|----|-------------|
| SAV-01 | Game state is automatically saved to LocalStorage after every meaningful state change. |
| SAV-02 | Game state is loaded from LocalStorage on startup. If no save exists, a new game is initialized. |
| SAV-03 | The save payload includes: terrarium state, reptile collection, inventory, coins, chest queue, Reptipedia unlock state, achievements, and last-seen timestamp. |
| SAV-04 | The last-seen timestamp is written on every save and on page unload/visibility change. |
| SAV-05 | On load, elapsed offline time is calculated from the last-seen timestamp to compute idle gains. |
| SAV-06 | Offline time used for idle calculation is capped at a `[CONFIGURABLE]` maximum (e.g. 24 hours) to prevent exploit accumulation. |
| SAV-07 | Save data is versioned. A schema version field allows future migrations without data loss. |
| SAV-08 | If save data is corrupt or unreadable, the game initializes a fresh state and logs a warning. It does not crash. |


---

## 3. Reptile System

### 3.1 Species Data

| ID | Requirement |
|----|-------------|
| REP-01 | Each species is defined as a data record in a config file, not in code logic. |
| REP-02 | A species record contains: id, name, group, rarity, base stats, Reptipedia data, sprite references, and animation keys. |
| REP-03 | Rarity tiers are: Common, Uncommon, Rare, Special Event. |
| REP-04 | Species groups are: Gecko, Lizard, Turtle, Snake, Chameleon. |
| REP-05 | MVP species roster: Leopard Gecko, Crested Gecko, Bearded Dragon, Blue-tongued Skink, Red-eared Slider, Greek Tortoise, Ball Python, Corn Snake, Veiled Chameleon. |
| REP-06 | Each morph variant is defined as a separate entry linked to its base species, with a probability weight `[CONFIGURABLE]`. |

### 3.2 Reptile Instances

| ID | Requirement |
|----|-------------|
| REP-07 | A reptile instance is an owned copy of a species, with a unique ID, name, current stats, and morph flag. |
| REP-08 | Visible stats per reptile: Hunger (0–100), Happiness (0–100), Health (0–100). |
| REP-09 | Hunger decreases over time at a rate `[CONFIGURABLE]` per species group or rarity. |
| REP-10 | Happiness is derived from: Hunger level, Cleanliness level, and decoration score. The formula is `[CONFIGURABLE]`. |
| REP-11 | Health degrades only if Hunger reaches zero and stays there for a `[CONFIGURABLE]` duration. Health does not degrade for any other reason in MVP. |
| REP-12 | Health recovers passively once Hunger is above zero, at a rate `[CONFIGURABLE]`. |
| REP-13 | A reptile at 0 Health becomes visually distressed but does not die or disappear. The game is never punitive. |
| REP-14 | Each reptile has a gender (Male / Female), assigned randomly at acquisition. Gender is required for breeding pairing. The game does not guarantee a gender-balanced pair. Obtaining a compatible mate is an intentional progression goal. |
| REP-15a | The game must never permanently block breeding. Future phases (additional shop stock rotation, chest rewards, hatchling gifting, trading) must provide alternative paths to acquiring a compatible mate. This constraint applies to Phase 2+ design, not MVP implementation. |
| REP-15b | Temperature-dependent or any other biological sex determination mechanic is explicitly excluded. Gender is a binary random assignment only. |

### 3.3 Acquisition

| ID | Requirement |
|----|-------------|
| REP-16 | The player starts with one reptile of a starter species (species and starter cost defined in config). |
| REP-17 | Additional reptiles are purchased from the in-game shop using Coins. Each species has a `[CONFIGURABLE]` coin cost. |
| REP-18 | New reptiles are added directly to the terrarium if the population limit has not been reached. |
| REP-19 | If the terrarium is at the population limit, the player cannot purchase new reptiles until space is freed. |


---

## 4. Terrarium System

| ID | Requirement |
|----|-------------|
| TER-01 | The player has exactly one terrarium in MVP. |
| TER-02 | The terrarium has a maximum population capacity `[CONFIGURABLE]`. |
| TER-03 | The terrarium has a Cleanliness stat (0–100) that degrades over time at a rate `[CONFIGURABLE]`. |
| TER-04 | Cleanliness degradation rate scales with the number of reptiles currently in the terrarium `[CONFIGURABLE]` multiplier. |
| TER-05 | The terrarium has a Decoration Score derived from the number and quality of placed decorations. The scoring formula is `[CONFIGURABLE]`. |
| TER-06 | Decoration Score contributes to reptile Happiness (see REP-10). |
| TER-07 | The terrarium displays all owned reptiles simultaneously as animated sprites. |
| TER-08 | The terrarium has a Background layer and a Substrate layer, each independently customizable. |
| TER-09 | Decorations are placed freely within the terrarium bounds. The player can move and remove placed decorations. |
| TER-10 | The terrarium view is the primary and permanent visual focus of the game UI. |
| TER-11 | A small set of starter decorations is available at no cost. Additional decorations are purchasable with Coins. All decoration costs are `[CONFIGURABLE]`. |
| TER-12 | The decoration catalog is intentionally small — quality over quantity. MVP decoration count per category is defined in config. |

---

## 5. Feeding Mechanic

| ID | Requirement |
|----|-------------|
| FED-01 | The player can feed a reptile by tapping/clicking it or via a "Feed All" action. |
| FED-02 | Feeding a reptile increases its Hunger stat by a `[CONFIGURABLE]` amount per feed action. Hunger is capped at 100. |
| FED-03 | Feeding a well-fed reptile (Hunger above a `[CONFIGURABLE]` threshold) yields a reduced coin reward or none. Overfeeding is not rewarded. |
| FED-04 | Feeding triggers a short eat animation on the reptile sprite. |
| FED-05 | Feeding a hungry reptile (Hunger below a `[CONFIGURABLE]` threshold) generates a `[CONFIGURABLE]` Coin reward. |
| FED-06 | Feeding costs nothing — there is no food resource to manage in MVP. Food inventory is a Phase 2 consideration. |
| FED-07 | A visual indicator (icon or color change) shows when a reptile is hungry and awaiting feeding. |

---

## 6. Cleaning Mechanic

| ID | Requirement |
|----|-------------|
| CLN-01 | A "Clean Terrarium" action is available when Cleanliness falls below a `[CONFIGURABLE]` threshold. |
| CLN-02 | Cleaning instantly restores Cleanliness to 100. |
| CLN-03 | Cleaning triggers a brief visual effect (e.g. sparkle or sweep animation). |
| CLN-04 | Cleaning awards a `[CONFIGURABLE]` Coin bonus. |
| CLN-05 | Low Cleanliness reduces reptile Happiness (via the Happiness formula in REP-10) but has no other negative consequence. |
| CLN-06 | The terrarium never enters a "broken" or unrecoverable state due to low Cleanliness. |
| CLN-07 | A visual indicator shows when the terrarium needs cleaning. |


---

## 7. Breeding System

| ID | Requirement |
|----|-------------|
| BRD-01 | The player can initiate a breed by selecting two reptiles of the same species with opposite genders. |
| BRD-02 | Only one breeding pair may be active at a time in MVP. |
| BRD-03 | Breeding begins a countdown timer. Duration is `[CONFIGURABLE]` per species or rarity tier. |
| BRD-04 | The breeding timer progresses in real time, including while the game is closed (using the idle timestamp system). |
| BRD-05 | While breeding is in progress, both parent reptiles remain visible and functional in the terrarium. They can still be fed and contribute to coin generation. |
| BRD-06 | When the timer completes, a hatchling egg appears in the terrarium UI as a notification or overlay. |
| BRD-07 | The hatchling's species matches the parents. Its morph is determined at hatch time by a weighted random roll using `[CONFIGURABLE]` morph probability tables. |
| BRD-08 | Morphs are visual variants only. They do not affect stats or gameplay. |
| BRD-09 | The player may keep the hatchling (adds it to the terrarium if space permits) or sell it for a `[CONFIGURABLE]` Coin reward. |
| BRD-10 | If the terrarium is at population capacity, the player must sell the hatchling or free up a slot before accepting it. |
| BRD-11 | After a hatch is resolved (kept or sold), the breeding slot becomes available again. |
| BRD-12 | A hatchling notification persists until the player resolves it. It does not expire or disappear automatically. |
| BRD-13 | A breeding cooldown period `[CONFIGURABLE]` applies to each pair after a successful hatch before they can breed again. |

---

## 8. Economy System

| ID | Requirement |
|----|-------------|
| ECO-01 | Coins are the sole active currency in MVP. Gems are scaffolded but not functional. |
| ECO-02 | Coin balance is always visible in the main HUD. |
| ECO-03 | Coins are earned by: feeding reptiles (FED-05), cleaning the terrarium (CLN-04), selling hatchlings (BRD-09), and opening chests (CHE-04). |
| ECO-04 | Reptiles generate passive Coins over time while Happiness is above a `[CONFIGURABLE]` threshold. Generation rate scales with Happiness level using a `[CONFIGURABLE]` formula. |
| ECO-05 | Passive Coin generation accumulates during offline time and is applied on next load (subject to the offline cap in SAV-06). |
| ECO-06 | Coins are spent at the in-game shop to purchase: new reptile species (REP-17), food (deferred — no food cost in MVP), and decorations (TER-11). |
| ECO-07 | All shop prices are `[CONFIGURABLE]`. The shop reads prices from the species and decoration config files. |
| ECO-08 | Coin balance cannot go below zero. Purchases are blocked if the player has insufficient Coins. |
| ECO-09 | A transaction log is not required in MVP but the economy system must emit events that could feed one in future. |


---

## 9. Chest System

| ID | Requirement |
|----|-------------|
| CHE-01 | Chests are awarded by: daily login (one chest per calendar day), and unlocking achievements (ACH system). |
| CHE-02 | A daily login chest is granted the first time the player opens the game on a given calendar day. |
| CHE-03 | Uncollected chests queue up. The queue size is `[CONFIGURABLE]`. Chests are never lost — the queue simply stops accepting new ones when full. |
| CHE-04 | Opening a chest performs a weighted random loot roll and awards one of: Coins, a decoration item, or a surprise egg (hatchling of a random species). |
| CHE-05 | All loot tables and drop weights per chest type are `[CONFIGURABLE]`. |
| CHE-06 | A surprise egg behaves identically to a breeding hatchling: the player may keep it or sell it. |
| CHE-07 | A chest-opening animation plays when the player opens a chest. |
| CHE-08 | The number of unopened chests is visible in the HUD as a badge or counter. |

---

## 10. Reptipedia System

| ID | Requirement |
|----|-------------|
| PED-01 | The Reptipedia is an in-game encyclopedia accessible from the main UI at any time. |
| PED-02 | Each species in the MVP roster has a Reptipedia entry defined in config data. |
| PED-03 | A species entry contains: common name, scientific name, geographic origin, habitat type, ideal temperature range, primary diet, average lifespan, and one or two concise real-world facts. |
| PED-04 | A species entry is locked (grayed out, name hidden or shown as "???") until the player owns at least one reptile of that species. |
| PED-05 | Once unlocked, a species entry is permanently accessible even if the player later sells all reptiles of that species. |
| PED-06 | Reptipedia content is presented visually: species illustration, clear typographic layout, icons for temperature/diet/lifespan. No dense academic paragraphs. |
| PED-07 | The Reptipedia tracks unlock count. This count is used by the achievement system (ACH system). |

---

## 11. Achievement System

| ID | Requirement |
|----|-------------|
| ACH-01 | Achievements are defined entirely in config data: id, name, description, condition type, condition value, and reward. |
| ACH-02 | Achievement conditions supported in MVP: species_unlocked_count, group_completed, hatchlings_produced, coins_earned_total, terrarium_cleaned_count, reptipedia_entries_unlocked. |
| ACH-03 | Achievements are evaluated reactively — checked whenever a relevant game event fires. They do not require polling. |
| ACH-04 | When an achievement is unlocked, a non-intrusive notification appears on screen. |
| ACH-05 | Achievement rewards are: Coins `[CONFIGURABLE]` and/or Chests `[CONFIGURABLE]`. |
| ACH-06 | The Achievement panel is accessible from the main UI. It shows locked achievements as visible-but-locked goals (name and description visible, reward hidden or shown as "?"). |
| ACH-07 | Each achievement can only be unlocked once. |
| ACH-08 | MVP achievement examples (final list defined in config): "First Resident" (own first reptile), "Happy Home" (reach 80+ happiness on all reptiles), "Nest Complete" (produce first hatchling), "Herpetologist" (unlock 5 Reptipedia entries), "Gecko Family" (own both gecko species), "Tidy Keeper" (clean the terrarium 10 times). |


---

## 12. Idle Progression System

| ID | Requirement |
|----|-------------|
| IDL-01 | When the player returns after being offline, the game calculates elapsed time using the timestamp saved at last close (SAV-04). |
| IDL-02 | Elapsed time is used to compute: accumulated passive Coins (ECO-05), Hunger decay for all reptiles (REP-09), Cleanliness decay (TER-03), and breeding timer progress (BRD-04). |
| IDL-03 | All idle calculations use the same elapsed time delta for consistency. |
| IDL-04 | Offline time is capped at a `[CONFIGURABLE]` maximum before it is applied (SAV-06). This prevents extreme stat divergence after long absences. |
| IDL-05 | Idle gains are applied silently on load, before the player sees the terrarium. A brief "welcome back" summary may optionally be shown indicating what accumulated. |
| IDL-06 | Idle gains never produce negative outcomes. A reptile may be hungry on return, but never dead or penalized. |
| IDL-07 | The idle system is implemented as a pure function: given a state snapshot and an elapsed time, it returns the new state. This makes it deterministic and testable. |

---

## 13. User Interface

### 13.1 Layout and Navigation

| ID | Requirement |
|----|-------------|
| UI-01 | The terrarium view is always the primary screen. All other panels (shop, Reptipedia, achievements) open as overlays or side panels without leaving the terrarium view. |
| UI-02 | The main HUD displays: Coin balance, chest count badge, and shortcut buttons for Shop, Reptipedia, Achievements, and Clean. |
| UI-03 | The game scales responsively to fit desktop and mobile viewports using Phaser's scale manager. The chosen scale mode is defined in config. |
| UI-04 | Touch input must be supported for all interactive elements. |
| UI-05 | All interactive elements have a minimum touch target size of 44×44 CSS pixels. |

### 13.2 Reptile Interaction

| ID | Requirement |
|----|-------------|
| UI-06 | Tapping/clicking a reptile opens a small reptile detail card showing: name, species, stats (Hunger, Happiness, Health), and action buttons (Feed, Breed). |
| UI-07 | A "Feed All" button feeds all reptiles in the terrarium in one action. |
| UI-08 | Stat bars use color coding: green (high), yellow (medium), red (low). Thresholds are `[CONFIGURABLE]`. |
| UI-09 | When a reptile is hungry, a small icon (e.g. food bowl) floats above its sprite. |
| UI-10 | When a hatchling is ready, a prominent egg or nest icon appears in the terrarium UI. |

### 13.3 Shop

| ID | Requirement |
|----|-------------|
| UI-11 | The shop is accessible from the HUD and shows: available species for purchase, and available decorations. |
| UI-12 | Items the player cannot afford are visually dimmed with their cost shown. |
| UI-13 | Items the player already owns (species) show an "Owned" state rather than a purchase button. |
| UI-14 | Purchasing an item requires a single confirmation tap to prevent accidental buys. |

### 13.4 Breeding UI

| ID | Requirement |
|----|-------------|
| UI-15 | The breeding interface lists compatible pairs (same species, opposite genders). |
| UI-16 | An active breeding countdown timer is visible in the terrarium HUD. |
| UI-17 | When breeding completes, the hatchling resolution screen shows the hatchling's species, morph (if any), and options: Keep or Sell. |


---

## 14. Audio

| ID | Requirement |
|----|-------------|
| AUD-01 | A calm ambient background track plays in the terrarium. Audio can be toggled on/off. |
| AUD-02 | Sound effects play on: feeding a reptile, cleaning the terrarium, opening a chest, completing a breed, and unlocking an achievement. |
| AUD-03 | All audio is optional. The game is fully playable with audio disabled. |
| AUD-04 | Audio preferences (on/off) are persisted in LocalStorage. |
| AUD-05 | Audio files are loaded as Phaser assets. No streaming audio in MVP. |

---

## 15. Non-Functional Requirements

### 15.1 Performance

| ID | Requirement |
|----|-------------|
| NFR-01 | The game must reach an interactive state within 5 seconds on a standard broadband connection. |
| NFR-02 | The game must maintain 60 fps during normal gameplay on modern desktop hardware. |
| NFR-03 | The game must maintain at least 30 fps on mid-range mobile devices (2021 or newer). |
| NFR-04 | Total initial bundle size (JS + CSS) must not exceed 2 MB gzipped. Assets are loaded separately and are not counted toward this limit. |

### 15.2 Reliability

| ID | Requirement |
|----|-------------|
| NFR-05 | The save system must not corrupt existing save data on a failed or interrupted write. Writes are atomic where possible (full replacement, not partial update). |
| NFR-06 | The idle calculation function (IDL-07) must produce identical output given the same inputs, regardless of when it is called. |
| NFR-07 | All game config files must be validated against a schema at startup. A missing or malformed config field must produce a clear error, not a silent runtime failure. |

### 15.3 Maintainability

| ID | Requirement |
|----|-------------|
| NFR-08 | Adding a new species requires only: adding a data entry to the species config file, providing sprite assets, and adding a Reptipedia entry. No code changes should be required. |
| NFR-09 | Adjusting any balance value requires only editing a config file. No recompilation or code changes should be required. |
| NFR-10 | All game systems communicate via a typed event bus, not direct cross-system calls, to remain decoupled. |
| NFR-11 | TypeScript strict mode is enabled. No use of `any` unless explicitly justified with a comment. |

### 15.4 Accessibility

| ID | Requirement |
|----|-------------|
| NFR-12 | All UI text meets WCAG 2.1 AA contrast ratio requirements (4.5:1 for normal text). |
| NFR-13 | Interactive elements are keyboard-navigable where technically feasible within Phaser's constraints. |
| NFR-14 | No gameplay mechanic relies solely on color to convey state. Icons or labels must accompany color indicators. |

### 15.5 Localization Readiness

| ID | Requirement |
|----|-------------|
| NFR-15 | All player-facing strings are stored in a locale file, not embedded in code or config logic. |
| NFR-16 | The game ships in English only in MVP. The locale system must support adding additional languages (e.g. Spanish) without code changes. |

---

## 16. Out of Scope (MVP)

The following are explicitly excluded from MVP. They must not be built or partially built
unless otherwise directed. Infrastructure stubs that do not expose functionality to the
player are permitted where noted.

| Feature | Phase |
|---------|-------|
| User accounts and authentication | Phase 2 |
| Cloud save / server-side persistence | Phase 2 |
| Friend system (adding, visiting, gifting) | Phase 2 |
| Activity feed | Phase 2 |
| Leaderboards | Phase 2 |
| Multiple terrariums | Phase 2 |
| Gems (premium currency) — activation and purchase | Phase 2 |
| Seasonal events and event species | Growth phase |
| "Reptile Haven Plus" subscription | Maturity phase |
| Native mobile app (iOS / Android) | Future |
| Food resource management (reptiles have unlimited food in MVP) | Phase 2 |
| Reptile selling (to reclaim terrarium slots) | Phase 2 consideration |
| In-game chat or messaging | Not planned |
| Fantasy or fictional species | Never |
| Combat or competitive mechanics | Never |

---

*This document is the requirements baseline for MVP implementation.*
*Every architecture and task decision must be traceable to a requirement defined here.*
*All requirements marked `[CONFIGURABLE]` must be resolved to a named constant or*
*config key before implementation begins — the value itself is set during playtesting.*
