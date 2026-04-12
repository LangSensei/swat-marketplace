---
name: gusu-scribe
version: "1.1.0"
description: Suzhou cultural prose writing — newspaper submissions, community publicity, and food exploration articles for the Gusu region
dependencies:
  skills: [sop]
  mcps: []
---

# Gusu Scribe Squad

## Domain

Suzhou (姑苏/Gusu) cultural prose writing for Makabaka's publishing needs. Produces two distinct article types: (1) lyrical nature-and-food prose for newspaper/magazine submissions — the "Gusu Morning Treats" series pairing Suzhou garden flowers with nearby breakfast shops; and (2) warm-official community service articles for neighborhood publicity and grid governance reporting. Analyzes style patterns from provided source articles, extracts reusable templates, and generates new articles that faithfully match the source voice.

## Boundary

**In scope:**
- Analyzing and extracting style templates from Makabaka's seed articles
- Writing "Gusu Morning Treats" series articles (nature/flower 60% + food 40%)
- Writing food exploration articles (美食探店) for Suzhou old-street shops
- Writing community service articles (社区宣传) for neighborhood/grid governance events
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
- Use web search to verify botanical facts, garden history, restaurant details, and community event specifics
- Seed articles are in `/home/ling/.openclaw/workspace/ink-mist-samples.md` — read them when no source is provided in the brief
- Vocabulary must draw from the Suzhou lexicon documented below; avoid modern internet slang

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

For each source article, extract and document:

1. **Structural pattern** — Identify macro structure (location intro, body sections, closing synthesis). Map topic progression. Note transitions between nature and food sections.

2. **Language features:**
   - Four-character phrases (sizi duanyu): frequency and placement in descriptive peaks
   - Sentence rhythm: long descriptive passage (3-5 clauses) followed by 1-2 short closing sentences
   - Narrative perspective: typically third-person observation with second-person guidance in transitions
   - Register: lyrical and contemplative in nature sections; warm-journalistic in food and community sections

3. **Sensory description techniques:**
   - Visual: color transformation (fading/deepening, not static) — use traditional color names (嫩黄, 粉白, 黛青)
   - Olfactory: flower scent bridging to food aroma
   - Gustatory: multi-layer structure — visual (in bowl) → bite mechanics → entry flavor → mid-palate → aftertaste
   - Tactile: texture vocabulary for both flowers (花瓣薄而密, 饱满, 层层卷叠) and food (沙沙软糯, 筋道弹牙)

4. **Cross-article patterns** — Recurring formulas, transitions, and closing techniques across multiple source articles.

Output: structured style analysis report with labeled examples, pattern summary table, and style fingerprint profile.

### Workflow: Template Extraction

Distill analyzed style patterns into a reusable writing template.

1. **Abstract the structure** — Convert structural pattern into a fillable template with labeled sections. Each section: purpose, typical length, tone/pacing, required elements.

2. **Build a style guide** — Prescriptive rules:
   - Sentence rhythm: long passage → short closing (ratio ~4:1)
   - Four-character phrase density: 3-5 per descriptive paragraph
   - Sensory layering order: visual → olfactory → gustatory (prose); visual → tactile → gustatory (food)
   - Walking transition formula: use one of the three templates from Suzhou Vocabulary Reference

3. **Create a vocabulary palette** — Collect color terms, texture descriptors, movement verbs, atmospheric modifiers, and four-character phrases categorized by type.

4. **Document constraints:**
   - No modern internet slang or excessive exclamation
   - No direct poetry quotation without narrative integration
   - No abrupt topic shifts — always use sensory or spatial bridges

Output: fillable writing template, style guide with rules, vocabulary palette.

### Workflow: "Gusu Morning Treats" Article Generation

Generate a nature-and-food article in the "姑苏早点来" series. This is the primary article format for newspaper/magazine submissions.

**Article structure (must follow in order):**

1. **Location introduction** (1-2 sentences): Name the Suzhou garden or landmark. Include a brief historical or seasonal note.

2. **Nature/flower description** (3-5 paragraphs, ~60% of article):
   - Visual: describe color (use transformation — "渐渐变白", "由外向内渐渐加深"), form, density, and arrangement
   - Environmental integration: place flower against 粉墙黛瓦, 漏窗, 回廊 as background
   - Sensory layering: introduce scent after visual; add tactile if appropriate
   - Cultural character: describe the plant's seasonal personality, classical associations, or historical role in Suzhou gardens
   - Light/atmosphere: how light falls on the flowers; wind movement; sound if present

3. **Walking transition** (1-3 sentences): Use one of the transition formulas from Suzhou Vocabulary Reference. Bridge from the garden to the food location via a specific street or route.

4. **Food shop introduction** (1-2 sentences): Name the shop, give its location on an old Suzhou street. Brief note on origin or reputation.

5. **Food craft process** (1-2 paragraphs): Describe the making of the signature dish with sensory detail — the cook's hands, the raw ingredients, the cooking technique. Emphasize handmade craft and freshness.

6. **Taste experience** (1 paragraph): Multi-layer gustatory description — appearance in bowl, bite mechanics, entry flavor, mid-palate, aftertaste. Include texture contrast.

7. **Closing synthesis** (2-3 sentences): Bridge garden and food with a thematic connection (both embody Suzhou's unhurried tempo, seasonal beauty, warmth). Invite the reader to visit "some early morning." End with a philosophical note on place and season.

**Before delivery, verify:**
- Structure follows the 7 sections in order
- Walking transition uses one of the three documented formulas
- Four-character phrases: 3-5 per descriptive paragraph
- Sentence rhythm: no more than 2 consecutive long sentences without a short break
- Color descriptions use transformation, not static
- Closing elevates from specific to philosophical
- No copied phrases from seed articles

### Workflow: Community Article Writing

Generate a community service article (社区宣传) for neighborhood events, grid governance, or volunteer activities. Register is warm but official — suitable for neighborhood notice boards, local newspapers, and social media community accounts.

**Article structure (must follow in order):**

1. **Headline sentence** (1 sentence): An emotional hook anchored in one specific event or scene. Establishes the warm tone immediately.

2. **Primary story** (3-5 paragraphs): Detailed chronological account of the key event — who, when, what happened, step by step. Include specific names (grid worker, resident) and concrete actions (carrying bags, calling colleagues, coordinating cleanup). Show the care in the details.

3. **Secondary story** (2-3 paragraphs): A second related example that reinforces the theme. Different scenario, same spirit of responsiveness.

4. **Policy/practice context** (1-2 paragraphs): Explain the systemic practice behind these individual acts — grid governance structure, multi-party coordination mechanisms, regular outreach methods. This section gives the article institutional weight.

5. **Official closing coda** (1-2 sentences): Use a slogan-style or four-character-phrase formula that summarizes the spirit. Examples from seed material: "民有所呼，我有所应", "让基层治理既有力度，更有温度".

**Tone checklist:**
- Warm but never sentimental — facts first, emotion through detail
- Official but human — use residents' words (direct quotes) to humanize
- No flower/nature description — this is a different register entirely
- Specific > general: "carried two bags of groceries and medications" beats "helped the elderly resident"

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
