# BSP Shop — Rebuilt Edition

A static GitHub Pages storefront for free `.bsp` packages.

## 1. Create the repository

Create a **new public GitHub repository** named `bsp_shop` under `ocean-3ds`.

Upload the contents of this folder directly to the repository root. The root must look like this:

```text
bsp_shop/
├── index.html
├── config.js
├── app.js
├── styles.css
├── README.md
└── assets/
    └── favicon.svg
```

**Important:** Do not upload the `BSP_Shop_Rebuilt` parent folder itself. Upload the files and `assets` folder inside it. `index.html` must be at the repository root.

## 2. Enable GitHub Pages

Repository → Settings → Pages

- Build and deployment: Deploy from a branch
- Branch: `main`
- Folder: `/ (root)`
- Save

Wait for the Pages deployment to finish. The expected URL is:

`https://ocean-3ds.github.io/bsp_shop/`

## 3. BSP-files catalog connection

`config.js` currently points to:

`https://raw.githubusercontent.com/ocean-3ds/BSP-files/main/BSP-files/Metadata/catalog.json`

Package-relative paths are resolved from:

`https://raw.githubusercontent.com/ocean-3ds/BSP-files/main/BSP-files/`

If your BSP-files repository uses a different folder layout, edit these two URLs in `config.js` to match the actual repository structure.

## 4. Catalog format

The catalog can be a JSON array or an object containing `packages`, `apps`, `products`, or `items`.

Example:

```json
{
  "packages": [
    {
      "id": "example-calculator",
      "name": "Example Calculator",
      "description": "A simple calculator package.",
      "developer": "KY-Studio",
      "version": "1.0.0",
      "category": "Utilities",
      "featured": true,
      "file": "Packages/Utilities/example-calculator/example-calculator.bsp"
    }
  ]
}
```

`file` must point to a `.bsp` file. It may be a path relative to the configured packages base URL or a direct HTTP(S) URL. Parent-directory traversal (`..`) is rejected. Other file extensions are not offered as downloads.

## 5. Important security and platform limits

- The shop displays catalog entries and links to `.bsp` packages. It does **not** execute packages in the browser.
- This static website does not upload files to GitHub, authenticate users, verify age/identity, perform AI malware scans, or approve submissions. The profile is local browser convenience only.
- Do not put GitHub personal access tokens, private keys, signing secrets, payment secrets, or admin credentials in `config.js` or browser JavaScript.
- A client-side extension filter is not a security scanner. Validate package contents on a trusted server or controlled maintainer workflow before approval.
- Only publish reviewed `.bsp` packages in the public catalog. Reject ROM files and unrelated formats (including `.gb`, `.gbc`, `.gba`, `.nds`, `.3ds`, `.cia`, and `.iso`) in the repository review workflow.
- GitHub Pages is static hosting. Real account login, private download authorization, automated scanning, and safe file uploads require a trusted backend or GitHub-side maintainer workflow.

## 6. Troubleshooting

- If the entire site is 404: check that `index.html` is at the repository root and Pages is deployed from `main / (root)`.
- If the site opens but catalog fails: open the `catalogUrl` from `config.js` directly and confirm it returns JSON, not a GitHub HTML page or 404.
- If a product opens but download fails: confirm the catalog `file` path matches the exact `.bsp` location and filename in the BSP-files repository.
- After changing files, wait for the Pages deployment to complete and hard-refresh the browser (`Ctrl+F5`).
