# Imperial RP Loading Screen v2 (GitHub Pages)

## Why v2?
- SteamID64 + Last Connected now show reliably.
  (Fix: GMod callbacks are defined immediately, not after async config load.)
- No pointless buttons (GMod loading screen is not clickable).
- Fully responsive layout: panels stack cleanly on smaller screens.
- Background support (cycle multiple images if you add them).

## Setup (GitHub Pages)
1) Create repo: `loadingscreen`
2) Upload this folder contents to repo root
3) Settings → Pages → Deploy from branch → main → /(root)
4) Use:
   sv_loadingurl "https://YOURNAME.github.io/loadingscreen/"

## Customise
Edit `config.json`:
- discordText / websiteText
- rules / staff / tips
- backgrounds: add more, e.g. "assets/bg2.jpg"

## Adding your own backgrounds
Drop images into `assets/` (jpg/png/webp) and add to `backgrounds` array.
Keep files under ~2–4MB each for faster loads.
