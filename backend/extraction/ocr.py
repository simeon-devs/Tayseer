"""Tesseract OCR engine for document text extraction.

All extraction uses lang=ara+eng with PSM 3 (fully automatic page segmentation)
to handle mixed Arabic and English government documents including salary certificates,
bank statements, and Emirates ID cards.
"""

from __future__ import annotations

import logging
import os

import pytesseract
from PIL import Image
from pdf2image import convert_from_path

logger = logging.getLogger(__name__)

_OCR_LANG = "ara+eng"
_OCR_CONFIG = "--psm 3"
_PDF_DPI = 200


def extract_text_from_image(image_path: str) -> str:
    """Extract raw text from an image file using Tesseract.

    Loads the image with Pillow, runs Tesseract with lang=ara+eng and PSM 3.
    Returns an empty string and logs a warning if extraction fails.
    """
    try:
        image = Image.open(image_path)
        text: str = pytesseract.image_to_string(
            image,
            lang=_OCR_LANG,
            config=_OCR_CONFIG,
        )
        return text
    except Exception as exc:
        logger.warning("OCR failed for image %s: %s", image_path, exc)
        return ""


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract raw text from a PDF by converting pages to images then running OCR.

    Converts each page to a PIL Image at 200 DPI, runs Tesseract on each page,
    and concatenates all page texts separated by newlines.
    Returns an empty string and logs a warning if extraction fails.
    """
    try:
        pages = convert_from_path(pdf_path, dpi=_PDF_DPI)
        page_texts: list[str] = []
        for page in pages:
            text: str = pytesseract.image_to_string(
                page,
                lang=_OCR_LANG,
                config=_OCR_CONFIG,
            )
            page_texts.append(text)
        return "\n".join(page_texts)
    except Exception as exc:
        logger.warning("OCR failed for PDF %s: %s", pdf_path, exc)
        return ""


def extract_text(file_path: str) -> str:
    """Detect file type by extension and run the appropriate OCR function.

    Supports PDF (any capitalisation of .pdf) and image files (.png, .jpg,
    .jpeg, .tiff, .bmp, .webp). Returns an empty string and logs a warning
    for unsupported extensions.
    """
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    if ext in {".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".webp"}:
        return extract_text_from_image(file_path)
    logger.warning("Unsupported file extension %s for %s", ext, file_path)
    return ""
