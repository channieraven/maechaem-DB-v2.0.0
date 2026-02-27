# ระบบบันทึกข้อมูลรายแปลง — แม่แจ่ม (Mae Chaem Tree Database)

A Progressive Web App (PWA) for recording and tracking tree growth data, GPS coordinates, and forest health in the Mae Chaem multi-purpose forest project. Built for field teams who often work in areas with limited or no internet connectivity.

---

## Features

- **Tree Growth Logging** — Record DBH, height, status, flowering, and yield data per tree per survey date.
- **Coordinate Management** — Enter and store UTM coordinates; auto-converts to Lat/Lng for map display.
- **Interactive Map** — Leaflet-based map showing tree locations by plot.
- **Statistics & Charts** — Recharts dashboards summarising growth trends, species distribution, and plot status.
- **History View** — Browse and filter past survey records.
- **Plot Information** — Per-plot overview including images stored in Supabase Storage.
- **User Authentication** — Register/login backed by Supabase Auth; per-user profile with admin approval flow.
- **Offline / PWA Support** — Service worker caches the app shell; submissions made offline are queued in `localStorage` and replayed automatically when connectivity returns.
- **Thai language UI** — All labels and messages are in Thai (Sarabun font).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite 7 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Maps | Leaflet + react-leaflet |
| Charts | Recharts |
| Icons | lucide-react |
| Backend / DB | Supabase (PostgreSQL) |
| Image storage | Supabase Storage |
| Dev server | Express (Node.js) + Vite middleware |
| PWA | Web App Manifest + Service Worker |

---

## Project Structure

```
├── src/
│   ├── components/       # Reusable UI components (auth, layout, plots, trees, …)
│   ├── contexts/         # React contexts (AuthContext, OfflineContext)
│   ├── hooks/            # Custom hooks (usePlots, useTrees, useGrowthLogs, …)
│   ├── lib/              # Supabase client, offline queue, database types
│   ├── pages/            # Top-level route pages
│   ├── App.tsx           # Router setup (BrowserRouter + protected routes)
│   ├── main.tsx          # React entry point
│   └── index.css         # Global styles (Tailwind import)
├── public/               # Static assets (manifest, service worker, icons, 404.html)
├── index.html            # HTML shell
├── server.js             # Express dev/production server
└── vite.config.ts        # Vite configuration
```

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

The app is served at `http://localhost:8080` by default.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL (from Settings → API) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key (from Settings → API) |

For local development, add the variables to a `.env` file in the project root:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

For GitHub Actions / GitHub Pages, add them as **repository variables** (not secrets) — see [`docs/supabase_env_setup.md`](docs/supabase_env_setup.md) for step-by-step instructions.

---

## Database Setup

> **Important:** The app requires the Supabase database schema to be initialised before login will work.  
> If you see **"ฐานข้อมูลยังไม่พร้อมใช้งาน"** (Database error querying schema) when trying to log in, the schema has not been applied yet.

### Applying the Schema

1. Open the **Supabase Dashboard** → your project → **SQL Editor**.
2. Open and run each migration file **in order**:

   | File | Contents |
   |------|----------|
   | `supabase/migrations/00001_initial_schema.sql` | Tables, enums, trigger, helper functions |
   | `supabase/migrations/00002_rls_policies.sql` | Row Level Security policies |
   | `supabase/migrations/00003_fix_handle_new_user_trigger.sql` | Improved trigger function |
   | `supabase/migrations/00004_plot_summary_rpc.sql` | `get_plot_summaries()` RPC |
   | `supabase/migrations/00005_admin_auto_approve.sql` | Auto-approve admin role changes |
   | `supabase/migrations/00006_ensure_handle_new_user_trigger.sql` | Reinstalls trigger (idempotent) |

3. After running the migrations:
   - The `profiles` table is created and a `handle_new_user` trigger will auto-create a profile row in `public.profiles` for every new sign-up in `auth.users`.
   - RLS policies are enabled so users can only access data they are authorised to see.

### First Admin User

The **first user to register** is automatically promoted to `admin` and marked as approved by the `handle_new_user` trigger — no manual SQL step is required.

If you need to promote an additional user to admin later, run this in the SQL Editor:

```sql
UPDATE public.profiles
SET role = 'admin', approved = true
WHERE email = 'your@email.com';
```

---

## Offline / PWA Mode

The app registers a service worker (`public/sw.js`) that:

1. **Pre-caches** the app shell on first install so the UI loads without a network connection.
2. Serves same-origin assets from the cache first; all external requests (Supabase, CDN) are passed through unchanged.
3. Falls back to the cached `index.html` for navigation requests when offline.

When a field worker submits data while offline, the payload is saved to a `localStorage` queue (`src/lib/offlineQueue.ts`). A yellow banner and sync badge appear in the header. When connectivity is restored, tapping **Sync** drains the queue in order and refreshes the data.

To install the app on a phone, open the live URL in Chrome or Safari and use **"Add to Home Screen"**.

---

## CI / Continuous Integration

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs automatically on every **push** and **pull request**:

| Step | Details |
|------|---------|
| Install | Uses `npm ci` when a lockfile is present, otherwise `npm install`. |
| Test | Runs `npm test` (currently a no-op placeholder). |
| Build | Always runs `npm run build` to confirm the production build succeeds. |

Node.js LTS is used, and `npm` dependencies are cached between runs.

---

## GitHub Pages Deployment

A second workflow (`.github/workflows/pages.yml`) builds the app and deploys it to **GitHub Pages** automatically on every push to the **`main`** (or **`master`**) branch. You can also trigger it manually from the **Actions** tab.

### Live URL

Once the workflow runs successfully, the site is available at:

```
https://channieraven.github.io/maechaem-DB-v2.0.0/
```

> **Note:** If you fork or rename this repository, replace `channieraven` and `maechaem-DB-v2.0.0` with your GitHub username and repository name respectively.

### How it works

1. Checks out the code and installs dependencies.
2. Runs `npm run build` (Vite outputs to `dist/`) with the correct `--base` path for GitHub Pages.
3. Uploads the `dist/` folder as a Pages artifact.
4. Deploys it with the official `actions/deploy-pages` action.

Deep-links (e.g. `/maechaem-DB-v2.0.0/plots/P01`) are handled by a `public/404.html` redirect so that users can bookmark or share direct links without seeing a blank page.

### Required GitHub repository settings

In your repository go to **Settings → Pages** and set **Source** to **"GitHub Actions"** — this is required for the deploy workflow to work.


trigger deploy 2
