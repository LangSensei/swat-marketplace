#!/usr/bin/env python3
"""Marriage compatibility (he hun) analysis for two people.

Input: Two solar (Gregorian) birth dates with optional birth hours.
Output: Structured JSON compatibility report with zodiac, day master,
        five-element complementarity, and overall rating.
"""
import argparse
import json
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "lib"))
from lib import (
    solar_to_lunar, get_bazi, get_element, get_nayin, get_zodiac,
    get_hidden_stems, get_ten_deity, output_json, error_exit,
    CN_ELEMENT_EN, CN_ZODIAC_EN, TEN_DEITY_EN,
)


# Five element generation and control cycles
GENERATES = {"Wood": "Fire", "Fire": "Earth", "Earth": "Metal", "Metal": "Water", "Water": "Wood"}
CONTROLS = {"Wood": "Earth", "Earth": "Water", "Water": "Fire", "Fire": "Metal", "Metal": "Wood"}


def get_person_info(year, month, day, hour, label):
    """Get bazi info for one person."""
    lunar = solar_to_lunar(year, month, day, hour)
    ba = get_bazi(lunar)

    from datas import gan5, nayins
    from ganzhi import ten_deities

    gans = [ba.getYearGan(), ba.getMonthGan(), ba.getDayGan(), ba.getTimeGan()]
    zhis = [ba.getYearZhi(), ba.getMonthZhi(), ba.getDayZhi(), ba.getTimeZhi()]

    me = gans[2]
    me_el = CN_ELEMENT_EN.get(gan5.get(me, ""), "")
    year_nayin = nayins.get((gans[0], zhis[0]), "")

    from datas import zhi5
    element_scores = {"Wood": 0, "Fire": 0, "Earth": 0, "Metal": 0, "Water": 0}
    for gan in gans:
        el = CN_ELEMENT_EN.get(gan5.get(gan, ""), "")
        if el:
            element_scores[el] += 8
    for zhi in zhis:
        for hg, strength in zhi5.get(zhi, {}).items():
            el = CN_ELEMENT_EN.get(gan5.get(hg, ""), "")
            if el:
                element_scores[el] += strength

    return {
        "label": label,
        "solar_date": f"{year:04d}-{month:02d}-{day:02d}",
        "hour": hour,
        "lunar_display": str(lunar),
        "gans": gans,
        "zhis": zhis,
        "day_master": me,
        "day_master_element": me_el,
        "year_zhi": zhis[0],
        "day_zhi": zhis[2],
        "year_nayin": year_nayin,
        "zodiac_cn": get_zodiac(zhis[0]),
        "zodiac_en": CN_ZODIAC_EN.get(get_zodiac(zhis[0]), ""),
        "element_scores": element_scores,
    }


def check_zodiac_compatibility(zhi1, zhi2):
    """Check zodiac compatibility between two year branches."""
    from ganzhi import zhi_atts
    results = []
    score = 0

    atts1 = zhi_atts.get(zhi1, {})
    atts2 = zhi_atts.get(zhi2, {})

    # Liu He (Six Harmony)
    if atts1.get("liu", "") == zhi2:
        results.append({"type": "liu_he", "description": "Six Harmony (excellent match)", "score": 3})
        score += 3

    # San He (Three Harmony)
    he1 = atts1.get("he", ())
    he2 = atts2.get("he", ())
    if zhi2 in he1 or zhi1 in he2:
        results.append({"type": "san_he", "description": "Three Harmony (good match)", "score": 2})
        score += 2

    # San Hui (Three Meetings)
    hui1 = atts1.get("hui", ())
    hui2 = atts2.get("hui", ())
    if zhi2 in hui1 or zhi1 in hui2:
        results.append({"type": "san_hui", "description": "Three Meeting (favorable)", "score": 1})
        score += 1

    # Chong (Clash)
    if atts1.get("chong", "") == zhi2:
        results.append({"type": "chong", "description": "Clash (conflicting)", "score": -3})
        score -= 3

    # Hai (Harm)
    if atts1.get("hai", "") == zhi2:
        results.append({"type": "hai", "description": "Harm (detrimental)", "score": -2})
        score -= 2

    # Xing (Punishment)
    if atts1.get("xing", "") == zhi2:
        results.append({"type": "xing", "description": "Punishment (challenging)", "score": -2})
        score -= 2

    # Po (Destruction)
    if atts1.get("po", "") == zhi2:
        results.append({"type": "po", "description": "Destruction (minor conflict)", "score": -1})
        score -= 1

    if not results:
        results.append({"type": "neutral", "description": "No special relationship", "score": 0})

    return {"relationships": results, "score": score}


def check_zodiac_compat_key(zhi1, zhi2):
    """Check using the correct Chinese keys in zhi_atts."""
    from datas import zhi_atts
    results = []
    score = 0

    atts1 = zhi_atts.get(zhi1, {})

    # Six Harmony
    if atts1.get("\u516d", "") == zhi2:
        results.append({"type": "liu_he", "description": "Six Harmony (excellent match)", "score": 3})
        score += 3

    # Three Harmony
    he_partners = atts1.get("\u5408", ())
    if zhi2 in he_partners:
        results.append({"type": "san_he", "description": "Three Harmony (good match)", "score": 2})
        score += 2

    # Three Meeting
    hui_partners = atts1.get("\u4f1a", ())
    if zhi2 in hui_partners:
        results.append({"type": "san_hui", "description": "Three Meeting (favorable)", "score": 1})
        score += 1

    # Clash
    if atts1.get("\u51b2", "") == zhi2:
        results.append({"type": "chong", "description": "Clash (conflicting)", "score": -3})
        score -= 3

    # Harm
    if atts1.get("\u5bb3", "") == zhi2:
        results.append({"type": "hai", "description": "Harm (detrimental)", "score": -2})
        score -= 2

    # Punishment
    if atts1.get("\u5211", "") == zhi2:
        results.append({"type": "xing", "description": "Punishment (challenging)", "score": -2})
        score -= 2

    # Destruction
    if atts1.get("\u7834", "") == zhi2:
        results.append({"type": "po", "description": "Destruction (minor conflict)", "score": -1})
        score -= 1

    if not results:
        results.append({"type": "neutral", "description": "No special relationship", "score": 0})

    return {"relationships": results, "score": score}


def check_day_master_relationship(el1, el2):
    """Check the five-element relationship between two day masters."""
    if el1 == el2:
        return {"type": "same", "description": f"Both {el1} - similar personalities", "harmony": "neutral"}
    if GENERATES.get(el1) == el2:
        return {"type": "generates", "description": f"{el1} generates {el2}", "harmony": "good"}
    if GENERATES.get(el2) == el1:
        return {"type": "generated_by", "description": f"{el2} generates {el1}", "harmony": "good"}
    if CONTROLS.get(el1) == el2:
        return {"type": "controls", "description": f"{el1} controls {el2}", "harmony": "challenging"}
    if CONTROLS.get(el2) == el1:
        return {"type": "controlled_by", "description": f"{el2} controls {el1}", "harmony": "challenging"}
    return {"type": "neutral", "description": "Indirect relationship", "harmony": "neutral"}


def check_day_branch_harmony(zhi1, zhi2):
    """Check spouse palace (day branch) harmony."""
    from datas import zhi_atts
    atts1 = zhi_atts.get(zhi1, {})
    results = []

    if atts1.get("\u516d", "") == zhi2:
        results.append("Six Harmony in spouse palace (very favorable)")
    he_partners = atts1.get("\u5408", ())
    if zhi2 in he_partners:
        results.append("Three Harmony in spouse palace (favorable)")
    if atts1.get("\u51b2", "") == zhi2:
        results.append("Clash in spouse palace (unfavorable)")
    if atts1.get("\u5211", "") == zhi2:
        results.append("Punishment in spouse palace (challenging)")
    if atts1.get("\u5bb3", "") == zhi2:
        results.append("Harm in spouse palace (unfavorable)")

    if not results:
        results.append("No special relationship in spouse palace (neutral)")

    return results


def check_element_complementarity(scores1, scores2):
    """Check if two people's five-element profiles complement each other."""
    complement_score = 0
    details = []

    for element in ["Wood", "Fire", "Earth", "Metal", "Water"]:
        s1 = scores1.get(element, 0)
        s2 = scores2.get(element, 0)

        if s1 < 5 and s2 > 15:
            details.append(f"Person B's strong {element} supplements Person A's weak {element}")
            complement_score += 2
        elif s2 < 5 and s1 > 15:
            details.append(f"Person A's strong {element} supplements Person B's weak {element}")
            complement_score += 2

    return {"score": complement_score, "details": details}


def compute_overall_rating(zodiac_score, dm_harmony, branch_results, complement_score):
    """Compute overall compatibility rating (0-100)."""
    base = 60

    # Zodiac score: -3 to +3 mapped to -15 to +15
    zodiac_contrib = zodiac_score * 5
    base += zodiac_contrib

    # Day master harmony
    if dm_harmony == "good":
        base += 10
    elif dm_harmony == "challenging":
        base -= 10

    # Spouse palace
    for r in branch_results:
        if "Six Harmony" in r:
            base += 10
        elif "Three Harmony" in r:
            base += 5
        elif "Clash" in r:
            base -= 10
        elif "Punishment" in r or "Harm" in r:
            base -= 5

    # Complementarity
    base += complement_score * 2

    # Clamp to 0-100
    return max(0, min(100, base))


def analyze_compatibility(p1_date, p1_hour, p2_date, p2_hour, p1_female=False, p2_female=True):
    """Run full compatibility analysis."""
    p1_parts = p1_date.split("-")
    p2_parts = p2_date.split("-")

    p1 = get_person_info(int(p1_parts[0]), int(p1_parts[1]), int(p1_parts[2]),
                         p1_hour, "Person A (male)" if not p1_female else "Person A (female)")
    p2 = get_person_info(int(p2_parts[0]), int(p2_parts[1]), int(p2_parts[2]),
                         p2_hour, "Person B (female)" if p2_female else "Person B (male)")

    # Zodiac compatibility
    zodiac_compat = check_zodiac_compat_key(p1["year_zhi"], p2["year_zhi"])

    # Day master relationship
    dm_relationship = check_day_master_relationship(
        p1["day_master_element"], p2["day_master_element"])

    # Day branch (spouse palace) harmony
    branch_harmony = check_day_branch_harmony(p1["day_zhi"], p2["day_zhi"])

    # Five-element complementarity
    complement = check_element_complementarity(
        p1["element_scores"], p2["element_scores"])

    # Overall rating
    rating = compute_overall_rating(
        zodiac_compat["score"],
        dm_relationship["harmony"],
        branch_harmony,
        complement["score"],
    )

    # Rating label
    if rating >= 85:
        label = "Excellent"
    elif rating >= 70:
        label = "Good"
    elif rating >= 55:
        label = "Average"
    elif rating >= 40:
        label = "Below Average"
    else:
        label = "Challenging"

    return {
        "person_a": {
            "solar_date": p1["solar_date"],
            "hour": p1["hour"],
            "lunar_display": p1["lunar_display"],
            "zodiac": {"chinese": p1["zodiac_cn"], "english": p1["zodiac_en"]},
            "day_master": p1["day_master"],
            "day_master_element": p1["day_master_element"],
            "day_branch": p1["day_zhi"],
            "year_nayin": p1["year_nayin"],
            "five_elements": p1["element_scores"],
        },
        "person_b": {
            "solar_date": p2["solar_date"],
            "hour": p2["hour"],
            "lunar_display": p2["lunar_display"],
            "zodiac": {"chinese": p2["zodiac_cn"], "english": p2["zodiac_en"]},
            "day_master": p2["day_master"],
            "day_master_element": p2["day_master_element"],
            "day_branch": p2["day_zhi"],
            "year_nayin": p2["year_nayin"],
            "five_elements": p2["element_scores"],
        },
        "zodiac_compatibility": {
            "person_a_zodiac": p1["zodiac_en"],
            "person_b_zodiac": p2["zodiac_en"],
            "relationships": zodiac_compat["relationships"],
            "score": zodiac_compat["score"],
        },
        "day_master_relationship": dm_relationship,
        "spouse_palace_harmony": branch_harmony,
        "five_element_complementarity": complement,
        "overall_rating": {
            "score": rating,
            "label": label,
            "max_score": 100,
        },
    }


def main():
    parser = argparse.ArgumentParser(
        description="Marriage compatibility (he hun) analysis from two solar birth dates. "
                    "Outputs structured JSON with zodiac, day master, and element compatibility.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""Examples:
  python3 compatibility.py --person-a 1990-05-15 --person-b 1992-08-20
  python3 compatibility.py --person-a 1990-05-15 --hour-a 10 --person-b 1992-08-20 --hour-b 14"""
    )
    parser.add_argument("--person-a", required=True,
                        help="Person A solar birth date (YYYY-MM-DD)")
    parser.add_argument("--hour-a", type=int, default=12,
                        help="Person A birth hour (0-23, default: 12)")
    parser.add_argument("--person-b", required=True,
                        help="Person B solar birth date (YYYY-MM-DD)")
    parser.add_argument("--hour-b", type=int, default=12,
                        help="Person B birth hour (0-23, default: 12)")
    parser.add_argument("--a-female", action="store_true", default=False,
                        help="Person A is female (default: male)")
    parser.add_argument("--b-male", action="store_true", default=False,
                        help="Person B is male (default: female)")

    args = parser.parse_args()

    try:
        result = analyze_compatibility(
            args.person_a, args.hour_a,
            args.person_b, args.hour_b,
            p1_female=args.a_female,
            p2_female=not args.b_male,
        )
        output_json(result)
    except Exception as e:
        error_exit(f"Compatibility analysis failed: {e}")


if __name__ == "__main__":
    main()
