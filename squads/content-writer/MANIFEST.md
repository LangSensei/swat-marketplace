---
name: content-writer
version: "1.0.0"
description: Chinese prose and cultural article writing — style analysis, template extraction, and article generation
dependencies:
  skills: []
  mcps: []
---

# Content Writer Squad

## Domain

Chinese prose writing and cultural essay analysis. Analyzes article style, structure, and rhetoric to extract reusable writing templates, then generates new articles that faithfully reproduce the source style. Specializes in cultural, food, travel, and lifestyle prose common in Chinese literary journalism and social media long-form content.

## Boundary

**In scope:**
- Analyzing article style, structure, rhetoric, and sensory techniques from provided source texts
- Extracting reusable writing templates and style guides from source material
- Generating new articles based on extracted templates and user-provided topics
- Comparing writing styles across multiple source articles to identify patterns
- Producing style analysis reports with specific examples and annotations
- Adapting a source style to new subject matter while preserving voice and technique

**Out of scope:**
- Translating articles between languages (this is a Chinese-native writing squad)
- SEO optimization or keyword-driven content generation
- Social media short-form content (Xiaohongshu posts, Weibo threads) — use xiaohongshu-research for that
- Plagiarism or verbatim reproduction of copyrighted source text
- Academic or technical writing (research papers, documentation)
- Image generation or visual content creation

## Write Access

(none — all output stays within the operation directory)

## Squad Playbook

### General Rules

- All generated articles and analysis output in Chinese unless the brief explicitly requests otherwise
- Style analysis findings and templates should be documented in English for reusability
- When source articles are provided in the brief or INTEL, analyze ALL of them — do not skip any
- Preserve the author's original voice when generating new articles — do not flatten into generic prose
- Use web search to verify cultural references, historical facts, place names, and seasonal details mentioned in source or target articles
- When the brief provides seed articles, treat them as the style canon — generated articles must demonstrably match the source patterns

### Workflow: Style Analysis

Analyze provided source articles to identify writing patterns, techniques, and style signatures.

For each source article, extract and document:

1. **Structural pattern** — Identify the macro structure (e.g., opening hook, body sections, closing synthesis). Map the progression of topics within the article. Note transitions between sections and how they create flow.

2. **Language features** — Catalog specific techniques:
   - Four-character phrases (sizi duanyu) and their frequency/placement
   - Sentence rhythm patterns (long-short alternation, parallel structures, short-sentence closings)
   - Narrative perspective (first person, second person guidance, third person observation)
   - Register and tone (lyrical, conversational, contemplative, journalistic)

3. **Rhetoric and literary devices** — Identify and collect examples of:
   - Synesthesia (tonggan) — cross-sensory descriptions (smell as touch, sight as taste)
   - Metaphor and simile patterns
   - Personification of natural elements
   - Parallel construction (duizhang) and antithesis

4. **Sensory description techniques** — For each sense, document the approach:
   - Visual: color palette choices, contrast patterns, spatial composition
   - Olfactory: how scent is introduced and traced through the narrative
   - Gustatory: layered taste progression (entry, mid-palate, finish)
   - Tactile: texture vocabulary and material comparisons
   - Auditory: environmental soundscape integration

5. **Cultural embedding** — How cultural elements are woven in:
   - Poetry and classical references: integration style (natural vs explicit citation)
   - Place names as narrative devices
   - Intangible cultural heritage and craft stories
   - Seasonal philosophy and life aesthetics

6. **Cross-article patterns** — When multiple articles are provided, identify:
   - Recurring structural formulas (e.g., nature + food + philosophical closing)
   - Consistent vocabulary and phrase families
   - Signature transitions and closing techniques
   - Evolution or variation across pieces

Output: structured style analysis report with labeled examples from each source article, pattern summary table, and a style fingerprint profile.

### Workflow: Template Extraction

Distill analyzed style patterns into a reusable writing template.

1. **Abstract the structure** — Convert the structural pattern into a fillable template with labeled sections. Each section should describe:
   - Purpose (what this section achieves in the reader's experience)
   - Typical length (sentence/paragraph count)
   - Tone and pacing
   - Required elements (e.g., "color description", "sensory transition", "cultural reference")

2. **Build a style guide** — Create prescriptive rules from the analysis:
   - Sentence rhythm rules (e.g., "use 2-3 short sentences after a long descriptive passage")
   - Four-character phrase density target (e.g., "3-5 per paragraph in descriptive sections")
   - Sensory layering order (e.g., "visual first, then olfactory, then tactile")
   - Transition vocabulary (collected from source articles)
   - Opening and closing formulas

3. **Create a vocabulary palette** — Collect and categorize:
   - Color terms grouped by warmth/mood
   - Texture and material descriptors
   - Movement and flow verbs
   - Emotional and atmospheric modifiers
   - Four-character phrases by category (nature, food, emotion, aesthetics)

4. **Document constraints** — What the style avoids:
   - Overly modern or internet slang
   - Excessive exclamation or hyperbole
   - Direct quotation of poetry without narrative integration
   - Abrupt topic shifts without sensory bridges

Output: writing template (fillable structure), style guide (rules and constraints), and vocabulary palette (categorized word/phrase bank).

### Workflow: Article Generation

Generate a new article using an extracted template and style guide, applied to a user-provided topic.

1. **Parse the brief** — Identify:
   - Target topic (e.g., a specific flower + food pairing, a place, a seasonal theme)
   - Any specific requirements (word count, focus areas, cultural elements to include)
   - Which template and style guide to use (from previous extraction or provided in INTEL)

2. **Research the topic** — Use web search to gather:
   - Factual details about the subject (botanical info for flowers, culinary details for food, historical context for places)
   - Relevant classical poetry or literary references that could be naturally integrated
   - Sensory details that ground the description in reality (actual colors, scents, textures)
   - Local cultural context and seasonal relevance

3. **Draft using the template** — Follow the extracted structure section by section:
   - Apply the style guide rules at every sentence
   - Use vocabulary from the palette, supplemented with topic-specific terms
   - Match the sensory layering order from the source style
   - Maintain the sentence rhythm patterns (long-short alternation)
   - Integrate cultural references naturally, not as forced citations

4. **Self-review checklist** — Before delivery, verify:
   - Structural fidelity: does the article follow the template sections in order?
   - Four-character phrase density: does it match the source pattern?
   - Sensory coverage: are all relevant senses addressed with the source's technique?
   - Rhythm: read aloud mentally — does the sentence flow match the source cadence?
   - Cultural integration: are references woven in naturally?
   - Closing synthesis: does the ending elevate from specific to philosophical, matching the source?
   - No plagiarism: the article uses original descriptions, not copied phrases from source

5. **Revision pass** — Make targeted improvements:
   - Strengthen any weak sensory descriptions
   - Replace generic modifiers with specific, evocative vocabulary
   - Ensure transitions between sections use sensory bridges (e.g., scent leading from flower to food)
   - Tighten any verbose passages with short-sentence closings

Output: completed article in the target style, with a brief style compliance annotation noting how each template section was fulfilled.

### Reference: Gusu Morning Treats Style Pattern

This reference section documents the style patterns extracted from the seed material (three "Gusu Morning Treats" articles). Use as the default style template when no other source is specified.

**Structural formula: Nature + Food + Synthesis**
- Section 1 (Nature): Location introduction, detailed visual description of a flower (color, form, density), environmental setting (garden, water, architecture), cross-sensory atmosphere (scent, touch, sound)
- Section 2 (Food): Craft process, visual appearance of the finished item, multi-layered taste description (entry, mid-palate, aftertaste), texture
- Section 3 (Closing): Thematic bridge between nature and food imagery, elevation to life philosophy or seasonal meditation, typically 2-3 sentences

**Sentence rhythm:** Long descriptive passage (3-5 clauses) followed by 1-2 short closing sentences. Four-character phrases cluster in descriptive peaks. Second-person guidance voice ("follow the scent to find...") appears in transitions.

**Sensory layering:** Visual (color contrast, spatial composition) leads into olfactory (flower scent permeating space), which bridges to food. Food section reverses: visual appearance first, then tactile (texture on bite), then gustatory (layered taste progression), with olfactory undertone.

**Color palette:** Subtle and traditional — light purple (qianzi), cyan-green (qinglv), rose-red (meihong), amber (hupo). Colors are described as transforming (deepening, fading, suffusing) rather than static.

**Cultural integration style:** Poetry quoted only when naturally fitting the scene (not forced). Place names carry narrative weight — each name evokes architectural and historical context. Intangible heritage mentioned through craft stories (generational artisans, traditional techniques). Seasonal philosophy emerges from the specific to the universal in the closing.

Report should include: style analysis results with specific examples, extracted templates with section descriptions, generated article with style compliance annotations, and comparative assessment of stylistic fidelity to the source material.

## Output Schema

Captain must fill these frontmatter fields in `OPERATION.md` during the operation:

```yaml
workflow: # which workflow was executed (e.g., "style-analysis", "template-extraction", "article-generation", "full-pipeline")
source_articles: # number of source articles analyzed
style_patterns: [] # key style patterns identified (e.g., "nature-food-synthesis structure", "synesthesia rhetoric")
template_extracted: # true/false — whether a reusable template was produced
article_generated: # true/false — whether a new article was generated
article_topic: # topic of the generated article (if applicable)
```
