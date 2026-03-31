#!/usr/bin/env python3
"""BaZi (Four Pillars of Destiny) analysis for a single person.

Input: Solar (Gregorian) birth date and optional birth hour.
Output: Structured JSON with four pillars, day master, five elements,
        nayin, ten deities, hidden stems, and major luck periods.
"""
import argparse
import json
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "lib"))
from lib import (
    solar_to_lunar, get_bazi, get_element, get_nayin, get_zodiac,
    get_hidden_stems, get_ten_deity, output_json, error_exit,
    CN_ELEMENT_EN, CN_ZODIAC_EN, TEN_DEITY_EN, TWELVE_STAGES_EN,
)


def compute_element_scores(gans, zhis):
    """Compute five-element strength scores from all pillars."""
    from datas import zhi5, gan5
    scores = {"Wood": 0, "Fire": 0, "Earth": 0, "Metal": 0, "Water": 0}

    for gan in gans:
        element = CN_ELEMENT_EN.get(gan5.get(gan, ""), "")
        if element:
            scores[element] += 8

    for zhi in zhis:
        for hidden_gan, strength in zhi5.get(zhi, {}).items():
            element = CN_ELEMENT_EN.get(gan5.get(hidden_gan, ""), "")
            if element:
                scores[element] += strength

    return scores


def get_twelve_stage(day_master, zhi):
    """Get the twelve-stage-of-life for day master at given branch."""
    from ganzhi import ten_deities
    stage_cn = ten_deities.get(day_master, {}).get(zhi, "")
    stage_en = TWELVE_STAGES_EN.get(stage_cn, stage_cn)
    return {"chinese": stage_cn, "english": stage_en}


def compute_dayun(lunar, is_male):
    """Compute major luck periods (da yun)."""
    ba = lunar.getEightChar()
    from datas import gan5, nayins
    from ganzhi import Gan, Zhi, ten_deities

    year_gan = ba.getYearGan()
    is_yang_year = Gan.index(year_gan) % 2 == 0
    forward = (is_yang_year and is_male) or (not is_yang_year and not is_male)

    month_gan_idx = Gan.index(ba.getMonthGan())
    month_zhi_idx = Zhi.index(ba.getMonthZhi())

    dayun_list = []
    me = ba.getDayGan()

    for i in range(1, 11):
        if forward:
            g_idx = (month_gan_idx + i) % 10
            z_idx = (month_zhi_idx + i) % 12
        else:
            g_idx = (month_gan_idx - i) % 10
            z_idx = (month_zhi_idx - i) % 12

        gan = Gan[g_idx]
        zhi = Zhi[z_idx]
        ganzhi = gan + zhi
        nayin = nayins.get((gan, zhi), "")
        element = CN_ELEMENT_EN.get(gan5.get(gan, ""), "")

        deity_cn = ten_deities.get(me, {}).get(gan, "")
        deity_en = TEN_DEITY_EN.get(deity_cn, deity_cn)

        stage = get_twelve_stage(me, zhi)

        dayun_list.append({
            "ganzhi": ganzhi,
            "stem": gan,
            "branch": zhi,
            "element": element,
            "nayin": nayin,
            "ten_deity": {"chinese": deity_cn, "english": deity_en},
            "twelve_stage": stage,
        })

    return dayun_list


def analyze(year, month, day, hour, is_male):
    """Run full bazi analysis and return structured dict."""
    lunar = solar_to_lunar(year, month, day, hour)
    ba = get_bazi(lunar)

    from datas import gan5, nayins, days60
    from ganzhi import Gan, Zhi, ten_deities

    gans = [ba.getYearGan(), ba.getMonthGan(), ba.getDayGan(), ba.getTimeGan()]
    zhis = [ba.getYearZhi(), ba.getMonthZhi(), ba.getDayZhi(), ba.getTimeZhi()]

    me = gans[2]  # day master
    me_element_cn = gan5.get(me, "")
    me_element_en = CN_ELEMENT_EN.get(me_element_cn, me_element_cn)

    pillars = []
    pillar_names = ["year", "month", "day", "hour"]
    for i, name in enumerate(pillar_names):
        gan = gans[i]
        zhi = zhis[i]
        ganzhi = gan + zhi

        gan_el = CN_ELEMENT_EN.get(gan5.get(gan, ""), "")
        nayin = nayins.get((gan, zhi), "")

        if i == 2:
            deity_cn = "--"
            deity_en = "Self"
        else:
            deity_cn = ten_deities.get(me, {}).get(gan, "")
            deity_en = TEN_DEITY_EN.get(deity_cn, deity_cn)

        hidden = {}
        from datas import zhi5
        for hg, strength in zhi5.get(zhi, {}).items():
            hg_el = CN_ELEMENT_EN.get(gan5.get(hg, ""), "")
            hg_deity_cn = ten_deities.get(me, {}).get(hg, "")
            hg_deity_en = TEN_DEITY_EN.get(hg_deity_cn, hg_deity_cn)
            hidden[hg] = {
                "element": hg_el,
                "strength": strength,
                "ten_deity": {"chinese": hg_deity_cn, "english": hg_deity_en},
            }

        stage = get_twelve_stage(me, zhi)

        pillars.append({
            "name": name,
            "ganzhi": ganzhi,
            "stem": {"chinese": gan, "element": gan_el},
            "branch": {
                "chinese": zhi,
                "zodiac": CN_ZODIAC_EN.get(get_zodiac(zhi), get_zodiac(zhi)),
                "hidden_stems": hidden,
            },
            "nayin": nayin,
            "ten_deity": {"chinese": deity_cn, "english": deity_en},
            "twelve_stage": stage,
        })

    element_scores = compute_element_scores(gans, zhis)

    # Day pillar interpretation
    day_ganzhi = gans[2] + zhis[2]
    day_interp = days60.get(day_ganzhi, "")

    # Day master strength assessment
    me_el = gan5.get(me, "")
    same_count = 0
    support_count = 0
    for g in gans:
        if gan5.get(g, "") == me_el:
            same_count += 1
    for z in zhis:
        from datas import zhi5
        for hg in zhi5.get(z, {}):
            if gan5.get(hg, "") == me_el:
                support_count += 1
            el = gan5.get(hg, "")
            from ganzhi import ten_deities as td
            # Check if this element generates day master element
            if td.get(me, {}).get("\u751f\u6211", "") == el:
                support_count += 1

    total = sum(element_scores.values())
    me_score = element_scores.get(me_element_en, 0)
    strength = "strong" if me_score > total / 3 else ("weak" if me_score < total / 5 else "moderate")

    # Major luck periods
    dayun = compute_dayun(lunar, is_male)

    solar = lunar.getSolar()

    result = {
        "input": {
            "solar_date": f"{year:04d}-{month:02d}-{day:02d}",
            "hour": hour,
            "gender": "male" if is_male else "female",
        },
        "lunar_date": {
            "year": lunar.getYear(),
            "month": lunar.getMonth(),
            "day": lunar.getDay(),
            "display": str(lunar),
        },
        "zodiac": {
            "chinese": get_zodiac(zhis[0]),
            "english": CN_ZODIAC_EN.get(get_zodiac(zhis[0]), ""),
        },
        "day_master": {
            "stem": me,
            "element": {"chinese": me_el, "english": me_element_en},
            "strength": strength,
        },
        "four_pillars": pillars,
        "five_elements": element_scores,
        "major_luck_periods": dayun,
        "day_pillar_interpretation": day_interp[:200] if day_interp else "",
    }

    return result


def main():
    parser = argparse.ArgumentParser(
        description="BaZi (Four Pillars) analysis from solar birth date. "
                    "Outputs structured JSON with pillars, elements, and luck periods.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""Examples:
  python3 bazi-analysis.py --date 1990-05-15
  python3 bazi-analysis.py --date 1990-05-15 --hour 10
  python3 bazi-analysis.py --date 1990-05-15 --hour 14 --female"""
    )
    parser.add_argument("--date", required=True,
                        help="Solar (Gregorian) birth date in YYYY-MM-DD format")
    parser.add_argument("--hour", type=int, default=12,
                        help="Birth hour (0-23, default: 12 for unknown)")
    parser.add_argument("--female", action="store_true", default=False,
                        help="Set gender to female (default: male)")

    args = parser.parse_args()

    try:
        parts = args.date.split("-")
        year, month, day = int(parts[0]), int(parts[1]), int(parts[2])
    except (ValueError, IndexError):
        error_exit("Invalid date format. Use YYYY-MM-DD (e.g., 1990-05-15)")

    if not (0 <= args.hour <= 23):
        error_exit("Hour must be 0-23")

    try:
        result = analyze(year, month, day, args.hour, not args.female)
        output_json(result)
    except Exception as e:
        error_exit(f"Analysis failed: {e}")


if __name__ == "__main__":
    main()
