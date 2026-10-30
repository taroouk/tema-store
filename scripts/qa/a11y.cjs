// Accessibility (axe-core) scan of the server-rendered HTML of every page.
// Needs a running build:  QA_BASE=http://localhost:3000 npm run qa:a11y
const R=require("path").resolve(__dirname,"../..")+"/";
const {JSDOM}=require(R+"node_modules/jsdom");const axeSrc=require("fs").readFileSync(R+"node_modules/axe-core/axe.min.js","utf8");
const BASE=process.env.QA_BASE||"http://localhost:3000";
const pages=["/","/men","/women","/accessories","/new-in","/products/canvas-tote","/products/essential-oversized-tee","/cart","/checkout","/contact","/faq","/track","/privacy","/terms","/shipping","/returns","/about","/search?q=tee","/unsubscribe","/nope-404","/admin/login"];
function inlineStreamed(html){
 // put streamed Suspense content in place of its fallback (what a browser does once the stream finishes)
 return html.replace(/<!--\$\?--><template id="B:(\d+)"><\/template>([\s\S]*?)<!--\/\$-->/g,(m,n)=>{const re=new RegExp(`<div hidden id="S:${n}">([\\s\\S]*?)</div><script>`);const c=html.match(re);return c?c[1]:m});
}
(async()=>{
 const agg={};
 for(const p of pages){
  let html=await (await fetch(BASE+p)).text();html=inlineStreamed(html);
  const dom=new JSDOM(html,{runScripts:"outside-only",pretendToBeVisual:true});
  dom.window.eval(axeSrc);
  const r=await dom.window.axe.run(dom.window.document,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21a","wcag21aa","best-practice"]},rules:{"color-contrast":{enabled:false},"scrollable-region-focusable":{enabled:false}}});
  const v=r.violations.map(x=>`${x.id}(${x.impact})x${x.nodes.length}`);
  console.log(p.padEnd(36),v.length?v.join(", "):"clean");
  for(const x of r.violations){(agg[x.id]??={n:0,sample:null}).n+=x.nodes.length;agg[x.id].sample??=`${p} :: ${x.nodes[0].target.join(" ").slice(0,70)} :: ${x.help}`}
  dom.window.close();
 }
 console.log("\nDistinct issues:");for(const [k,v] of Object.entries(agg))console.log("-",k,v.n,"nodes →",v.sample);
})();
