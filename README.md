# desterrocore.github.io

Personal portfolio of **Lennon da Silva Rocha** — senior backend engineer and cultural
producer from Florianópolis (Desterro), Santa Catarina, Brazil.

Live: <https://desterrocore.github.io/>

---

## What this is

A single-page static site. No framework, no bundler, no build step, no third-party
scripts, no analytics, no cookies. Four files do the work:

| File | Role |
| --- | --- |
| `index.html` | The whole page. Ships with the **pt-BR** copy inline, so the default language is real HTML — not something JavaScript has to paint in. |
| `assets/css/desterrocore.css` | The design system: tokens, 12-column grid, type scale, components, texture, motion. |
| `assets/js/i18n.js` | The **en-US** string table, keyed to `data-i18n` attributes. |
| `assets/js/main.js` | Language switch, nav state, scroll reveal, counters, contact assembly. |

Fonts (Archivo variable + JetBrains Mono variable) are self-hosted in `assets/fonts/`,
so the site makes zero requests to any origin other than its own.

## Languages

**pt-BR is the default** and lives directly in `index.html`. Switching to en-US swaps
text through the table in `assets/js/i18n.js`; switching back restores the pt-BR strings
captured from the DOM at load, which means the two languages can never drift apart in
key coverage.

- `https://desterrocore.github.io/` → pt-BR
- `https://desterrocore.github.io/?lang=en` → en-US (shareable, also honoured by `#en`)

The choice is remembered in `localStorage`. With JavaScript disabled the site still
works completely, in Portuguese.

### Editing copy

1. Edit the pt-BR text **in `index.html`**, on the element carrying `data-i18n="the.key"`.
2. Edit the matching `"the.key"` entry in `assets/js/i18n.js` for the English.

Attributes are translated with `data-i18n-attr="attribute:key[,attribute:key…]"`.
A key missing from `i18n.js` falls back to the Portuguese — never to an empty string.

Nothing enforces that at runtime, so there is a checker:

```bash
python3 tools/check-i18n.py
```

It reports keys with no English, English with no key, keys used both as text and
as an attribute, the same key carrying two different Portuguese values, and
in-page links with no target. No dependencies; exits non-zero, so it works as a
pre-commit hook.

## Local preview

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

Opening `index.html` straight off disk works too; nothing is fetched at runtime.

## Deploy

Pushing to `main` triggers `.github/workflows/deploy-pages.yml`, which stages the
publishable files (everything except `source/` and repo meta) and deploys them to
GitHub Pages.

**One-time setup**, in this order:

1. The repository must be named **`desterrocore.github.io`** — that is what makes it a
   GitHub Pages *user site* served from the bare root. Any other name publishes it under
   a subpath, and every absolute URL here (canonical, hreflang, `sitemap.xml`,
   `site.webmanifest`, the root-relative paths in `404.html`) assumes the root.
2. GitHub → *Settings* → *Pages* → *Build and deployment* → *Source*: **GitHub Actions**.

## Repository layout

```
index.html                    the site
404.html                      not-found page, same design language
assets/css/desterrocore.css   design system
assets/js/i18n.js             en-US string table
assets/js/main.js             behaviour
assets/fonts/                 self-hosted woff2 subsets
assets/img/                   avatar / social card
assets/favicon.svg            favicon
tools/check-i18n.py           pt-BR / en-US consistency checker
source/                       the written briefs and the original 1.9 MB artwork
                              (kept for reference, never deployed — the workflow
                              stages an explicit file list)
.github/workflows/            Pages deployment
TODO.md                       what is still pending
```

Weights, measured: **163 KB on a first visit** — 19 KB of HTML, 12 KB of CSS and
13 KB of JS after gzip, plus 123 KB of woff2 — and a 152 KB avatar that is
lazy-loaded below the fold. Every character in the pt-BR copy falls inside the
fonts' `latin` subset, so the `latin-ext` files ship with the repo but are never
requested; the three arrow glyphs the UI uses get their own 1 KB subset rather
than dropping to a system font mid-label.

## Design system, in short

Near-black `#090909` ground, warm paper `#E7DFCF` type, signal orange `#E85D04`
carrying identity, terminal green `#7CFF4F` reserved strictly for machine semantics.
Roughly 70 / 20 / 8 / 2. Disciplined grid, dirty surface: grain and print texture live
at low opacity above the layout, never inside it.

The one place the page scrolls sideways is the `FIG. 02` topology diagram: its
labels are sized in viewBox units, so scaling the drawing down would scale the
type down with it. Below about 1080px it scrolls inside its own container
(focusable, so a keyboard can scroll it) rather than shrinking past legibility;
below 720px it swaps to a three-node strip.

Full specification in `source/portfolio-brief-v2.md`.

## Licence

Source code: MIT (see `LICENSE`).
Written content, artwork and the Desterrocore identity: © Lennon da Silva Rocha,
all rights reserved.
