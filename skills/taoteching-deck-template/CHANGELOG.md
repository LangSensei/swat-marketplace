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
