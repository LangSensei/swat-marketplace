# Changelog

All notable changes to the `gusu-scribe` squad.

## 1.2.0 — 2026-04-14

### Added
- Constraints section with 6 domain-specific writing constraints (voice fidelity, no verbatim copying, factual grounding, one article type per operation, register separation, sensory specificity)
- Food Exploration Article Generation workflow with 6-section structure and quality gate (was listed in scope but had no workflow)
- Quality gates (checklist format) on Style Analysis and Template Extraction workflows
- Prerequisites sections on all generation workflows
- "Report should include" guidance section at bottom of playbook
- Anti-patterns documentation in Template Extraction workflow
- Measurable thresholds in style guide rules (sensory channel minimums, phrase density per sentence type)

### Changed
- Domain description updated from "two distinct article types" to "three article types" to include food exploration
- Removed hardcoded seed article file path; now reads from brief-specified path
- Upgraded "Before delivery, verify" to structured "Quality gate" format with checkboxes across all workflows
- Community Article quality gate expanded from informal tone checklist to structured verification with 7 items
- Gusu Morning Treats quality gate expanded from 7 items to 10 items (added web search verification, 60/40 ratio check, 2-sense-per-paragraph check)
- General Rules: added explicit factual grounding instruction ("never invent factual details")
- Style Analysis: added section word count measurement, four-character phrase categorization, cross-article confidence levels
- Template Extraction: added word count ranges, vocabulary usage notes, expanded anti-patterns list

### Removed
- Hardcoded `/home/ling/.openclaw/workspace/ink-mist-samples.md` path from General Rules

## 1.1.0 — 2026-04-12

### Changed
- Add `sop` skill dependency
- Remove Output Schema section

## [1.0.0] - 2026-04-10

### Added
- Initial squad creation as a rename and specialization of `content-writer`
- MANIFEST.md with domain, boundary, write access, playbook, and output schema
- Squad renamed from `content-writer` to `gusu-scribe` to reflect Suzhou (姑苏/Gusu) cultural focus
- Four workflows: Style Analysis, Template Extraction, "Gusu Morning Treats" Article Generation, Community Article Writing
- Suzhou Cultural Vocabulary Reference with architecture terms, seasonal vocabulary, and walking transition formulas
- "Gusu Morning Treats" 7-section structural template (location → nature → transition → shop → craft → taste → closing)
- Community Article 5-section template (headline → primary story → secondary story → policy context → official coda)
- Style fingerprint reference section: sentence rhythm, color palette, flower personality device, food craft detail rule, closing formulas
- Output schema with article_type field distinguishing gusu-morning-treats, community-article, food-exploration
- Removed: `content-writer` squad directory (renamed to gusu-scribe)
