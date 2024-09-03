"""Scrape, parse, and generate a list of Bible books and their common abbreviations.

Run: uv run main.py
"""
# /// script
# dependencies = [
#   "beautifulsoup4<5",
#   "lxml<6",
#   "requests<3"
# ]
# ///

import json
import pathlib

import bs4
import requests


def clean_book_abbreviation(abbreviation: str) -> str:
    return abbreviation.replace("Most common:", "").strip().removesuffix(".")


if __name__ == "__main__":
    response = requests.get("https://www.logos.com/bible-book-abbreviations")
    response.raise_for_status()
    soup = bs4.BeautifulSoup(response.content, "lxml")

    abbreviations: dict[str, list[str]] = {}

    for article in soup.find_all("article"):
        for book_div in article.find_all(class_="row-of-lists__list"):
            book: str = book_div.find("h2").text
            abbreviations_for_book: list[str] = [
                clean_book_abbreviation(li.text) for li in book_div.find_all("li")
            ]
            abbreviations[book] = abbreviations_for_book

    outpath = pathlib.Path("../src/abbreviations.json").absolute()
    with open(outpath, "w") as fout:
        fout.write(json.dumps(abbreviations, indent=2))

    print(f"Output abbreviations to {outpath}")
