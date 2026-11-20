const MAX_BYTES = 20 * 1024 * 1024;
const ALLOWED_ORIGIN = "https://ocean-3ds.github.io";
const BLOCKED = new Set([".gb",".gbc",".gba",".nds",".3ds",".cia",".iso",".3dsx",".n64",".z64",".nes",".sfc",".smc"]);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "https://ocean-3ds.github.io",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    }
  });
}
function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? ALLOWED_ORIGIN : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}
function safeName(name) {
  return name.normalize("NFKC").replace(/[^a-zA-Z0-9._-]/g, "_").replace(/^\.+/, "").slice(0, 100);
}
function toBase64(bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
async function verifyTurnstile(token, secret, ip) {
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST", body
  });
  const result = await response.json();
  return result.success === true;
}
async function githubRequest(path, token, body) {
  return fetch(`https://api.github.com/repos/${path}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "BSP-Shop-Upload"
    },
    body: JSON.stringify(body)
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (origin !== ALLOWED_ORIGIN) {
      return json({ error: "Origin not allowed." }, 403);
    }
    const url = new URL(request.url);
    if (request.method !== "POST" || url.pathname !== "/api/submit") {
      return json({ error: "Not found." }, 404);
    }

    try {
      if (!env.GITHUB_TOKEN || !env.TURNSTILE_SECRET) {
        return json({ error: "Upload service is not configured. Contact the site administrator." }, 503);
      }
      const form = await request.formData();
      const name = String(form.get("name") || "").trim();
      const version = String(form.get("version") || "").trim();
      const description = String(form.get("description") || "").trim();
      const developer = String(form.get("developer") || "").trim();
      const token = String(form.get("turnstileToken") || "");
      const file = form.get("package");

      if (!name || !version || !description || !developer || !(file instanceof File)) {
        return json({ error: "Complete all fields and choose a package file." }, 400);
      }
      if (!await verifyTurnstile(token, env.TURNSTILE_SECRET, request.headers.get("CF-Connecting-IP"))) {
        return json({ error: "Anti-spam verification failed. Please try again." }, 400);
      }

      const originalName = file.name || "";
      const dot = originalName.lastIndexOf(".");
      const extension = dot >= 0 ? originalName.slice(dot).toLowerCase() : "";
      if (extension !== ".bsp" || BLOCKED.has(extension)) {
        return json({ error: "Only .bsp package files are accepted. ROM and ISO files are prohibited." }, 415);
      }
      if (file.size <= 0 || file.size > MAX_BYTES) {
        return json({ error: "File must be between 1 byte and 20 MB." }, 413);
      }

      const bytes = new Uint8Array(await file.arrayBuffer());
      const id = `${new Date().toISOString().replace(/[:.]/g, "-")}-${crypto.randomUUID().slice(0, 8)}`;
      const filename = safeName(originalName);
      const path = `BSP-files/submissions/pending/${id}-${filename}`;
      const metadata = {
        id, name, version, description, developer,
        originalFilename: originalName,
        storedPath: path,
        submittedAt: new Date().toISOString(),
        status: "pending_review"
      };

      const upload = await githubRequest(
        `ocean-3ds/BSP-files/contents/${path}`,
        env.GITHUB_TOKEN,
        {
          message: `BSP Shop submission: ${name} ${version}`,
          content: toBase64(bytes),
          branch: env.GITHUB_BRANCH || "main"
        }
      );
      if (!upload.ok) {
        const detail = await upload.text();
        return json({ error: `GitHub rejected the upload (${upload.status}). Check repository permissions and branch settings.`, detail: detail.slice(0, 300) }, 502);
      }

      const metaPath = `BSP-files/submissions/pending/${id}.json`;
      const metaUpload = await githubRequest(
        `ocean-3ds/BSP-files/contents/${metaPath}`,
        env.GITHUB_TOKEN,
        {
          message: `BSP Shop submission metadata: ${name}`,
          content: toBase64(new TextEncoder().encode(JSON.stringify(metadata, null, 2))),
          branch: env.GITHUB_BRANCH || "main"
        }
      );
      if (!metaUpload.ok) {
        return json({ error: "Package uploaded, but metadata creation failed. An administrator must review the pending file.", id }, 502);
      }

      return json({ ok: true, id, status: "pending_review" }, 201);
    } catch (error) {
      return json({ error: "Unexpected upload error.", detail: String(error.message || error) }, 500);
    }
  }
};
