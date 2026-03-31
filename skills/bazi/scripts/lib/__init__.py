#!/usr/bin/env python3
"""Shared utilities for bazi skill scripts.

Handles sys.path setup so scripts can import from the bazi reference repo,
plus common helper functions for structured JSON output.
"""
import os
import sys
import json

# Add the bazi reference repo to Python path
SKILL_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BAZI_REPO = os.path.expanduser("~/.swat/repos/china-testing-bazi/worktrees/readonly")
if not os.path.isdir(BAZI_REPO):
    # Fallback to local references dir for development
    BAZI_REPO = os.path.join(SKILL_DIR, "references", "bazi-repo")
if os.path.isdir(BAZI_REPO):
    sys.path.insert(0, BAZI_REPO)


def solar_to_lunar(year, month, day, hour=0):
    """Convert solar (Gregorian) date to lunar date and return EightChar object."""
    from lunar_python import Solar
    solar = Solar.fromYmdHms(year, month, day, hour, 0, 0)
    lunar = solar.getLunar()
    return lunar


def get_bazi(lunar):
    """Get BaZi (EightChar) from a Lunar date object."""
    return lunar.getEightChar()


def get_element(gan):
    """Get the five-element of a Heavenly Stem."""
    from datas import gan5
    return gan5.get(gan, "")


def get_nayin(gan, zhi):
    """Get the nayin (sound-element) for a Gan-Zhi pair."""
    from datas import nayins
    return nayins.get((gan, zhi), "")


def get_zodiac(zhi):
    """Get the Chinese zodiac animal for an Earthly Branch."""
    from datas import shengxiaos
    return shengxiaos.get(zhi, "")


def get_zodiac_zhi(animal):
    """Get the Earthly Branch for a zodiac animal name."""
    from datas import shengxiaos
    return shengxiaos.inverse.get(animal, "")


def get_hidden_stems(zhi):
    """Get the hidden stems and their strength values for an Earthly Branch."""
    from datas import zhi5
    return dict(zhi5.get(zhi, {}))


def get_ten_deity(day_master, target):
    """Get the ten-deity relationship between day master and target stem."""
    from ganzhi import ten_deities
    deities = ten_deities.get(day_master, {})
    return deities.get(target, "")


def output_json(data):
    """Print structured JSON to stdout."""
    print(json.dumps(data, ensure_ascii=False, indent=2))


def error_exit(message, code=1):
    """Print error to stderr and exit."""
    sys.stderr.write(f"Error: {message}\n")
    sys.exit(code)


# Heavenly Stems and Earthly Branches reference lists
HEAVENLY_STEMS = ["jia", "yi", "bing", "ding", "wu", "ji", "geng", "xin", "ren", "gui"]
EARTHLY_BRANCHES = ["zi", "chou", "yin", "mao", "chen", "si", "wu_branch", "wei", "shen", "you", "xu", "hai"]

# Five elements mapping for English output
ELEMENT_MAP = {
    "wood": "mu", "fire": "huo", "earth": "tu", "metal": "jin", "water": "shui",
    "mu": "Wood", "huo": "Fire", "tu": "Earth", "jin": "Metal", "shui": "Water",
}

CN_ELEMENT_EN = {
    "\u6728": "Wood", "\u706b": "Fire", "\u571f": "Earth",
    "\u91d1": "Metal", "\u6c34": "Water",
}

CN_ZODIAC_EN = {
    "\u9f20": "Rat", "\u725b": "Ox", "\u864e": "Tiger", "\u5154": "Rabbit",
    "\u9f99": "Dragon", "\u86c7": "Snake", "\u9a6c": "Horse", "\u7f8a": "Goat",
    "\u7334": "Monkey", "\u9e21": "Rooster", "\u72d7": "Dog", "\u732a": "Pig",
}

# Ten Deities English names
TEN_DEITY_EN = {
    "\u6bd4": "Companion", "\u52ab": "Rob Wealth",
    "\u98df": "Eating God", "\u4f24": "Hurting Officer",
    "\u624d": "Indirect Wealth", "\u8d22": "Direct Wealth",
    "\u6740": "Seven Killings", "\u5b98": "Direct Officer",
    "\u67ad": "Indirect Seal", "\u5370": "Direct Seal",
}

# Twelve stages of life
TWELVE_STAGES_EN = {
    "\u6c90": "Bathing", "\u51a0": "Capping", "\u5efa": "Prosperity",
    "\u5e1d": "Imperial", "\u8870": "Decline", "\u75c5": "Illness",
    "\u6b7b": "Death", "\u5893": "Tomb", "\u7edd": "Extinction",
    "\u80ce": "Embryo", "\u517b": "Nurture", "\u957f": "Growth",
}

# Reverse mappings: English → Chinese
EN_ELEMENT_CN = {v: k for k, v in CN_ELEMENT_EN.items()}
EN_ZODIAC_CN = {v: k for k, v in CN_ZODIAC_EN.items()}
EN_DEITY_CN = {v: k for k, v in TEN_DEITY_EN.items()}
EN_STAGES_CN = {v: k for k, v in TWELVE_STAGES_EN.items()}

# Jianchu (12-day cycle) bilingual names
JIANCHU_BILINGUAL = {
    0: {"cn": "\u5efa", "en": "Establish", "pinyin": "jian"},
    1: {"cn": "\u9664", "en": "Remove", "pinyin": "chu"},
    2: {"cn": "\u6ee1", "en": "Full", "pinyin": "man"},
    3: {"cn": "\u5e73", "en": "Balance", "pinyin": "ping"},
    4: {"cn": "\u5b9a", "en": "Stable", "pinyin": "ding"},
    5: {"cn": "\u6267", "en": "Hold", "pinyin": "zhi"},
    6: {"cn": "\u7834", "en": "Break", "pinyin": "po"},
    7: {"cn": "\u5371", "en": "Danger", "pinyin": "wei"},
    8: {"cn": "\u6210", "en": "Success", "pinyin": "cheng"},
    9: {"cn": "\u6536", "en": "Receive", "pinyin": "shou"},
    10: {"cn": "\u5f00", "en": "Open", "pinyin": "kai"},
    11: {"cn": "\u95ed", "en": "Close", "pinyin": "bi"},
}


def bilingual(cn, en_map):
    """Create a bilingual {cn, en} dict from a Chinese string and mapping."""
    en = en_map.get(cn, cn)
    return {"cn": cn, "en": en}


def bilingual_element(cn_or_en):
    """Create bilingual element from either Chinese or English input."""
    if cn_or_en in CN_ELEMENT_EN:
        return {"cn": cn_or_en, "en": CN_ELEMENT_EN[cn_or_en]}
    if cn_or_en in EN_ELEMENT_CN:
        return {"cn": EN_ELEMENT_CN[cn_or_en], "en": cn_or_en}
    return {"cn": cn_or_en, "en": cn_or_en}


def bilingual_zodiac(cn_or_en):
    """Create bilingual zodiac from either Chinese or English input."""
    if cn_or_en in CN_ZODIAC_EN:
        return {"cn": cn_or_en, "en": CN_ZODIAC_EN[cn_or_en]}
    if cn_or_en in EN_ZODIAC_CN:
        return {"cn": EN_ZODIAC_CN[cn_or_en], "en": cn_or_en}
    return {"cn": cn_or_en, "en": cn_or_en}


def bilingual_deity(cn):
    """Create bilingual ten deity from Chinese input."""
    return {"cn": cn, "en": TEN_DEITY_EN.get(cn, cn)}


def bilingual_stage(cn):
    """Create bilingual twelve stage from Chinese input."""
    return {"cn": cn, "en": TWELVE_STAGES_EN.get(cn, cn)}
