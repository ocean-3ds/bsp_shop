const MAX_BYTES = 20 * 1024 * 1024;
const ALLOWED_ORIGIN = "https://YOUR-GITHUB-USERNAME.github.io";
const OWNER = "ocean-3ds";
const REPO = "BSP-files";
const BRANCH = "main";

function reply(data,status=200){
  return new Response(JSON.stringify(data),{status,headers:{
    "content-type":"application/json; charset=utf-8",
    "access-control-allow-origin":ALLOWED_ORIGIN,
    "access-control-allow-methods":"POST, OPTIONS",
    "access-control-allow-headers":"Content-Type",
    "vary":"Origin"
  }});
}
function clean(value,max=100){
  return String(value||"").trim().replace(/[\\\\/\\0-\\x1f]/g,"").slice(0,max);
}
function base64(bytes){
  let s=""; for(let i=0;i<bytes.length;i+=0x8000)s+=String.fromCharCode(...bytes.subarray(i,i+0x8000));
  return btoa(s);
}
async function verifyTurnstile(token,secret,ip){
  const body=new URLSearchParams({secret,response:token}); if(ip)body.set("remoteip",ip);
  const r=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body});
  if(!r.ok)return false; const result=await r.json(); return result.success===true;
}
async function putGithub(path,content,message,env){
  const r=await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`,{
    method:"PUT",headers:{
      authorization:`Bearer ${env.GITHUB_TOKEN}`,
      accept:"application/vnd.github+json",
      "content-type":"application/json",
      "x-github-api-version":"2022-11-28",
      "user-agent":"BSP-Shop"
    },
    body:JSON.stringify({message,content,branch:BRANCH})
  });
  const result=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(result.message||`GitHub API error ${r.status}`);
}
export default {
 async fetch(request,env){
  const origin=request.headers.get("Origin")||"";
  if(origin!==ALLOWED_ORIGIN)return reply({error:"Origin not allowed"},403);
  if(request.method==="OPTIONS")return new Response(null,{status:204,headers:{
    "access-control-allow-origin":ALLOWED_ORIGIN,
    "access-control-allow-methods":"POST, OPTIONS",
    "access-control-allow-headers":"Content-Type",
    "access-control-max-age":"86400","vary":"Origin"
  }});
  const url=new URL(request.url);
  if(request.method!=="POST"||url.pathname!=="/api/submit")return reply({error:"Not found"},404);
  if(!env.GITHUB_TOKEN||!env.TURNSTILE_SECRET)return reply({error:"Worker secrets are missing"},500);
  const length=Number(request.headers.get("content-length")||0);
  if(length>MAX_BYTES+200000)return reply({error:"Maximum upload size is 20 MB"},413);
  try{
    const form=await request.formData();
    const name=clean(form.get("name"),80),version=clean(form.get("version"),32);
    const category=clean(form.get("category"),40),description=String(form.get("description")||"").trim().slice(0,1000);
    const file=form.get("package"),token=String(form.get("cf-turnstile-response")||"");
    if(!name||!version||!category||!description)return reply({error:"Complete all fields"},400);
    if(!(file instanceof File)||!file.name.toLowerCase().endsWith(".bsp"))return reply({error:"Only .bsp files are accepted"},400);
    if(file.size<1||file.size>MAX_BYTES)return reply({error:"File must be 1 byte to 20 MB"},413);
    if(!token||!(await verifyTurnstile(token,env.TURNSTILE_SECRET,request.headers.get("CF-Connecting-IP"))))return reply({error:"Turnstile verification failed"},403);
    const safeFile=clean(file.name,100).replace(/[^a-zA-Z0-9._-]/g,"_");
    const id=`${Date.now()}-${crypto.randomUUID()}`;
    const filePath=`BSP-files/Pending/${id}-${safeFile}`;
    const metadataPath=`BSP-files/Pending/${id}.json`;
    const bytes=new Uint8Array(await file.arrayBuffer());
    await putGithub(filePath,base64(bytes),`BSP submission: ${name}`,env);
    const metadata={id,name,version,category,description,originalFileName:safeFile,file:filePath,status:"pending",submittedAt:new Date().toISOString()};
    await putGithub(metadataPath,base64(new TextEncoder().encode(JSON.stringify(metadata,null,2))),`BSP submission metadata: ${name}`,env);
    return reply({ok:true,id,message:"Submission queued for review"},201);
  }catch(error){return reply({error:error.message||"Upload failed"},500);}
 }
};