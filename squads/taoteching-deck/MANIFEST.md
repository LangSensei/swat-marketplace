---
name: taoteching-deck
version: "1.0.0"
description: Tao Te Ching (Daodejing) chapter HTML slide-deck generator — single-file, ink-style, 10-page narrative (cover / concept overview / original text / five-paragraph analysis / key line / chapter summary) with paired ancient-modern case studies
dependencies:
  skills: [sop, taoteching-deck-template]
  mcps: []
---

# Tao Te Ching Deck Squad

## Domain

Generation of single-file, zero-dependency HTML slide decks that explain individual chapters of the *Tao Te Ching* (《道德经》, Daodejing). Output is a Chinese-language, ink-style presentation that opens by double-click in any modern browser, navigates with arrow keys / wheel / touch, and ships as one self-contained HTML file ready for offline distribution.

The squad takes a chapter number (and optionally the user-supplied original text plus interpretive focus) and produces a 10-page deck following the fixed lecture rhythm: cover, concept overview, original text, five paragraph-by-paragraph analyses (each with one historical and one modern case study), a key-line page, and a summary. The visual language is ink-and-paper Chinese (墨色, 楷体 brush calligraphy, 朱印 vermilion seals, 金线 gold rules), the engine is hand-rolled (~60 lines of vanilla JS, no reveal.js / impress.js), and every page is built from reusable CSS variables and animation classes.

## Boundary

**In scope:**
- Building a 10-page HTML deck for any *Tao Te Ching* chapter, from chapter number alone or from user-supplied original text
- Auto-segmenting the chapter into five paragraphs, extracting the key line, drafting the chapter summary
- Drafting one historical case (史) and one modern case (今) per paragraph — the "ancient-modern mirrors" (古今印证) signature
- Producing the 180×180 SVG concept diagram for each analysis page
- Default delivery: gradient placeholder backgrounds with TODO comments naming the recommended imagery per page
- Optional delivery: base64-inlined background images when the user supplies image files or explicitly requests the embedded-image variant
- Output language: Chinese (target audience reads classical Chinese commentary)

**Out of scope:**
- Translating the chapter into other languages, or producing new academic exegesis (rely on mainstream commentaries; do not invent novel readings)
- PDF / PPTX / Keynote export (HTML only in v1)
- Other classical texts beyond the *Tao Te Ching* (template is reusable, but this squad targets only this corpus)
- Hosting, CDN delivery, or any networked dependency in the output file
- External fonts, JS libraries, CSS frameworks, or remote images in the deck

Other classical texts (Zhuangzi, Analects, etc.) are explicitly out of scope — fork the squad to extend coverage.

## Write Access

(none — all output stays within the operation directory)

## Squad Playbook

### General Rules

- The HTML deliverable is in Chinese (target audience is Chinese readers); all marketplace source files (this MANIFEST, SKILL.md, CHANGELOG.md) and operator working files (plan.md / findings.md / progress.md) stay in English. Inside HTML/CSS code samples, Chinese is preserved verbatim because it is content rather than prose
- **Always use `create` / `edit` tools (or Python `with open(..., "w", encoding="utf-8")`) to write the HTML file.** Never use bash heredoc (`cat << EOF`) — it corrupts multi-byte UTF-8 sequences and the deck is heavily CJK
- The deck is a single `.html` file. CSS, JS, SVG, base64 backgrounds (when used), and font fallback chains are all inlined. No external links of any kind in the output
- Chinese fonts use system fallback only: `--kai: "楷体","KaiTi","STKaiti","华文楷体",serif` for headers/titles and `--song: "宋体","SimSun","STSong",serif` for body text
- File naming: `taoteching-{N}.html` where `{N}` is the Arabic-numeral chapter number (e.g., `taoteching-33.html`)
- Always look up the chapter's original text from a mainstream edition (Wang Bi 王弼 recension by default) when the user does not paste it. If the user does paste it, use that version verbatim
- Use the `taoteching-deck-template` skill as the source of truth for the HTML skeleton, CSS variables, JS engine, animation keyframes, and SVG patterns — copy from there rather than re-deriving

### Workflow: Generate a Chapter Deck

When the brief asks for a chapter (e.g., "用 taoteching-deck 做第三十三章" or "用 taoteching-deck 做第八章，原文我贴在下面：……"):

1. **Resolve chapter source**
   - Parse the chapter number from the brief (Chinese numerals like 三十三 → 33, or Arabic 33)
   - If the user supplied original text, use it verbatim. Otherwise reproduce the chapter from a Wang Bi recension
   - Note any interpretive focus the user requested (e.g., "侧重领导力" — focus on leadership; "结合现代心理学" — connect with modern psychology)

2. **Plan the narrative**
   - Pick a chapter-level title that names the theme (e.g., "第二十五章 · 道法自然" — "Chapter 25 · Tao Follows Nature"; "第三十三章 · 自知者明" — "Chapter 33 · Self-knowledge is Wisdom"). Use the canonical received-text title where one exists
   - Segment the chapter into **exactly five paragraphs** (P4–P8). If the chapter is shorter, group adjacent sentences thematically; never produce more than five or fewer than five
   - Pick one canonical key line for the standalone P9 page. It must appear verbatim somewhere in the chapter
   - Draft the two-column concept overview (P2): pick two foundational concepts (typically a noun + a verb, or substance + function — 体/用) and define each in 2-3 paragraphs, ending each column with a quoted reinforcement from another chapter

3. **Draft the ancient-modern case pairs (古今印证)**
   - For each of the five paragraphs (P4–P8), draft **one historical case (史)** and **one modern case (今)**
   - Historical cases should reach for documented anecdotes (e.g., King Fuchai vs. Goujian — 夫差/勾践; Cook Ding carving the ox — 庖丁解牛; Yu the Great taming the floods — 大禹治水; Pangu separating heaven and earth — 盘古开天). Modern cases should reach for verifiable contemporary examples (e.g., economic cycles, climate crisis, Steve Jobs and minimalism, Wittgenstein's silence)
   - Each case is 3-5 lines, names the figure or concept in the title (`.pa-case-title`), embeds 1-2 `<strong>` highlights, and ends with the takeaway tying back to the chapter's argument
   - This ancient-modern pairing is the squad's signature — every paragraph page must carry it

4. **Pick the SVG concept diagrams (one per analysis page)**
   - Each P4–P8 page carries a 180×180 SVG diagram that visualises the paragraph's concept. Reuse one of the patterns documented in the `taoteching-deck-template` skill (concentric circles, four-direction cycle, descending arrow chain, question mark + named opposites, layered rings) and remix the labels and animation classes (`.an-spin`, `.an-glow`, `.an-bob`, etc.)
   - SVGs are **vector-only, no raster images**. Use `font-family="KaiTi,serif"` for any embedded Chinese characters

5. **Apply the visual system from `taoteching-deck-template`**
   - Copy the CSS variable block and engine into the new file unchanged
   - Default to gradient placeholder backgrounds with TODO comments per page (e.g., `/* TODO: replace with cover background image base64 — recommended: distant landscape with mist */`); operators may keep these TODOs in Chinese in the deliverable for downstream Chinese-speaking authors, but the structure of the comment is what matters
   - Apply the three-colour semantic rule strictly: gold `#f5c97a` for `<strong>` emphasis, red `--red` for paragraph numbers and 史 (history) labels, green `--green` (`#2d5a3d`) for the modern-case left border. No other accent colours
   - Confirm every background-bearing slide has its `::before` mask (cover `.55`, intro `.90`, original-text page `.92`, paragraph / key / summary `.88`) and that all foreground elements use `position:relative; z-index:1`
   - Confirm every body text element carries `text-shadow: 0 2px 8px rgba(0,0,0,0.7)` (and double shadow on key lines and quotes)

5.5. **Start from the skeleton, not from scratch.** Copy `<SKILL_DIR>/templates/skeleton.html` (where `<SKILL_DIR>` = the installed `taoteching-deck-template` skill directory) to the operation root, rename to `taoteching-{N}.html`, then edit. Do not assemble the file by stitching SKILL.md sections together — that path is reserved for skeleton maintenance, not chapter authoring. Every `{{TOKEN}}` placeholder in the skeleton must be replaced; see the skill's "Placeholder Cheatsheet" for the full list and run `grep '{{' taoteching-{N}.html` after editing to verify zero matches remain.

6. **Write the file using `create` / `edit`**
   - Output path: `taoteching-{N}.html` in the operation root
   - Fill every `{{TOKEN}}` placeholder. After editing, run `grep '{{' taoteching-{N}.html` — it must return zero matches. The full token list is in the skill's "Placeholder Cheatsheet" section.
   - Verify file size is under 100 KB when using gradient placeholders (typical: 40-50 KB). When using base64 backgrounds the file may reach 4-5 MB — flag this in the report
   - Mentally walk the file end-to-end and confirm: 10 `.slide` blocks present, dot count auto-derived from `.slide` count in JS, `.slide.s-cover` carries `.on` initially

Report should include: chapter number and title, the key line (金句), a one-line summary of each P4–P8 paragraph, the history/modern case pair list, output file name and size, and the recommended background-image list per slide.

### Visual System

#### CSS Variables (verbatim block)

```css
:root {
  --ink:   #1a1a2e;
  --ink2:  #12121f;
  --paper: #f0e6d3;
  --dim:   #b8a88a;
  --red:   #c53d43;
  --gold:  #d4a574;
  --green: #2d5a3d;
  --kai:   "楷体","KaiTi","STKaiti","华文楷体",serif;
  --song:  "宋体","SimSun","STSong",serif;
}
```

The accent colour for `<strong>` highlights is `#f5c97a` (a brighter gold than `--gold`); use the literal hex, not a variable.

#### Background Mask Rule (non-negotiable)

Every slide that has a background image (or a busy gradient) must layer a `::before` overlay so that text remains legible:

```css
.s-cover::before { content:''; position:absolute; inset:0; background:rgba(18,18,31,0.55); z-index:0; }
.s-intro::before { content:''; position:absolute; inset:0; background:rgba(10,10,20,0.90); z-index:0; }
.s-text::before  { content:''; position:absolute; inset:0; background:rgba(8,8,16,0.92);  z-index:0; }
.s-cover > *, .s-intro > *, .s-text > * { position:relative; z-index:1; }
```

Mask opacity by slide type:

| Slide | Mask opacity | Why |
|-------|--------------|-----|
| Cover (P1) | `.55` | Subtle ambient; the cover gradient is intentionally muted, so a heavy mask would crush it |
| Concept overview (P2) | `.90` | Two-column dense text needs strong contrast against a busy backdrop |
| Original text (P3) | `.92` | Maximum legibility — the chapter text itself is the focus |
| Paragraph analysis (P4–P8), key line (P9), summary (P10) | `.88` | Balanced — text-heavy but with breathing room |

#### Text Shadow Rule (non-negotiable for CJK)

Chinese glyphs have dense interior strokes that wash out without shadows. Apply `text-shadow: 0 2px 8px rgba(0,0,0,0.7)` to **all body text**, and a double shadow `0 2px 10px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,0.6)` to key lines (`.tx-body .ln`, `.kk-main`, `.pa-quote`).

#### Responsive Strategy

Three breakpoints:

- `@media (max-width:1100px)` — tighten padding and grid gap
- `@media (max-width:900px)` — collapse `.in-grid` 1fr 1px 1fr → 1fr; collapse `.pa-wrap` flex row → column; shrink SVG 180→130; collapse `.pa-cases` two columns → one
- `@media (max-width:500px)` — shrink arrow buttons, drop title letter-spacing from `.3em` → `.15em`, drop key-line letter-spacing from `.35em` → `.2em`

All font sizes use `clamp(min, vw, max)` so they scale fluidly between breakpoints.

#### Letter-Spacing = Antiquity

Heavy letter-spacing reads as classical Chinese typography. Use:

- Cover title (`.cv-title`): `letter-spacing: .3em` (drop to `.15em` below 500px)
- Cover subtitle (`.cv-sub`): `.6em`
- Section titles (`.sec-t`): `.25em`
- Key line (`.kk-main`): `.35em`
- Quote line (`.pa-quote`): `.12em`
- Body paragraphs: `.04-.06em` (subtle)

### Motion (animation classes — reuse, do not re-author)

Animation keyframes are predeclared in the template skill and applied via class names. The full library:

| Class | Effect | Companion delays |
|-------|--------|------------------|
| `.an-pulse` | 3s scale + opacity breathing | `.an-pulse-d` (+0.8s) |
| `.an-glow` | 4s opacity breathing | `.an-glow-d` (+1.2s) |
| `.an-bob` | 3.5s vertical bob | `.an-b1` / `.an-b2` / `.an-b3` / `.an-b4` (0 / 0.6 / 1.2 / 1.8s) |
| `.an-ring` | 4s stroke-dash offset | `.an-r1` / `.an-r2` / `.an-r3` (0 / 0.5 / 1s) |
| `.an-drift` | 5s diagonal drift | `.an-drift-r` (reverse) |
| `.an-spin` | 24s linear rotation | `.an-spin-r` (18s reverse) |
| `.an-fade` | 5s opacity fade | `.an-f1` / `.an-f2` / `.an-f3` (0 / 1.5 / 3s) |

**Slide entry animation:** every slide has `.slide .a { opacity:0; transform: translateY(25px); transition: ... }` and `.slide.on .a { opacity:1; transform: translateY(0) }`. Children declare `class="a d2"` to inherit the entry; `.d1` through `.d6` set staircase delays of 0.1s × N. This is declarative — never write per-element JS animation.

### Content Structure

#### 10-Page Narrative Rhythm (fixed)

| Slide | Class hooks | Content |
|-------|-------------|---------|
| P1 | `.slide.s-cover.on` | `.cv-line` + `.cv-title` (book name) + `.cv-sub` (chapter number + title) + `.cv-desc` (chapter incipit) + `.seal` (vertical vermilion seal) |
| P2 | `.slide.s-intro` | `.sec-t` + `.in-sub` + `.in-grid` (2 columns × `.in-block`, each with `.in-label` + 3× `.in-p` + `.in-quote`); `.in-divider` 1px gold gradient between |
| P3 | `.slide.s-text` | `.tx-label` + `.tx-deco-t` (gold line) + `.tx-body` (centered `.ln` lines, the chapter's original text verbatim) + `.tx-deco-b` |
| P4–P8 | `.slide.s-para.s-p4` … `.s-p8` | One `.pa-container` per page; inside: `.pa-wrap` (`.pa-left` SVG + `.pa-right` `.pa-num` + `.pa-quote` + `.pa-label` + `.pa-text`) + `.pa-divider-row` (`✦ 古今印证 ✦` — ancient-modern divider) + `.pa-cases` (2× `.pa-case`, the second carries `.modern`) |
| P9 | `.slide.s-key.s-p9` | `.kk-box` > `.kk-pre` (label "本章金句" — chapter key line) + `.kk-deco` (1px gold) + `.kk-main` (the key line, `<em>` for accent words) + `.kk-sub` (interpretation, with `<strong>` highlights) |
| P10 | `.slide.s-sum.s-p10` | `.sm-box` (bordered card) > `.sm-t` + 2× `.sm-p` (chapter argument recap + closing exhortation) + `.seal` |

#### Paragraph-Page Four-Piece Layout (P4–P8 invariant)

Every analysis page is structurally identical so the deck reads as a series:

```
.pa-container
  .pa-wrap
    .pa-left  -> 180x180 SVG concept diagram
    .pa-right -> .pa-num   (e.g., "第一段 · 道之体" — Paragraph 1, the substance of the Tao)
                 .pa-quote (the paragraph quoted from the chapter's original text)
                 .pa-label ("解析" — analysis)
                 .pa-text  (commentary, with <strong> highlights)
  .pa-divider-row "✦ 古今印证 ✦"  (ancient-modern divider)
  .pa-cases
    .pa-case        -> 史 (history mirror)
    .pa-case.modern -> 今 (modern mirror)
```

#### Three-Colour Semantics (entire deck)

- **Gold `#f5c97a`** — the only highlight colour; reserved for `<strong>` and the key-line `<em>`
- **Red `--red` (#c53d43)** — paragraph numbers (`.pa-num`), history (史) label, the vermilion seal border + glyph
- **Green `--green` (#2d5a3d)** — left border of the modern case card (`.pa-case.modern`), modern-case head colour `#6db58a`

Do not introduce a fourth accent colour. If a new emphasis is needed, use weight (font-weight) or letter-spacing instead.

### Engineering

#### Background Strategy

Two tiers, picked at delivery time:

1. **Default (gradient placeholder + TODO comment).** Each slide carries `background: linear-gradient(...)` plus a `/* TODO: replace with PN background image base64 — recommended: <imagery hint> */` comment (the comment may stay in Chinese in the deliverable since the downstream author is also Chinese-speaking; the structure is what matters). File size ~40-50 KB. Ship this unless the user explicitly asks for the embedded version.
2. **Embedded base64.** When the user supplies image files or asks for the embedded-image variant (嵌图版), encode each background as a `data:image/jpeg;base64,...` URL inside the slide's CSS rule. File size will reach 4-5 MB. Always pair with the heavier mask opacity values from the table above.

The background imagery menu (used both for the placeholder TODOs and to brief any image search):

| Slide | Recommended imagery |
|-------|---------------------|
| P1 cover | distant landscape with mist; primordial / vast feel (山水云雾远景, 混沌苍茫感) |
| P2 overview | deep starry sky; primordial vapour (深邃星空, 混沌氤氲) |
| P3 original text | ancient bamboo scroll; ink-wash with white space (古卷竹简, 水墨留白) |
| P4–P8 | per-paragraph imagery matching the concept (e.g., primordial swirl, lone misty peak, vortex / annual rings, four-direction cosmos / palace silhouette, layered mountain ranges) |
| P9 key line | vast natural landscape; sunrise; living world (辽阔自然景观, 晨曦, 自然万物) |
| P10 summary | landscape harmony; sea of clouds at sunrise (山水合一, 云海日出) |

#### App-like Interaction (in the bundled JS engine)

- `html, body { overflow: hidden; user-select: none }` — locks the viewport
- Three input modalities (all in ~60 lines of JS):
  - **Keyboard:** ArrowRight / ArrowDown / Space → next; ArrowLeft / ArrowUp → previous
  - **Wheel:** any wheel event → next / previous, throttled by an 800ms `setTimeout` lock (`wt`)
  - **Touch:** `touchstart` records start position, `touchend` swipes 50px+ horizontally → previous / next
- A `busy` flag prevents double-advance during the 600ms transition
- Page indicator (`.pn`), dot navigation (`.dots`), and arrow buttons (`.arr-l` / `.arr-r`) are bound on init; arrows hide when at the first / last slide

The full engine is documented in `taoteching-deck-template/SKILL.md`. Copy it verbatim — the slide count is auto-derived from `document.querySelectorAll('.slide')`, so adding or removing slides Just Works.

#### UTF-8 Safety (repeat warning)

The deck is heavy CJK content. **Never** generate it with bash heredoc (`cat << EOF`), `echo` redirection containing Chinese characters, or any shell-string concatenation that crosses an encoding boundary. Always write the file via `create` / `edit` tools or Python `open(..., "w", encoding="utf-8")`. A single corrupted multi-byte sequence breaks a glyph silently.

### Reference Implementation

The `taoteching-deck-template` skill ships an end-to-end annotated skeleton with all per-slide CSS, all animation keyframes, the full JS engine, and five reusable SVG patterns. Snippets in this MANIFEST and in the skill are extracted from a working Chapter 25 reference (道法自然) — operators can use that chapter as a worked example when writing a new chapter, then swap content while keeping the structure intact.

### Constraints

- **Single file, zero dependency** — no `<link>`, no `<script src=...>`, no remote images, no web fonts. Ever.
- **Always five paragraph pages** (P4–P8). Never four, never six. Group or split sentences as needed
- **Always one history + one modern case per paragraph** (古今印证). Both must be specific and named, never generic
- **Three-colour palette only** (gold / red / green); do not add a fourth accent colour
- **Heavy mask + heavy text-shadow** on every CJK page; no exceptions
- **Reuse animation classes** from the template; do not author per-page custom keyframes
- **Output language is Chinese** in the deliverable; marketplace source files and operator working files stay in English
