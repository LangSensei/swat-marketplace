---
name: scientific-method
version: "1.0.4"
description: Hypothesis-driven cognitive framework for complex reasoning and research tasks. Understand → Decompose → Cycle (Hypothesize → Predict → Test → Conclude) → Synthesize.
---

# Scientific Method

A cognitive framework for tasks that require reasoning, research, or exploration. Instead of executing a linear checklist, you iteratively form hypotheses, test them, and refine your understanding.

## When to Use

**Use for:**
- Research and analysis tasks
- Debugging and root-cause analysis
- Exploratory tasks with unclear scope
- Tasks requiring reasoning under uncertainty
- Anything where "figure it out" is part of the job

**Don't use for:**
- Tasks with a known, fixed procedure (use an SOP skill instead)
- Simple lookups or single-step actions

## Where Files Go

| Location | What Goes There |
|----------|----------------|
| Skill directory | SKILL.md, templates, and hooks |
| Your working directory | `plan.md`, `findings.md`, `progress.md` (created per task) |

## File Responsibilities

| File | Role | Tracks |
|------|------|--------|
| `plan.md` | **How you think** | Goal, current state pointer, key questions, decomposition, hypotheses, conclusions, synthesis, decisions |
| `findings.md` | **What you found** | Research findings, visual/browser findings, technical decisions, issues encountered, resources |
| `progress.md` | **What you did** | Actions log per step, **status of each step** (single source of truth), test results, errors |

One piece of information lives in one place. Don't duplicate status, errors, or findings across files.

## Quick Start

Before starting any complex task:

1. **Copy templates** — Do NOT create these files from scratch. The templates contain required structure and comments. If the files already exist, skip this step.
   ```
   cp .github/skills/scientific-method/templates/plan.md .
   cp .github/skills/scientific-method/templates/findings.md .
   cp .github/skills/scientific-method/templates/progress.md .
   ```
2. **Fill in `plan.md` Goal** — One sentence describing what you're trying to achieve
3. **Follow the framework below** — Start with Understand, then Decompose, then Cycles

## The Framework

```
Understand → Decompose → [Hypothesize → Predict → Test → Conclude] × N → Synthesize
                                    ↑_______←_______↓ (if hypothesis rejected)
```

Each step is a distinct cognitive action. Do not skip steps. Do not combine steps.

### 1. Understand

Before anything else, understand what you're dealing with.

- Read the task description carefully
- Identify what you know vs what you don't know
- Record information gaps as **Key Questions** in `plan.md`
- Identify constraints, assumptions, and success criteria

**Output:** `plan.md` Goal + Key Questions + Understand section filled in. Update `progress.md` Understand Status → `in_progress`.

### 2. Decompose

Break the problem into sub-problems. This is mandatory — even "simple" tasks benefit from explicit decomposition.

- Each sub-problem = one **Cycle**
- Each Cycle should be completable in one round of Hypothesize → Predict → Test → Conclude
- Order Cycles by dependency (what needs to be answered first?)
- Don't decompose generically ("research → analyze → report") — decompose by **actual sub-questions**

**Output:** `plan.md` Decompose table filled in with Cycles. Update `progress.md` Understand Status → `complete`, Decompose Status → `complete`.

> **Status transition rule:** When you start a step, mark it `in_progress`. When you finish it and move to the next, mark it `complete`. The step you're entering becomes `in_progress`.

### 3. Cycle (repeat for each sub-problem)

When starting a Cycle, update `progress.md` Cycle N Status → `in_progress` and `plan.md` Current State.

#### Hypothesize
Based on what you know so far, propose an answer or approach.

- Be specific and falsifiable: "I think X because Y"
- Not: "I'll look into it" — that's not a hypothesis

**Output:** `plan.md` → Cycle N → Hypothesis section.

#### Predict
If your hypothesis is correct, what would you expect to see?

- Define concrete, observable predictions
- These become your test criteria

**Output:** `plan.md` → Cycle N → Prediction section.

#### Test
Execute the verification. This is where you actually do work.

- Search, read code, run commands, call APIs, browse
- Record ALL discoveries in `findings.md` immediately
- **2-Action Rule:** After every 2 search/browse/view operations, update `findings.md`
- Visual/multimodal content must be transcribed to text immediately — it won't persist

**Output:** `findings.md` updated with discoveries. `progress.md` Test Results table updated.

#### Conclude
Was the hypothesis supported or rejected?

- **Supported:** Record conclusion, move to next Cycle
- **Rejected:** Form a new hypothesis based on what you learned, repeat the Cycle
- **Partially supported:** Note what held and what didn't, refine and repeat
- Record conclusion in `plan.md` → Cycle N → Conclusion
- Update `progress.md` Cycle N Status → `complete` (or stay `in_progress` if looping back)

### 4. Synthesize

After all Cycles are complete:

- Review all Cycle conclusions together
- Identify patterns, contradictions, or gaps
- Produce the final answer or deliverable
- Check: did you answer all Key Questions from Understand?

**Output:** `plan.md` Synthesis section + final deliverable. Update `progress.md` Synthesize Status → `complete`.

## Critical Rules

### Create Plan First
Never start a complex task without `plan.md`. Non-negotiable.

### The 2-Action Rule
> After every 2 view/browser/search operations, IMMEDIATELY save key findings to `findings.md`.

Multimodal content (images, browser results, screenshots) does not persist in context. Write it down or lose it.

### Read Before Decide
Before major decisions, re-read `plan.md`. This refreshes goals in your attention window. Context decays over long sessions — your files don't.

### Update Progress at Every Transition
When moving between steps (Understand → Decompose, Cycle N Hypothesize → Test, etc.), update `progress.md` — both the actions log and the **Status** field. Status in `progress.md` is the single source of truth for how far you've gotten. Also update `plan.md` Current State to reflect where you are.

### Log ALL Errors
Every error goes in `progress.md` Errors table. Track what you tried. Never repeat a failed action — mutate the approach.

### The 3-Strike Protocol

```
ATTEMPT 1: Diagnose & Fix
  → Read error, identify root cause, apply targeted fix

ATTEMPT 2: Alternative Approach
  → Same error? Different method. Different tool. Different angle.

ATTEMPT 3: Broader Rethink
  → Question assumptions. Search for solutions. Consider revising the plan.

AFTER 3 FAILURES: Escalate
  → Stop. Document what you tried in progress.md. Present the problem,
    attempts, and errors to the user. Ask for guidance or alternative direction.
```

### Don't Skip Steps
Each step (Understand, Decompose, Hypothesize, Predict, Test, Conclude, Synthesize) is a distinct cognitive action. Jumping from Understand straight to Test means you're guessing, not reasoning. The discipline of forming explicit hypotheses and predictions is what makes this framework work.

### When to Loop Back
- Hypothesis rejected → new hypothesis (stay in same Cycle)
- Discovered a sub-problem you didn't anticipate → add a new Cycle to plan.md
- Realize your decomposition was wrong → go back to Decompose and restructure

## Read vs Write Decision Matrix

| Situation | Action | Reason |
|-----------|--------|--------|
| Just wrote a file | DON'T read it back | Content still in context |
| Viewed image/PDF | Write findings NOW | Multimodal → text before lost |
| Browser returned data | Write to findings.md | Screenshots don't persist |
| Starting new Cycle | Read plan + findings + progress | Re-orient before hypothesizing |
| Error occurred | Read relevant file | Need current state to fix |
| Resuming after gap | Read all 3 files | Recover full state |

## The 5-Question Reboot Test

If you can answer these from your files, your state management is solid:

| Question | Source |
|----------|--------|
| Where am I? | Current State in `plan.md` + Status in `progress.md` |
| Where am I going? | Remaining steps — check Status fields in `progress.md` |
| What's the goal? | Goal statement in `plan.md` |
| What have I learned? | `findings.md` |
| What have I done? | `progress.md` |

## Anti-Patterns

| Don't | Do Instead |
|-------|------------|
| Jump straight to testing | Form a hypothesis first |
| Decompose generically ("research, analyze, report") | Decompose by actual sub-questions |
| Keep findings in your head | Write to `findings.md` immediately |
| Repeat a failed approach | Log error, mutate approach |
| Skip Predict ("I'll just see what happens") | Define what you expect to see |
| Forget to update progress | Update at every step transition |
| Duplicate info across files | One piece of information, one file |
| Start without a plan | Create `plan.md` FIRST |
