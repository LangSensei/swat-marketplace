# Findings
<!--
  WHAT: Your evidence base. Everything you discover goes here.
  WHY: Context windows are limited. This file is your "external memory" — persistent and unlimited.
  WHEN: Update after ANY discovery. Especially after 2 view/browser/search operations (2-Action Rule).
-->

## Research Findings
<!--
  WHAT: Discoveries from web searches, documentation, code reading, exploration.
  WHY: Raw discoveries that haven't been promoted to Key Findings yet.
  WHEN: After EVERY 2 view/browser/search operations (2-Action Rule). Don't batch — write immediately.
  EXAMPLE:
    - MySQL docs: READ COMMITTED allows non-repeatable reads within a transaction
    - Stack Overflow: similar issue resolved by adding SELECT ... FOR UPDATE
    - Source code: OrderService.update() doesn't use pessimistic locking
-->
-

## Visual/Browser Findings
<!--
  WHAT: Information from images, PDFs, browser results, screenshots.
  WHY: CRITICAL — multimodal content does NOT persist in context. Must be captured as text IMMEDIATELY.
  WHEN: IMMEDIATELY after viewing. Do not wait. Do not batch.
  EXAMPLE:
    - Browser: API response shows {"error": "conflict", "detail": "row was updated by another transaction"}
    - Screenshot: Grafana dashboard shows spike in DB connections at 14:32 UTC
-->
-

## Technical Decisions
<!--
  WHAT: Implementation choices made during investigation, with reasoning.
  WHY: Complements the Decisions table in plan.md. More detail, more technical context.
  WHEN: When you choose a specific tool, library, approach, or configuration.
  EXAMPLE:
    | Use slow query log over app profiler | Direct DB-level evidence, no app restart needed |
-->
| Decision | Rationale |
|----------|-----------|
| | |

## Issues Encountered
<!--
  WHAT: Broader problems (not just code errors) and how they were resolved.
  WHY: Documents blockers and workarounds for future reference.
  EXAMPLE:
    | Test DB missing seed data | Ran migration scripts from /db/seeds/ |
-->
| Issue | Resolution |
|-------|------------|
| | |

## Resources
<!--
  WHAT: URLs, file paths, API endpoints, documentation links collected during work.
  WHY: Don't lose useful references in scrolled-away context. Easy to revisit.
  WHEN: Add as you discover useful resources.
  EXAMPLE:
    - MySQL isolation levels: https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-isolation-levels.html
    - Source: src/services/OrderService.ts:142 (the update method)
    - API endpoint: POST /api/v1/orders/{id}/confirm
-->
-

---
<!--
  REMINDER: The 2-Action Rule
  After every 2 view/browser/search operations, you MUST update this file.
  This prevents visual information from being lost when context resets.
-->
*Update this file after every 2 view/browser/search operations.*
