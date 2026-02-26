# ระบบบันทึกข้อมูลรายแปลง — แม่แจ่ม (Mae Chaem Tree Database)

A Progressive Web App (PWA) for recording and tracking tree growth data, GPS coordinates, and forest health in the Mae Chaem multi-purpose forest project. Built for field teams who often work in areas with limited or no internet connectivity.

---

## Features

- **Tree Growth Logging** — Record DBH, height, status, flowering, and yield data per tree per survey date.
- **Coordinate Management** — Enter and store UTM coordinates; auto-converts to Lat/Lng for map display.
- **Interactive Map** — Leaflet-based map showing tree locations by plot.
- **Statistics & Charts** — Recharts dashboards summarising growth trends, species distribution, and plot status.
- **History View** — Browse and filter past survey records.
- **Plot Information** — Per-plot overview including images uploaded to Cloudinary.
- **User Authentication** — Register/login backed by Google Apps Script; per-user profile.
- **Offline / PWA Support** — Service worker caches the app shell; submissions made offline are queued in `localStorage` and replayed automatically when connectivity returns.
- **Thai language UI** — All labels and messages are in Thai (Sarabun font).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite 7 |
| Styling | Tailwind CSS (CDN) |
| Maps | Leaflet + react-leaflet |
| Charts | Recharts |
| Icons | lucide-react |
| Backend / DB | Google Apps Script + Google Sheets |
| Image storage | Cloudinary |
| Dev server | Express (Node.js) |
| PWA | Web App Manifest + Service Worker |

---

## Local Development

### Prerequisites

- Node.js 20 or later (the CI workflow uses the current LTS)
- npm 9 or later

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Create a local environment file
cp .env.example .env   # or create .env manually (see Environment Variables below)

# 3. Start the dev server
npm run dev
```

The app is served at `http://localhost:3000` by default.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_APPS_SCRIPT_URL` | Deployed Google Apps Script web-app URL (data & auth backend) |

For local development, add the variable to a `.env` file in the project root:

```
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/<YOUR_DEPLOYMENT_ID>/exec
```

For GitHub Actions / GitHub Pages, add it as a **repository variable** (not a secret) — see [`docs/VITE_APPS_SCRIPT_URL_setup.md`](docs/VITE_APPS_SCRIPT_URL_setup.md) for step-by-step instructions.

---

## Offline / PWA Mode

The app registers a service worker (`public/sw.js`) that:

1. **Pre-caches** the app shell on first install so the UI loads without a network connection.
2. Serves same-origin assets from the cache first; all external requests (Apps Script, Cloudinary, CDN) are passed through unchanged.

When a field worker submits data while offline, the payload is saved to an `localStorage` queue (`utils/offlineQueue.ts`). A yellow banner and sync badge appear in the header. When connectivity is restored, tapping **Sync** drains the queue in order and refreshes the data.

To install the app on a phone, open the live URL in Chrome or Safari and use **"Add to Home Screen"**.

---

## CI / Continuous Integration

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs automatically on every **push** and **pull request**:

| Step | Details |
|------|---------|
| Install | Uses `npm ci` when a lockfile is present, otherwise `npm install`. |
| Lint | Runs `npm run lint` if that script is defined in `package.json`; otherwise skipped. |
| Test | Runs `npm test` in CI mode if a `test` script is defined; otherwise skipped. |
| Build | Always runs `npm run build` to confirm the production build succeeds. |

Node.js LTS is used, and `npm` dependencies are cached between runs.

---

## GitHub Pages Deployment

A second workflow (`.github/workflows/pages.yml`) builds the app and deploys it to **GitHub Pages** automatically on every push to the **`main`** (or **`master`**) branch. You can also trigger it manually from the **Actions** tab.

### Live URL

Once the workflow runs successfully, the site is available at:

```
https://channieraven.github.io/maechaem_DB_app-V1/
```

> **Note:** If you fork or rename this repository, replace `channieraven` and `maechaem_DB_app-V1` with your GitHub username and repository name respectively.

You can open this URL on your phone or any device — no computer required.

### How it works

1. Checks out the code and installs dependencies.
2. Runs `npm run build` (Vite outputs to `dist/`) with the correct `--base` path for GitHub Pages.
3. Uploads the `dist/` folder as a Pages artifact.
4. Deploys it with the official `actions/deploy-pages` action.

### Required GitHub repository settings

In your repository go to **Settings → Pages** and set **Source** to **"GitHub Actions"** — this is required for the deploy workflow to work.

trigger deploy 2
