# Manifest

A capture-first list app. It opens straight to a single input and three importance pads (Low / Med / High). Swipe left for the full list.

Built as a Home Screen web app: no App Store, no build step. It is plain HTML, CSS and JS in one file.

## What's in here

| File | What it does |
|---|---|
| `index.html` | The whole app |
| `manifest.webmanifest` | App name, icon and full-screen settings for the Home Screen |
| `sw.js` | Offline cache, so it opens instantly with no signal |
| `icons/` | App icon in every size iOS and Android ask for |
| `.nojekyll` | Tells GitHub Pages to serve the files as-is |

## Put it online with GitHub Pages

1. On GitHub, create a new repository (for example `manifest`). GitHub Pages on a free account needs it to be **public**. Your list itself never goes in the repo; see Privacy below.
2. Upload everything in this folder to the repository root, including the `icons` folder and `.nojekyll`.
3. In the repository, open **Settings → Pages**. Under "Build and deployment", set the source to **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
4. After a minute or two the page shows your site address, something like `https://YOUR-USERNAME.github.io/manifest/`.

## Install it on your iPhone

1. Open that address in **Safari** (it has to be Safari on iOS).
2. Tap **Share**, then **Add to Home Screen**, then **Add**.
3. Launch it from the new icon. It runs full screen with no browser bars.

## Bring your old list in

Copy your list as bullets (`*`, `-`, `•` or `1.`), paste it into the input, and tap a level. Every line becomes its own item.

## Privacy

Your items are stored only on the device, in the app's local storage. Nothing is sent anywhere and nothing is written to the repository. A Home Screen app keeps its own storage, separate from Safari's, so items added in Safari won't appear in the installed app and the other way round.

## Updating

Edit `index.html`, then bump `VERSION` at the top of `sw.js` (for example `manifest-v2`) and push. The installed app loads the new version on the next launch or the one after.

## Controls

- **Capture:** Enter saves as Med. On a keyboard, ⌘/Ctrl + 1, 2 or 3 picks a level.
- **List:** swipe a row right to mark it done, left to delete, or tap it to edit or change its level.
- **Switching screens:** swipe left from Capture to the list. Tap "‹ Add" or swipe in from the left edge to go back.
- **The cat:** tap it for a suggestion.
