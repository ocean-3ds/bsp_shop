(() => {
"use strict";
const cfg = window.BSP_CONFIG;
const $ = id => document.getElementById(id);
let packages = [];
const translations = {
en:{loading:"Loading catalog…",loaded:"packages loaded",empty:"No packages found.",error:"Could not load the catalog.",sending:"Sending submission…",sent:"Submission received for review.",failed:"Upload failed.",all:"All categories",details:"Details",download:"Download"},
ko:{loading:"카탈로그 불러오는 중…",loaded:"개 패키지",empty:"검색 결과가 없습니다.",error:"카탈로그를 불러오지 못했습니다.",sending:"제출 중…",sent:"검토 요청이 접수되었습니다.",failed:"업로드에 실패했습니다.",all:"모든 카테고리",details:"상세 정보",download:"다운로드"},
ja:{loading:"読み込み中…",loaded:"件のパッケージ",empty:"見つかりません。",error:"カタログを読み込めません。",sending:"送信中…",sent:"審査用の提出を受け付けました。",failed:"アップロードに失敗しました。",all:"すべてのカテゴリ",details:"詳細",download:"ダウンロード"},
"zh-TW":{loading:"正在載入…",loaded:"個套件",empty:"找不到套件。",error:"無法載入目錄。",sending:"正在提交…",sent:"已收到審核提交。",failed:"上傳失敗。",all:"所有類別",details:"詳細資料",download:"下載"},
de:{loading:"Katalog wird geladen…",loaded:"Pakete geladen",empty:"Keine Pakete gefunden.",error:"Katalog konnte nicht geladen werden.",sending:"Wird gesendet…",sent:"Einreichung erhalten.",failed:"Upload fehlgeschlagen.",all:"Alle Kategorien",details:"Details",download:"Herunterladen"},
fr:{loading:"Chargement…",loaded:"paquets chargés",empty:"Aucun paquet trouvé.",error:"Catalogue indisponible.",sending:"Envoi…",sent:"Soumission reçue.",failed:"Échec de l’envoi.",all:"Toutes les catégories",details:"Détails",download:"Télécharger"},
es:{loading:"Cargando…",loaded:"paquetes cargados",empty:"No se encontraron paquetes.",error:"No se pudo cargar el catálogo.",sending:"Enviando…",sent:"Envío recibido.",failed:"Error al subir.",all:"Todas las categorías",details:"Detalles",download:"Descargar"},
pt:{loading:"Carregando…",loaded:"pacotes carregados",empty:"Nenhum pacote encontrado.",error:"Catálogo indisponível.",sending:"Enviando…",sent:"Envio recebido.",failed:"Falha no envio.",all:"Todas as categorias",details:"Detalhes",download:"Baixar"}
};
let lang = localStorage.getItem("bsp-language") || "en";
const tr = key => (translations[lang] || translations.en)[key] || translations.en[key];
const esc = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function fileUrl(file) {
  const f = String(file || "").replace(/^\/+/,"");
  if (!f.toLowerCase().endsWith(".bsp") || f.includes("..") || /^https?:/i.test(f)) return "";
  return new URL(f.split("/").map(encodeURIComponent).join("/"),cfg.packageBaseUrl).href;
}
async function loadCatalog() {
  $("catalogStatus").textContent = tr("loading");
  try {
    const r = await fetch(cfg.catalogUrl,{cache:"no-store"});
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    packages = Array.isArray(data) ? data : (data.packages || []);
    packages = packages.filter(p=>p && p.name && p.file && String(p.file).toLowerCase().endsWith(".bsp"));
    render();
  } catch(e) { console.error(e); $("catalogStatus").textContent=tr("error"); $("catalogGrid").innerHTML=""; }
}
function render() {
  const q=$("searchInput").value.trim().toLowerCase(), selected=$("categoryFilter").value, sort=$("sortSelect").value;
  const cats=[...new Set(packages.map(p=>p.category||"Other"))].sort();
  $("categoryFilter").innerHTML=`<option value="all">${esc(tr("all"))}</option>`+cats.map(c=>`<option>${esc(c)}</option>`).join("");
  $("categoryFilter").value=cats.includes(selected)?selected:"all";
  let list=packages.filter(p=>[p.name,p.description,p.category,p.version].join(" ").toLowerCase().includes(q)&&($("categoryFilter").value==="all"||(p.category||"Other")===$("categoryFilter").value));
  list.sort((a,b)=>sort==="newest"?String(b.updated||"").localeCompare(String(a.updated||"")):String(a.name).localeCompare(String(b.name)));
  $("catalogStatus").textContent=`${list.length} ${tr("loaded")}`;
  $("catalogGrid").innerHTML=list.length?list.map((p,i)=>`<article class="package-card"><div class="app-icon">${esc(String(p.name).slice(0,1).toUpperCase())}</div><div><small>${esc(p.category||"Other")}</small><h3>${esc(p.name)}</h3><p>${esc(p.description||"")}</p><small>v${esc(p.version||"1.0.0")}</small></div><button class="secondary detail-button" data-i="${i}">${esc(tr("details"))}</button></article>`).join(""):`<p class="muted">${esc(tr("empty"))}</p>`;
  $("catalogGrid").querySelectorAll(".detail-button").forEach(b=>b.addEventListener("click",()=>details(list[Number(b.dataset.i)])));
}
function details(p) {
  const url=fileUrl(p.file);
  $("detailContent").innerHTML=`<p class="eyebrow">${esc(p.category||"Other")}</p><h2>${esc(p.name)}</h2><p>${esc(p.description||"")}</p><p>Version: ${esc(p.version||"1.0.0")}</p>${url?`<a class="primary-link" href="${url}" download>${esc(tr("download"))}</a>`:""}`;
  $("detailDialog").showModal();
}
$("language").value=lang;
$("language").addEventListener("change",e=>{lang=e.target.value;localStorage.setItem("bsp-language",lang);render();});
$("searchInput").addEventListener("input",render);
$("categoryFilter").addEventListener("change",render);
$("sortSelect").addEventListener("change",render);
$("refreshButton").addEventListener("click",loadCatalog);
$("closeDialog").addEventListener("click",()=>$("detailDialog").close());
$("detailDialog").addEventListener("click",e=>{if(e.target===$("detailDialog"))$("detailDialog").close();});
$("uploadForm").addEventListener("submit",async e=>{
  e.preventDefault(); const form=e.currentTarget, fd=new FormData(form), file=fd.get("package"), status=$("uploadStatus");
  if(!(file instanceof File)||!file.name.toLowerCase().endsWith(".bsp")){status.textContent="Only .bsp files are accepted.";return;}
  if(file.size<1||file.size>cfg.maxUploadBytes){status.textContent="File must be 1 byte to 20 MB.";return;}
  const token=fd.get("cf-turnstile-response"); if(!token){status.textContent="Complete anti-bot verification.";return;}
  status.textContent=tr("sending");
  const body=new FormData(); ["name","version","category","description"].forEach(k=>body.append(k,fd.get(k)||""));
  body.append("package",file,file.name); body.append("cf-turnstile-response",token);
  try {
    const response=await fetch(cfg.workerApiUrl.replace(/\/$/,"")+"/api/submit",{method:"POST",body});
    const result=await response.json(); if(!response.ok)throw new Error(result.error||`HTTP ${response.status}`);
    status.textContent=tr("sent"); form.reset(); if(window.turnstile)window.turnstile.reset();
  } catch(err) { console.error(err); status.textContent=`${tr("failed")} ${err.message}`; }
});
loadCatalog();
})();