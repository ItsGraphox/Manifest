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

Two ways, and both land as **Unsorted** (no level yet):

- Paste a multi-line list straight into the capture input and tap **Add unsorted**.
- On the list screen, tap **Import** and paste, or load a `.txt`, `.md` or `.csv` file. Bullets, numbers and `[ ]` checkboxes are stripped, headings are ignored, and anything already on your list is skipped.

## Deep Dive

Tap **Dive** to sort unsorted items one card at a time. Swipe left for Low, up for Med, right for High, and down to skip, or use the buttons. When nothing is unsorted, Dive runs through every open item so you can re-rank.

## Settings

Tap the gear at the top right. Your settings stay on the device.

- **Theme:** four color sets for High / Med / Low plus the accent color.
- **Display:** text size (S–XL), row height, and whether rows show serial numbers.
- **List:** order (by level, newest first, or oldest first, which matches the order things were added), which screen the app opens to, and which level the Enter key saves as.
- **Motion:** glitch effects (Full, Subtle, Off) and the boot sequence.
- **Companion:** on/off, how often it speaks up on its own, whether taps can get sass or only tasks, which corner it sits in, and its face. Type any face; if it has a mouth character like `⩊` `ω` `ᴥ` `‿` and dot eyes `•`, those animate.
- **Data:** import, copy everything as text, clear completed items, or erase everything (asks twice, and Undo is offered).

The **Sort** button next to the search field on the list cycles Level → Newest → Oldest.

## Privacy

Your items are stored only on the device, in the app's local storage. Nothing is sent anywhere and nothing is written to the repository. A Home Screen app keeps its own storage, separate from Safari's, so items added in Safari won't appear in the installed app and the other way round.

## Updating

Edit `index.html`, then bump `VERSION` at the top of `sw.js` (for example `manifest-v2`) and push. The installed app loads the new version on the next launch or the one after.

## Controls

- **Capture:** Enter saves as Med. On a keyboard, ⌘/Ctrl + 1, 2 or 3 picks a level.
- **List:** swipe a row right to mark it done, left to delete, or tap it to edit or change its level.
- **Switching screens:** swipe left from Capture to the list. Tap "‹ Add" or swipe in from the left edge to go back.
- **The cat:** tap it for a suggestion.
- **Deep Dive:** arrow keys work too (← Low, ↑ Med, → High, ↓ Skip).
