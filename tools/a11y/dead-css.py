#!/usr/bin/env python3
"""Find CSS class selectors that can never match anything in the built site.

Catches the classic "typo'd block class" bug: e.g. CSS says `.footer h2` while
the template renders `class="site-footer"`.
"""
import re
import sys
import pathlib

def find_site_root():
    d = pathlib.Path(__file__).resolve().parent
    for _ in range(6):
        if (d / "hugo.toml").is_file():
            return d
        d = d.parent
    raise SystemExit("hugo.toml not found above " + str(pathlib.Path(__file__).resolve().parent))

SITE = find_site_root()
PUBLIC = SITE / "public"

# classes toggled by main.js at runtime, plus the html.js hook
RUNTIME = {"js", "is-stuck", "is-open", "is-locked", "is-in", "is-visible"}

# Design-system vocabulary that no page currently uses. These are kept on
# purpose so content authors can reach for them; they are reported separately
# from genuinely dead selectors so a real typo still stands out.
RESERVED_PREFIXES = (
    "bg-mint-tint", "bg-wine-tint", "btn--light", "card--num", "card--tint",
    "card--wine", "card__num", "grid--2", "link-arrow", "mt-0", "pill--onwine",
    "prose", "round-img", "sec-head--row", "shadow", "split__media--plain",
    "split__media--tall", "stack", "ticks", "visually-hidden",
    "iform__grid--3",
    # the call-to-action banner: removed from every page by request, kept as a
    # block type so it can be switched back on from content alone. `section--wine`
    # is the dark band surface that block uses (the invented-numbers stats band,
    # which was the last user of it, is gone).
    "cta-band", "eyebrow--onwine", "section--tight", "section--wine",
    # the testimonial block: unused until real, consented reviews exist (the
    # lorem-ipsum ones were removed). Kept so it is a content-only change to
    # bring back — same deal as the cta band.
    "quote",
    # the clickable-card mechanism. No page uses it at the moment: every grid
    # whose cards shared one destination now has a single `cta` button instead
    # (see the README's "Egy cél = egy hivatkozás" rule). It stays for grids
    # where each card has its own target.
    "card--link", "card__link", "card__more",
)

css = (SITE / "assets" / "css" / "main.css").read_text(encoding="utf-8")
css = re.sub(r"/\*.*?\*/", " ", css, flags=re.S)

# class tokens used in stylesheet selectors
css_classes = {}
for block in re.finditer(r"([^{}]+)\{", css):
    sel = block.group(1).strip()
    if sel.startswith("@"):
        continue
    for cls in re.findall(r"\.(-?[_a-zA-Z][\w-]*)", sel):
        css_classes.setdefault(cls, set()).add(re.sub(r"\s+", " ", sel)[:70])

# class tokens present in generated HTML + JS
used = set()
for f in list(PUBLIC.rglob("*.html")) + list(SITE.glob("assets/js/*.js")):
    text = f.read_text(encoding="utf-8", errors="ignore")
    for attr in re.findall(r'class="([^"]*)"', text):
        used.update(attr.split())
    if f.suffix == ".js":
        for m in re.findall(r"classList\.(?:add|toggle|remove)\(([^)]*)\)", text):
            used.update(re.findall(r"['\"]([\w-]+)['\"]", m))

unmatched = {c: s for c, s in css_classes.items() if c not in used and c not in RUNTIME}
dead = {c: s for c, s in unmatched.items() if not c.startswith(RESERVED_PREFIXES)}
reserved = {c: s for c, s in unmatched.items() if c.startswith(RESERVED_PREFIXES)}

print(f"CSS classes defined : {len(css_classes)}")
print(f"classes found in DOM: {len(used)}")
print(f"\n### DEAD SELECTORS ({len(dead)}) — CSS can never match")
for c in sorted(dead):
    print(f"  .{c}")
    for s in sorted(dead[c])[:3]:
        print(f"      {s}")

print(f"\n### RESERVED VOCABULARY, not used by any page ({len(reserved)})")
print("  " + ", ".join("." + c for c in sorted(reserved)))

extra = sorted(used - set(css_classes))
extra = [c for c in extra if not c.startswith("wp-")]
print(f"\n### classes in HTML with no CSS rule ({len(extra)}) — usually fine")
print("  " + ", ".join(extra) if extra else "  (none)")

sys.exit(1 if dead else 0)
