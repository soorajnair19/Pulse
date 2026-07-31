# PulseGrid

Embeddable activity widgets as grids.

## Setup

```bash
cp .env.example .env.local
# Add a GitHub personal access token
npm install
npm run dev
```

Required env:

```
GITHUB_TOKEN=ghp_...
```

Optional (production embed URLs in the copy snippet):

```
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

If unset, the playground uses `window.location.origin`.

## Playground

Open `/` on your deployed URL. Select **GitHub**, enter a username, choose variant / duration / theme, click **Generate**, then **Copy embed code**.

Shareable query params:

```
/?provider=github&u=octocat&variant=default&period=1y&theme=github-dark
```

## Embed

```html
<iframe
  src="https://your-domain.com/embed/github/octocat"
  width="100%"
  height="220"
  frameborder="0"
></iframe>
```

### Variants

| Variant | Height | URL |
|---------|--------|-----|
| compact | ~120px | `?variant=compact` |
| default | ~220px | `?variant=default` (recommended) |
| detailed | ~380px | `?variant=detailed` |

### Parameters

- `theme` — `github-dark` (default), `github-light`, `minimal`, `glass`, `figma`, `nord`, `dracula`, `catppuccin`
- `period` — `3m` \| `6m` \| `1y` (default)
- `showLegend` — `true` \| `false`
- `showMonths` — `true` \| `false`
- `showWeekdays` — `true` \| `false`
- `cellSize` — `6`–`20`
- `gap` — `1`–`8`
- `radius` — `0`–`8`

### API

`GET /api/github/contributions/[username]` — JSON contribution data (cached 24h).
