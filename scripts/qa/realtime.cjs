// Live-update security + delivery test (uses temporary QA accounts, removed afterwards).   npm run qa:realtime
const R=require("path").resolve(__dirname,"../..")+"/";
require(R+"node_modules/dotenv").config({path:R+".env.local",quiet:true});
const {Client}=require(R+"node_modules/pg");const {createClient}=require(R+"node_modules/@supabase/supabase-js");const crypto=require("crypto");
const URL_=process.env.NEXT_PUBLIC_SUPABASE_URL,PUB=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,SEC=process.env.SUPABASE_SECRET_KEY;
const out=[];const ok=(n,p,i="")=>out.push([p?"PASS":"FAIL",n,i]);
const publish=async(title)=>{const r=await fetch(`${URL_}/realtime/v1/api/broadcast`,{method:"POST",headers:{apikey:SEC,Authorization:`Bearer ${SEC}`,"Content-Type":"application/json"},body:JSON.stringify({messages:[{topic:"admin-events",event:"admin",payload:{type:"order.new",title,scope:"orders",at:new Date().toISOString()},private:true}]})});return r.status};
async function listen(client,label,ms=4500){
 const got=[];let status="";
 const ch=client.channel("admin-events",{config:{private:true}}).on("broadcast",{event:"admin"},(m)=>got.push(m.payload.title));
 await new Promise(res=>{ch.subscribe((s)=>{status=s;if(["SUBSCRIBED","CHANNEL_ERROR","TIMED_OUT","CLOSED"].includes(s))res()});setTimeout(res,6000)});
 return {ch,got,status:()=>status};
}
(async()=>{
 const sb=createClient(URL_,SEC,{auth:{persistSession:false}});const db=new Client({connectionString:process.env.DIRECT_URL});await db.connect();
 const pw="Qa!"+crypto.randomBytes(9).toString("hex");const ids=[];
 try{
  const mk=async(email,admin,active=true)=>{const {data}=await sb.auth.admin.createUser({email,password:pw,email_confirm:true});ids.push(data.user.id);if(admin)await db.query(`insert into "AdminUser"(id,"updatedAt",email,name,role,"isActive") values ($1,now(),$2,'QA','SUPPORT',$3)`,[data.user.id,email,active]);
   const c=createClient(URL_,PUB,{auth:{persistSession:false}});const {data:s}=await c.auth.signInWithPassword({email,password:pw});c.realtime.setAuth(s.session.access_token);return c};
  const adminC=await mk("qa-rt-admin@example.com",true),plainC=await mk("qa-rt-user@example.com",false),offC=await mk("qa-rt-off@example.com",true,false);
  const anon=createClient(URL_,PUB,{auth:{persistSession:false}});
  const A=await listen(adminC),P=await listen(plainC),O=await listen(offC),N=await listen(anon);
  ok("Active admin can subscribe to the private channel",A.status()==="SUBSCRIBED",A.status());
  ok("Signed-in user without an admin row cannot subscribe",P.status()!=="SUBSCRIBED",P.status());
  ok("Deactivated admin cannot subscribe",O.status()!=="SUBSCRIBED",O.status());
  ok("Anonymous visitor cannot subscribe",N.status()!=="SUBSCRIBED",N.status());
  const st=await publish("hello admins");ok("Server can publish with the service key",st===202||st===200,"HTTP "+st);
  await new Promise(r=>setTimeout(r,2500));
  ok("Admin receives the event",A.got.includes("hello admins"),JSON.stringify(A.got));
  ok("Nobody else receives it",P.got.length+O.got.length+N.got.length===0,`user:${P.got.length} deactivated:${O.got.length} anon:${N.got.length}`);
  // browsers must not be able to publish
  const sent=await new Promise(res=>{const ch=adminC.channel("admin-events",{config:{private:true}});ch.subscribe(async s=>{if(s==="SUBSCRIBED"){const r=await ch.send({type:"broadcast",event:"admin",payload:{type:"order.new",title:"forged",scope:"orders",at:""}});res(r)}});setTimeout(()=>res("timeout"),6000)});
  await new Promise(r=>setTimeout(r,1500));
  ok("A browser cannot publish a forged event",!A.got.includes("forged"),"send() returned "+sent);
  for(const x of [A,P,O,N])await x.ch.unsubscribe();
 }catch(e){ok("test run",false,String(e))}finally{
  for(const id of ids)await sb.auth.admin.deleteUser(id).catch(()=>{});
  await db.query(`delete from "AdminUser" where email like 'qa-rt-%'`);await db.end();
  for(const r of out)console.log(r.join(" | "));const f=out.filter(r=>r[0]==="FAIL").length;console.log(`\n${out.length-f}/${out.length} passed`);setTimeout(()=>process.exit(f?1:0),500)}
})();
