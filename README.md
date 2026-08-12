# Pulse

Turn your activity into a little grid you can drop on a website, blog, or README.

Pulse builds heatmap-style widgets from the things you already do online — coding on **GitHub**, watching films on **Letterboxd**, finishing books on **Goodreads**, and more soon.

## What you can do

1. Open the site
2. Pick a provider (GitHub, Letterboxd, or Goodreads)
3. Enter your username (or Goodreads My Books URL / user ID)
4. Choose a size, year or duration, and theme
5. Hit **Generate**
6. **Copy the embed code** — or download the widget as an image

That’s it. No account required.

## Supported today

| Provider | What it shows | Time range |
|----------|----------------|------------|
| **GitHub** | Your contribution activity | Rolling: 1 month, 3 months, 6 months, or 1 year |
| **Letterboxd** | Your film diary (with ratings and likes) | Calendar year — pick a recent year or enter a custom one |
| **Goodreads** | Books finished by date read (with ratings when present) | Calendar year — pick a recent year or enter a custom one |

**Goodreads setup:** paste a public My Books URL like `https://www.goodreads.com/review/list/123456`, or just the numeric user ID.


## Customize

- **Size** — Compact, Default, or Detailed
- **Duration / Year** — Rolling lookbacks on GitHub; calendar year on Letterboxd and Goodreads (recent years in the dropdown, or type any year from 1900 to the current year)
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

Letterboxd and Goodreads work the same way:

- `/embed/letterboxd/yourusername`
- `/embed/goodreads/123456`

You can also share a playground link with your settings baked in:

```
/?provider=github&u=octocat&variant=default&period=1y&theme=github-dark
/?provider=letterboxd&u=yourusername&variant=default&period=2025&theme=github-dark
/?provider=goodreads&u=123456&variant=default&period=2025&theme=github-dark
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
