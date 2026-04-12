---
name: sop
version: "1.0.1"
description: Standard Operating Procedure — phase-based execution with step checklists for structured, repeatable tasks
---

# SOP Skill

Execute structured tasks by following predefined phases with step-by-step checklists. Unlike exploratory research (scientific method), SOP tasks have known procedures — the focus is on thorough execution, not hypothesis testing.

## When to Use

- Tasks with known, repeatable procedures
- Code review, content writing, squad creation
- Any task where the phases can be defined upfront

## Files

| File | Purpose | When to Update |
|------|---------|----------------|
| `plan.md` | Phases, steps, decisions, current state | After each step/phase |
| `findings.md` | Discoveries, technical decisions, issues | After ANY discovery |
| `progress.md` | Execution log, errors, test results | Throughout execution |

### Responsibility Split

- **plan.md** = How you execute — phase/step structure, checklist, decisions
- **findings.md** = What you found — research results, technical decisions, issues encountered
- **progress.md** = What you did — action log per phase, errors, test results

## Quick Start

1. Understand your task — read the assignment/brief to identify the phases
2. Copy templates to your working directory and fill in Goal + Phases
3. Execute phases in order — check off steps as you go
4. Update findings.md after every 2 search/browse/view operations (2-Action Rule)
5. Update progress.md with actions taken at each phase gate

## Core Rules

### 1. Plan First
Copy the templates. Fill in the phases from your task brief. Do not start execution without `plan.md`.

### 2. Execute in Order
Phases are sequential. Do not skip ahead. Each phase must be completed before moving to the next, unless explicitly marked `[skipped] reason`.

### 3. The 2-Action Rule
> After every 2 search/browse/view operations, IMMEDIATELY save key findings to `findings.md`.

Visual and browser content is lost if not written to disk promptly.

### 4. Phase Gate
Before starting the next phase, complete ALL of these:
1. Check off completed steps in `plan.md`
2. Update phase status: `in_progress` → `complete`
3. Update `Current Phase` to the next phase
4. Save any new discoveries to `findings.md`
5. Log actions taken in `progress.md` for the current phase
6. Verify: re-read `progress.md` and confirm the phase section is filled in

### 5. Read Before Decide
Before major decisions, re-read `plan.md`. This refreshes goals in your attention window.

### 6. Log ALL Errors
Every error goes in `progress.md` Errors table. Track what you tried. Never repeat the exact same failing action.

### 7. The 3-Strike Protocol
```
Attempt 1: Diagnose & fix — read error, identify root cause, apply targeted fix
Attempt 2: Alternative approach — different method, different tool
Attempt 3: Broader rethink — question assumptions, search for solutions
After 3 failures: Log in findings.md Issues Encountered — document what you tried and the blockers
```

## The 5-Question Reboot Test

If you can answer these from your files, your context is solid:

| Question | Source |
|----------|--------|
| Where am I? | Current Phase + Step in plan.md |
| Where am I going? | Remaining phases |
| What's the goal? | Goal in plan.md |
| What have I found? | findings.md |
| What have I done? | progress.md |

## Templates

Copy these to your working directory:

- [templates/plan.md](templates/plan.md) — Phase/step tracking
- [templates/findings.md](templates/findings.md) — Research and discoveries
- [templates/progress.md](templates/progress.md) — Execution log
