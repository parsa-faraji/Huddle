# Huddle — Presentation

Three-section walkthrough deck: **Intro**, **Frontend**, **Backend**.

## Run locally

Open it directly in a browser:

```bash
open docs/presentation/index.html
# or, from the repo root:
python3 -m http.server 8000 -d docs
# then visit http://localhost:8000/presentation/
```

Reveal.js is loaded from a CDN — no build step.

## Files

- `index.html` — the slideshow (reveal.js 5.x)
- `../demo/huddle-demo.webm` — embedded on the Demo slide. Regenerate with `npm run demo:record`.

## Keyboard controls

- `→` / `←` — next / previous slide
- `f` — fullscreen
- `s` — speaker notes view
- `esc` — slide overview
- `b` — pause (black screen)
