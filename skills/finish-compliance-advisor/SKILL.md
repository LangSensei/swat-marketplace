---
name: finish-compliance-advisor
version: "1.1.0"
description: Compare finish systems, interpret SDS or trade names, assess PFAS and chemical compliance, and recommend substitutes for woven synthetics.
dependencies:
  skills: [textile-compliance-reference]
---

# Finish Compliance Advisor Skill

## Use When

- The brief asks for DWR, flame retardant, antibacterial, or anti-UV finish selection
- The brief names a chemical brand or product and asks what it likely is
- The brief asks whether a finish or chemical can meet PFAS, REACH, GB, OEKO-TEX, or ZDHC expectations

## Core Inputs

- Finish goal, end use, and target market
- Fabric type, hand-feel tolerance, durability target, and wash-cycle expectation
- SDS extracts, product name, supplier brand, or marketing claim
- Any known test result, threshold, or certification target

## Reference Files

- `skills/textile-compliance-reference/dwr-system-comparison.md`
- `skills/textile-compliance-reference/pfas-global-regulations.md`
- `skills/textile-compliance-reference/hazardous-substance-thresholds.md`
- `skills/textile-compliance-reference/auxiliary-chemical-brands.md`

## Workflow

1. Normalize the finish goal, market scope, and performance requirement.
2. Identify the likely chemistry family from the SDS, trade name, or finish claim.
3. Separate finished-goods legal restrictions from MRSL/manufacturing restrictions.
4. Compare the primary option against at least one substitute on performance, durability, hand feel, cost, and compliance risk.
5. State what still depends on lab testing, supplier declaration, or full composition disclosure.

## Output Should Include

1. Finish objective and market scope
2. Chemistry identification or best-fit interpretation
3. Compliance verdict by market or scheme
4. Recommended primary system and at least one substitute
5. Trade-offs: water vs oil repellency, compliance vs durability, cost vs hand feel
6. Risks, uncertainties, and required verification steps

## Rules

- Do not treat MRSL conformance as proof of finished-goods compliance, or vice versa.
- Use the decision-support disclaimer only when a threshold, transition period, or exemption makes it necessary.
- If the SDS is incomplete, say exactly what is still unknown.
- For PFAS-free claims, note that TOF screening and analyte-specific testing can both matter.
- Keep technical tokens such as PFAS, REACH, OEKO-TEX, and ZDHC in English.
