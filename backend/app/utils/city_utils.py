"""
City normalization utilities for consistent city name handling and
smart matching of full Mapbox destination strings against local DB rows.
"""

from typing import List
import re


_IGNORED_TOKENS = {
    "philippines",
    "ph",
    "pilipinas",
    "republic of the philippines",
}

_HUB_ALIASES = {
    "metro manila": ["manila", "metro manila"],
    "ncr": ["manila", "metro manila"],
    "national capital region": ["manila", "metro manila"],
    "makati": ["manila", "makati"],
    "taguig": ["manila", "taguig"],
    "pasay": ["manila", "pasay"],
    "quezon city": ["manila", "quezon city"],
    "paranaque": ["manila", "paranaque"],
    "ermita": ["manila", "ermita"],
    "intramuros": ["manila", "intramuros"],
    "cebu city": ["cebu", "cebu city"],
    "lapu-lapu": ["cebu", "lapu-lapu"],
    "lapu-lapu city": ["cebu", "lapu-lapu"],
    "mactan": ["cebu", "mactan"],
    "moalboal": ["cebu", "moalboal"],
    "badian": ["cebu", "badian"],
    "baguio city": ["baguio", "baguio city"],
    "benguet": ["baguio", "benguet"],
    "la trinidad": ["baguio", "la trinidad"],
    "boracay": ["boracay", "malay", "aklan"],
    "boracay island": ["boracay", "malay", "aklan"],
    "malay": ["boracay", "malay", "aklan"],
    "aklan": ["boracay", "aklan"],
    "kalibo": ["boracay", "kalibo", "aklan"],
    "el nido": ["palawan", "el nido"],
    "coron": ["palawan", "coron"],
    "puerto princesa": ["palawan", "puerto princesa"],
    "puerto princesa city": ["palawan", "puerto princesa"],
    "panglao": ["bohol", "panglao"],
    "tagbilaran": ["bohol", "tagbilaran"],
    "tagbilaran city": ["bohol", "tagbilaran"],
    "carmen": ["bohol", "carmen"],
    "general luna": ["siargao", "general luna"],
    "siargao island": ["siargao", "surigao del norte"],
    "surigao del norte": ["siargao", "surigao del norte"],
    "dapa": ["siargao", "dapa"],
    "del carmen": ["siargao", "del carmen"],
    "davao city": ["davao", "davao city"],
    "davao del sur": ["davao", "davao del sur"],
    "samal": ["davao", "samal"],
    "island garden city of samal": ["davao", "samal"],
    "iloilo city": ["iloilo", "iloilo city"],
    "guimaras": ["iloilo", "guimaras"],
    "carles": ["iloilo", "carles"],
    "miagao": ["iloilo", "miagao"],
    "vigan": ["ilocos", "vigan"],
    "vigan city": ["ilocos", "vigan"],
    "ilocos sur": ["ilocos", "ilocos sur", "vigan"],
    "ilocos norte": ["ilocos", "ilocos norte", "paoay", "pagudpud"],
    "ilocos region": ["ilocos", "vigan", "paoay", "pagudpud"],
    "laoag": ["ilocos", "ilocos norte"],
    "pagudpud": ["ilocos", "pagudpud"],
    "paoay": ["ilocos", "paoay"],
    "tagaytay city": ["tagaytay", "cavite"],
    "cavite": ["tagaytay", "cavite"],
    "batangas": ["tagaytay", "batangas", "nasugbu", "mabini"],
    "nasugbu": ["tagaytay", "nasugbu", "batangas"],
    "mabini": ["tagaytay", "mabini", "batangas"],
    "taal": ["tagaytay", "taal", "batangas"],
    "basco": ["batanes", "basco"],
    "batan island": ["batanes", "basco"],
    "sabtang": ["batanes", "sabtang"],
    "albay": ["bicol", "albay", "legazpi", "daraga"],
    "legazpi": ["bicol", "legazpi", "albay"],
    "legazpi city": ["bicol", "legazpi", "albay"],
    "daraga": ["bicol", "daraga", "albay"],
    "bicol region": ["bicol", "albay", "sorsogon", "camarines sur"],
    "camarines sur": ["bicol", "camarines sur", "caramoan"],
    "caramoan": ["bicol", "caramoan"],
    "sorsogon": ["bicol", "sorsogon", "donsol", "matnog"],
    "donsol": ["bicol", "donsol"],
    "angeles": ["pampanga", "angeles"],
    "angeles city": ["pampanga", "angeles"],
    "clark": ["pampanga", "clark"],
    "mabalacat": ["pampanga", "clark", "mabalacat"],
    "san fernando": ["pampanga", "san fernando"],
    "porac": ["pampanga", "porac"],
    "subic": ["zambales", "subic"],
    "subic bay": ["zambales", "subic"],
    "olongapo": ["zambales", "olongapo", "subic"],
    "olongapo city": ["zambales", "olongapo", "subic"],
    "san antonio": ["zambales", "san antonio"],
    "san narciso": ["zambales", "san narciso", "liwliwa"],
    "liwliwa": ["zambales", "liwliwa", "san narciso"],
    "botolan": ["zambales", "botolan"],
    "iba": ["zambales", "iba"],
}


def normalize_city(city: str) -> str:
    """
    Normalize a city name by stripping whitespace and converting to lowercase.
    """
    if not city:
        return ""
    return city.strip().lower()


def extract_city_search_tokens(city: str) -> List[str]:
    """
    Extract candidate search tokens from a user or Mapbox destination string.

    Examples:
        "Baguio, Benguet, Philippines" -> ["baguio", "benguet"]
        "Baguio City, Benguet, Philippines" -> ["baguio city", "baguio", "benguet"]
        "El Nido, Palawan, Philippines" -> ["el nido", "palawan"]
        "Metro Manila, Philippines" -> ["metro manila", "manila"]
    """
    normalized = normalize_city(city)
    if not normalized:
        return []

    raw_parts = [p.strip() for p in re.split(r"[,/|-]+", normalized) if p.strip()]
    tokens: List[str] = []

    def _add(tok: str) -> None:
        cleaned = tok.strip().lower()
        if not cleaned or len(cleaned) < 2 or cleaned in _IGNORED_TOKENS:
            return
        if cleaned not in tokens:
            tokens.append(cleaned)

    for part in raw_parts:
        if part in _IGNORED_TOKENS:
            continue
        _add(part)

        # Strip common suffixes like " city", " province", " region", " island", " municipality"
        for suffix in (" city", " province", " region", " island", " municipality"):
            if part.endswith(suffix):
                stripped = part[: -len(suffix)].strip()
                _add(stripped)

        # Expand known hub aliases (e.g. "el nido" -> "palawan", "benguet" -> "baguio")
        for candidate in (part, re.sub(r"\s+(city|province|region|island)$", "", part).strip()):
            if candidate in _HUB_ALIASES:
                for alias in _HUB_ALIASES[candidate]:
                    _add(alias)

    if not tokens:
        _add(normalized)

    return tokens
