import re

BIBLE_VERSE_PATTERN = re.compile(r"\d?\w{3} \d{1,3}:\d{1,3}([-–—]?\d{1,3})?")

assert bool(BIBLE_VERSE_PATTERN.match("Eph 4:14"))
assert bool(BIBLE_VERSE_PATTERN.match("1Cor 13:1"))
assert bool(BIBLE_VERSE_PATTERN.match("2Tim 3:16-17"))
