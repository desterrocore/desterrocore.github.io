# TODO — desterrocore.com.br

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

- [ ] **Rename the GitHub repository to `desterrocore.github.io`.** Do this first —
      nothing else works without it. GitHub serves a *user site* from a repo named
      exactly `<user>.github.io`; any other name publishes under a subpath. The local
      remote already points at the new name:
      `git@github.com:desterrocore/desterrocore.github.io.git`.
- [ ] In GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
      The workflow at `.github/workflows/deploy-pages.yml` does the rest on every push
      to `main`.
- [ ] Confirm the site answers at <https://desterrocore.github.io/> before touching DNS.
      Getting the plain Pages URL working first means that if the custom domain
      misbehaves later, you already know the deploy itself is fine.

## Custom domain — desterrocore.com.br

The `CNAME` file at the repo root holds the domain, and the deploy workflow copies it
into the published artifact. Do not delete it: with GitHub Actions publishing, a
deploy whose artifact has no `CNAME` drops the custom domain and the site falls back
to `desterrocore.github.io`.

- [ ] **Verify the domain first** (GitHub recommends it, and it blocks takeover if the
      domain ever lapses): GitHub → your avatar → *Settings* → *Pages* → *Add a domain*.
      GitHub gives you a `_github-pages-challenge-desterrocore` TXT record with a token.
      Add it at Registro.br, wait for it to resolve, then click *Verify*.
- [ ] **Add the DNS records at Registro.br.** Log in at <https://registro.br>, open
      *Painel* → `desterrocore.com.br` → the **DNS** section, and edit the zone
      (Registro.br hosts DNS for the domain by default, so there is nothing to delegate).
      The apex needs A and AAAA records because a CNAME is not legal at a zone apex;
      `www` gets a CNAME.

      **In Registro.br's form, the apex records have an EMPTY Nome field.** Leave it
      blank — do not type `desterrocore.com.br`, because Registro.br appends the zone
      to whatever you enter and you would end up creating
      `desterrocore.com.br.desterrocore.com.br`. Only the `www` and TXT rows get a
      name, and it is the label alone, not the full hostname.

      | Nome | Tipo | Dados |
      | --- | --- | --- |
      | *(empty)* | A | `185.199.108.153` |
      | *(empty)* | A | `185.199.109.153` |
      | *(empty)* | A | `185.199.110.153` |
      | *(empty)* | A | `185.199.111.153` |
      | *(empty)* | AAAA | `2606:50c0:8000::153` |
      | *(empty)* | AAAA | `2606:50c0:8001::153` |
      | *(empty)* | AAAA | `2606:50c0:8002::153` |
      | *(empty)* | AAAA | `2606:50c0:8003::153` |
      | `www` | CNAME | `desterrocore.github.io.` |
      | `_github-pages-challenge-desterrocore` | TXT | *(the token GitHub gives you)* |

      All four A records and all four AAAA records — they are GitHub's load balancers,
      not alternatives to pick between. The trailing dot on the CNAME value matters:
      it makes the target absolute, so it is not read as
      `desterrocore.github.io.desterrocore.com.br`.

      Save, and make sure Registro.br shows the zone as published. If you are using
      Registro.br's advanced/zone-file mode instead of the form, that format does
      accept `@` for the apex — `@` is zone-file shorthand for the zone origin, which
      is why it turns up in most DNS instructions written for other providers.
- [ ] **Check the records resolve** before going near GitHub again:
      `dig +short desterrocore.com.br A` → the four `185.199.*` addresses
      `dig +short www.desterrocore.com.br CNAME` → `desterrocore.github.io.`
- [ ] **Set the domain in the repo**: Settings → Pages → *Custom domain* →
      `desterrocore.com.br` → *Save*. GitHub re-checks DNS; a green tick means it is bound.
- [ ] **Wait for the certificate.** GitHub provisions a Let's Encrypt certificate once
      DNS resolves — usually minutes, occasionally up to 24 h. The *Enforce HTTPS*
      checkbox stays greyed out until it is issued. **Tick it once it is available**, and
      not before.
- [ ] Confirm all four of these land on the same page over HTTPS:
      `desterrocore.com.br`, `www.desterrocore.com.br`, `http://desterrocore.com.br`,
      and `desterrocore.github.io` (which should 301 to the custom domain).

**If you ever move DNS to Cloudflare:** keep the records grey-clouded (*DNS only*).
With the orange proxy on, GitHub cannot complete the ACME challenge and certificate
renewal fails silently a few months later.

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
