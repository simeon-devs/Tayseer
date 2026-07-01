"""Text and field normalization helpers for the document extraction pipeline.

Provides digit normalization for Arabic OCR output, Emirates ID format
validation, and lenient date parsing for extracted document fields. All
functions are pure and never raise; they return a safe default on any
unparseable input.
"""

from __future__ import annotations

import re
from datetime import date, datetime

_ARABIC_INDIC_DIGITS = "٠١٢٣٤٥٦٧٨٩"
_EASTERN_ARABIC_INDIC_DIGITS = "۰۱۲۳۴۵۶۷۸۹"
_ASCII_DIGITS = "0123456789"

_DIGIT_TRANSLATION = str.maketrans(
    _ARABIC_INDIC_DIGITS + _EASTERN_ARABIC_INDIC_DIGITS,
    _ASCII_DIGITS + _ASCII_DIGITS,
)

_EMIRATES_ID_PATTERN = re.compile(r"^784-\d{4}-\d{7}-\d$")

_DATE_FORMATS = (
    "%Y-%m-%d",
    "%d/%m/%Y",
    "%d-%m-%Y",
    "%d.%m.%Y",
    "%m/%d/%Y",
)


def normalize_arabic_indic_digits(text: str) -> str:
    """Convert Arabic-Indic and Eastern Arabic-Indic digits to ASCII digits.

    Government documents OCR'd with lang=ara+eng can emit either digit form.
    Returns the text unchanged if it contains no such digits.
    """
    return text.translate(_DIGIT_TRANSLATION)


def validate_emirates_id_format(id_number: str | None) -> bool:
    """Return True if id_number matches the 784-XXXX-XXXXXXX-X format.

    Returns False for None, empty, or malformed input.
    """
    if not id_number:
        return False
    return bool(_EMIRATES_ID_PATTERN.match(id_number))


def parse_document_date(date_str: str | None) -> date | None:
    """Parse a date string extracted from a document into a date object.

    Tries a fixed list of formats commonly seen on UAE government documents.
    Returns None if date_str is empty or matches no known format.
    """
    if not date_str:
        return None
    cleaned = date_str.strip()
    for fmt in _DATE_FORMATS:
        try:
            return datetime.strptime(cleaned, fmt).date()
        except ValueError:
            continue
    return None
