---
name: dye-process-advisor
version: "1.0.0"
description: Design or interpret dye process curves for woven synthetics, diagnose defects, and recommend colorfastness improvements with explicit trade-offs.
---

# Dye Process Advisor Skill

## Use When

- The brief asks for a dye process curve, recipe logic, or a temperature/time/pH interpretation
- The brief describes levelness, listing, crocking, oligomer, wash-off, or batch-difference problems
- The brief asks how to improve washing, rubbing, perspiration, or sublimation-related fastness

## Core Inputs

- Fiber family or best-guess polymer
- Shade depth, end use, and required fastness
- Current process notes: pH, heat-up rate, peak temperature, hold time, dosing points, and aftertreatment
- Defect description, timing, and any before/after comparison between good and bad lots

## Reference Files

- `intel/fiber-dye-matching-and-process-windows.md`
- `intel/cost-and-energy-structure-reference.md`

## Workflow

1. Classify the substrate, dye class, shade depth, and thermal sensitivity.
2. Build the curve as a sequence: pretreatment, heat-up, pH control, dosing, peak hold, cool-down, and aftertreatment.
3. Rank defect root causes from most to least likely instead of presenting an unstructured list.
4. Link each corrective action to its likely impact on levelness, fastness, cycle time, utilities, and cost.
5. Offer at least one lower-risk or lower-cost alternative pathway.

## Output Should Include

1. Problem restatement and substrate context
2. Recommended or interpreted curve in text form: temperature, time, pH, and dosing points
3. Root-cause ranking for any defect scenario
4. Corrective actions and fastness-improvement options
5. Cost and energy implications
6. Risks, uncertainties, and process watchpoints

## Rules

- Give indicative process windows, not false single-number setpoints.
- For PET deep shades, discuss reduction clearing when wash-off or sublimation risk is relevant.
- For PA and stretch-containing fabrics, call out acid control, overheat risk, and elastane protection.
- Separate primary causes from secondary amplifiers such as water hardness, oligomer, or poor circulation.
- Every recommendation must state at least one trade-off.
