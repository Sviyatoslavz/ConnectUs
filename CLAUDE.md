# CLAUDE.md

Guidance for AI assistants (and humans) working in this repository.

## What this project is

**ConnectUs** is a marketing landing page for an NFC-solutions business based in
Odesa, Ukraine. It sells NFC magnets, smart business cards, keychains, and
bundled "venue" packages that let a customer tap a phone to open a mini-site
(Google reviews, menu, payment, booking). Orders are taken through a Telegram
bot (`t.me/ConnectUI_bot`).

The entire product is a **single, self-contained static HTML file**. There is no
build step, no framework, no backend, no package manager, and no dependencies to
install.

## Repository layout

```
ConnectUs/
├── ConnectUs.html   # The entire site: HTML + inline CSS + inline JS + base64 images
├── README.md        # Placeholder (just the project name)
└── CLAUDE.md         # This file
```

- **`ConnectUs.html`** (~738 KB, ~395 lines) is the whole application. Its size
  comes almost entirely from ~23 base64-encoded `WebP`/image data URIs embedded
  directly in the markup (product photos, gallery, logos, section art). The
  actual hand-written HTML/CSS/JS is small.

## Architecture of `ConnectUs.html`

Everything lives in one file, in this order:

1. **`<head>`** — meta tags, a base64 favicon, Google Fonts preconnect + the
   `IBM Plex Sans` stylesheet, and one large inline `<style>` block.
2. **Inline CSS** (`<style>`, ~lines 12–181) — all styling. Uses CSS custom
   properties defined in `:root` (`--bg`, `--txt`, `--panel`, `--r`, etc.) for a
   light-background / dark-panel theme. Layout is CSS grid + flexbox, fully
   responsive via `@media` breakpoints at `820px` and `430px`.
3. **`<body>`** markup (~lines 183–344), section by section:
   - `nav.bar` — sticky top bar with brand + language switcher (UA/RU/EN).
   - `header.hero` — headline, subcopy, CTAs to the Telegram bot.
   - `section.demo` — interactive "tap" phone demo (`#tap` / `#mini`).
   - `section#products` — product cards (`.card`) and niche blocks (`.niche`).
   - `section#gallery` — grid of client-work images.
   - Google-reviews value section with an animated `+30` counter (`.gnum`).
   - `section.fin` — final CTA. `footer` — copyright + social links.
4. **Inline JS** (`<script>`, ~lines 346–393) — no libraries. Three concerns:
   - **Tap demo**: clicking `#tap` reveals the mini-site menu for 6 seconds.
   - **i18n / language switch** (see below).
   - **Scroll reveal + counter**: `IntersectionObserver` adds `.in` to `.rv`
     elements; the `+30` number counts up when the Google block scrolls in.

## Internationalization (important convention)

The site supports three languages: **Ukrainian (default), Russian, English.**

- Every translatable element carries a **`data-i="<key>"`** attribute. The
  Ukrainian text is written directly in the HTML as the base copy.
- Translations live in the JS `D` object: `D.ua` is empty (`{}`) because UA is
  the base; `D.ru` and `D.en` map each `data-i` key to translated `innerHTML`.
- On page load, the original HTML for each `data-i` element is cached in
  `bgTexts`. Clicking a `.langs` button (`data-lang="ua|ru|en"`) rewrites every
  `[data-i]` element's `innerHTML` to `D[lang][key] ?? bgTexts[key]` and updates
  `document.documentElement.lang`.

**When you add or edit any user-facing text:**
1. Give the element a unique `data-i` key.
2. Write the Ukrainian copy inline in the HTML.
3. Add matching entries under **both** `D.ru` and `D.en` in the script, or the
   language switch will fall back to the Ukrainian base text for that key.
4. Note: some translation values contain inline HTML (e.g. `<em>`, `<b>`); keep
   markup consistent across languages since it is assigned via `innerHTML`.

(Historical quirk: the switch code contains a leftover `L==='bg'` branch that is
never reached — the buttons only emit `ua`/`ru`/`en`. Leave it or remove it, but
don't rely on a `bg` language existing.)

## Conventions & style

- **Language of the source/UI is Ukrainian.** Copy, comments, and `aria-label`s
  are in Ukrainian (`<html lang="uk">`). Preserve this.
- **Keep it single-file and dependency-free.** Do not introduce a build tool,
  bundler, framework, or npm package unless explicitly asked. New CSS goes in the
  existing `<style>` block; new JS in the existing `<script>` block.
- **Images are inline base64 data URIs.** Product/gallery images are referenced
  by element IDs (e.g. `#pimg-smartcard`, `#pimg-keychain`, `#pimg-bundle`) and
  set via CSS `background`. Editing/replacing an image means swapping a large
  base64 string — expect very long lines. Prefer WebP to keep size down.
- **Accessibility & motion**: the site respects `prefers-reduced-motion`
  (animations disabled) and uses `:focus-visible` outlines, `aria-label`s, and
  semantic sections. Maintain these when editing.
- **Order/CTA links** all point to the Telegram bot with a start payload, e.g.
  `https://t.me/ConnectUI_bot?start=magnet` (`order`, `magnet`, `card`,
  `keychain`, `pack`). Reuse this pattern for new CTAs.
- **Styling tokens**: reuse the `:root` CSS variables and existing class
  patterns (`.cta`, `.card`, `.niche`, `.eyebrow`, `.h2`, `.wrap`) rather than
  inventing new one-off styles.

## Developing & previewing

There is no build or test step. To preview changes, open the file directly:

```bash
# open ConnectUs.html in a browser, e.g.
xdg-open ConnectUs.html      # Linux
open ConnectUs.html          # macOS

# or serve it locally
python3 -m http.server 8000  # then visit http://localhost:8000/ConnectUs.html
```

**Manual verification checklist after edits:**
- Page loads with no console errors.
- Language switch (UA/RU/EN) swaps all `[data-i]` text correctly.
- Tap demo (`#tap`) reveals and re-hides the mini menu.
- Scroll-reveal animations fire and the `+30` counter animates.
- Layout holds at desktop and mobile widths (test ≤820px and ≤430px).

## Git workflow

- Active development branch for this work: **`claude/claude-md-docs-xfi0yv`**.
  Develop, commit, and push there; create it from `main` if needed.
- Push with `git push -u origin claude/claude-md-docs-xfi0yv`.
- Do **not** push to `main` or open a pull request unless explicitly asked.
- Keep commit messages clear and descriptive.
