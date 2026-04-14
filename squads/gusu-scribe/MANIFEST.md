---
name: gusu-scribe
version: "1.2.0"
description: Suzhou cultural prose writing — newspaper submissions, community publicity, and food exploration articles for the Gusu region
dependencies:
  skills: [sop]
  mcps: []
---

# Gusu Scribe Squad

## Domain

Suzhou (Gusu) cultural prose writing for Makabaka's publishing needs. Three article types: (1) lyrical nature-and-food prose for newspaper/magazine submissions — the "Gusu Morning Treats" series pairing Suzhou garden flowers with nearby breakfast shops; (2) food exploration articles focused on Suzhou old-street dining; and (3) warm-official community service articles for neighborhood publicity and grid governance reporting. Analyzes style patterns from provided source articles, extracts reusable templates, and generates new articles that faithfully match the source voice.

## Boundary

**In scope:**
- Analyzing and extracting style templates from Makabaka's seed articles
- Writing "Gusu Morning Treats" series articles (nature/flower 60% + food 40%)
- Writing food exploration articles for Suzhou old-street shops
- Writing community service articles for neighborhood/grid governance events
- Researching botanical details, Suzhou historical context, restaurant information, and community event facts for factual grounding
- Style compliance self-review and revision

**Out of scope:**
- Writing about locations outside Suzhou/Gusu region
- SEO-optimized or keyword-driven content
- Social media short-form posts (use xiaohongshu-research for Xiaohongshu)
- Academic or technical writing
- Translating between Chinese and other languages
- Image generation or visual content creation
- Plagiarism or verbatim reproduction of copyrighted source text

## Write Access

(none — all output stays within the operation directory)

## Squad Playbook

### General Rules

- All generated articles in Chinese; style analysis templates and notes in English for reusability
- When source articles are provided in the brief or INTEL, analyze ALL of them — do not skip any
- Preserve Makabaka's voice: unhurried, lyrical, warm, grounded in Suzhou cultural specificity
- Use web search to verify botanical facts, garden history, restaurant details, and community event specifics — never invent factual details (garden founding year, dish ingredients, street names)
- If seed articles are referenced in the operation brief, read them from the path specified there. Do not assume a fixed filesystem location
- Vocabulary must draw from the Suzhou lexicon documented below; avoid modern internet slang

### Constraints

- **Voice fidelity over creativity** — when in doubt between an inventive phrase and one that matches the seed article voice, choose voice fidelity. The goal is to write as Makabaka would, not to write better than Makabaka
- **No verbatim copying** — never copy sentences or distinctive multi-clause phrases from seed articles. Reuse structural patterns and vocabulary, not exact prose
- **Factual grounding required** — every garden name, street name, shop name, dish name, flower species, and historical claim must be verified via web search. If verification fails, flag the claim as unverified rather than publishing it
- **One article type per operation** — do not mix Gusu Morning Treats structure with community article structure. If the brief is ambiguous, default to the article type that best fits the subject matter
- **Register separation** — lyrical register (nature/food prose) and official register (community articles) must never bleed into each other. No four-character garden phrases in community articles; no policy slogans in food prose
- **Sensory specificity over abstraction** — prefer concrete sensory detail ("petals curl inward at the tips, thinning to translucence") over abstract praise ("the flowers are beautiful"). Every descriptive paragraph must engage at least two senses
### Suzhou Cultural Vocabulary Reference

This vocabulary bank is extracted from the seed articles and must be used in generated prose:

**Architecture & garden:** 粉墙黛瓦, 漏窗, 回廊, 花窗, 黛瓦翘檐, 回廊曲折, 粉墙 (use as background contrast for flower color)

**Water & scenery:** 沧浪之水, 护城河, 碧波, 粼粼波光, 软枝轻垂探向水面

**Suzhou temperament:** 不急不徐, 笃定从容, 温柔不散, 安安静静, 从容不迫

**Food craft:** 现点现包/现包现煮, 明厨亮灶, 新鲜现剥, 入口沙沙绵密, 层层递进

**Seasonal transitions:** 春光正好, 早春时节, 四月, 烟雨江南, 鹅黄新绿, 花期绵长

**Walking transitions (copy these formulas):**
- "赏罢[flower]，循着[garden]外的小巷走出去，不远处便是[street/shop]"
- "赏过[scenery]，循着[location]步入，[destination]"
- "春光正好，[flower]正盛。寻个清晨，去[garden]看[flower]，再踱进[street]吃[food]"

### Workflow: Style Analysis

Analyze provided source articles to identify writing patterns, techniques, and style signatures.

**Input:** One or more source articles provided in the brief or referenced file path.

For each source article, extract and document:

1. **Structural pattern** — Identify macro structure (location intro, body sections, closing synthesis). Map topic progression. Note transitions between nature and food sections. Record section word counts to establish length ratios.

2. **Language features:**
   - Four-character phrases: frequency, placement in descriptive peaks, and categories (nature, food, temperament)
   - Sentence rhythm: long descriptive passage (3-5 clauses) followed by 1-2 short closing sentences. Measure average clause count per long passage
   - Narrative perspective: typically third-person observation with second-person guidance in transitions
   - Register: lyrical and contemplative in nature sections; warm-journalistic in food and community sections

3. **Sensory description techniques:**
   - Visual: color transformation (fading/deepening, not static) — use traditional color names
   - Olfactory: flower scent bridging to food aroma
   - Gustatory: multi-layer structure — visual (in bowl) -> bite mechanics -> entry flavor -> mid-palate -> aftertaste
   - Tactile: texture vocabulary for both flowers and food

4. **Cross-article patterns** — Recurring formulas, transitions, and closing techniques across multiple source articles. Note which patterns appear in 2+ articles (high confidence) vs single articles (may be situational).

**Quality gate — verify before completing:**
- [ ] Every source article is analyzed (none skipped)
- [ ] Each article has all 4 extraction categories filled in with specific examples (not just labels)
- [ ] Cross-article pattern table distinguishes high-confidence (2+ articles) from situational patterns
- [ ] At least 3 labeled examples per sensory technique category

**Output:** Structured style analysis report with labeled examples, pattern summary table, and style fingerprint profile.

### Workflow: Template Extraction

Distill analyzed style patterns into a reusable writing template. Requires a completed Style Analysis as input.

1. **Abstract the structure** — Convert structural pattern into a fillable template with labeled sections. Each section specifies: purpose, typical length (word count range), tone/pacing, and required elements.

2. **Build a style guide** — Prescriptive rules with measurable thresholds:
   - Sentence rhythm: long passage -> short closing (ratio ~4:1 clauses)
   - Four-character phrase density: 3-5 per descriptive paragraph, 0-1 per transition sentence
   - Sensory layering order: visual -> olfactory -> gustatory (nature prose); visual -> tactile -> gustatory (food sections)
   - Walking transition formula: use one of the three templates from Suzhou Vocabulary Reference
   - Minimum sensory channels per paragraph: 2 for descriptive sections, 1 for transitions

3. **Create a vocabulary palette** — Collect color terms, texture descriptors, movement verbs, atmospheric modifiers, and four-character phrases categorized by type. Include usage notes for context-specific terms.

4. **Document anti-patterns** — Explicitly list what to avoid:
   - No modern internet slang or excessive exclamation
   - No direct poetry quotation without narrative integration
   - No abrupt topic shifts — always use sensory or spatial bridges
   - No static color descriptions (always show transformation)
   - No generic food praise — always specify texture, temperature, or flavor layers

**Quality gate — verify before completing:**
- [ ] Template has word count ranges for each section
- [ ] Style guide rules are measurable (numbers, ratios, counts — not just "some" or "appropriate")
- [ ] Vocabulary palette has 5+ entries per category with usage notes
- [ ] Anti-patterns section has 5+ specific items

**Output:** Fillable writing template, style guide with rules, vocabulary palette.
### Workflow: "Gusu Morning Treats" Article Generation

Generate a nature-and-food article in the series. This is the primary article format for newspaper/magazine submissions.

**Prerequisites:** The brief must specify (1) which garden/flower to feature and (2) which food shop/dish to pair. If either is missing, use web search to identify a seasonally appropriate pairing within the same Suzhou neighborhood.

**Article structure (must follow in order):**

1. **Location introduction** (1-2 sentences, ~30-50 characters): Name the Suzhou garden or landmark. Include one historical or seasonal anchor (founding dynasty, seasonal highlight, or distinctive feature).

2. **Nature/flower description** (3-5 paragraphs, ~60% of total article):
   - Visual: describe color using transformation (never static "is white")
   - Environmental integration: place flower against architectural backdrop. Describe the spatial relationship
   - Sensory layering: introduce scent after visual; add tactile if appropriate. Each paragraph must engage 2+ senses
   - Cultural character: describe the plant's seasonal personality, classical associations, or historical role in Suzhou gardens. One specific cultural reference per flower
   - Light/atmosphere: how light falls on the flowers; wind movement; sound if present

3. **Walking transition** (1-3 sentences): Use one of the three transition formulas from Suzhou Vocabulary Reference. Bridge from the garden to the food location via a specific, real street or route.

4. **Food shop introduction** (1-2 sentences): Name the shop, give its location on an old Suzhou street. One detail about origin, reputation, or what regulars know.

5. **Food craft process** (1-2 paragraphs, ~20% of total article): Describe the making of the signature dish with sensory detail. Emphasize handmade craft and freshness. Name specific ingredient sourcing choices and explain why they matter.

6. **Taste experience** (1 paragraph): Multi-layer gustatory description following this sequence — appearance in bowl, first bite mechanics, entry flavor, mid-palate development, aftertaste. Include at least one texture contrast.

7. **Closing synthesis** (2-3 sentences): Bridge garden and food with a thematic connection. Invite the reader to visit. End with a philosophical note on place and season. Use one of the closing formula patterns from the Style Fingerprint reference.

**Quality gate — verify before delivery:**
- [ ] Structure follows the 7 sections in order, no sections missing
- [ ] Walking transition uses one of the three documented formulas
- [ ] Four-character phrases: 3-5 per descriptive paragraph
- [ ] Sentence rhythm: no more than 2 consecutive long sentences without a short break
- [ ] Color descriptions use transformation, not static adjectives
- [ ] Nature section is ~60% of article, food section is ~40%
- [ ] Closing elevates from specific place to philosophical reflection
- [ ] No copied phrases from seed articles (recheck against source)
- [ ] All garden names, street names, shop names verified via web search
- [ ] Each descriptive paragraph engages at least 2 senses

### Workflow: Food Exploration Article Generation

Generate a standalone food exploration article for a Suzhou old-street shop. Unlike Gusu Morning Treats, this format focuses entirely on the food experience without a paired garden/nature section.

**Prerequisites:** The brief must specify the shop name and location. If dish is unspecified, use web search to identify the shop's signature item.

**Article structure (must follow in order):**

1. **Street scene opening** (1-2 sentences): Set the scene on the old Suzhou street — time of day, atmosphere, sensory details of the neighborhood. Anchor the reader in place.

2. **Shop introduction** (1-2 paragraphs): History, location, reputation. What do regulars know that first-timers do not? Include one specific detail that only comes from visiting.

3. **Ordering ritual** (1-2 sentences): How ordering works at this shop — counter, queue, verbal order, menu board. This grounds the reader in the experience.

4. **Craft process** (2-3 paragraphs, ~40% of article): Detailed sensory description of the making. Ingredient sourcing, technique, timing, the cook's practiced movements. Name specific choices and explain why they matter. This is the emotional core.

5. **Taste experience** (1-2 paragraphs, ~30% of article): Multi-layer description — visual presentation, first bite, entry flavor, mid-palate, aftertaste. Texture contrasts. Temperature. What makes this dish different from the same dish elsewhere.

6. **Closing** (1-2 sentences): Connect the food Suzhou's cultural character  to the unhurried craft, the old-street life, the seasonal rhythm. Brief, philosophical, not sentimental.

**Quality gate — verify before delivery:**
- [ ] No garden/nature section (this is food-only format)
- [ ] Craft process names specific ingredient sourcing choices with reasons
- [ ] Taste description follows the 5-layer sequence (visual, bite, entry, mid, after)
- [ ] All shop names, street names, dish names verified via web search
- [ ] Register is warm-journalistic, not lyrical-garden
- [ ] At least one texture contrast in the taste section

### Workflow: Community Article Writing

Generate a community service article for neighborhood events, grid governance, or volunteer activities. Register is warm but official — suitable for neighborhood notice boards, local newspapers, and social media community accounts.

**Prerequisites:** The brief must provide the event(s) or theme to cover. If names/details are not provided, use web search to find real examples from the specified community.

**Article structure (must follow in order):**

1. **Headline sentence** (1 sentence): An emotional hook anchored in one specific event or scene. Establishes the warm tone immediately. Must name a real person or concrete action — not an abstract statement.

2. **Primary story** (3-5 paragraphs): Detailed chronological account of the key event — who, when, what happened, step by step. Include specific names (grid worker, resident) and concrete actions. Show the care in the details. Each paragraph advances the narrative; no circular repetition.

3. **Secondary story** (2-3 paragraphs): A second related example that reinforces the theme. Different scenario, same spirit of responsiveness. Must involve different people or a different type of service than the primary story.

4. **Policy/practice context** (1-2 paragraphs): Explain the systemic practice behind these individual acts — grid governance structure, multi-party coordination mechanisms, regular outreach methods. This section gives the article institutional weight. Connect the individual stories to the system.

5. **Official closing coda** (1-2 sentences): Use a slogan-style or four-character-phrase formula that summarizes the spirit.

**Quality gate — verify before delivery:**
- [ ] Structure follows the 5 sections in order
- [ ] Warm but never sentimental — facts first, emotion through detail
- [ ] Official but human — at least one direct quote from a resident or worker
- [ ] No flower/nature description — this is a different register entirely
- [ ] Specific > general: actions described with concrete details
- [ ] Primary and secondary stories feature different people/scenarios
- [ ] Policy section connects individual acts to systemic practice

### Reference: Gusu Morning Treats Style Fingerprint

Extracted from five seed articles (samples 2-5 plus sample 1 for food-only baseline). Use as default style template when no other source is specified.

**Structural formula:** Location → Nature (60%) → Walking Transition → Food Shop → Craft Process → Taste → Closing Synthesis

**Sentence rhythm:** Long descriptive passage (3-5 clauses, often comma-separated) followed by 1-2 short declarative sentences of 5-10 characters. Example pattern: [long nature description 40 chars]，[another clause 30 chars]，[a third 20 chars]。[Short punchline 10 chars]。

**Four-character phrase placement:** Cluster at descriptive peaks — especially in nature sections and food taste descriptions. Avoid in transition sentences.

**Color palette:** Traditional, transforming — 嫩黄新绿, 粉白, 粉墙黛瓦, 黛青, 淡紫, 暖玉. Colors deepen or fade; they are never static.

**Flower personality device:** Each flower gets a cultural "character" — camellia (耐冬: enduring, unhurried); cherry blossom (先花后叶: purity, impermanence); viburnum (team/roundness: 团团如雪); willow (灵动: flowing, alive). Always connect flower character to Suzhou temperament.

**Food craft detail rule:** Name the exact ingredient sourcing choice and explain why (e.g., why fresh-cracked duck yolk instead of packaged; why steam instead of bake). This craft story is the emotional core of the food section.

**Closing formula patterns:**
- "把[nature element]与[food quality]，都收进这一个早晨里"
- "[flower] [verb], [food] [verb]. 姑苏的[season]，总是这般[quality adjective]，[quality adjective]，从[garden]到[street]，温柔不散。"
- "春光正好，[flower]正[state]。寻个清晨，去[garden]看[flower]，再踱进[street/shop]，好吃的滋味向来限量，可得早点来哟。"

Report should include: the generated article (full text), style compliance assessment (which rules were followed, any deviations and why), factual verification notes (what was searched and confirmed), and word count breakdown by section.
