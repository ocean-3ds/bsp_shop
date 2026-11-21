# BSP Shop 2.1 — account and upload UI

## Website
Replace the files in the root of the `bsp_shop` GitHub repository with `index.html`, `app.js`, and `styles.css`. Publish GitHub Pages from `main / (root)`.

The header now contains **회원 가입** and **업로드**. Sign-up asks for name and date of birth. Upload opens a dialog, not an Issues page.

## Important account limitation
This implementation is a lightweight browser profile stored in `localStorage`. Date of birth is not transmitted to the Worker and is not stored in GitHub. It is not secure identity verification, a password account, or a cross-device login. A visitor can clear browser storage or create another profile. The uploader name is only attribution text, not proof of identity.

## Cloudflare setup
1. Create a Cloudflare Turnstile widget for hostname `ocean-3ds.github.io`.
2. Replace `REPLACE_WITH_TURNSTILE_SITE_KEY` in `index.html` with the public Site Key.
3. Deploy `worker` using Wrangler:
   `npm install -g wrangler`
   `cd worker`
   `wrangler login`
   `wrangler secret put GITHUB_TOKEN` (fine-grained token limited to `ocean-3ds/BSP-files`, Contents read/write)
   `wrangler secret put TURNSTILE_SECRET`
   `wrangler deploy`
4. Put the deployed Worker URL into `apiBaseUrl` in the inline config in `index.html`.
5. Replace the site files in GitHub and wait for Pages deployment.

Submissions are stored under `BSP-files/submissions/pending/` and are not published automatically. Only `.bsp` is accepted; ROM/disc extensions including `.iso` are rejected. Maximum file size is 20 MB.
