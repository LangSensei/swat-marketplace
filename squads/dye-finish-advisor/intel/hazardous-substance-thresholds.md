# Hazardous Substance Thresholds

## Use Notes

- Units below are given in mg/kg unless otherwise stated.
- Separate **finished article thresholds** from **MRSL or formulation thresholds**.
- Where the exact legal value depends on article type, component type, or product class, this file gives the practical screening anchor and flags the limitation.

## Finished Article Checkpoints

| Substance group | Regime | Typical scope | Threshold | Notes |
|---|---|---|---:|---|
| Formaldehyde | GB 18401 Category A | Infant textile products | 20 | Finished goods; GB/T 2912.1 is the common reference test |
| Formaldehyde | GB 18401 Category B | Direct skin-contact textiles | 75 | Finished goods |
| Formaldehyde | GB 18401 Category C | Non-direct skin-contact textiles | 300 | Finished goods |
| Formaldehyde | OEKO-TEX STANDARD 100, baby class | Baby articles | 16 | Often checked by ISO 14184-1 |
| Formaldehyde | OEKO-TEX STANDARD 100, higher classes | Direct-contact or decoration classes | 75 or 300 depending on class | Confirm the class before using the limit |
| Aromatic amines from azo dyes | GB 18401 | Finished textile products | 20 | Screening anchor for banned azo dyes; GB/T 17592 common |
| Aromatic amines from azo dyes | OEKO-TEX STANDARD 100 | Certified finished goods | 20 | EN ISO 14362 family often used |
| Aromatic amines from azo dyes | REACH Annex XVII Entry 43 | Consumer textiles and leather in contact with skin or mouth | 30 | EU market placement rule |
| NP or NPEO | REACH Annex XVII Entry 46 | Washable textile articles | 1000 | 0.1 percent by weight; strong finished-goods legal anchor |
| NP, NPEO, OPEO | OEKO-TEX STANDARD 100 | Certified finished goods | 20 each | Practical buyer-facing screen for washable textiles |
| PFAS | California AB 1817 | Textile articles | 100 ppm TOF plus no intentionally added PFAS | See `pfas-global-regulations.md` for the full market map |

## Manufacturing or Formulation Checkpoints

| Substance group | Regime | Typical scope | Threshold | Notes |
|---|---|---|---:|---|
| Formaldehyde | ZDHC MRSL | Chemical formulation | 500 | Manufacturing input limit, not finished fabric |
| NPEO or OPEO | ZDHC MRSL | Chemical formulation | 100 each | Input chemistry control |
| Listed azo amines | ZDHC MRSL | Chemical formulation | Not detected or method-level screening | Use the listed amine table, not a generic colorant claim |
| PFAS | ZDHC MRSL | Chemical formulation | Intentionally added PFAS not allowed | Reporting limit depends on analyte and test plan |

## Heavy Metals: Read This Carefully

GB 18401 is **not** the main legal anchor for broad heavy-metal control in synthetic textile fabrics. In practice, heavy-metal risk in textile programs is usually driven by:

- OEKO-TEX or buyer RSL requirements on extractable metals
- CPSIA or similar child-product rules for accessible substrates
- REACH or similar rules on specific article components
- Metal trims or coatings that trigger nickel release or chromium VI concerns

## Practical Heavy-Metal Screening Anchors

| Substance | Where it usually matters | Practical checkpoint | Important caveat |
|---|---|---:|---|
| Lead | Pigments, prints, coatings, accessible trims | 90-100 as a conservative buyer screen for child-sensitive programs | Confirm the exact regime because legal triggers differ by article and market |
| Cadmium | Pigments, PVC prints, coatings, metal components | 40-100 as a cautious buyer screen | EU legal restrictions are component-specific rather than one universal textile-fabric limit |
| Mercury | Biocidal systems, legacy pigments, contamination | Not detected or very low single-digit screening | Usually a contamination question, not a routine textile-performance choice |
| Chromium VI | Leather trims, coated metal hardware | Not detected | Usually not a pure synthetic-fabric problem unless trims or hardware are involved |
| Nickel release | Metal trims in prolonged skin contact | Release test, not a fabric mg/kg result | Use a release method, not a total-content shortcut |

## Helpful Test and Reference Methods

| Topic | Typical method family |
|---|---|
| Formaldehyde | GB/T 2912.1, ISO 14184-1 |
| Azo amines | GB/T 17592, EN ISO 14362-1, EN ISO 14362-3 |
| APEO | ISO 18254-1 or equivalent laboratory method |
| Extractable metals | EN 16711 family, laboratory-specific extractable-metal methods |
| PFAS screening | TOF or total fluorine screen plus analyte-specific PFAS methods where required |

## Practical Guidance

1. Use **GB 18401** for baseline China finished-goods safety framing.
2. Use **OEKO-TEX** when the customer wants a stricter consumer-facing certification benchmark.
3. Use **REACH** when the question is EU market placement.
4. Use **ZDHC MRSL** when the question is whether the chemistry package itself is acceptable at the mill input stage.
5. Do not answer a heavy-metal question with a single universal textile number unless the component, market, and rule are clearly identified.
