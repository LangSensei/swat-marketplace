# Changelog

## 1.0.0 (2026-05-02)

- Initial release
- Tao Te Ching (Daodejing) chapter HTML slide-deck generator — single-file, ink-style, 10-page narrative
- Fixed lecture rhythm: cover (P1) / concept overview (P2) / original text (P3) / five-paragraph analysis (P4–P8) / key line (P9) / chapter summary (P10)
- Each analysis page carries a 180×180 SVG concept diagram plus paired ancient-modern case studies (one historical case, one modern case)
- Default background strategy: gradient placeholders with TODO comments naming the recommended imagery; optional base64 inline mode for the embedded-image variant
- Three-colour palette: gold `#f5c97a` for highlights, red `#c53d43` for paragraph numbers and history labels, green `#2d5a3d` for the modern-case border
- Reuses HTML / CSS / JS skeleton from the `taoteching-deck-template` skill
- Output stays inside the operation directory: `taoteching-{N}.html` plus `report.html`
- Added `sop` methodology skill to MANIFEST `dependencies.skills` to satisfy marketplace lint Phase 2 (squad must declare a methodology skill — `sop` matches the precedent set by other content/HTML squads)
- Iterated on PR review feedback before release
- Added explicit guidance to start from `templates/skeleton.html` (workflow step 5.5) — operators copy the pre-assembled skeleton rather than stitching SKILL.md sections together
- Reaffirmed scope: Tao Te Ching only — fork the squad to extend coverage of other classical texts (Zhuangzi, Analects, etc.)
