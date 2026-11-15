# Xlays Link Helper

A lightweight, responsive link inspector built with plain HTML, CSS and JavaScript. No framework, build step, API key, or server required.

**Live preview:** enable GitHub Pages in the repository settings (Settings → Pages → Deploy from a branch → `main` → `/ (root)`).

## Features

- Responsive dark interface for desktop and mobile.
- Validates HTTP and HTTPS URLs locally in the browser.
- Recognizes LootLabs, Linkvertise, and Work.ink hostnames.
- Shows a provider-specific explanation and opens the original link.
- Copy URL action with clipboard feedback.
- No analytics, tracking, backend, or external link submissions.

## Run locally

Open `index.html` in a browser. For a local server, run:

```bash
python -m http.server 8080
```

Then visit http://localhost:8080.

## Important provider note

This project does **not** defeat, skip, or remove third-party keys, ads, surveys, subscriptions, or access controls. Those requirements are managed by each provider and the link publisher. The helper identifies known provider links and lets the user continue to the original provider page.

Only open links from sources you trust. A valid URL is not necessarily a safe URL.

## Project structure

```text
.
├── index.html
├── styles.css
├── app.js
├── README.md
├── LICENSE
└── .gitignore
```

## License

MIT — see [LICENSE](LICENSE).