
window.BSP_SHOP_CONFIG = Object.freeze({
    catalogUrl:
        "https://raw.githubusercontent.com/ocean-3ds/BSP-files/main/BSP-files/Metadata/catalog.json",

    apiBaseUrl:
        "https://YOUR-WORKER-NAME.YOUR-ACCOUNT.workers.dev",

    maxUploadBytes: 20 * 1024 * 1024,

    allowedExtensions: [".bsp"],

    blockedExtensions: [
        ".gb", ".gbc", ".gba",
        ".nds", ".3ds", ".cia", ".iso"
    ],

    defaultLanguage: "en",

    supportedLanguages: [
        "en", "ko", "ja", "zh-TW",
        "de", "fr", "es", "pt"
    ]
});