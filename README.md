# Eknoor Wadhwa — Portfolio

A single-page developer portfolio with a scroll- and mouse-reactive 3D
background built in three.js, plus tilt-on-hover project cards.

## Structure

```
index.html   — page content & markup
style.css    — design tokens, layout, animations
script.js    — three.js background scene, scroll/tilt interactions
```

No build step — it's plain HTML/CSS/JS plus two CDN scripts (three.js
and Google Fonts), so it works straight out of the repo.

## Running locally

Just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## Deploying with GitHub Pages

1. Push these three files to the root of a GitHub repo.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`,
   pick the `main` branch and `/ (root)` folder, then save.
4. GitHub gives you a live URL (usually within a minute or two) at
   `https://<your-username>.github.io/<repo-name>/`.

## Editing content

All the text (bio, projects, skills, contact links) lives directly in
`index.html` — search for the relevant section (`<section id="about">`,
`<section id="projects">`, etc.) and edit in place. Colors and fonts are
CSS custom properties at the top of `style.css` under `:root`.
