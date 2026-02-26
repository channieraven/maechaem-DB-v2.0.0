# GitHub Actions Variable Documentation

## Setting Up Supabase Environment Variables

To ensure that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correctly injected during the Vite build process and accessible via `import.meta.env.*` on GitHub Pages, follow these steps:

1. **Obtain your Supabase credentials**:
   Go to [app.supabase.com](https://app.supabase.com) → your project → **Settings → API** and copy:
   - **Project URL** (`VITE_SUPABASE_URL`) — e.g. `https://your-project-id.supabase.co`
   - **anon / public key** (`VITE_SUPABASE_ANON_KEY`)

2. **Add the variables to GitHub Actions**:
   In your GitHub repository, go to **Settings → Secrets and variables → Actions** and click the **Variables** tab, then click **New repository variable** for each:
   - **Name**: `VITE_SUPABASE_URL` | **Value**: your Project URL
   - **Name**: `VITE_SUPABASE_ANON_KEY` | **Value**: your anon/public key

   > **Note**: Use the **Variables** tab (not Secrets). These values are injected at build time and end up in the client bundle, so they are intentionally non-secret. Supabase Row Level Security (RLS) protects your data server-side.

3. **GitHub Actions Workflow**:
   The `pages.yml` workflow injects the variables during the build step:
   ```yaml
   - name: Build
     env:
       VITE_SUPABASE_URL: ${{ vars.VITE_SUPABASE_URL }}
       VITE_SUPABASE_ANON_KEY: ${{ vars.VITE_SUPABASE_ANON_KEY }}
     run: npm run build -- --base ${{ steps.setup_pages.outputs.base_path }}
   ```

4. **Frontend usage**:
   The variables are read in `src/lib/supabase.ts` as:
   ```ts
   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
   const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
   ```

### Notes
- If either variable is missing the app will log a warning and Supabase features will be unavailable (authentication, data reads/writes, image storage).
- For local development, add both variables to a `.env` file in the project root (see `.env.example`).

