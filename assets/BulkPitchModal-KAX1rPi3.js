import{r,j as e}from"./react-DNSylmp4.js";import{M as I,s as S,t as T,d as F}from"./index-CGOHAM4i.js";import{F as E,l as x,o as b,D as Y}from"./icons-DLB4ulan.js";function A(s){return`Subject: A quick idea for ${s.name}

Hi there,

I'm based locally in South Yorkshire and have been looking at the businesses Barnsley residents recommend most. ${s.name} came up repeatedly — ${s.reviewsCount} reviews at ${s.rating}★ is a strong reputation.

I noticed ${s.name} doesn't currently have a website. That means anyone searching after you've closed, or anyone new to the area, has no way to find your hours or get in touch without calling during the working day.

I've put together a short, no-obligation mock-up of what a simple site could look like — focused on making you easy to find, cutting down routine phone calls, and capturing enquiries you currently miss outside opening hours.

Would you be open to me sending it over? Two minutes to look at, and no hard feelings if it isn't for you.

All the best,
[Your name]`}function B(s){return`"Hello, could I speak with the owner or manager?

...

Hi! I'll keep this quick because I know you're busy. My name is [Your name], I'm local — based here in South Yorkshire.

I was looking at the most recommended businesses in ${s.area} and ${s.name} came up with ${s.reviewsCount} reviews at ${s.rating} stars, which is outstanding.

The reason I'm calling: I noticed you don't have a website, so anyone searching for you outside opening hours can't find your hours or get in touch. I've built a short preview of what a simple site could look like for ${s.name} — it wouldn't add any admin for you.

What's the best email address to send it to? I'll send it over and you can look whenever you get five minutes."`}function R({businesses:s,isOpen:u,onClose:g}){const[f,h]=r.useState(null),[w,m]=r.useState(!1),[y,j]=r.useState(""),d=r.useRef([]),v=()=>{d.current.forEach(t=>window.clearTimeout(t)),d.current=[]},a=r.useMemo(()=>s.map(t=>({business:t,email:A(t),phoneScript:B(t)})),[s]),i=a.find(t=>t.business.id===y)??a[0];if(!u||a.length===0||!i)return null;const k=t=>{t(),v(),d.current.push(window.setTimeout(()=>{h(null),m(!1)},2200))},p=async(t,o)=>{try{await navigator.clipboard.writeText(t),k(o)}catch{window.alert("Your browser blocked clipboard access. Use the download button instead.")}},$=()=>{const t=a.map(({business:n,email:c,phoneScript:N},C)=>`## ${C+1}. ${n.name}
- Sector: ${n.category}
- Location: ${n.area}, ${n.fullAddress} (${n.postcode})
- Phone: ${n.phone}
- Reputation: ${n.rating}★ (${n.reviewsCount} reviews)
- Opportunity score: ${n.opportunityScore}/100

### Email

\`\`\`
${c}
\`\`\`

### Phone script

\`\`\`
${N}
\`\`\`
`).join(`
---

`),o=`# Barnsley outreach pack

Generated: ${new Date().toLocaleString("en-GB")}
Businesses: ${a.length}

These are offline templates built from directory data. Replace [Your name] and check every detail against the business before sending.

---

`,l=a.length===1?`outreach_${S(a[0].business.name)}.md`:T(`barnsley_outreach_pack_${a.length}`,"md");F(l,o+t,"text/markdown")};return e.jsx(I,{isOpen:u,onClose:g,title:`Outreach pack — ${a.length} business${a.length===1?"":"es"}`,description:"Offline templates built from directory data. Check each one and replace [Your name] before sending.",className:"max-w-3xl",footer:e.jsxs("div",{className:"flex items-center justify-end gap-2 flex-wrap",children:[e.jsx("button",{type:"button",onClick:()=>void p(a.map(t=>`=== ${t.business.name} ===
${t.email}`).join(`

`),()=>m(!0)),className:"inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer",children:w?e.jsxs(e.Fragment,{children:[e.jsx(x,{className:"w-3.5 h-3.5 text-emerald-600","aria-hidden":"true"}),e.jsx("span",{children:"Copied all"})]}):e.jsxs(e.Fragment,{children:[e.jsx(b,{className:"w-3.5 h-3.5","aria-hidden":"true"}),e.jsx("span",{children:"Copy all emails"})]})}),e.jsxs("button",{type:"button",onClick:$,className:"inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold cursor-pointer",children:[e.jsx(Y,{className:"w-3.5 h-3.5","aria-hidden":"true"}),e.jsx("span",{children:"Download .md"})]})]}),children:e.jsxs("div",{className:"flex flex-col sm:flex-row",children:[e.jsx("nav",{"aria-label":"Businesses in this outreach pack",className:"sm:w-56 shrink-0 border-b sm:border-b-0 sm:border-r border-slate-200 max-h-48 sm:max-h-[50vh] overflow-y-auto",children:e.jsx("ul",{className:"list-none p-0 m-0",children:a.map((t,o)=>e.jsx("li",{children:e.jsxs("button",{type:"button",onClick:()=>j(t.business.id),"aria-current":t.business.id===i.business.id,className:`w-full text-left px-3 py-2.5 text-xs border-b border-slate-100 transition-colors cursor-pointer ${t.business.id===i.business.id?"bg-brand-50 text-brand-900 font-semibold":"text-slate-600 hover:bg-slate-50"}`,children:[e.jsx("span",{className:"block truncate",children:t.business.name}),e.jsxs("span",{className:"block text-[10px] text-slate-400 truncate",children:[o+1,". ",t.business.area," • ",t.business.rating,"★"]})]})},t.business.id))})}),e.jsx("div",{className:"flex-1 p-5 space-y-4 min-w-0",children:["email","phoneScript"].map(t=>{const o=a.findIndex(c=>c.business.id===i.business.id),l=i[t],n=t==="email"?"Email":"Phone script";return e.jsxs("section",{"aria-labelledby":`bulk-${t}-heading`,children:[e.jsxs("div",{className:"flex items-center justify-between mb-2 gap-2",children:[e.jsxs("h3",{id:`bulk-${t}-heading`,className:"text-xs font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1.5",children:[e.jsx(E,{className:"w-3.5 h-3.5","aria-hidden":"true"}),n]}),e.jsx("button",{type:"button",onClick:()=>void p(l,()=>h(o)),className:"inline-flex items-center gap-1 px-2 py-1 rounded border border-slate-300 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer",children:f===o?e.jsxs(e.Fragment,{children:[e.jsx(x,{className:"w-3 h-3 text-emerald-600","aria-hidden":"true"}),e.jsx("span",{children:"Copied"})]}):e.jsxs(e.Fragment,{children:[e.jsx(b,{className:"w-3 h-3","aria-hidden":"true"}),e.jsx("span",{children:"Copy"})]})})]}),e.jsx("pre",{className:"whitespace-pre-wrap font-sans text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3 leading-relaxed max-h-64 overflow-y-auto",children:l})]},t)})})]})})}export{R as BulkPitchModal};
