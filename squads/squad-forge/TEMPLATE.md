---
name: {squad-name}
version: "1.0.0"
description: {one-liner description}
dependencies:
  skills: [{skill-names}]
  mcps: [{mcp-names}]
---

# {squad-name}

## Domain

{Detailed scope — what operations, services, or codebases this squad handles.}

## Boundary

**In scope:**
- {capability 1}
- {capability 2}

**Out of scope:**
- {exclusion 1}
- {exclusion 2}

## Write Access

{Paths the squad can write to, or "(none — all interactions via API)" if API-only.}

## Squad Playbook

{Domain knowledge, API endpoints, workflows, operational guidance.
Use ### subsections to organize content — do not create additional ## sections.}

## Output Schema

Captain must fill these frontmatter fields in `OPERATION.md` during the operation:

```yaml
summary: # Brief result summary
action_items: [] # Follow-up steps
```
