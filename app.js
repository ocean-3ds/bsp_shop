(() => {
  "use strict";

  const config = window.BSP_SHOP_CONFIG || {};
  const $ = (id) => document.getElementById(id);
  const blockedExtensions = new Set([
    ".gb", ".gbc", ".gba", ".nds", ".3ds", ".cia", ".iso",
    ".3dsx", ".n64", ".z64", ".nes", ".sfc", ".smc"
  ]);

  $("year").textContent = new Date().getFullYear();

  function setNotice(element, message, kind = "") {
    element.textContent = message;
    element.className = `notice ${kind}`.trim();
  }

  function escapeText(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }

  function renderPackages(items) {
    const grid = $("catalogGrid");
    grid.replaceChildren();
    if (!items.length) {
      grid.innerHTML = '<p class="muted">No packages found.</p>';
      return;
    }
    for (const item of items) {
      const card = document.createElement("article");
      card.className = "package-card";
      const name = escapeText(item.name || item.title || "Untitled package");
      const version = escapeText(item.version || "Version unavailable");
      const description = escapeText(item.description || "No description provided.");
      const developer = escapeText(item.developer || item.publisher || "Unknown publisher");
      card.innerHTML = `<div class="package-icon">BSP</div><h3>${name}</h3><p class="version">${version}</p><p>${description}</p><p class="developer">${developer}</p>`;
      grid.appendChild(card);
    }
  }

  let allPackages = [];
  async function loadCatalog() {
    const status = $("catalogStatus");
    try {
      if (!config.catalogUrl) throw new Error("Catalog URL is not configured.");
      const response = await fetch(config.catalogUrl, { cache: "no-store" });
      if (!response.ok) throw new Error(`Catalog request failed (${response.status}).`);
      const data = await response.json();
      allPackages = Array.isArray(data) ? data : (Array.isArray(data.packages) ? data.packages : []);
      renderPackages(allPackages);
      setNotice(status, `${allPackages.length} package(s) loaded.`, "success");
    } catch (error) {
      setNotice(status, `Could not load the catalog: ${error.message}`, "error");
    }
  }

  $("searchInput").addEventListener("input", (event) => {
    const query = event.target.value.trim().toLowerCase();
    renderPackages(allPackages.filter((item) =>
      [item.name, item.title, item.description, item.developer, item.publisher]
        .some((value) => String(value || "").toLowerCase().includes(query))
    ));
  });

  $("packageFile").addEventListener("change", () => {
    const file = $("packageFile").files[0];
    $("fileName").textContent = file ? file.name : "Choose a .bsp file";
  });

  $("uploadForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = $("uploadStatus");
    const button = $("uploadButton");
    const form = event.currentTarget;
    const file = $("packageFile").files[0];

    if (!file) return setNotice(status, "Choose a .bsp file first.", "error");
    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (extension !== ".bsp" || blockedExtensions.has(extension)) {
      return setNotice(status, "Rejected: only .bsp files are accepted.", "error");
    }
    if (file.size <= 0 || file.size > Number(config.maxUploadBytes || 0)) {
      return setNotice(status, "The file is empty or exceeds the 20 MB upload limit.", "error");
    }
    if (!config.apiBaseUrl || config.apiBaseUrl.includes("REPLACE_WITH")) {
      return setNotice(status, "Upload service is not configured yet. Set apiBaseUrl in config.js after deploying the Worker.", "error");
    }

    const tokenInput = document.querySelector('[name="cf-turnstile-response"]');
    const turnstileToken = tokenInput ? tokenInput.value : "";
    if (!turnstileToken) return setNotice(status, "Complete the anti-spam verification first.", "error");

    const formData = new FormData(form);
    formData.set("package", file);
    formData.set("turnstileToken", turnstileToken);

    button.disabled = true;
    button.textContent = "Uploading…";
    setNotice(status, "Sending package for review…");
    try {
      const response = await fetch(`${config.apiBaseUrl.replace(/\/$/, "")}/api/submit`, {
        method: "POST",
        body: formData
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || `Upload failed (${response.status}).`);
      setNotice(status, `Submission received. Reference: ${result.id || "pending"}. Your package is awaiting review.`, "success");
      form.reset();
      $("fileName").textContent = "Choose a .bsp file";
      if (window.turnstile) window.turnstile.reset();
    } catch (error) {
      setNotice(status, error.message, "error");
      if (window.turnstile) window.turnstile.reset();
    } finally {
      button.disabled = false;
      button.textContent = "Submit for review";
    }
  });

  loadCatalog();
})();
