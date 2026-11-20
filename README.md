# BSP Shop 2.0 — upload-enabled source

This is a static GitHub Pages frontend plus a Cloudflare Worker upload API.
The frontend does **not** contain a GitHub token. The Worker stores the token as a secret.

## 1. Publish the website

1. Upload the contents of this folder to the root of the `bsp_shop` repository.
2. In GitHub, open **Settings → Pages**.
3. Select **Deploy from a branch**, branch `main`, folder `/(root)`.
4. Wait for deployment. The site URL should be `https://ocean-3ds.github.io/bsp_shop/`.

## 2. Create Cloudflare Turnstile keys

1. In Cloudflare dashboard, open Turnstile and add your BSP Shop domain.
2. Add `ocean-3ds.github.io` as an allowed hostname.
3. Copy the Site Key into `index.html`, replacing `REPLACE_WITH_TURNSTILE_SITE_KEY`.
4. Keep the Secret Key private; it goes into the Worker secret in step 3.

## 3. Deploy the Worker

Install Node.js and Wrangler, then open a terminal in the `worker` folder:

```bash
npm install -g wrangler
wrangler login
wrangler secret put GITHUB_TOKEN
# Paste a fine-grained GitHub token with Contents: Read and write
wrangler secret put TURNSTILE_SECRET
# Paste the Turnstile Secret Key
wrangler deploy
```

The GitHub token must belong to an account that can write to `ocean-3ds/BSP-files`.
Give it access only to that repository and only the required Contents permission.

## 4. Connect the frontend

After deployment, Wrangler prints a Worker URL similar to:

`https://bsp-shop-upload-api.YOUR_ACCOUNT.workers.dev`

Open `config.js` and replace `REPLACE_WITH_YOUR_CLOUDFLARE_WORKER_URL` with that URL. Commit and push the change.

## 5. Submission behavior

- Only `.bsp` extensions are accepted.
- `.gb`, `.gbc`, `.gba`, `.nds`, `.3ds`, `.cia`, `.iso` and other listed ROM/disc formats are rejected.
- Maximum upload size is 20 MB (GitHub Contents API limit is intentionally kept conservative).
- Accepted files and JSON metadata are written under `BSP-files/submissions/pending/`.
- Submissions are **not** added to the public catalog automatically. An administrator must review them and manually publish approved entries.
- The Worker only accepts requests from `https://ocean-3ds.github.io`.

## Important

This is a working source implementation, not an already-deployed service. The Worker will return a configuration error until the GitHub and Turnstile secrets are set. Do not put `GITHUB_TOKEN` or `TURNSTILE_SECRET` in `config.js`, `app.js`, or any public repository file.
