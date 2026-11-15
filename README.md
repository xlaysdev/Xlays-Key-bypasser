# Xlays Key Helper

A lightweight, responsive URL and link-gate helper built with plain HTML, CSS and JavaScript. No framework, build step, API key, or server required.

**Live preview:** enable GitHub Pages in the repository settings (Settings → Pages → Deploy from a branch → `main` → `/ (root)`).

## Features

- Responsive dark interface for desktop and mobile.
- Validates HTTP and HTTPS URLs locally in the browser.
- Recognizes LootLabs, Linkvertise, and Work.ink hostnames.
- Detects common embedded redirect destinations in URL parameters.
- Finds common tracking parameters and offers a cleaned URL to copy.
- Flags basic URL warning signs, including HTTP, punycode domains, IP-address hosts, and unusually deep subdomains.
- Opens the original link or an extracted destination in a new tab.
- No analytics, tracking, backend, or external link submissions.

## Run locally

Open `index.html` in a browser. For a local server, run:

```bash
python -m http.server 8080
```

Then visit http://localhost:8080.

## Important provider note

This project does **not** defeat, skip, or remove third-party keys, ads, surveys, subscriptions, or access controls. Those requirements are managed by each provider and the link publisher. The helper can identify known providers and analyze URL structure, but it cannot guarantee that a destination is safe or accessible.

URL analysis is local and heuristic. An extracted redirect destination is not fetched or verified. Only open links from sources you trust.

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
