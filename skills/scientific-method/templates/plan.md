# Plan
<!--
  WHAT: Your roadmap and thinking log. Tracks what you're investigating, your hypotheses, and conclusions.
  WHY: After 50+ tool calls, your original goals get forgotten. This file keeps them fresh.
  WHEN: Create FIRST, before starting any work. Update at every step transition.
-->

## Goal
<!--
  WHAT: One clear sentence describing what you're trying to achieve.
  WHY: This is your north star. Re-reading this keeps you focused on the end state.
  EXAMPLE: "Determine why the API returns 500 errors under concurrent load."
-->
[One sentence describing the end state]

## Current State
<!--
  WHAT: Quick snapshot of where you are right now.
  WHY: When re-reading plan before a decision, this tells you exactly where you are.
  WHEN: Update EVERY time you move to a new step or Cycle.
  Step OPTIONS: Understand | Decompose | Hypothesize | Predict | Test | Conclude | Synthesize | Complete
  Cycle OPTIONS: 0 (when not in a cycle) | 1 | 2 | 3 | ...
-->
- **Step:** Understand
- **Cycle:** 0

## Key Questions
<!--
  WHAT: Questions you need to answer to complete the task.
  WHY: These guide your decomposition and hypothesis formation.
  WHEN: Fill during Understand. Update as new questions emerge.
  EXAMPLE:
    1. What triggers the 500 error? (Answered: concurrent writes to same row)
    2. Is it a database lock issue or application logic? (Pending)
-->
1. [Question to answer]
2. [Question to answer]

## Understand
<!--
  WHAT: Your initial analysis of the problem — what you know, what you don't, constraints.
  WHY: Forces you to think before acting. Prevents jumping to conclusions.
  WHEN: Fill this FIRST, before Decompose.
  EXAMPLE:
    - The API works fine under single requests
    - Errors only appear with 10+ concurrent users
    - No error logs on the application server — suggests the issue is at DB level
    - Constraint: cannot change the database schema
-->
**Status:** not_started
- What I know:
- What I don't know:
- Constraints:
- Assumptions:

## Decompose
<!--
  WHAT: Break the problem into sub-problems. Each becomes a Cycle.
  WHY: Complex problems are solved by solving their parts. Explicit decomposition prevents aimless exploration.
  WHEN: After Understand. Update if you discover new sub-problems during Cycles.
  EXAMPLE:
    | 1 | Reproduce the error locally |
    | 2 | Identify the failing query |
    | 3 | Test fix under load |
-->
**Status:** not_started
| Cycle | Sub-problem |
|-------|-------------|
| 1 | |
| 2 | |

## Cycle 1: [Sub-problem]
<!--
  WHAT: One round of hypothesis-driven investigation for a specific sub-problem.
  WHY: Each Cycle is a self-contained reasoning unit. Keeps thinking structured.
  WHEN: Work through H → P → T → C in order. If hypothesis is rejected, add a new attempt below.
  STATUS OPTIONS: not_started | in_progress | complete
-->

### Hypothesis
<!--
  WHAT: Your proposed explanation or approach. Must be specific and falsifiable.
  WHY: "I'll look into it" is not a hypothesis. "The error is caused by X because Y" is.
  EXAMPLE: "The 500 error is caused by a database deadlock because the update query doesn't use row-level locking."
-->
**Status:** not_started

### Prediction
<!--
  WHAT: If the hypothesis is correct, what observable evidence would you expect?
  WHY: Defines your test criteria. Without prediction, you can't tell if a test passed or failed.
  EXAMPLE: "If it's a deadlock, I should see lock-wait-timeout entries in the MySQL slow query log."
-->
**Status:** not_started

### Test
<!--
  WHAT: Execute the verification. This is where you actually do work.
  WHY: Hypothesis and prediction are thinking; testing is doing. Record all discoveries.
  WHEN: After defining predictions. Update findings.md with every discovery.
  EXAMPLE: "Searched MySQL slow query log for lock-wait-timeout entries. Found 0 matches in last 24h."
-->
**Status:** not_started

### Conclusion
<!--
  WHAT: Was the hypothesis supported, rejected, or partially supported? Brief rationale.
  WHY: Closes the loop. Makes the reasoning chain explicit.
  EXAMPLE: "REJECTED — No deadlock entries found. Slow query log shows the query completes in 2ms. The issue is elsewhere."
-->
**Status:** not_started

<!-- If rejected, add another attempt: -->
<!-- ### Hypothesis (Attempt 2) -->
<!-- ### Prediction (Attempt 2) -->
<!-- ### Test (Attempt 2) -->
<!-- ### Conclusion (Attempt 2) -->

## Cycle 2: [Sub-problem]

### Hypothesis
**Status:** not_started

### Prediction
**Status:** not_started

### Test
<!--
  WHAT: Execute the verification. This is where you actually do work.
  WHY: Hypothesis and prediction are thinking; testing is doing. Record all discoveries.
  WHEN: After defining predictions. Update findings.md with every discovery.
  EXAMPLE: "Searched MySQL slow query log for lock-wait-timeout entries. Found 0 matches in last 24h."
-->
**Status:** not_started

### Conclusion
**Status:** not_started

## Synthesis
<!--
  WHAT: Final answer after all Cycles complete. Connects all conclusions into a coherent whole.
  WHY: Individual Cycle conclusions may be fragments. Synthesis produces the deliverable.
  WHEN: After all Cycles are complete. Check against Key Questions — did you answer them all?
-->
**Status:** not_started

## Decisions
<!--
  WHAT: Significant choices you made, with reasoning.
  WHY: You'll forget why you chose an approach. This table preserves that knowledge.
  WHEN: Update whenever you make a choice that affects direction.
  EXAMPLE:
    | Test with MySQL slow log instead of application profiler | Lower overhead, direct evidence |
-->
| Decision | Rationale |
|----------|-----------|
| | |

---
<!--
  REMINDERS:
  - Re-read this file before major decisions (attention manipulation — your context decays, this file doesn't)
  - Update Current State when you move to a new step or Cycle
  - Update Status fields (not_started → in_progress → complete) in each section
  - Log actions in progress.md at each step transition
  - If you discover a new sub-problem, add a new Cycle
-->
