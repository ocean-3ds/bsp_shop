/*
 * BSP Shop configuration.
 * Set apiBaseUrl to your deployed Cloudflare Worker URL.
 * Example: "https://bsp-upload-api.YOUR_ACCOUNT.workers.dev"
 */
window.BSP_SHOP_CONFIG = Object.freeze({
  catalogUrl: "https://raw.githubusercontent.com/ocean-3ds/BSP-files/main/BSP-files/Metadata/catalog.json",
  apiBaseUrl: "REPLACE_WITH_YOUR_CLOUDFLARE_WORKER_URL",
  maxUploadBytes: 20 * 1024 * 1024
});
