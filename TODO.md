# TODO — desterrocore.github.io

Pending items for the portfolio. Tick these off as they land.

## Contact / identity

- [ ] **Create a professional e-mail address** (e.g. `lennon@<dominio>` or a dedicated
      `desterrocore@…` address) to use publicly instead of the personal Gmail.
- [ ] **Update the LinkedIn profile** so it matches the positioning on the site
      (senior backend engineer + cultural producer, Desterrocore identity).
- [ ] **Wire both into the contact section.** Everything is already scaffolded:
  - `index.html` → section `06 / CONTATO`, the commented-out `<!-- contact:email -->`
    and `<!-- contact:linkedin -->` blocks.
  - `assets/js/i18n.js` → keys `contact.emailLabel`, `contact.linkedinLabel`,
    `contact.cta` already exist in both languages.
  - `assets/js/main.js` → the `CONTACT` object at the top: `emailUser`, `emailDomain`
    and `linkedin`. Fill them in and the rows unhide themselves. The address is
    assembled at runtime from its two halves, so the literal string never sits in the
    HTML source for scrapers; the LinkedIn handle shown on the page is derived from the
    URL you paste, so the two cannot disagree.
- [ ] Decide whether the e-mail should be a plain `mailto:` or a contact form
      (a form needs a third-party endpoint — GitHub Pages is static).

## Deploy

- [ ] **Rename the GitHub repository to `desterrocore.github.io`.** This is the first
      step and nothing else works without it. GitHub serves a *user site* at
      `https://<user>.github.io/` only from a repo named exactly `<user>.github.io`;
      a repo called `desterrocore` would be published at
      `https://desterrocore.github.io/desterrocore/` instead, and every absolute URL
      in the site — canonical, hreflang, `sitemap.xml`, `site.webmanifest`, the
      root-relative paths in `404.html` — assumes the bare root.
      The local remote already points at the new name:
      `git@github.com:desterrocore/desterrocore.github.io.git`.
      (Note that `desterrocore/desterrocore` is also the repo GitHub uses for the
      profile README shown on your profile page — a separate thing from this site.)
- [ ] In GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
      The workflow at `.github/workflows/deploy-pages.yml` does the rest on every push
      to `main`.
- [ ] Confirm the site answers at <https://desterrocore.github.io/>.
- [ ] Optional: point a custom domain at it (add a `CNAME` file at the repo root and
      configure the DNS `ALIAS`/`A` records GitHub documents).

## Content

- [ ] Add engineering case studies (payments / antifraud / integrations) once it is clear
      what can be described publicly without breaching employer confidentiality.
      Section `02 / ENGENHARIA` has room for a "selected work" block.
- [ ] Photography from the realized cineclub sessions and from the Escola Popular de
      Tecnologia — the culture section is designed to take duotone images.
- [ ] `Notes from Desterro` — the writing section sketched in the brief. Not built yet;
      would be a second page (`/notes/`) plus an index, still no build step required.
- [ ] Cultural projects currently in development are **deliberately absent** from the site.
      Add them only once they have actually been executed.

## Housekeeping

- [ ] Replace the OG/social preview image (`assets/img/desterrocore.jpg`) with a proper
      1200×630 card if the square crop looks bad when shared.
- [ ] Check the site with Lighthouse once it is live (target: 100 / 100 / 100 / 100).
- [ ] Run `python3 tools/check-i18n.py` after any copy change — it catches a key added
      to one language and forgotten in the other.
- [ ] Look at the page in a real browser at 320 px, 768 px and 1920 px, and with
      `prefers-reduced-motion` on. It was built and reviewed without a browser
      available, so every layout claim here is derived from the code, not from a
      rendering.
