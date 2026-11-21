(() => {
"use strict";
const cfg=window.BSP_SHOP_CONFIG||{},$=id=>document.getElementById(id),KEY="bsp_shop_profile_v1";
const blocked=new Set([".gb",".gbc",".gba",".nds",".3ds",".cia",".iso",".3dsx",".n64",".z64",".nes",".sfc",".smc"]);
$("year").textContent=new Date().getFullYear();
const profile=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"null")}catch{return null}};
const show=d=>d.showModal?d.showModal():d.setAttribute("open","");
const hide=d=>d.close?d.close():d.removeAttribute("open");
const note=(el,msg,type="")=>{el.textContent=msg;el.className=("notice "+type).trim()};
function updateAccount(){const p=profile();$("accountLabel").hidden=!p;$("accountLabel").textContent=p?"가입됨: "+p.name:"";$("signupOpen").textContent=p?"회원 정보":"회원 가입"}
$("signupOpen").onclick=()=>{const p=profile();if(p){$("signupForm").elements.memberName.value=p.name;$("signupForm").elements.birthDate.value=p.birthDate}show($("signupDialog"))};
$("uploadOpen").onclick=()=>{if(!profile()){show($("signupDialog"));return}show($("uploadDialog"))};
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>hide($(b.dataset.close)));
$("signupForm").addEventListener("submit",e=>{e.preventDefault();const f=e.currentTarget,n=f.elements.memberName.value.trim(),d=f.elements.birthDate.value;if(!n||!d)return;const date=new Date(d+"T00:00:00");if(Number.isNaN(date.getTime())||date>new Date()){alert("올바른 생년월일을 입력해 주세요.");return}localStorage.setItem(KEY,JSON.stringify({name:n,birthDate:d}));updateAccount();hide($("signupDialog"))});
$("packageFile").onchange=()=>{$("fileName").textContent=$("packageFile").files[0]?.name||".bsp 파일만 선택 가능"};
$("uploadForm").addEventListener("submit",async e=>{e.preventDefault();const status=$("uploadStatus"),btn=$("uploadButton"),f=e.currentTarget,file=$("packageFile").files[0],p=profile();
if(!p){hide($("uploadDialog"));show($("signupDialog"));return}
if(!file)return note(status,"파일을 선택해 주세요.","error");
const ext=file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
if(ext!==".bsp"||blocked.has(ext))return note(status,".bsp 파일만 업로드할 수 있어.","error");
if(!file.size||file.size>Number(cfg.maxUploadBytes||0))return note(status,"파일이 비어 있거나 20MB 제한을 초과했어.","error");
if(!cfg.apiBaseUrl||cfg.apiBaseUrl.includes("REPLACE_WITH"))return note(status,"Cloudflare Worker 주소가 config 설정에 없어. 배포 후 주소를 입력해 줘.","error");
const t=document.querySelector('[name="cf-turnstile-response"]')?.value;if(!t)return note(status,"스팸 방지 확인을 완료해 줘.","error");
const data=new FormData(f);data.set("package",file);data.set("turnstileToken",t);data.set("uploaderName",p.name);
btn.disabled=true;btn.textContent="업로드 중…";note(status,"검토 요청을 전송하고 있어…");
try{const r=await fetch(cfg.apiBaseUrl.replace(/\/$/,"")+"/api/submit",{method:"POST",body:data}),j=await r.json().catch(()=>({}));if(!r.ok)throw Error(j.error||"업로드 실패 ("+r.status+")");note(status,"제출 완료! 접수 번호: "+(j.id||"확인 중")+" · 관리자 검토 대기 중이야.","success");f.reset();$("fileName").textContent=".bsp 파일만 선택 가능";window.turnstile?.reset()}catch(err){note(status,err.message,"error");window.turnstile?.reset()}finally{btn.disabled=false;btn.textContent="검토 요청 제출"}
});
async function catalog(){const status=$("catalogStatus");try{const r=await fetch(cfg.catalogUrl,{cache:"no-store"});if(!r.ok)throw Error("HTTP "+r.status);const data=await r.json(),items=Array.isArray(data)?data:(data.packages||[]);window.bspItems=items;render(items);note(status,items.length+"개 패키지를 불러왔어.","success")}catch(e){note(status,"카탈로그를 불러오지 못했어: "+e.message,"error")}}
function render(items){const grid=$("catalogGrid");grid.replaceChildren();if(!items.length){grid.textContent="등록된 패키지가 없어.";return}items.forEach(x=>{const c=document.createElement("article");c.className="card";const h=document.createElement("h3");h.textContent=x.name||x.title||"이름 없음";const d=document.createElement("p");d.textContent=x.description||"설명 없음";const v=document.createElement("small");v.textContent=x.version||"";c.append(h,v,d);grid.append(c)})}
$("searchInput").addEventListener("input",e=>{const q=e.target.value.toLowerCase();render((window.bspItems||[]).filter(x=>[x.name,x.title,x.description].some(v=>String(v||"").toLowerCase().includes(q))))});
updateAccount();catalog();
})();