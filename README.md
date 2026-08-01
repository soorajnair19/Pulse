# Pulse

Turn your activity into a little grid you can drop on a website, blog, or README.

Pulse builds heatmap-style widgets from the things you already do online — coding on **GitHub**, watching films on **Letterboxd**, and more soon.

## What you can do

1. Open the site
2. Pick a provider (GitHub or Letterboxd)
3. Enter your username
4. Choose a size, time range, and look
5. Hit **Generate**
6. **Copy the embed code** — or download the widget as an image

That’s it. No account required.

## Supported today

| Provider | What it shows |
|----------|----------------|
| **GitHub** | Your contribution activity |
| **Letterboxd** | Your film diary |

Coming later: Figma and Goodreads.

## Customize

- **Size** — Compact, Default, or Detailed
- **Duration** — Last month, 3 months, 6 months, or a full year
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

Letterboxd works the same way — just use `/embed/letterboxd/yourusername` instead.

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
