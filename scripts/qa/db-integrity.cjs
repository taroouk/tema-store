// Database integrity, RLS and public-API lockdown checks.   npm run qa:db
const R=require("path").resolve(__dirname,"../..")+"/";
require(R+"node_modules/dotenv").config({path:R+".env.local",quiet:true});
const {Client}=require(R+"node_modules/pg");
const {createClient}=require(R+"node_modules/@supabase/supabase-js");
const out=[];const ok=(n,pass,info="",level="FAIL")=>{out.push([pass?"PASS":level,n,info]);};
(async()=>{
 const c=new Client({connectionString:process.env.DIRECT_URL});await c.connect();
 const q=async(s)=> (await c.query(s)).rows;
 // RLS
 const t=await q(`select tablename,rowsecurity from pg_tables where schemaname='public' and tablename<>'_prisma_migrations'`);
 ok("RLS enabled on every table",t.every(x=>x.rowsecurity),`${t.length} tables; off: ${t.filter(x=>!x.rowsecurity).map(x=>x.tablename).join(",")||"none"}`);
 ok("No permissive RLS policies (server-only access)",(await q(`select count(*)::int n from pg_policies where schemaname='public'`))[0].n===0);
 // data integrity
 ok("No negative stock",(await q(`select count(*)::int n from "ProductVariant" where stock<0`))[0].n===0);
 ok("No negative reserved/usedCount",(await q(`select (select count(*) from "ProductVariant" where reserved<0)+(select count(*) from "Coupon" where "usedCount"<0) n`))[0].n==0);
 ok("Coupon usage never exceeds maxUses",(await q(`select count(*)::int n from "Coupon" where "maxUses" is not null and "usedCount">"maxUses"`))[0].n===0);
 ok("Order totals add up (subtotal - discount + shipping)",(await q(`select count(*)::int n from "Order" where total<>subtotal-discount+"shippingFee"`))[0].n===0);
 ok("Order subtotal equals its items",(await q(`select count(*)::int n from "Order" o where subtotal<>(select coalesce(sum("unitPrice"*quantity),0) from "OrderItem" i where i."orderId"=o.id)`))[0].n===0);
 ok("No orphan images/variants/items",(await q(`select ((select count(*) from "ProductImage" i where not exists(select 1 from "Product" p where p.id=i."productId"))+(select count(*) from "ProductVariant" v where not exists(select 1 from "Product" p where p.id=v."productId"))+(select count(*) from "OrderItem" i where not exists(select 1 from "Order" o where o.id=i."orderId")))::int n`))[0].n===0);
 const bad=await q(`select p.slug from "Product" p where p.status='ACTIVE' and p."deletedAt" is null and (not exists(select 1 from "ProductImage" i where i."productId"=p.id) or not exists(select 1 from "ProductVariant" v where v."productId"=p.id))`);
 ok("Every live product has an image and a variant",bad.length===0,bad.map(b=>b.slug).join(","));
 ok("Variant colours are valid hex",(await q(`select count(*)::int n from "ProductVariant" where "colorHex" !~ '^#[0-9a-fA-F]{3,8}$'`))[0].n===0);
 ok("Unique product slugs + SKUs",(await q(`select ((select count(*) from (select slug from "Product" group by slug having count(*)>1) a)+(select count(*) from (select sku from "ProductVariant" group by sku having count(*)>1) b))::int n`))[0].n===0);
 ok("Prices are positive",(await q(`select count(*)::int n from "Product" where price<=0`))[0].n===0);
 ok("StoreSettings single row",(await q(`select count(*)::int n from "StoreSettings"`))[0].n===1);
 ok("Category slugs match storefront (men/women/accessories)",(await q(`select count(*)::int n from "Category" where slug in ('men','women','accessories')`))[0].n===3);
 ok("Demo/test leftovers absent (e2e/ZZ rows)",(await q(`select ((select count(*) from "Customer" where email like 'e2e-%')+(select count(*) from "Product" where name like 'ZZ%')+(select count(*) from "Order" where email like 'e2e-%')+(select count(*) from "Subscriber" where email like 'e2e-%')+(select count(*) from "ContactMessage" where email like 'e2e-%'))::int n`))[0].n===0);
 // admins exist in Supabase auth
 const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false}});
 const {data:users}=await sb.auth.admin.listUsers({perPage:200});
 const admins=await q(`select id,email,role,"isActive" from "AdminUser"`);
 ok("Every AdminUser exists in Supabase Auth",admins.every(a=>users.users.some(u=>u.id===a.id)),`${admins.length} admins`);
 ok("At least one active SUPER_ADMIN",admins.some(a=>a.role==="SUPER_ADMIN"&&a.isActive));
 const stray=users.users.filter(u=>!admins.some(a=>a.id===u.id));
 ok("No stray Supabase users without admin rows",stray.length===0,stray.map(s=>s.email).join(","));
 // public API lockdown
 const anon=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false}});
 let leaked=[];
 for(const tb of t.map(x=>x.tablename)){
  const r=await anon.from(tb).select("*").limit(1);
  if(r.data&&r.data.length>0) leaked.push(tb);
  const w=await anon.from(tb).insert({}).select();
  if(w.data&&w.data.length>0) leaked.push(tb+"(write)");
 }
 ok("Anonymous key cannot read or write any table via REST",leaked.length===0,leaked.join(","));
 const lst=await anon.storage.from("payment-proofs").list("orders");
 ok("Payment-proof bucket is not listable by anonymous users",!lst.data||lst.data.length===0);
 const up=await anon.storage.from("products").upload("qa/x.png",new Blob(["x"]),{contentType:"image/png"});
 ok("Anonymous cannot upload to the product bucket",!!up.error,up.error?.message);
 const st=await (await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL+"/auth/v1/settings",{headers:{apikey:process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}})).json();
 ok("Public sign-ups disabled in Supabase Auth (no customer accounts exist)",st.disable_signup===true,"disable_signup="+st.disable_signup+" — harmless (no admin row = no access) but recommended off in Supabase → Authentication → Sign In / Providers","WARN");
 await c.end();
 for(const r of out)console.log(r.join(" | "));
 const fails=out.filter(r=>r[0]==="FAIL").length;console.log("\n"+out.filter(r=>r[0]==="PASS").length+"/"+out.length+" passed, "+out.filter(r=>r[0]==="WARN").length+" warning(s), "+fails+" failure(s)");process.exitCode=fails?1:0;
})().catch(e=>{console.error(e);process.exit(1)});
