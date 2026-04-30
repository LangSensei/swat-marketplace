---
name: fabric-fiber-analyst
version: "1.1.0"
description: Identify woven synthetic fibers and explain their dyeing and finishing implications from lab clues, fabric specs, and supplier claims.
dependencies:
  skills: [textile-fiber-reference]
---

# Fabric Fiber Analyst Skill

## Use When

- The brief asks what fiber a woven synthetic fabric most likely is
- The brief compares PA6 vs PA66, PET vs PBT, CDP vs conventional PET, or stretch-fiber families
- The brief includes burn, FTIR, DSC, density, solubility, or supplier data that needs interpretation

## Core Inputs

- Fiber claim or trade name
- Fabric construction: yarn type, denier/count, weave, and gsm
- Burn behavior, DSC peaks, density, FTIR peaks, solubility notes, microscopy, or hand-feel observations
- Dyeing or finishing problems that may point back to polymer choice

## Reference Files

- `skills/textile-fiber-reference/fiber-identification-quick-reference.md`
- `skills/textile-fiber-reference/fiber-dye-matching-and-process-windows.md`

## Workflow

1. Normalize the evidence into a comparison matrix: burn, melt, DSC, density, FTIR, solubility, and claimed composition.
2. Eliminate impossible candidates first, then rank the remaining fibers by fit and confidence.
3. Separate the base fiber from elastic or bicomponent components when the construction is blended or stretch-containing.
4. Translate the identification result into dye-class compatibility, thermal limits, hydrolysis risk, finish compatibility, and likely quality risks.
5. State what would change the conclusion if a missing test were added.

## Output Should Include

1. Input restatement and problem scope
2. Most likely fiber or blend, with confidence label
3. Evidence matrix: clue -> what it supports -> what it weakens
4. Dyeing behavior implications
5. Finishing compatibility implications
6. Risks, uncertainties, and the next best confirming test
7. Recommendation with at least one alternative interpretation or fallback action

## Rules

- Do not make a definitive claim from a single weak clue such as burn smell alone.
- For PA6 vs PA66, weigh DSC, density, and room-temperature solubility more heavily than burn behavior.
- For PET-family differentiation, use thermal behavior and dye affinity; FTIR alone is rarely enough to split PET, PBT, and CDP confidently.
- For spandex or elastic bicomponent fabrics, call out the thermal ceiling and chlorine/alkali sensitivity explicitly.
- Keep explanations principle-level and buyer-relevant.
