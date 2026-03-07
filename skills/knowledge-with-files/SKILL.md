---
name: knowledge-with-files
version: "1.0.0"
description: Standardizes the distillation of insights into a structured, parsable knowledge file.
---

# Knowledge with Files

This skill ensures work culminates in a high-quality, parsable knowledge file.

## Important: Where Files Go

- **Templates** are in this skill's `templates/` folder
- **Your knowledge file** goes in your current working directory as `knowledge.md`

## The Knowledge Mandate

1. **Initialize `knowledge.md`** using the standardized template.
2. **Distill Truths**: Extract verified patterns, constraints, and architectural shifts from your findings. Only distill findings that would be useful in a *future* context — skip execution-specific details (e.g., "file was at line 42") and keep reusable insights (e.g., "skills can't reference each other").
3. **Index-Ready**: Ensure all Metadata fields are filled (Date, Status, Authors, Tags, Summary).

## Templates

- [templates/knowledge.md](templates/knowledge.md) — The standardized knowledge template.
