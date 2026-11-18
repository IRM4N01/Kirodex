<p align="center">
  <img src="images/kirodex-logo.webp" alt="Kirodex logo" width="220">
</p>

<h1 align="center">Kirodex</h1>

<p align="center">
  A mobile-first anime and manga tracker. Search any title, log every episode and chapter, and pick up where you left off.
</p>

<p align="center">
  <a href="https://irm4n01.github.io/Kirodex/"><strong>Live app</strong></a>
</p>

---

## Screenshots

<p align="center">
  <img src="screenshots/home.png" alt="Watching list with progress bars" width="240">
  <img src="screenshots/search.png" alt="Searching AniList for a title" width="240">
  <img src="screenshots/edit.png" alt="Edit panel for setting progress and status" width="240">
</p>

## Why I built it

I used to track every anime I watched and manga I read in my iPhone's Reminders app, updating each item by hand. I wanted something built for the job: a list that knows how many episodes a show has, shows my progress at a glance, and lets me log an episode with one tap.

## Features

- **Search AniList:** find any anime or manga and add it in one tap. The cover art, episode count and chapter count fill in automatically.
- **One-tap progress:** the **+1** button logs the next episode or chapter. A show moves to *Watching* when you start it and to *Completed* when you reach the last episode.
- **Edit panel:** set your exact progress, change the status, or remove a title.
- **Anime and manga tabs**, each with *Watching / Reading*, *Completed* and *Plan* filters and live counts.
- **Swipe between filters** with a page-turn animation, like flipping a book.
- **Installable app (PWA):** add it to your iPhone home screen. It opens full screen and works offline.
- **Accessible:** real buttons and labels, keyboard support, visible focus states, and animations switch off when *Reduce Motion* is on.

## Tech stack

- **HTML, CSS and vanilla JavaScript** (ES modules), with no frameworks or build tools
- **AniList GraphQL API** for search and title details
- **localStorage** for saving your list on the device
- **Service worker** and **web app manifest** for installing and offline use
- **Pointer Events** for swipe gestures, and the native **`<dialog>`** element for the edit panel
- Hosted on **GitHub Pages**

## How it works

| File | Job |
|---|---|
| `main.js` | App state and event handling: tabs, filters, swipes, the edit panel |
| `api.js` | Talks to the AniList GraphQL API and converts results into the app's format |
| `render.js` | Builds the list and search results on screen |
| `storage.js` | Saves and loads your list |
| `splash.js` | The launch splash screen |
| `sw.js` | Service worker: caching and offline support |

A few decisions worth noting:

- **Search waits until you stop typing** (400 ms debounce), so typing a title sends one request instead of one per letter. Replies that arrive out of order are ignored, so old results never replace newer ones.
- **The service worker is network-first** for the app's own files. When online you always get the latest version; offline, the saved copy is used. Cover images and fonts are cache-first, since they don't change.
- **Saved entries use AniList's data shape** (`mediaId`, `progress`, `status` values like `CURRENT` and `COMPLETED`), so syncing with an AniList account later won't need a rewrite.
- **The page turn** copies the current list, draws the new one, then rotates one of the two around its left edge in 3D.

## What I learned

- Working with a GraphQL API: writing queries, passing variables and shaping the response
- Debouncing input and handling out-of-order network responses
- How service workers cache files, why a cache-first strategy left my other app showing stale updates on iPhone, and how switching to network-first fixed it
- Debugging deployment problems: case-sensitive filenames on GitHub Pages, and an all-or-nothing cache install failing on one wrong path
- Building touch gestures with Pointer Events without breaking scrolling or taps
- Writing accessible UI: semantic buttons, labels, focus states and reduced motion

## Roadmap

- [ ] Log in with AniList (OAuth) and sync progress both ways, so progress logged in other apps appears automatically
- [ ] *Paused* and *Dropped* statuses
- [ ] New-episode alerts using AniList's airing schedule

## Running it locally

1. Clone the repo:
   ```bash
   git clone https://github.com/irm4n01/Kirodex.git
   ```
2. Open the folder in VS Code and start **Live Server** (ES modules and service workers need a local server; opening `index.html` directly won't work).

## Credits

Anime and manga data, including cover art, comes from [AniList](https://anilist.co) via its public API.