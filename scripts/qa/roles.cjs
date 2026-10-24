// Admin permission matrix for every role, using temporary QA accounts (cleaned up afterwards).
// Needs a running build:  QA_BASE=http://localhost:3000 npm run qa:roles
const R=require("path").resolve(__dirname,"../..")+"/";
require(R+"node_modules/dotenv").config({path:R+".env.local",quiet:true});
const {Client}=require(R+"node_modules/pg");
const {createClient}=require(R+"node_modules/@supabase/supabase-js");
const crypto=require("crypto");
const BASE=process.env.QA_BASE||"http://localhost:3000";
const ref=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
const MATRIX={SUPER_ADMIN:["catalog","orders","customers","admins","audit","marketing","settings","reports"],ADMIN:["catalog","orders","customers","audit","marketing","settings","reports"],EDITOR:["catalog"],SUPPORT:["orders","customers"]};
const ROUTES=[["/admin",null],["/admin/profile",null],["/admin/products","catalog"],["/admin/products/new","catalog"],["/admin/inventory","catalog"],["/admin/collections","catalog"],["/admin/categories","catalog"],["/admin/pages","catalog"],["/admin/pages/privacy","catalog"],["/admin/faq","catalog"],["/admin/orders","orders"],["/admin/customers","customers"],["/admin/messages","customers"],["/admin/coupons","marketing"],["/admin/subscribers","marketing"],["/admin/reports","reports"],["/admin/settings","settings"],["/admin/audit","audit"],["/admin/admins","admins"],["/admin/export/orders","orders"],["/admin/export/products","catalog"],["/admin/export/customers","customers"],["/admin/export/subscribers","marketing"]];
const cookieFor=(session)=>{const v="base64-"+Buffer.from(JSON.stringify(session)).toString("base64url");const name=`sb-${ref}-auth-token`;if(v.length<=3180)return `${name}=${v}`;const parts=[];for(let i=0;i*3180<v.length;i++)parts.push(`${name}.${i}=${v.slice(i*3180,(i+1)*3180)}`);return parts.join("; ")};
(async()=>{
 const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false}});
 const db=new Client({connectionString:process.env.DIRECT_URL});await db.connect();
 const pw="Qa!"+crypto.randomBytes(9).toString("hex");
 const specs=[["EDITOR","qa-editor@example.com",true,true],["SUPPORT","qa-support@example.com",true,true],["ADMIN","qa-admin@example.com",true,true],["ADMIN","qa-inactive@example.com",false,true],["NONE","qa-nonadmin@example.com",null,false]];
 const created=[];const results=[];let fails=0;
 try{
  for(const [role,email,active,hasRow] of specs){
   const {data,error}=await sb.auth.admin.createUser({email,password:pw,email_confirm:true});if(error)throw error;created.push(data.user.id);
   if(hasRow)await db.query(`insert into "AdminUser"(id,"updatedAt",email,name,role,"isActive") values ($1,now(),$2,$3,$4,$5)`,[data.user.id,email,"QA "+role,role,active]);
  }
  const sessionOf=async(email)=>{const c=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false}});const {data,error}=await c.auth.signInWithPassword({email,password:pw});if(error)throw error;return data.session};
  const who=[["EDITOR","qa-editor@example.com"],["SUPPORT","qa-support@example.com"],["ADMIN","qa-admin@example.com"]];
  // real super admin: build session via admin-generated link? use a temp SUPER_ADMIN user instead
  const sa=await sb.auth.admin.createUser({email:"qa-super@example.com",password:pw,email_confirm:true});created.push(sa.data.user.id);
  await db.query(`insert into "AdminUser"(id,"updatedAt",email,name,role,"isActive") values ($1,now(),'qa-super@example.com','QA super','SUPER_ADMIN',true)`,[sa.data.user.id]);
  who.unshift(["SUPER_ADMIN","qa-super@example.com"]);
  for(const [role,email] of who){
   const cookie=cookieFor(await sessionOf(email));let bad=[];
   for(const [path,perm] of ROUTES){
    const r=await fetch(BASE+path,{headers:{cookie},redirect:"manual"});
    const allowed=perm===null||MATRIX[role].includes(perm);
    const loc=r.headers.get("location")||"";
    const expectOk=allowed? (r.status===200) : ((r.status===307||r.status===308)&&(loc.includes("denied=1")||loc.includes("/admin")) ) || r.status===403;
    if(!expectOk)bad.push(`${path} -> ${r.status} ${loc} (expected ${allowed?"200":"deny"})`);
   }
   results.push([bad.length?"FAIL":"PASS",`${role}: ${ROUTES.length} routes behave per permission matrix`,bad.join("; ")]);if(bad.length)fails++;
  }
  // inactive admin & non-admin must be bounced to login on every admin page
  for(const [label,email] of [["Deactivated admin","qa-inactive@example.com"],["Signed-in user without admin row","qa-nonadmin@example.com"]]){
   const cookie=cookieFor(await sessionOf(email));let bad=[];
   for(const [path] of ROUTES){const r=await fetch(BASE+path,{headers:{cookie},redirect:"manual"});const loc=r.headers.get("location")||"";if(!(r.status===307||r.status===308||r.status===401||r.status===403)||(r.status>=300&&r.status<400&&!loc.includes("/admin/login")&&!path.startsWith("/admin/export")))bad.push(`${path} -> ${r.status} ${loc}`)}
   results.push([bad.length?"FAIL":"PASS",`${label}: blocked from all ${ROUTES.length} admin routes`,bad.join("; ")]);if(bad.length)fails++;
  }
  // unauthenticated
  let bad=[];for(const [path] of ROUTES){const r=await fetch(BASE+path,{redirect:"manual"});const loc=r.headers.get("location")||"";if(!((r.status===307||r.status===308)&&loc.includes("/admin/login")))bad.push(`${path} -> ${r.status} ${loc}`)}
  results.push([bad.length?"FAIL":"PASS",`Anonymous visitor: redirected to login on all ${ROUTES.length} admin routes`,bad.join("; ")]);if(bad.length)fails++;
  // forged / tampered session
  const sess=await sessionOf("qa-editor@example.com");const forged={...sess,access_token:sess.access_token.slice(0,-3)+"abc"};
  const r=await fetch(BASE+"/admin/products",{headers:{cookie:cookieFor(forged)},redirect:"manual"});
  results.push([(r.status===307&&(r.headers.get("location")||"").includes("/admin/login"))?"PASS":"FAIL","Tampered session token is rejected",`status ${r.status}`]);
  // privilege escalation: editor cannot export orders (already covered) - check API health & export content-type for super admin
  const sc=cookieFor(await sessionOf("qa-super@example.com"));
  const ex=await fetch(BASE+"/admin/export/orders",{headers:{cookie:sc}});results.push([ex.headers.get("content-type")?.includes("text/csv")?"PASS":"FAIL","CSV export returns text/csv for permitted role",ex.headers.get("content-type")]);
 }finally{
  for(const id of created){await sb.auth.admin.deleteUser(id).catch(()=>{});}
  await db.query(`delete from "AdminUser" where email like 'qa-%@example.com'`);await db.query(`delete from "AuditLog" where "adminEmail" like 'qa-%'`);
  const left=(await db.query(`select count(*)::int n from "AdminUser" where email like 'qa-%'`)).rows[0].n;results.push([left===0?"PASS":"FAIL","QA accounts cleaned up","left: "+left]);
  await db.end();
 }
 for(const r of results)console.log(r.join(" | "));
 console.log("\n"+results.filter(r=>r[0]==="PASS").length+"/"+results.length+" passed");
})().catch(e=>{console.error("ERR",e);process.exit(1)});
