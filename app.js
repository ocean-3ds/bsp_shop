(() => {
  "use strict";

  const CONFIG = window.BSP_SHOP_CONFIG || {};
  const $ = (selector) => document.querySelector(selector);
  const state = { products: [], language: localStorage.getItem("bsp_shop_language") || "en", category: "all", query: "", sort: "featured" };

  const TEXT = {
    en:{navExplore:"Explore",navSubmit:"Submit",eyebrow:"THE PACKAGE MARKETPLACE",heroTitle:'Find your next<br><span>great app.</span>',heroDescription:"Discover free apps and tools made for the Blue Shark ecosystem.",browseButton:"Browse packages",freeLabel:"Free packages",formatLabel:"Blue Shark Package",reviewLabel:"Reviewed submissions",discoverEyebrow:"DISCOVER",catalogTitle:"Explore packages",searchPlaceholder:"Search apps and tools…",allCategories:"All categories",sortFeatured:"Featured",sortName:"Name",sortNewest:"Newest",loading:"Loading catalog…",communityEyebrow:"FOR DEVELOPERS",submitTitle:"Share what<br>you've built.",submitDescription:"Submit a BSP package for review. Approved packages can be added to the public catalog.",submitCardTitle:"Submit a package",submitCardDescription:"Prepare your .bsp file and its listing details. A maintainer reviews every submission before publication.",openSubmission:"Open submission guide ↗",submitNote:"This static website does not upload files or run malware scans itself.",profileTitle:"Your profile",profileDisclaimer:"This profile is stored only in this browser. It is not a verified account or identity check.",nickname:"Nickname",birthdate:"Date of birth",saveProfile:"Save profile",clearProfile:"Clear local profile",empty:"No packages match your search.",catalogError:"The catalog could not be loaded. Check the catalog URL and repository file path.",noDescription:"No description provided.",download:"Download .BSP",details:"Details",version:"Version",developer:"Developer",category:"Category",updated:"Updated",formatError:"This item does not have a valid .bsp download file.",signIn:"Local profile",signedIn:"Hi",profileSaved:"Profile saved in this browser."},
    ko:{navExplore:"둘러보기",navSubmit:"제출하기",eyebrow:"패키지 마켓플레이스",heroTitle:'다음에 사용할<br><span>멋진 앱을 찾아보세요.</span>',heroDescription:"BLUE SHARK 생태계를 위한 무료 앱과 도구를 만나보세요.",browseButton:"패키지 둘러보기",freeLabel:"무료 패키지",formatLabel:"Blue Shark Package",reviewLabel:"검토 후 등록",discoverEyebrow:"둘러보기",catalogTitle:"패키지 탐색",searchPlaceholder:"앱과 도구 검색…",allCategories:"모든 카테고리",sortFeatured:"추천순",sortName:"이름순",sortNewest:"최신순",loading:"카탈로그 불러오는 중…",communityEyebrow:"개발자 공간",submitTitle:"직접 만든 것을<br>공유하세요.",submitDescription:"검토를 위해 BSP 패키지를 제출하세요. 승인된 패키지는 공개 카탈로그에 등록될 수 있습니다.",submitCardTitle:"패키지 제출",submitCardDescription:" .bsp 파일과 상품 정보를 준비하세요. 모든 제출물은 공개 전에 관리자의 검토를 받습니다.",openSubmission:"제출 안내 열기 ↗",submitNote:"이 정적 웹사이트는 파일을 직접 업로드하거나 악성코드 검사를 실행하지 않습니다.",profileTitle:"내 프로필",profileDisclaimer:"프로필은 이 브라우저에만 저장됩니다. 인증된 계정이나 본인 확인 기능이 아닙니다.",nickname:"닉네임",birthdate:"생년월일",saveProfile:"프로필 저장",clearProfile:"로컬 프로필 삭제",empty:"검색 결과가 없습니다.",catalogError:"카탈로그를 불러오지 못했습니다. 주소와 저장소 파일 경로를 확인하세요.",noDescription:"설명이 없습니다.",download:".BSP 다운로드",details:"상세 정보",version:"버전",developer:"개발자",category:"카테고리",updated:"업데이트",formatError:"올바른 .bsp 다운로드 파일이 등록되지 않았습니다.",signIn:"로컬 프로필",signedIn:"안녕하세요",profileSaved:"이 브라우저에 프로필을 저장했습니다."},
    ja:{navExplore:"探す",navSubmit:"提出",eyebrow:"パッケージマーケット",heroTitle:'次のお気に入り<br><span>アプリを見つけよう。</span>',heroDescription:"Blue Shark エコシステム向けの無料アプリとツール。",browseButton:"パッケージを見る",freeLabel:"無料パッケージ",formatLabel:"Blue Shark Package",reviewLabel:"審査後に公開",discoverEyebrow:"発見",catalogTitle:"パッケージを探す",searchPlaceholder:"アプリやツールを検索…",allCategories:"すべてのカテゴリ",sortFeatured:"おすすめ",sortName:"名前順",sortNewest:"新着順",loading:"カタログを読み込み中…",communityEyebrow:"開発者向け",submitTitle:"作ったものを<br>共有しよう。",submitDescription:"BSP パッケージを審査に提出できます。承認後、公開カタログに掲載されます。",submitCardTitle:"パッケージを提出",submitCardDescription:".bsp ファイルと掲載情報を準備してください。公開前に管理者が確認します。",openSubmission:"提出ガイドを開く ↗",submitNote:"この静的サイトはファイルのアップロードやマルウェア検査を実行しません。",profileTitle:"プロフィール",profileDisclaimer:"プロフィールはこのブラウザー内だけに保存されます。認証済みアカウントではありません。",nickname:"ニックネーム",birthdate:"生年月日",saveProfile:"保存",clearProfile:"ローカルプロフィールを削除",empty:"一致するパッケージはありません。",catalogError:"カタログを読み込めません。URL とファイルパスを確認してください。",noDescription:"説明はありません。",download:".BSP をダウンロード",details:"詳細",version:"バージョン",developer:"開発者",category:"カテゴリ",updated:"更新日",formatError:"有効な .bsp ファイルが登録されていません。",signIn:"ローカルプロフィール",signedIn:"こんにちは",profileSaved:"このブラウザーに保存しました。"},
    "zh-TW":{navExplore:"探索",navSubmit:"提交",eyebrow:"套件市集",heroTitle:'尋找下一個<br><span>實用好應用。</span>',heroDescription:"探索 BLUE SHARK 生態系的免費應用程式與工具。",browseButton:"瀏覽套件",freeLabel:"免費套件",formatLabel:"Blue Shark Package",reviewLabel:"審核後上架",discoverEyebrow:"探索",catalogTitle:"探索套件",searchPlaceholder:"搜尋應用程式與工具…",allCategories:"所有類別",sortFeatured:"推薦",sortName:"名稱",sortNewest:"最新",loading:"正在載入目錄…",communityEyebrow:"開發者專區",submitTitle:"分享你的<br>創作。",submitDescription:"提交 BSP 套件以供審核。核准後可加入公開目錄。",submitCardTitle:"提交套件",submitCardDescription:"準備 .bsp 檔案與商品資訊。每份提交都會在發布前由管理員審核。",openSubmission:"開啟提交指南 ↗",submitNote:"此靜態網站不會直接上傳檔案，也不會自行執行惡意軟體掃描。",profileTitle:"個人資料",profileDisclaimer:"資料僅儲存在此瀏覽器，並非經驗證的帳戶或身分確認。",nickname:"暱稱",birthdate:"出生日期",saveProfile:"儲存資料",clearProfile:"清除本機資料",empty:"找不到符合的套件。",catalogError:"無法載入目錄。請檢查網址與檔案路徑。",noDescription:"沒有提供說明。",download:"下載 .BSP",details:"詳細資訊",version:"版本",developer:"開發者",category:"類別",updated:"更新日期",formatError:"此項目沒有有效的 .bsp 下載檔案。",signIn:"本機個人資料",signedIn:"你好",profileSaved:"已儲存於此瀏覽器。"},
    de:{navExplore:"Entdecken",navSubmit:"Einreichen",eyebrow:"PAKET-MARKTPLATZ",heroTitle:'Finde deine nächste<br><span>großartige App.</span>',heroDescription:"Kostenlose Apps und Tools für das Blue-Shark-Ökosystem.",browseButton:"Pakete ansehen",freeLabel:"Kostenlose Pakete",formatLabel:"Blue Shark Package",reviewLabel:"Geprüfte Einreichungen",discoverEyebrow:"ENTDECKEN",catalogTitle:"Pakete entdecken",searchPlaceholder:"Apps und Tools suchen…",allCategories:"Alle Kategorien",sortFeatured:"Empfohlen",sortName:"Name",sortNewest:"Neueste",loading:"Katalog wird geladen…",communityEyebrow:"FÜR ENTWICKLER",submitTitle:"Teile, was du<br>entwickelt hast.",submitDescription:"Reiche ein BSP-Paket zur Prüfung ein. Genehmigte Pakete können im öffentlichen Katalog erscheinen.",submitCardTitle:"Paket einreichen",submitCardDescription:"Bereite deine .bsp-Datei und die Angebotsdetails vor. Jede Einreichung wird vor der Veröffentlichung geprüft.",openSubmission:"Einreichungsleitfaden ↗",submitNote:"Diese statische Website lädt keine Dateien hoch und führt selbst keine Malware-Scans aus.",profileTitle:"Dein Profil",profileDisclaimer:"Dieses Profil wird nur in diesem Browser gespeichert. Es ist kein verifiziertes Konto.",nickname:"Spitzname",birthdate:"Geburtsdatum",saveProfile:"Profil speichern",clearProfile:"Lokales Profil löschen",empty:"Keine passenden Pakete gefunden.",catalogError:"Katalog konnte nicht geladen werden. URL und Dateipfad prüfen.",noDescription:"Keine Beschreibung vorhanden.",download:".BSP herunterladen",details:"Details",version:"Version",developer:"Entwickler",category:"Kategorie",updated:"Aktualisiert",formatError:"Keine gültige .bsp-Datei für diesen Eintrag.",signIn:"Lokales Profil",signedIn:"Hallo",profileSaved:"Profil in diesem Browser gespeichert."},
    fr:{navExplore:"Explorer",navSubmit:"Soumettre",eyebrow:"BOUTIQUE DE PAQUETS",heroTitle:'Trouvez votre prochaine<br><span>application préférée.</span>',heroDescription:"Découvrez des applications et outils gratuits pour l’écosystème Blue Shark.",browseButton:"Parcourir",freeLabel:"Paquets gratuits",formatLabel:"Blue Shark Package",reviewLabel:"Soumis à validation",discoverEyebrow:"DÉCOUVRIR",catalogTitle:"Explorer les paquets",searchPlaceholder:"Rechercher des applications…",allCategories:"Toutes les catégories",sortFeatured:"À la une",sortName:"Nom",sortNewest:"Récents",loading:"Chargement du catalogue…",communityEyebrow:"POUR LES DÉVELOPPEURS",submitTitle:"Partagez vos<br>créations.",submitDescription:"Soumettez un paquet BSP pour examen. Les paquets approuvés peuvent rejoindre le catalogue public.",submitCardTitle:"Soumettre un paquet",submitCardDescription:"Préparez votre fichier .bsp et ses informations. Chaque soumission est examinée avant publication.",openSubmission:"Guide de soumission ↗",submitNote:"Ce site statique ne téléverse pas de fichiers et n’effectue pas lui-même d’analyse antivirus.",profileTitle:"Votre profil",profileDisclaimer:"Ce profil est stocké uniquement dans ce navigateur. Ce n’est pas un compte vérifié.",nickname:"Pseudo",birthdate:"Date de naissance",saveProfile:"Enregistrer",clearProfile:"Effacer le profil local",empty:"Aucun paquet correspondant.",catalogError:"Impossible de charger le catalogue. Vérifiez l’URL et le chemin.",noDescription:"Aucune description.",download:"Télécharger .BSP",details:"Détails",version:"Version",developer:"Développeur",category:"Catégorie",updated:"Mis à jour",formatError:"Aucun fichier .bsp valide pour cet élément.",signIn:"Profil local",signedIn:"Bonjour",profileSaved:"Profil enregistré dans ce navigateur."},
    es:{navExplore:"Explorar",navSubmit:"Enviar",eyebrow:"MERCADO DE PAQUETES",heroTitle:'Encuentra tu próxima<br><span>gran aplicación.</span>',heroDescription:"Descubre aplicaciones y herramientas gratuitas para el ecosistema Blue Shark.",browseButton:"Explorar paquetes",freeLabel:"Paquetes gratis",formatLabel:"Blue Shark Package",reviewLabel:"Envíos revisados",discoverEyebrow:"DESCUBRIR",catalogTitle:"Explorar paquetes",searchPlaceholder:"Buscar aplicaciones y herramientas…",allCategories:"Todas las categorías",sortFeatured:"Destacados",sortName:"Nombre",sortNewest:"Más recientes",loading:"Cargando catálogo…",communityEyebrow:"PARA DESARROLLADORES",submitTitle:"Comparte lo que<br>has creado.",submitDescription:"Envía un paquete BSP para revisión. Los paquetes aprobados pueden añadirse al catálogo público.",submitCardTitle:"Enviar un paquete",submitCardDescription:"Prepara tu archivo .bsp y los datos del listado. Cada envío se revisa antes de publicarse.",openSubmission:"Abrir guía de envío ↗",submitNote:"Este sitio estático no carga archivos ni ejecuta análisis de malware por sí mismo.",profileTitle:"Tu perfil",profileDisclaimer:"Este perfil solo se guarda en este navegador. No es una cuenta verificada.",nickname:"Apodo",birthdate:"Fecha de nacimiento",saveProfile:"Guardar perfil",clearProfile:"Borrar perfil local",empty:"No hay paquetes que coincidan.",catalogError:"No se pudo cargar el catálogo. Comprueba la URL y la ruta.",noDescription:"Sin descripción.",download:"Descargar .BSP",details:"Detalles",version:"Versión",developer:"Desarrollador",category:"Categoría",updated:"Actualizado",formatError:"Este elemento no tiene un archivo .bsp válido.",signIn:"Perfil local",signedIn:"Hola",profileSaved:"Perfil guardado en este navegador."},
    pt:{navExplore:"Explorar",navSubmit:"Enviar",eyebrow:"LOJA DE PACOTES",heroTitle:'Encontre seu próximo<br><span>grande aplicativo.</span>',heroDescription:"Descubra aplicativos e ferramentas gratuitos para o ecossistema Blue Shark.",browseButton:"Explorar pacotes",freeLabel:"Pacotes gratuitos",formatLabel:"Blue Shark Package",reviewLabel:"Envios revisados",discoverEyebrow:"DESCOBRIR",catalogTitle:"Explorar pacotes",searchPlaceholder:"Pesquisar aplicativos e ferramentas…",allCategories:"Todas as categorias",sortFeatured:"Destaques",sortName:"Nome",sortNewest:"Mais recentes",loading:"Carregando catálogo…",communityEyebrow:"PARA DESENVOLVEDORES",submitTitle:"Compartilhe o que<br>você criou.",submitDescription:"Envie um pacote BSP para análise. Pacotes aprovados podem entrar no catálogo público.",submitCardTitle:"Enviar um pacote",submitCardDescription:"Prepare seu arquivo .bsp e os detalhes da publicação. Cada envio é revisado antes de ser publicado.",openSubmission:"Abrir guia de envio ↗",submitNote:"Este site estático não envia arquivos nem executa verificações de malware por conta própria.",profileTitle:"Seu perfil",profileDisclaimer:"Este perfil fica armazenado apenas neste navegador. Não é uma conta verificada.",nickname:"Apelido",birthdate:"Data de nascimento",saveProfile:"Salvar perfil",clearProfile:"Limpar perfil local",empty:"Nenhum pacote corresponde à pesquisa.",catalogError:"Não foi possível carregar o catálogo. Verifique a URL e o caminho.",noDescription:"Nenhuma descrição fornecida.",download:"Baixar .BSP",details:"Detalhes",version:"Versão",developer:"Desenvolvedor",category:"Categoria",updated:"Atualizado",formatError:"Este item não possui um arquivo .bsp válido.",signIn:"Perfil local",signedIn:"Olá",profileSaved:"Perfil salvo neste navegador."}
  };

  const t = (key) => (TEXT[state.language] || TEXT.en)[key] || TEXT.en[key] || key;
  const safeText = (value) => String(value ?? "");
  const escapeHTML = (s) => safeText(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const first = (...values) => values.find(v => v !== undefined && v !== null && v !== "");
  const normalizeProduct = (p) => ({
    id: safeText(first(p.id,p.slug,p.package_id,p.name,Math.random().toString(36).slice(2))),
    name: safeText(first(p.name,p.title,p.display_name,"Untitled package")),
    description: first(p.description,p.summary,p.short_description,""),
    developer: safeText(first(p.developer,p.author,p.publisher,"Unknown developer")),
    version: safeText(first(p.version,p.package_version,"1.0.0")),
    category: safeText(first(p.category,p.type,"Other")),
    icon: safeText(first(p.icon,p.icon_url,"")),
    updated: safeText(first(p.updated,p.updated_at,p.release_date,"")),
    featured: Boolean(p.featured || p.is_featured),
    file: first(p.file,p.file_url,p.download_url,p.package_url,p.path,p.filename,""),
    raw: p
  });

  function packageUrl(product) {
    const file = safeText(product.file).trim();
    if (!file || !/\.bsp(?:$|[?#])/i.test(file)) return "";
    if (/^(https?:)?\/\//i.test(file)) {
      try { const u = new URL(file, location.href); return /\.bsp(?:$|[?#])/i.test(u.pathname) ? u.href : ""; } catch { return ""; }
    }
    const clean = file.replace(/^\.?\//,"").replace(/\\/g,"/");
    if (clean.split("/").some(part => part === "..")) return "";
    return new URL(clean, CONFIG.packagesBaseUrl).href;
  }

  function applyLanguage() {
    document.documentElement.lang = state.language;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const value = t(el.dataset.i18n);
      if (el.tagName === "OPTION") el.textContent = value; else el.innerHTML = value;
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => el.placeholder = t(el.dataset.i18nPlaceholder));
    $("#languageSelect").value = state.language;
    updateProfileButton();
    renderProducts();
  }

  function updateProfileButton() {
    const profile = getProfile();
    $("#profileButton").textContent = profile ? `${t("signedIn")}, ${profile.nickname}` : t("signIn");
  }
  function getProfile() { try { return JSON.parse(localStorage.getItem("bsp_shop_profile") || "null"); } catch { return null; } }

  function productCard(p) {
    const icon = p.icon && /^(https?:)?\/\//i.test(p.icon) ? `<img src="${escapeHTML(p.icon)}" alt="" loading="lazy" onerror="this.style.display='none'">` : `<span>${escapeHTML(p.name.slice(0,1).toUpperCase())}</span>`;
    return `<article class="product-card"><button class="card-main" type="button" data-product="${escapeHTML(p.id)}"><div class="product-icon">${icon}</div><div class="product-meta"><span>${escapeHTML(p.category)}</span><span class="free-tag">FREE</span></div><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(p.description || t("noDescription"))}</p><div class="card-footer"><span>${escapeHTML(p.developer)}</span><span>v${escapeHTML(p.version)}</span></div></button><button class="quick-download" type="button" data-download="${escapeHTML(p.id)}" aria-label="${escapeHTML(t("download"))}">↓</button></article>`;
  }

  function filteredProducts() {
    let items = [...state.products];
    if (state.category !== "all") items = items.filter(p => p.category === state.category);
    if (state.query) {
      const q = state.query.toLocaleLowerCase();
      items = items.filter(p => [p.name,p.description,p.developer,p.category].join(" ").toLocaleLowerCase().includes(q));
    }
    if (state.sort === "name") items.sort((a,b)=>a.name.localeCompare(b.name));
    if (state.sort === "newest") items.sort((a,b)=>String(b.updated).localeCompare(String(a.updated)));
    if (state.sort === "featured") items.sort((a,b)=>Number(b.featured)-Number(a.featured));
    return items;
  }

  function renderProducts() {
    const grid = $("#productGrid"); if (!grid) return;
    const items = filteredProducts();
    $("#resultCount").textContent = `${items.length} ${items.length === 1 ? "PACKAGE" : "PACKAGES"}`;
    grid.innerHTML = items.map(productCard).join("");
    if (!items.length && state.products.length) $("#catalogStatus").textContent = t("empty");
    else if (state.products.length) $("#catalogStatus").textContent = "";
  }

  function openProduct(p) {
    const url = packageUrl(p);
    $("#dialogContent").innerHTML = `<p class="eyebrow">${escapeHTML(p.category)}</p><h2>${escapeHTML(p.name)}</h2><p class="dialog-description">${escapeHTML(p.description || t("noDescription"))}</p><div class="detail-grid"><div><small>${t("version")}</small><b>${escapeHTML(p.version)}</b></div><div><small>${t("developer")}</small><b>${escapeHTML(p.developer)}</b></div><div><small>${t("category")}</small><b>${escapeHTML(p.category)}</b></div><div><small>${t("updated")}</small><b>${escapeHTML(p.updated || "—")}</b></div></div>${url ? `<a class="primary-button full-button" href="${escapeHTML(url)}" target="_blank" rel="noopener">${t("download")} ↓</a>` : `<p class="error-note">${t("formatError")}</p>`}`;
    $("#productDialog").showModal();
  }

  async function loadCatalog() {
    $("#catalogStatus").textContent = t("loading");
    try {
      if (!CONFIG.catalogUrl) throw new Error("catalogUrl is not configured");
      const response = await fetch(CONFIG.catalogUrl, {cache:"no-store"});
      if (!response.ok) throw new Error(`Catalog HTTP ${response.status}`);
      const data = await response.json();
      const list = Array.isArray(data) ? data : first(data.packages,data.apps,data.products,data.items,[]);
      if (!Array.isArray(list)) throw new Error("Catalog must contain an array");
      state.products = list.filter(p => p && typeof p === "object").map(normalizeProduct);
      const categories = [...new Set(state.products.map(p=>p.category).filter(Boolean))].sort();
      $("#categorySelect").innerHTML = `<option value="all">${t("allCategories")}</option>` + categories.map(c=>`<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`).join("");
      $("#catalogStatus").textContent = state.products.length ? "" : t("empty");
      renderProducts();
    } catch (error) {
      console.error("BSP Shop catalog error:", error);
      $("#catalogStatus").textContent = t("catalogError");
      $("#productGrid").innerHTML = `<div class="error-panel"><b>Catalog unavailable</b><p>${escapeHTML(error.message)}</p><a href="${escapeHTML(CONFIG.catalogUrl || "#")}" target="_blank" rel="noopener">Open catalog JSON ↗</a></div>`;
    }
  }

  $("#languageSelect").addEventListener("change", e => { state.language=e.target.value; localStorage.setItem("bsp_shop_language",state.language); applyLanguage(); });
  $("#searchInput").addEventListener("input",e=>{state.query=e.target.value.trim();renderProducts();});
  $("#categorySelect").addEventListener("change",e=>{state.category=e.target.value;renderProducts();});
  $("#sortSelect").addEventListener("change",e=>{state.sort=e.target.value;renderProducts();});
  $("#productGrid").addEventListener("click",e=>{
    const download = e.target.closest("[data-download]");
    const card = e.target.closest("[data-product]");
    const id = (download || card)?.dataset.download || card?.dataset.product;
    if (!id) return;
    const p=state.products.find(x=>x.id===id); if (!p) return;
    if (download) { const url=packageUrl(p); if(url) window.open(url,"_blank","noopener"); else alert(t("formatError")); }
    else openProduct(p);
  });
  $("#closeDialog").addEventListener("click",()=>$("#productDialog").close());
  $("#profileButton").addEventListener("click",()=>{
    const p=getProfile(); $("#nicknameInput").value=p?.nickname||""; $("#birthdateInput").value=p?.birthdate||"";
    $("#profileDialog").showModal();
  });
  $("#closeProfile").addEventListener("click",()=>$("#profileDialog").close());
  $("#profileForm").addEventListener("submit",e=>{
    e.preventDefault();
    const profile={nickname:$("#nicknameInput").value.trim(),birthdate:$("#birthdateInput").value};
    if(!profile.nickname||!profile.birthdate)return;
    localStorage.setItem("bsp_shop_profile",JSON.stringify(profile)); updateProfileButton(); $("#profileDialog").close(); alert(t("profileSaved"));
  });
  $("#signOutButton").addEventListener("click",()=>{localStorage.removeItem("bsp_shop_profile");updateProfileButton();$("#profileDialog").close();});
  $("#submitLink").href=CONFIG.submissionGuideUrl || CONFIG.repositoryUrl || "#";
  $("#year").textContent=new Date().getFullYear();
  applyLanguage();
  loadCatalog();
  if (CONFIG.catalogRefreshMs > 0) setInterval(loadCatalog, CONFIG.catalogRefreshMs);
})();
