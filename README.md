# BSP Shop full source

## Website deployment
1. Upload the contents of this folder to the root of a new GitHub Pages repository.
2. Open repository Settings > Pages.
3. Select Deploy from a branch, `main`, and `/(root)`.
4. In `config.js`, set `workerApiUrl` to your deployed Worker URL.

## Catalog format
Create `BSP-files/Metadata/catalog.json` in the `ocean-3ds/BSP-files` repository:

```json
{
  "packages": [
    {
      "name": "Example App",
      "version": "1.0.0",
      "category": "Utilities",
      "description": "Example BSP application",
      "file": "Applications/example.bsp",
      "updated": "2026-11-20"
    }
  ]
}
```
The `file` path is relative to `BSP-files/` and must end in `.bsp`.

## Turnstile
1. Create a Cloudflare Turnstile widget for your GitHub Pages domain.
2. Replace `YOUR_TURNSTILE_SITE_KEY` in `index.html` with the public site key.
3. Keep the Turnstile secret key private.

## Worker deployment
Install Node.js, then run:

```bash
npm install -g wrangler
cd worker
npx wrangler login
npx wrangler secret put GITHUB_TOKEN
npx wrangler secret put TURNSTILE_SECRET
npx wrangler deploy
```

Create a fine-grained GitHub token limited to `ocean-3ds/BSP-files`, with Contents read/write permission. Paste it only when Wrangler prompts for the secret. Never put it in browser JavaScript.

In `worker/src/index.js`, change `ALLOWED_ORIGIN` to the exact website origin, for example `https://ocean-3ds.github.io`. Then deploy. In `config.js`, replace `workerApiUrl` with the Worker URL.

## Submission handling
Uploads are placed under `BSP-files/Pending/` and are NOT automatically listed in the public catalog. Review each file, scan it, move approved packages to an approved directory, then add an entry to `Metadata/catalog.json`.

This starter checks the `.bsp` extension and 20 MB size, but does not prove package safety or validity. Inspect package contents before approval. Add Cloudflare rate limiting and a moderation workflow before opening uploads widely. Reject ROM extensions (.gb, .gbc, .gba, .nds, .3ds, .cia) and `.iso` files during review as well.
