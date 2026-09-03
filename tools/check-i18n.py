#!/usr/bin/env python3
"""Check that the two languages of the site still line up.

The Portuguese lives in index.html (it is the default and must work with
JavaScript off); the English lives in assets/js/i18n.js. Nothing enforces that
relationship at runtime — a key added to one and forgotten in the other just
silently shows Portuguese to an English reader. This says so.

    python3 tools/check-i18n.py

Exits non-zero if anything is missing, so it can go in a pre-commit hook.
No dependencies, no build step: it only reads the two files.
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = os.path.join(ROOT, "index.html")
I18N = os.path.join(ROOT, "assets", "js", "i18n.js")


def main() -> int:
    html = open(HTML, encoding="utf-8").read()
    js = open(I18N, encoding="utf-8").read()

    text_keys = set(re.findall(r'data-i18n="([^"]+)"', html))
    attr_keys = set()
    for spec in re.findall(r'data-i18n-attr="([^"]+)"', html):
        for pair in spec.split(","):
            bits = pair.split(":")
            if len(bits) == 2:
                attr_keys.add(bits[1].strip())

    used = text_keys | attr_keys
    en = set(re.findall(r'^\s*"([^"]+)":', js, re.M))

    problems = []

    missing = sorted(used - en)
    if missing:
        problems.append("no English for %d key(s) — they will stay in Portuguese:\n    %s"
                        % (len(missing), "\n    ".join(missing)))

    orphans = sorted(en - used)
    if orphans:
        problems.append("English for %d key(s) nothing in the page uses:\n    %s"
                        % (len(orphans), "\n    ".join(orphans)))

    collisions = sorted(text_keys & attr_keys)
    if collisions:
        problems.append("key(s) used as BOTH element text and an attribute value; the "
                        "Portuguese snapshot cannot hold both:\n    %s" % "\n    ".join(collisions))

    # The same key on several elements must carry the same Portuguese on each.
    seen = {}
    for m in re.finditer(r'data-i18n="([^"]+)"[^>]*>([^<]*)<', html):
        key, value = m.group(1), m.group(2)
        if key in seen and seen[key] != value:
            problems.append('key "%s" has two different Portuguese values in index.html:\n'
                            '    %r\n    %r' % (key, seen[key], value))
        seen[key] = value

    anchors = set(re.findall(r'href="#([^"]+)"', html))
    ids = set(re.findall(r'\bid="([^"]+)"', html))
    dangling = sorted(anchors - ids)
    if dangling:
        problems.append("in-page link(s) with no target: %s" % ", ".join(dangling))

    if problems:
        print("i18n check FAILED\n")
        for p in problems:
            print("  - %s\n" % p)
        return 1

    print("i18n check OK — %d keys, both languages complete." % len(used))
    return 0


if __name__ == "__main__":
    sys.exit(main())
