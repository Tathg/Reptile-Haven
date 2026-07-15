/**
 * main.ts — Vite entry point
 *
 * This file is intentionally minimal. Its only job right now is to verify
 * that Phaser resolves correctly through the build pipeline.
 *
 * Phaser.Game instantiation and scene registration are handled in SPEC-17
 * (src/config/GameConfig.ts) once the type system and core infrastructure
 * are in place.
 */

// Verify Phaser is importable through the module system.
// The `type` import is zero-cost at runtime — it vanishes after tsc.
import type Phaser from 'phaser';

// Suppress unused-variable warning for the type-only import above.
// This stub will be replaced in SPEC-17.
void (null as unknown as typeof Phaser);
