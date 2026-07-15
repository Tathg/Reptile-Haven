# Specs Directory

This directory contains implementation task files for each specification in
`docs/roadmap.md`.

## Directory Structure

```
.kiro/specs/
├── README.md              ← this file
└── spec-NN-short-name/
    ├── spec.md            ← full spec + task breakdown
    └── tasks.md           ← task list only (used as checklist during implementation)
```

## Naming Convention

- Directories: `spec-{NN}-{kebab-case-title}` — padded two-digit number.
- Example: `spec-01-project-bootstrap/`

## Task Status Convention

Tasks inside `tasks.md` use this notation:

- `[ ]` — not started
- `[~]` — in progress
- `[x]` — completed

## Workflow

1. Spec file is written and reviewed before any code is touched.
2. Tasks are approved by the developer before implementation begins.
3. Each task maps to one small, reviewable Git commit.
4. `tasks.md` is updated as tasks are completed.
