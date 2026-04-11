# Plan
<!--
  WHAT: Your roadmap and thinking log. Tracks what you're investigating, your hypotheses, and conclusions.
  WHY: After 50+ tool calls, your original goals get forgotten. This file keeps them fresh.
  WHEN: Create FIRST, before starting any work. Update at every node transition.
-->

## Goal
<!--
  WHAT: One clear sentence describing what you're trying to achieve.
  WHY: This is your north star. Re-reading this keeps you focused on the end state.
  EXAMPLE: "Determine why the API returns 500 errors under concurrent load."
-->
[One sentence describing the end state]

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
    | 1 | Reproduce the error locally | complete |
    | 2 | Identify the failing query | in_progress |
    | 3 | Test fix under load | pending |
-->
| Cycle | Sub-problem | Status |
|-------|-------------|--------|
| 1 | | pending |
| 2 | | pending |

## Cycle 1: [Sub-problem]
<!--
  WHAT: One round of hypothesis-driven investigation for a specific sub-problem.
  WHY: Each Cycle is a self-contained reasoning unit. Keeps thinking structured.
  WHEN: Work through H → P → T → C in order. If hypothesis is rejected, add a new attempt below.
-->

### Hypothesis
<!--
  WHAT: Your proposed explanation or approach. Must be specific and falsifiable.
  WHY: "I'll look into it" is not a hypothesis. "The error is caused by X because Y" is.
  EXAMPLE: "The 500 error is caused by a database deadlock because the update query doesn't use row-level locking."
-->

### Prediction
<!--
  WHAT: If the hypothesis is correct, what observable evidence would you expect?
  WHY: Defines your test criteria. Without prediction, you can't tell if a test passed or failed.
  EXAMPLE: "If it's a deadlock, I should see lock-wait-timeout entries in the MySQL slow query log."
-->

### Conclusion
<!--
  WHAT: Was the hypothesis supported, rejected, or partially supported? Brief rationale.
  WHY: Closes the loop. Makes the reasoning chain explicit.
  EXAMPLE: "REJECTED — No deadlock entries found. Slow query log shows the query completes in 2ms. The issue is elsewhere."
-->

<!-- If rejected, add another attempt: -->
<!-- ### Hypothesis (Attempt 2) -->
<!-- ### Prediction (Attempt 2) -->
<!-- ### Conclusion (Attempt 2) -->

## Cycle 2: [Sub-problem]

### Hypothesis

### Prediction

### Conclusion

## Synthesis
<!--
  WHAT: Final answer after all Cycles complete. Connects all conclusions into a coherent whole.
  WHY: Individual Cycle conclusions may be fragments. Synthesis produces the deliverable.
  WHEN: After all Cycles are complete. Check against Key Questions — did you answer them all?
-->

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

## Errors
<!--
  WHAT: Every error encountered, attempt number, and resolution.
  WHY: Prevents repeating mistakes. Builds knowledge across the session.
  WHEN: Add IMMEDIATELY when an error occurs.
  EXAMPLE:
    | Connection refused to test DB | 1 | DB container wasn't started — ran docker compose up |
-->
| Error | Attempt | Resolution |
|-------|---------|------------|
| | 1 | |

---
<!--
  REMINDERS:
  - Re-read this file before major decisions (attention manipulation — your context decays, this file doesn't)
  - Update Cycle status in Decompose table as you progress: pending → in_progress → complete
  - Log ALL errors — they prevent repetition
  - Never repeat a failed action — mutate your approach
  - If you discover a new sub-problem, add a new Cycle
-->
