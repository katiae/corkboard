# 📌 Corkboard

A profile page that *is* a corkboard. Think MySpace / Linktree, reimagined as a physical pinboard you decorate yourself — polaroids, handwritten notes, stickers, ribbons, plants, fairy lights, a cassette/Walkman/Discman/iPod that plays your Spotify, and a stitched-in guestbook where visitors leave notes.

The whole point: it should feel like a **real corkboard photographed on a wall**, not a flat app faking one. One consistent light source, procedural cork and wood-grain textures, cast shadows, and items that physically lift, settle, crumple, and tear.

## Run it

No build step — it's plain HTML/CSS/JS.

```bash
# from this folder
python3 -m http.server 4173
# then open http://localhost:4173
```

## What you can do

- **Add**: polaroids (single / photo-strip / 2×2 photoshoot, with photo & gif upload + darkroom filters), sticky notes, custom notes (lined / grid / plain / your own paper image, pick handwriting, bullets, pin or tape), stickers (built-in or upload — with background removal & lasso cutout), guestbooks, and music players.
- **Decorate**: hanging pothos, ivy garland, cactus, fairy lights, a flickering lantern — or upload your own decor image.
- **Customize**: pin shapes (ball, pearl, brass tack, daisy, heart, star) & colours, tape patterns (gingham, dots, stripes, chevron, hearts, stars, washi, clear, kraft…), board frame, and wall colour.
- **Handle things like real objects**: drag freely, **rotate** and **resize** from the corner handles, recut paper/sticker edges with the **scissors**, and toss things in the desk **bin** — paper crumples with a soft paper-crinkle sound.
- **Music**: pick a device skin, paste a Spotify link, and the embed sits *on* the device like a sticker; the play button drives it. No link → a built-in lo-fi loop.

## Status

Working prototype. Board state (positions, sizes, rotations, edits) currently resets on reload — **persistence / accounts** is the next planned step.

## Stack

Single-page, dependency-free: `index.html`, `styles.css`, `app.js`. Textures are generated with SVG filters (no image assets). Fonts via Google Fonts; music via the Spotify iFrame API.
