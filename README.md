# Pulse

Turn your activity into a little grid you can drop on a website, blog, or README.

Pulse builds heatmap-style widgets from the things you already do online — coding on **GitHub**, watching films on **Letterboxd**, finishing books on **Goodreads**, and more soon.

## What you can do

1. Open the site
2. Pick a provider (GitHub, Letterboxd, or Goodreads)
3. Enter your username (or Goodreads My Books URL / user ID)
4. Choose a size, time range, and look
5. Hit **Generate**
6. **Copy the embed code** — or download the widget as an image

That’s it. No account required.

## Supported today

| Provider | What it shows |
|----------|----------------|
| **GitHub** | Your contribution activity |
| **Letterboxd** | Your film diary |
| **Goodreads** | Books finished (by date read), with ratings when present |

Goodreads uses your public Read shelf finish dates — paste a My Books URL like `https://www.goodreads.com/review/list/123456` or just the numeric user ID. Duration is a **calendar year** (recent years in the dropdown, or enter any year from 1900 to the current year).

Coming later: Figma.

## Customize

- **Size** — Compact, Default, or Detailed
- **Duration** — Last month, 3 months, 6 months, or a full year (GitHub / Letterboxd). Goodreads uses a calendar year (pick a recent year or enter a custom one).
- **Theme** — Dark, Light, Minimal, Glass, Violet, Arctic, Twilight, Pastel

Switch between providers anytime — each one remembers its own username and preview.

## Embed it

After you generate a widget, copy the iframe snippet and paste it where you want it to appear:

```html
<iframe
  src="https://your-domain.com/embed/github/yourusername"
  width="100%"
  height="220"
  frameborder="0"
  loading="lazy"
></iframe>
```

Letterboxd and Goodreads work the same way — use `/embed/letterboxd/yourusername` or `/embed/goodreads/123456`.

You can also share a playground link with your settings baked in, for example:

```
/?provider=github&u=octocat&variant=default&period=1y&theme=github-dark
```

## Run it yourself

If you want to run Pulse locally:

1. Copy `.env.example` to `.env.local`
2. Add a GitHub personal access token (`GITHUB_TOKEN`) — needed for GitHub widgets
3. Optionally set `NEXT_PUBLIC_SITE_URL` to your public site URL (used in copied embed snippets)
4. Install and start:

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).
