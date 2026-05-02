# Changelog

## 1.0.0 (2026-05-02)

- Initial release
- Single-file HTML slide-deck template for Chinese classical-text decks
- 10-page narrative skeleton: cover (P1), concept overview (P2), original text (P3), five-paragraph analysis (P4–P8), key line (P9), chapter summary (P10)
- Hand-rolled vanilla-JS engine (~60 lines): horizontal `translateX` slide transitions, keyboard / wheel (800ms throttle) / touch (50px swipe) / dot navigation, busy-flag debounce
- Full animation library: `.an-pulse`, `.an-glow`, `.an-bob`, `.an-ring`, `.an-drift`, `.an-spin`, `.an-fade` (with companion delay variants)
- Five reusable 180×180 SVG concept-diagram patterns (concentric circles, question mark + opposites, four-direction cycle, layered rings, descending arrow chain)
- Three-colour semantic palette: gold `#f5c97a` for `<strong>` highlights, red `#c53d43` for paragraph numbers and history labels, green `#2d5a3d` for modern-case borders
- Three-tier responsive strategy at 1100 / 900 / 500 px breakpoints
- Background strategy: default gradient placeholders with TODO imagery hints; optional base64-inlined images for the polished version
- Iterated on PR review feedback before release
- Fixed JS engine busy-flag race: lock now releases at 600ms (matching CSS transition) instead of 100ms — eliminates skipped-slide / stutter on rapid keyboard or dot-click navigation
- Added `templates/skeleton.html` — pre-assembled, runnable single-file deck; operators copy this rather than stitch sections
- Documented `.an-spin` viewBox=200 origin constraint (override `transform-origin` if a different viewBox is used)
- Normalized passive event listener flags (`{passive:1}` → `{passive:true}`, `{passive:0}` → `{passive:false}`)
- Documented intentional full-document `wheel` capture (deck is a fullscreen kiosk; page scroll is never desired)
- Introduced `{{TOKEN}}` placeholder convention with cheatsheet for grep-verification (`grep '{{' taoteching-{N}.html` must return zero after authoring)
- Scope-restricted skill description to Tao Te Ching (was: any Chinese classical-text deck)
