---
name: scientific-method
version: "1.0.0"
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
| Skill directory (`skills/scientific-method/`) | SKILL.md and templates |
| Your working directory | `plan.md`, `findings.md`, `progress.md` |

## Quick Start

Before starting any complex task:

1. **Create `plan.md`** — Use [templates/plan.md](templates/plan.md) as starting point
2. **Create `findings.md`** — Use [templates/findings.md](templates/findings.md) as starting point
3. **Create `progress.md`** — Use [templates/progress.md](templates/progress.md) as starting point

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

**Output:** `plan.md` Goal + Key Questions + Understand section filled in.

### 2. Decompose

Break the problem into sub-problems. This is mandatory — even "simple" tasks benefit from explicit decomposition.

- Each sub-problem = one **Cycle**
- Each Cycle should be completable in one round of Hypothesize → Predict → Test → Conclude
- Order Cycles by dependency (what needs to be answered first?)
- Don't decompose generically ("research → analyze → report") — decompose by **actual sub-questions**

**Output:** `plan.md` Decompose table filled in with Cycles.

### 3. Cycle (repeat for each sub-problem)

#### Hypothesize
Based on what you know so far, propose an answer or approach.

- Be specific and falsifiable: "I think X because Y"
- Not: "I'll look into it" — that's not a hypothesis

**Output:** `plan.md` → Cycle N → Hypothesis section.

#### Predict
If your hypothesis is correct, what would you expect to see?

- Define concrete, observable predictions
- These become your test criteria

#### Test
Execute the verification. This is where you actually do work.

- Search, read code, run commands, call APIs, browse
- Record ALL discoveries in `findings.md` immediately
- **2-Action Rule:** After every 2 search/browse/view operations, update `findings.md`
- Visual/multimodal content must be transcribed to text immediately — it won't persist

#### Conclude
Was the hypothesis supported or rejected?

- **Supported:** Record conclusion, move to next Cycle
- **Rejected:** Form a new hypothesis based on what you learned, repeat the Cycle
- **Partially supported:** Note what held and what didn't, refine and repeat
- Record conclusion in `plan.md` → Cycle N → Conclusion

### 4. Synthesize

After all Cycles are complete:

- Review all Cycle conclusions together
- Identify patterns, contradictions, or gaps
- Produce the final answer or deliverable
- Check: did you answer all Key Questions from Understand?

**Output:** `plan.md` Synthesis section + final deliverable.

## Critical Rules

### Create Plan First
Never start a complex task without `plan.md`. Non-negotiable.

### The 2-Action Rule
> After every 2 view/browser/search operations, IMMEDIATELY save key findings to `findings.md`.

Multimodal content (images, browser results, screenshots) does not persist in context. Write it down or lose it.

### Read Before Decide
Before major decisions, re-read `plan.md`. This refreshes goals in your attention window. Context decays over long sessions — your files don't.

### Update Progress at Every Transition
When moving between nodes (Understand → Decompose, Cycle N Hypothesize → Test, etc.), update `progress.md`. This is your recovery mechanism if the session resets.

### Log ALL Errors
Every error goes in `plan.md` Errors table. Track what you tried. Never repeat a failed action — mutate the approach.

### The 3-Strike Protocol

```
ATTEMPT 1: Diagnose & Fix
  → Read error, identify root cause, apply targeted fix

ATTEMPT 2: Alternative Approach
  → Same error? Different method. Different tool. Different angle.

ATTEMPT 3: Broader Rethink
  → Question assumptions. Search for solutions. Consider revising the plan.

AFTER 3 FAILURES: Escalate
  → Explain what you tried, share the error, ask for guidance.
```

### Don't Skip Nodes
Each node (Understand, Hypothesize, Predict, Test, Conclude) is a distinct cognitive action. Jumping from Understand straight to Test means you're guessing, not reasoning. The discipline of forming explicit hypotheses and predictions is what makes this framework work.

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
| Starting new Cycle | Read plan + findings | Re-orient before hypothesizing |
| Error occurred | Read relevant file | Need current state to fix |
| Resuming after gap | Read all 3 files | Recover full state |

## The 5-Question Reboot Test

If you can answer these from your files, your state management is solid:

| Question | Source |
|----------|--------|
| Where am I? | Current node in `progress.md` |
| Where am I going? | Remaining Cycles in `plan.md` |
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
| Forget to update progress | Update at every node transition |
| Start without a plan | Create `plan.md` FIRST |

## Templates

- [templates/plan.md](templates/plan.md) — Goal, decomposition, hypothesis tracking
- [templates/findings.md](templates/findings.md) — Evidence and discoveries
- [templates/progress.md](templates/progress.md) — Session log and recovery
