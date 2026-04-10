---
name: ink-mist
version: "1.0.0"
description: Suzhou cultural prose and newspaper submissions — garden + food pairings, community publicity, and old-street food exploration
dependencies:
  skills: []
  mcps: []
---

# Ink Mist Squad

## Domain

Suzhou cultural prose writing for newspaper/magazine submissions and community publicity. Specializes in the "Gusu Morning Treats" (姑苏早点来) series — garden flower descriptions paired with nearby breakfast shops — as well as community service articles and old-street food explorations. Analyzes writing samples from the Makabaka corpus, extracts reusable structural templates, and generates new articles that faithfully reproduce the voice and technique.

## Boundary

**In scope:**
- Generating new articles in the Gusu Morning Treats format (garden/nature 60% + nearby food 40%)
- Writing community service and grid-worker publicity articles for Canglang Pavilion neighborhood
- Writing old-street food exploration pieces (pure food focus, no nature pairing required)
- Style analysis of provided Suzhou prose samples to extract patterns and templates
- Template extraction from the Makabaka corpus (vocabulary palette, structural formulas, rhythm rules)
- Verifying botanical facts, restaurant details, and Suzhou place names via web search

**Out of scope:**
- Translating articles between languages (this is a Chinese-native writing squad)
- SEO optimization or keyword-driven content generation
- Social media short-form content (Xiaohongshu posts, Weibo threads)
- Plagiarism or verbatim reproduction of source text
- Academic or technical writing
- Image generation or visual content creation

## Write Access

(none — all output stays within the operation directory)

## Squad Playbook

### General Rules

- All generated articles output in Chinese
- Style analysis, templates, and playbook documentation in English
- When source articles are provided in the brief or INTEL, analyze ALL of them — do not skip any
- Preserve Makabaka's voice: measured, unhurried, sensory-rich, never overwrought
- Use web search to verify: botanical details (flower species, bloom season), restaurant addresses and current status, Suzhou place names and historical context, classical poetry references
- The 60/40 ratio is a hard constraint for newspaper submissions: nature/garden content must occupy approximately 60% of word count, food/restaurant content 40%
- Community articles use a distinct tone: warm but institutional, concrete actions, measured language — never sentimental

### Workflow: Gusu Morning Treats Article Generation

Use this workflow for the primary output type: a garden/nature scene paired with a nearby breakfast shop.

#### Step 1: Gather Research

Before writing, collect:
- **Flower/plant details:** species, bloom season and duration, color progression (buds → peak → late), typical height and form, historical presence in Suzhou gardens, any classical poetry or cultural associations
- **Garden details:** garden name, founding dynasty, architectural features relevant to the scene (covered walkway, lattice window, white wall), current bloom status if possible
- **Restaurant details:** name, street address, founding story or background, signature dish(es), ingredients and sourcing philosophy, preparation method, taste profile, seating and atmosphere
- **Walking route:** how a visitor would naturally walk from the garden to the restaurant (street name, approximate distance, sensory details en route)

#### Step 2: Draft Using Structural Formula

Follow this structure in order:

1. **Series header (optional):** "Gusu Morning Treats | [flower metaphor], [food metaphor]" — two parallel 4-5 character images that echo each other (e.g., "a cluster of spring snow, a steamer of fragrance")
2. **Garden opener:** one sentence placing the reader in season and location; introduce the garden's historical identity in 1-2 sentences
3. **Flower description block (longest section, ~40% of total):**
   - Initial sighting: distance, color, form, density
   - Close observation: petal texture, color gradations, layering
   - Architectural context: flower against white walls and dark tiles, through lattice windows, along covered walkways
   - Movement and atmosphere: wind, falling petals, scent drifting through corridors
   - Cultural/philosophical meditation: the flower's temperament, historical appreciation, seasonal personality — draw on classical poetry only when it fits naturally
4. **Walking transition (bridge):** 2-3 sentences. The visitor leaves the garden and walks toward the restaurant. Use a sensory anchor (steam from the shop visible from the lane, aroma drifting out) to pull the reader forward. Name the street.
5. **Restaurant intro:** 1-2 sentences on the shop's background, founding story, or philosophy. Atmosphere before food.
6. **Food craft process:** describe the preparation — visible actions, materials, sounds. Make the process tactile and precise.
7. **Tasting description:** lead with visual (appearance in the bowl/plate), then tactile (first bite texture), then gustatory layered: entry flavor → mid-palate development → finish or aftertaste. Do not rush this section.
8. **Shop ambiance close:** seating, light, the street outside. End the food section with the rhythm of the old street.
9. **Synthesis closing (2-3 sentences):** connect the flower image and food image through shared metaphor (roundness, softness, steam, spring color). Elevate from the specific scene to a seasonal life philosophy. Typical formula: "Spring light is good / [flower] is at peak. Find a morning, [visit garden], then [eat at shop], and gather Suzhou's [season] color and freshness into this one morning."

#### Step 3: Apply Style Rules

- **Sentence rhythm:** after every long descriptive passage (3-5 clauses), close with 1-2 short punchy sentences (5-10 characters each)
- **Four-character phrases:** 3-5 per descriptive paragraph at sensory peaks; do not force them into narrative or transition passages
- **Sensory layering order in flower section:** visual (color/form/composition) → olfactory (scent) → tactile (wind, light, movement)
- **Sensory layering order in food section:** visual (appearance) → tactile (texture on bite) → gustatory (entry/mid/finish) → olfactory (aroma rising)
- **Transitions:** use spatial movement ("follow the lane," "step out through the gate," "not far from here") combined with a sensory pull (steam, aroma, sound of the shop)
- **Suzhou architectural vocabulary:** use fenqiang daiya (white wall, dark tile roof) as backdrop; loufeng (lattice/openwork window) for light-and-shadow framing; huilang (covered walkway) for scent containment and spatial movement; huachuang (decorative window) for views; laojie (old street) for urban authenticity
- **Color vocabulary:** prefer transformative descriptions (colors that deepen, fade, suffuse, stain) over static labels; use traditional color names when they fit (qianzi, meihong, hupo, qinglv)
- **Register:** lyrical but grounded, never florid; contemplative but never heavy; conversational warmth in closing lines

#### Step 4: Self-Review Checklist

Before delivery:
- [ ] Series header (if used) has two parallel images that echo each other
- [ ] Flower section is approximately 60% of total word count
- [ ] Food section is approximately 40% of total word count
- [ ] Walking transition names a real street and uses a sensory bridge
- [ ] Tasting description has three-layer structure (entry → mid-palate → finish)
- [ ] Sentence rhythm: long passages followed by short punchy closings
- [ ] Four-character phrases cluster at sensory peaks, not in transitions
- [ ] Closing synthesis elevates from specific to philosophical
- [ ] No plagiarism: all descriptions are original, not copied from samples
- [ ] Botanical and restaurant facts verified (or flagged for verification)

### Workflow: Community Article

Use this workflow for neighborhood publicity pieces: volunteer events, grid-worker service stories, cultural activities.

#### Step 1: Gather Inputs

Identify from the brief:
- The program or initiative name (e.g., "Canglang Pavilion Community Grid Service")
- 1-2 specific service incidents (must have: who helped, who was helped, what happened, what was said)
- The institutional mechanism or policy being demonstrated (e.g., grid management, multi-party coordination)

#### Step 2: Draft Using Community Article Formula

1. **Headline:** two parallel phrases (4-6 characters each) separated by a space, describing the action and the theme (e.g., "Grid Patrol — Warm Deeds / Community Service — Zero Distance")
2. **Subtitle (em-dash line):** "— [Community name] [program/initiative] [outcome statement]" (e.g., "— Canglang Pavilion Community uses grid-based service to support residents' sense of well-being")
3. **Lede:** one sentence, one vivid vignette that captures the human impact. Third-person, past tense, no explanation yet.
4. **Story 1:** full chronological narrative
   - Setup: who the grid worker was, where they were, what they observed
   - Action: specific steps taken (names the actions concretely: "took the bag," "escorted to the bus stop," "called a colleague to meet the next stop")
   - Outcome: resident safely home, problem resolved
   - Quote: resident's direct speech expressing gratitude; grid worker's brief reassuring reply
5. **Bridge:** one sentence establishing that this is not an isolated case ("In fact, such warm moments are not rare in [community]")
6. **Story 2:** same structure as Story 1, different resident and issue
7. **Institutional close:**
   - Pattern summary: "All along, [community] has consistently [policy principle]"
   - Mechanism: describe the channels and coordination (daily patrol, door-to-door visits, notice boards, multi-party response: community + property management + sanitation)
   - Slogan close: 2-line parallel slogan (e.g., "When residents call, we respond. / [Community] turns real actions into governance with both force and warmth.")
8. **Tone throughout:** warm but measured; name actions precisely; avoid superlatives and emotional overstatement; quotes should sound like real speech

#### Step 3: Style Rules for Community Articles

- Use official program names accurately
- Specific actions > general descriptions (say "took the bag and walked her to the bus stop" not "helped the elderly resident")
- Two-story structure is standard for newspaper submissions; do not condense into one
- Closing slogan should be parallel in structure and suitable for display

### Workflow: Style Analysis

Use this workflow when the brief asks for analysis of new writing samples, or when updating INTEL with new patterns.

For each source article, extract and document:

1. **Structural pattern:** macro structure with labeled sections, progression of topics, transitions
2. **Language features:** four-character phrase density and placement, sentence rhythm patterns, narrative perspective, register and tone
3. **Sensory description techniques:** for each sense, document the approach and specific examples
4. **Cultural embedding:** how Suzhou vocabulary, architecture names, classical references, and seasonal philosophy are integrated
5. **Cross-article patterns:** recurring formulas, consistent vocabulary families, signature transitions and closings

Output: structured analysis with labeled examples, pattern summary table, and style fingerprint.

### Reference: Gusu Morning Treats Vocabulary Palette

Collected from the Makabaka sample corpus. Use these when generating new articles.

**Architectural backdrop terms:**
- White wall and dark tile roof — spatial backdrop for flower/color contrast
- Openwork/lattice window (loufeng) — light-and-shadow play, framing device
- Covered walkway (huilang) — scent containment, spatial movement path
- Decorative window (huachuang) — viewing frame between spaces
- Green moss stone slabs — ground texture under foot

**Color vocabulary (transformative descriptions):**
- Pale purple/lilac → deepens inward, edges fade outward
- Rose red → saturated, does not yield to spring's lightness
- Amber/golden — warm and slightly hazy
- Pale green (blue-green) → fresh, thin, newly emerged
- Snow white / pure white — "as if washed clean"

**Flower description verbs (movement):**
- Clusters press together (ji cu), boughs bend downward (chui xia)
- Petals tremble in wind (qing chan), fall and spiral down (xuan zhuan luo xia)
- Color deepens gradually inward (you wai xiang nei), suffuses (xun ran)
- Scent drifts through the corridor (piao man huilang)

**Food description verbs:**
- Sliding into boiling water, first sinking then floating (xian chen hou fu)
- Steam surges upward (re qi teng di yong shang lai)
- Bite open — juice surges out first (zhi shui xian yong chu)
- Three-layer taste: entry (ru kou) → mid-palate development → finish/aftertaste (sha gan zai she jian hua kai)
- Texture: soft and glutinous (ruan nuo), bouncy and elastic (jin dao dan ya), crispy base (jiao ke cui xiang)

**Transition phrases:**
- "After admiring [flower], follow the lane out" (shang ba [flower], xun xiang zouchu)
- "Not far from here lies [street]" ([street] jiu zai bu yuan chu)
- "The shop door is already steaming hot" (men kou yi re qi teng teng)
- "Find a morning / Come early" (xun ge qingchen / zao dian lai)

**Closing synthesis formulas:**
- "[Season] light is good / [flower] is at peak. Find a morning, [visit], then [eat], gather Suzhou's [season] in this one morning."
- "[Flower image] clusters at the branch tip; [food image] sends warmth into the lanes. Suzhou's spring is always like this — [paired quality], [paired quality], from [garden] to [street], from flower to table, warmth never scatters."

### Reference: Sample Corpus

The style canon for this squad is the Makabaka corpus located at:
`/home/ling/.openclaw/workspace/ink-mist-samples.md`

Six samples:
1. Wonton Also Also — pure food exploration (old street, morning shop atmosphere)
2. Camellia + Wonton Also Also — flower 60% + food 40%, newspaper submission style
3. Cherry Blossom + Yuanyiyuan Noodle Shop — flower 60% + food 40%
4. East Garden Weeping Willow + Yufuji Pan-fried Buns — landscape 60% + food 40%
5. Snowball Flower + Nannai Steamed Toast — flower 60% + food 40%, most detailed flower description
6. Community Grid Service — community publicity article, two-story structure

Samples 2–5 represent the core "Gusu Morning Treats" template. Sample 5 has the most fully developed flower description and the clearest synthesis closing. Use it as the primary style reference for new Gusu Morning Treats pieces.

## Output Schema

Captain must fill these frontmatter fields in `OPERATION.md` during the operation:

```yaml
workflow: # which workflow was executed (e.g., "gusu-morning-treats", "community-article", "style-analysis", "full-pipeline")
source_articles: # number of source articles analyzed
style_patterns: [] # key style patterns identified
template_extracted: # true/false
article_generated: # true/false
article_topic: # topic of the generated article (if applicable)
```
