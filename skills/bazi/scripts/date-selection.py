#!/usr/bin/env python3
"""Auspicious date selection (ze ri) for Chinese traditional events.

Input: Event type, year, month range, optional bride's zodiac for weddings.
Output: Structured JSON list of auspicious dates with 12-day cycle,
        activities, profit month checks, and San Niang Sha avoidance.
"""
import argparse
import json
import sys
import os
from datetime import date, timedelta

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "lib"))
from lib import (
    solar_to_lunar, get_bazi, get_element, get_nayin, get_zodiac,
    get_zodiac_zhi, output_json, error_exit, CN_ELEMENT_EN, CN_ZODIAC_EN,
    bilingual_element, JIANCHU_BILINGUAL,
)


# Event types and their auspicious jianchu days (0-indexed)
EVENT_JIANCHU_GOOD = {
    "wedding": [1, 2, 4, 5, 8, 9, 10],  # chu, man, ding, zhi, cheng, shou, kai
    "move": [1, 2, 8, 10],  # chu, man, cheng, kai
    "business": [2, 4, 8, 9, 10],  # man, ding, cheng, shou, kai
    "travel": [0, 1, 8, 10],  # jian, chu, cheng, kai
    "construction": [0, 2, 4, 8],  # jian, man, ding, cheng
    "burial": [1, 5, 7, 8],  # chu, zhi, wei, cheng
    "general": [1, 2, 4, 8, 9, 10],  # most favorable days
}

# San Niang Sha days (lunar days to avoid for weddings)
SAN_NIANG_SHA = [3, 7, 13, 18, 22, 27]

# Da Li Yue (Big Profit Months) and Xiao Li Yue (Small Profit Months)
# for bride's zodiac. Key = set of zodiac branches, value = (da_li_months, xiao_li_months)
PROFIT_MONTHS = {
    # Rat & Horse
    frozenset(["zi", "wu"]): {"da_li": [6, 12], "xiao_li": [1, 7]},
    # Ox & Goat
    frozenset(["chou", "wei"]): {"da_li": [5, 11], "xiao_li": [4, 10]},
    # Tiger & Monkey
    frozenset(["yin", "shen"]): {"da_li": [2, 8], "xiao_li": [3, 9]},
    # Rabbit & Rooster
    frozenset(["mao", "you"]): {"da_li": [1, 7], "xiao_li": [6, 12]},
    # Dragon & Dog
    frozenset(["chen", "xu"]): {"da_li": [4, 10], "xiao_li": [5, 11]},
    # Snake & Pig
    frozenset(["si", "hai"]): {"da_li": [3, 9], "xiao_li": [2, 8]},
}

# Map Chinese zodiac branches to pinyin for lookup
ZHI_PINYIN = {
    "\u5b50": "zi", "\u4e11": "chou", "\u5bc5": "yin", "\u536f": "mao",
    "\u8fb0": "chen", "\u5df3": "si", "\u5348": "wu", "\u672a": "wei",
    "\u7533": "shen", "\u9149": "you", "\u620c": "xu", "\u4ea5": "hai",
}

# Zodiac animal to branch pinyin
ZODIAC_PINYIN = {
    "rat": "zi", "ox": "chou", "tiger": "yin", "rabbit": "mao",
    "dragon": "chen", "snake": "si", "horse": "wu", "goat": "wei",
    "monkey": "shen", "rooster": "you", "dog": "xu", "pig": "hai",
}

# Weekday names
WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def get_jianchu_index(lunar_month_zhi, day_zhi):
    """Calculate the 12-day cycle index for a given day.

    The jianchu cycle starts with 'jian' (Establish) on the day whose
    Earthly Branch matches the month's Earthly Branch.
    """
    from ganzhi import Zhi
    month_idx = Zhi.index(lunar_month_zhi)
    day_idx = Zhi.index(day_zhi)
    return (day_idx - month_idx) % 12


def get_profit_month_status(bride_zhi_pinyin, lunar_month):
    """Check if a lunar month is a profit month for the bride's zodiac."""
    for key, months in PROFIT_MONTHS.items():
        if bride_zhi_pinyin in key:
            if lunar_month in months["da_li"]:
                return "da_li_yue"
            if lunar_month in months["xiao_li"]:
                return "xiao_li_yue"
            return "neutral"
    return "unknown"


def analyze_date(solar_year, solar_month, solar_day, event_type, bride_zhi_pinyin=None):
    """Analyze a single date for auspiciousness."""
    try:
        lunar = solar_to_lunar(solar_year, solar_month, solar_day, 12)
    except Exception:
        return None

    ba = get_bazi(lunar)
    day_gan = ba.getDayGan()
    day_zhi = ba.getDayZhi()
    month_zhi = ba.getMonthZhi()
    day_ganzhi = day_gan + day_zhi

    from datas import jianchus, nayins, gan5

    # 12-day cycle
    jianchu_idx = get_jianchu_index(month_zhi, day_zhi)
    jianchu_data = jianchus.get(jianchu_idx, ("", ""))
    jianchu_cn = jianchu_data[0]
    jianchu_desc = jianchu_data[1] if len(jianchu_data) > 1 else ""
    jianchu_bi = JIANCHU_BILINGUAL.get(jianchu_idx, {"cn": "", "en": "", "pinyin": ""})

    # Check if auspicious for event type
    good_days = EVENT_JIANCHU_GOOD.get(event_type, EVENT_JIANCHU_GOOD["general"])
    is_auspicious_jianchu = jianchu_idx in good_days

    # Nayin
    nayin = nayins.get((day_gan, day_zhi), "")

    # Check San Niang Sha (for weddings)
    lunar_day = lunar.getDay()
    is_san_niang_sha = lunar_day in SAN_NIANG_SHA

    # Profit month status (for weddings with bride zodiac)
    profit_status = None
    if bride_zhi_pinyin and event_type == "wedding":
        lunar_month_abs = abs(lunar.getMonth())
        profit_status = get_profit_month_status(bride_zhi_pinyin, lunar_month_abs)

    # Day element
    day_element_cn = gan5.get(day_gan, "")
    day_element_en = CN_ELEMENT_EN.get(day_element_cn, day_element_cn)
    day_element_bi = bilingual_element(day_element_en) if day_element_en else {"cn": "", "en": ""}

    # Check for Tou Xiu days (head/tail match patterns)
    from datas import datouxiu, xiaotouxiu
    is_da_tou_xiu = day_ganzhi in datouxiu
    is_xiao_tou_xiu = day_ganzhi in xiaotouxiu

    # Day of week
    d = date(solar_year, solar_month, solar_day)
    weekday = WEEKDAYS[d.weekday()]
    is_weekend = d.weekday() >= 5

    # Compute auspiciousness score
    score = 0
    reasons = []

    if is_auspicious_jianchu:
        score += 3
        reasons.append(f"Favorable 12-day cycle: {jianchu_bi['en']} ({jianchu_bi['cn']})")
    else:
        score -= 2
        reasons.append(f"Unfavorable 12-day cycle: {jianchu_bi['en']} ({jianchu_bi['cn']})")

    if jianchu_idx == 6:  # po (Break) - always bad
        score -= 3
        reasons.append("Break day - inauspicious for most activities")

    if event_type == "wedding":
        if is_san_niang_sha:
            score -= 3
            reasons.append("San Niang Sha day - traditionally avoided for weddings")

        if profit_status == "da_li_yue":
            score += 3
            reasons.append("Big Profit Month for bride's zodiac")
        elif profit_status == "xiao_li_yue":
            score += 1
            reasons.append("Small Profit Month for bride's zodiac")
        elif profit_status == "neutral":
            reasons.append("Not a profit month for bride's zodiac")

    if is_da_tou_xiu:
        score -= 1
        reasons.append("Da Tou Xiu day - minor caution")

    if is_weekend:
        score += 1
        reasons.append("Weekend - convenient for events")

    # Overall auspiciousness
    if event_type == "wedding" and is_san_niang_sha:
        auspicious = False
    elif jianchu_idx == 6:
        auspicious = False
    else:
        auspicious = is_auspicious_jianchu

    return {
        "solar_date": f"{solar_year:04d}-{solar_month:02d}-{solar_day:02d}",
        "weekday": weekday,
        "is_weekend": is_weekend,
        "lunar_date": {
            "year": lunar.getYear(),
            "month": lunar.getMonth(),
            "day": lunar.getDay(),
            "display": str(lunar),
        },
        "day_ganzhi": day_ganzhi,
        "day_element": day_element_bi,
        "nayin": nayin,
        "jianchu": {
            "index": jianchu_idx,
            "cn": jianchu_bi["cn"],
            "en": jianchu_bi["en"],
            "pinyin": jianchu_bi["pinyin"],
            "description": jianchu_desc[:150] if jianchu_desc else "",
        },
        "auspicious": auspicious,
        "score": score,
        "reasons": reasons,
        "san_niang_sha": is_san_niang_sha if event_type == "wedding" else None,
        "profit_month": profit_status,
    }


def select_dates(event_type, year, month_start, month_end, bride_zodiac=None):
    """Select auspicious dates in a range."""
    bride_zhi_pinyin = None
    if bride_zodiac:
        bride_zhi_pinyin = ZODIAC_PINYIN.get(bride_zodiac.lower())
        if not bride_zhi_pinyin:
            # Try Chinese zodiac name
            zhi = get_zodiac_zhi(bride_zodiac)
            if zhi:
                bride_zhi_pinyin = ZHI_PINYIN.get(zhi)

    results = []
    d = date(year, month_start, 1)
    end = date(year, month_end, 1)
    # Go to end of month_end
    if month_end == 12:
        end = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        end = date(year, month_end + 1, 1) - timedelta(days=1)

    while d <= end:
        info = analyze_date(d.year, d.month, d.day, event_type, bride_zhi_pinyin)
        if info and info["auspicious"]:
            results.append(info)
        d += timedelta(days=1)

    # Sort by score descending
    results.sort(key=lambda x: x["score"], reverse=True)

    return {
        "event_type": event_type,
        "search_range": {
            "year": year,
            "month_start": month_start,
            "month_end": month_end,
        },
        "bride_zodiac": bride_zodiac,
        "total_auspicious_dates": len(results),
        "dates": results,
    }


def main():
    parser = argparse.ArgumentParser(
        description="Auspicious date selection (ze ri) for Chinese traditional events. "
                    "Outputs structured JSON with scored dates.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""Event types: wedding, move, business, travel, construction, burial, general

Examples:
  python3 date-selection.py --event wedding --year 2026 --month-start 9 --month-end 10
  python3 date-selection.py --event wedding --year 2026 --month-start 6 --month-end 12 --bride-zodiac ox
  python3 date-selection.py --event move --year 2026 --month-start 3 --month-end 3"""
    )
    parser.add_argument("--event", required=True,
                        choices=["wedding", "move", "business", "travel",
                                 "construction", "burial", "general"],
                        help="Event type for date selection")
    parser.add_argument("--year", required=True, type=int,
                        help="Year to search (e.g., 2026)")
    parser.add_argument("--month-start", required=True, type=int,
                        help="Start month (1-12)")
    parser.add_argument("--month-end", required=True, type=int,
                        help="End month (1-12)")
    parser.add_argument("--bride-zodiac", type=str, default=None,
                        help="Bride's zodiac animal for profit month check "
                             "(e.g., ox, tiger, rabbit). Only used for wedding events.")

    args = parser.parse_args()

    if not (1 <= args.month_start <= 12) or not (1 <= args.month_end <= 12):
        error_exit("Months must be 1-12")
    if args.month_start > args.month_end:
        error_exit("month-start must be <= month-end")

    try:
        result = select_dates(args.event, args.year,
                              args.month_start, args.month_end,
                              args.bride_zodiac)
        output_json(result)
    except Exception as e:
        error_exit(f"Date selection failed: {e}")


if __name__ == "__main__":
    main()
