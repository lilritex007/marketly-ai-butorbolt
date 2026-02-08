import{c as Y,p as de,f as me,s as ue,g as he,a as ge,b as T,d as J,e as Z,h as xe,j as t,M as pe,S as fe,X as ke,C as be,B as q,T as ye,i as ve,P as we,L as Q,k as je,t as Ne,l as ze,m as $e,n as Ce,o as Ee}from"./index.js";import{r as h}from"./vendor.js";/**
 * @license lucide-react v0.456.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ae=Y("Send",[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]]);/**
 * @license lucide-react v0.456.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Re=Y("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]),Te=({products:X,catalogProducts:R,onShowProducts:M,serverSearchMode:P=!1,totalProductsCount:I=0,categoryHierarchy:w})=>{var B;const[j,S]=h.useState(!1),[y,b]=h.useState([]),[N,L]=h.useState(""),[v,K]=h.useState(!1),D=h.useRef(null),z=h.useRef(null),O=h.useRef(0),g=R&&R.length>0?R:X,r=h.useMemo(()=>{if(!g||g.length===0){const l=((w==null?void 0:w.mainCategories)||[]).slice(0,15).map(c=>({name:c.name,count:Number(c.productCount||0),subcategories:Array.isArray(c.children)?c.children.slice(0,5).map(d=>d.name):[],priceRange:{min:0,max:0}}));return{total:I||0,categories:l,priceRange:{min:0,max:0},priceDistribution:{under50k:0,under100k:0,under200k:0,over200k:0},onSaleCount:0,availableStyles:[],availableColors:[]}}const e={},a={under50k:0,under100k:0,under200k:0,over200k:0};let s=1/0,n=0,m=0;const o=new Set,x=new Set;g.forEach(l=>{const c=l.category||"Egyéb",d=c.split(" > ")[0];e[d]||(e[d]={count:0,subcategories:new Set,priceRange:{min:1/0,max:0}}),e[d].count++,c.includes(" > ")&&e[d].subcategories.add(c.split(" > ").slice(1).join(" > "));const u=l.salePrice||l.price||0;u>0&&(s=Math.min(s,u),n=Math.max(n,u),e[d].priceRange.min=Math.min(e[d].priceRange.min,u),e[d].priceRange.max=Math.max(e[d].priceRange.max,u),u<5e4?a.under50k++:u<1e5?a.under100k++:u<2e5?a.under200k++:a.over200k++),l.originalPrice&&l.originalPrice>u&&m++;const p=(l.name||"").toLowerCase();["modern","skandináv","rusztikus","klasszikus","minimalista","vintage"].forEach(k=>{p.includes(k)&&x.add(k)}),["fehér","fekete","szürke","barna","bézs","kék","zöld"].forEach(k=>{p.includes(k)&&o.add(k)})});const f=Object.entries(e).sort((l,c)=>c[1].count-l[1].count).slice(0,15).map(([l,c])=>({name:l,count:c.count,subcategories:Array.from(c.subcategories).slice(0,5),priceRange:c.priceRange}));return{total:g.length,categories:f,priceRange:{min:s,max:n},priceDistribution:a,onSaleCount:m,availableStyles:Array.from(x),availableColors:Array.from(o)}},[g,I,w]),_=h.useCallback(async(e,a={})=>{const{limit:s=12}=a,n=de(e);if(P)try{return{results:(await me({search:e,limit:s,offset:0,slim:!1})).products||[],intent:n}}catch{return{results:[],intent:n}}return!g||g.length===0?{results:[],intent:n}:ue(g,e,{limit:s})},[g,P]),$=h.useCallback((e,a=6)=>g?g.filter(s=>(s.category||"").toLowerCase().includes(e.toLowerCase())).sort((s,n)=>(n.salePrice||n.price||0)-(s.salePrice||s.price||0)).slice(0,a):[],[g]),F=h.useMemo(()=>he(),[g]),C=()=>(O.current+=1,`msg_${Date.now()}_${O.current}`);h.useEffect(()=>{var m,o,x,f,l,c;ge();const e=T(3);J(2);const a=Z();let s="",n=[];if(e.length>0){const d=e[0];s=`Szia újra! 👋

Látom, a "${d.name}" érdekelt.
`,d.price&&(s+=`💡 Hasonló árban (${Math.round(d.price/1e3)}k Ft körül) még több szuper darabot tudok mutatni!

`);const u=(m=d.category)==null?void 0:m.split(" > ")[0];u&&(n=$(u,4).filter(p=>p.id!==d.id)),s+=`📦 ${((o=r==null?void 0:r.total)==null?void 0:o.toLocaleString("hu-HU"))||0} termékből segítek kiválasztani a TÖKÉLETESET!`}else a!=null&&a.styleDNA?(s=`Szia! 👋 A Marketly AI tanácsadója vagyok.

`,s+=`✨ Látom, a ${a.styleDNA} stílust kedveled!
`,s+=`📦 ${((x=r==null?void 0:r.total)==null?void 0:x.toLocaleString("hu-HU"))||0} termék közül pont a NEKED valót keresem!

`,s+="💬 Mondd el, mit keresel, és máris ajánlok!"):(s=`Szia! 👋 A Marketly AI bútortanácsadója vagyok.

`,s+=`📦 ${((f=r==null?void 0:r.total)==null?void 0:f.toLocaleString("hu-HU"))||0} termék közül segítek választani!
`,s+=`💰 Árak: ${Math.round((((l=r==null?void 0:r.priceRange)==null?void 0:l.min)||0)/1e3)}k - ${Math.round((((c=r==null?void 0:r.priceRange)==null?void 0:c.max)||0)/1e3)}k Ft
`,(r==null?void 0:r.onSaleCount)>0&&(s+=`🏷️ ${r.onSaleCount} termék most AKCIÓBAN!

`),s+='💬 Kérdezz bátran - pl. "modern kanapé 150 ezer alatt"');b([{id:C(),role:"assistant",content:s,timestamp:new Date,products:n.length>0?n:void 0}])},[r,$]);const W=()=>{var e;(e=D.current)==null||e.scrollIntoView({behavior:"smooth"})};h.useEffect(()=>{W()},[y]),h.useEffect(()=>{j&&z.current&&setTimeout(()=>{var e;return(e=z.current)==null?void 0:e.focus()},100)},[j]);const U=(e,a)=>{var n;const s=y.find(m=>m.id===e);s&&(Ne(e,a,{query:s.userQuery||"",productCount:((n=s.products)==null?void 0:n.length)||0}),b(m=>m.map(o=>o.id===e?{...o,feedback:a?"positive":"negative"}:o)))},V=(e,a)=>{M&&M(e,a),S(!1)},H=async()=>{var m,o,x,f;if(!N.trim()||v)return;const e=N.trim();L(""),ze(e);const a=C();b(l=>[...l,{id:a,role:"user",content:e,timestamp:new Date}]),K(!0);let s=[],n=null;try{const l=await _(e,{limit:12});s=l.results||[],n=l.intent;const c=$e(),d=T(3),u=J(3),p=Z(),k=y.slice(-4).map(i=>`${i.role==="user"?"VÁSÁRLÓ":"TANÁCSADÓ"}: ${i.content.slice(0,150)}`).join(`
`),re=(r==null?void 0:r.categories.slice(0,10).map(i=>`• ${i.name}: ${i.count} db (${Math.round(i.priceRange.min/1e3)}k - ${Math.round(i.priceRange.max/1e3)}k Ft)`).join(`
`))||"",ae=s.length>0?s.slice(0,8).map(i=>{var A;return`• ${i.name} | ${(i.salePrice||i.price||0).toLocaleString("hu-HU")} Ft | ${((A=i.category)==null?void 0:A.split(" > ")[0])||"Egyéb"}${i.salePrice&&i.salePrice<i.price?" [AKCIÓ!]":""}`}).join(`
`):"Nem találtam pontos egyezést, de tudok ajánlani hasonlókat!",ne=d.length>0?`Korábban nézett: ${d.map(i=>i.name).join(", ")}`:"",ie=n?`
FELISMERT SZÁNDÉK:
- Termék típus: ${n.productTypes.join(", ")||"nincs megadva"}
- Stílus: ${n.styles.join(", ")||"nincs megadva"}
- Szín: ${n.colors.join(", ")||"nincs megadva"}
- Szoba: ${n.rooms.join(", ")||"nincs megadva"}
- Ártartomány: ${n.priceRange?`${n.priceRange.min.toLocaleString()} - ${n.priceRange.max===1/0?"∞":n.priceRange.max.toLocaleString()} Ft`:"nincs megadva"}
- Akciót keres: ${n.isOnSale?"IGEN":"nem"}`:"",le=p!=null&&p.styleDNA?`Stílus preferencia: ${p.styleDNA}`:"",oe=`Te a Marketly bútorwebshop LEGJOBB AI tanácsadója vagy! A világ legokosabb bútorszakértője. Teljes kínálatot ismered.

===== WEBSHOP KATALÓGUS =====
📦 Összes termék: ${((m=r==null?void 0:r.total)==null?void 0:m.toLocaleString("hu-HU"))||0} db
💰 Árkategória: ${Math.round((((o=r==null?void 0:r.priceRange)==null?void 0:o.min)||0)/1e3)}k - ${Math.round((((x=r==null?void 0:r.priceRange)==null?void 0:x.max)||0)/1e3)}k Ft
🏷️ Akciós termékek: ${(r==null?void 0:r.onSaleCount)||0} db
🎨 Stílusok: ${((f=r==null?void 0:r.availableStyles)==null?void 0:f.join(", "))||"modern, skandináv, klasszikus"}

TOP KATEGÓRIÁK:
${re}

===== VÁSÁRLÓ KÉRDÉSE =====
"${e}"
${ie}

===== VÁSÁRLÓ PROFILJA =====
${c||"Új látogató"}
${le}
${ne}
Kedvelt kategóriák: ${u.join(", ")||"még nincs"}

===== BESZÉLGETÉS ELŐZMÉNYE =====
${k||"Új beszélgetés"}

===== TALÁLT TERMÉKEK (${s.length} db) =====
${ae}

===== VÁLASZOLÁSI SZABÁLYOK =====
1. ✅ Magyarul, tegezve, BARÁTSÁGOSAN és LELKESEN
2. ✅ Ha vannak termékek: KONKRÉTAN ajánlj 2-3 darabot NÉVVEL és ÁRRAL
3. ✅ Ha drágának találja: mutass olcsóbb alternatívát is
4. ✅ Adj PRO TIPPET (méret, kombináció, karbantartás)
5. ✅ Ha akciót keres: emeld ki a kedvezményeket!
6. ✅ MAX 4-5 mondat, LÉNYEGRE TÖRŐEN
7. ✅ Zárd: "👇 Kattints a termékekre lent a részletekért!"
8. ❌ NE használj markdown formázást (**bold** helyett CAPS)
9. ❌ NE kérdezz vissza, AJÁNLJ azonnal

VÁLASZOLJ MOST a fenti szabályok szerint:`;let E={success:!1,text:""};try{E=await Ce(oe,{temperature:.7,maxTokens:500})}catch(i){console.error("AI generateText error:",i)}const G=C();if(E.success&&E.text)b(i=>[...i,{id:G,role:"assistant",content:E.text,timestamp:new Date,products:s.slice(0,8),userQuery:e}]),Ee(`${e.slice(0,50)}... kerestél.`);else{const i=s.length>0?s:$("kanapé",4),A=s.length>0?`Találtam ${s.length} terméket! 👇 Nézd meg őket lent, és kattints a részletekért!`:"Jelenleg nem tudok konkrét terméket ajánlani, de böngészd a kategóriákat a menüben!";b(ce=>[...ce,{id:G,role:"assistant",content:A,timestamp:new Date,products:i,userQuery:e,isError:!s.length}])}}catch(l){console.error("Chat hiba:",l);const c=s.length>0?s:$("kanapé",4),d=s.length>0?`Találtam ${s.length} terméket! 👇 Nézd meg őket lent, és kattints a részletekért!`:"Jelenleg nem tudok konkrét terméket ajánlani, de böngészd a kategóriákat a menüben!";b(u=>[...u,{id:C(),role:"assistant",content:d,timestamp:new Date,products:c,userQuery:e,isError:!s.length}])}finally{K(!1)}},ee=e=>{e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),H())},te=h.useMemo(()=>{var m;const e=[];F.slice(0,2).forEach(o=>{e.push(o.text)});const a=T(2);if(a.length>0){const o=(m=a[0].category)==null?void 0:m.split(" > ")[0];o&&!e.some(x=>x.includes(o))&&e.push(`${o} 100 ezer alatt`)}const s=xe(2);return s.length>0&&s[0].query&&!e.includes(s[0].query)&&e.push(s[0].query),["Modern kanapé 150 ezer alatt","Skandináv stílusú bútorok","Akciós termékek","Hálószoba berendezés","Étkező bútorok"].forEach(o=>{e.length<5&&!e.includes(o)&&e.push(o)}),e.slice(0,5)},[F]),se=e=>(e||0).toLocaleString("hu-HU")+" Ft";return t.jsxs(t.Fragment,{children:[!j&&t.jsxs("button",{id:"mkt-butorbolt-chat",onClick:()=>S(!0),className:`
            fixed bottom-[calc(1.5rem+44px)] md:bottom-6 right-4 md:right-6 z-[100]
            w-14 h-14 md:w-16 md:h-16 rounded-full
            bg-gradient-to-br from-primary-500 to-secondary-700
            text-white shadow-2xl
            flex items-center justify-center
            transition-all duration-300
            hover:shadow-primary-500/50 hover:scale-110
            group
          `,"aria-label":"AI Chat megnyitása",children:[t.jsx(pe,{className:"w-7 h-7"}),t.jsx("span",{className:"absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg",children:"AI"}),t.jsx("span",{className:"absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none",children:"AI Tanácsadó"})]}),j&&t.jsxs("div",{className:`
          fixed bottom-0 md:bottom-6 right-0 md:right-6 z-[9999]
          w-full md:w-[440px] h-[100dvh] md:h-[650px] md:max-h-[85vh]
          bg-white md:rounded-2xl shadow-2xl
          flex flex-col overflow-hidden border-0 md:border border-gray-200
        `,children:[t.jsxs("div",{className:"bg-gradient-to-r from-primary-500 to-secondary-700 p-4 flex items-center justify-between",children:[t.jsxs("div",{className:"flex items-center gap-3",children:[t.jsx("div",{className:"w-11 h-11 rounded-full bg-white/20 flex items-center justify-center",children:t.jsx(fe,{className:"w-6 h-6 text-white"})}),t.jsxs("div",{children:[t.jsx("h3",{className:"text-white font-bold text-lg",children:"AI Tanácsadó"}),t.jsxs("p",{className:"text-white/80 text-xs flex items-center gap-1.5",children:[t.jsx("span",{className:"w-2 h-2 bg-green-400 rounded-full animate-pulse"}),((B=r==null?void 0:r.total)==null?void 0:B.toLocaleString("hu-HU"))||0," termék ismerete"]})]})]}),t.jsx("button",{onClick:()=>S(!1),className:"text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full","aria-label":"Bezárás",children:t.jsx(ke,{className:"w-6 h-6"})})]}),t.jsxs("div",{className:"flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white",children:[y.map(e=>t.jsxs("div",{children:[t.jsxs("div",{className:`flex gap-3 ${e.role==="user"?"flex-row-reverse":""}`,children:[t.jsx("div",{className:`
                    w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm
                    ${e.role==="user"?"bg-primary-500":e.isError?"bg-orange-500":"bg-gradient-to-br from-primary-500 to-secondary-700"}
                  `,children:e.role==="user"?t.jsx(Re,{className:"w-5 h-5 text-white"}):e.isError?t.jsx(be,{className:"w-5 h-5 text-white"}):t.jsx(q,{className:"w-5 h-5 text-white"})}),t.jsxs("div",{className:"max-w-[85%]",children:[t.jsx("div",{className:`
                      rounded-2xl p-3.5
                      ${e.role==="user"?"bg-primary-500 text-white rounded-tr-sm":"bg-white text-gray-800 rounded-tl-sm shadow-md border border-gray-100"}
                    `,children:t.jsx("p",{className:"text-sm whitespace-pre-wrap leading-relaxed",children:e.content})}),e.role==="assistant"&&!e.feedback&&!e.isError&&t.jsxs("div",{className:"flex items-center gap-1 mt-1.5 ml-1",children:[t.jsx("button",{onClick:()=>U(e.id,!0),className:"p-1.5 rounded-full hover:bg-green-100 text-gray-400 hover:text-green-600 transition-colors",title:"Hasznos volt",children:t.jsx(ye,{className:"w-3.5 h-3.5"})}),t.jsx("button",{onClick:()=>U(e.id,!1),className:"p-1.5 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors",title:"Nem volt hasznos",children:t.jsx(ve,{className:"w-3.5 h-3.5"})})]}),e.feedback&&t.jsx("div",{className:`text-[10px] mt-1 ml-1 ${e.feedback==="positive"?"text-green-600":"text-gray-400"}`,children:e.feedback==="positive"?"👍 Köszönjük!":"👎 Fejlődünk"})]})]}),e.products&&e.products.length>0&&t.jsxs("div",{className:"ml-12 mt-3",children:[t.jsxs("p",{className:"text-xs text-gray-500 mb-2 flex items-center gap-1.5 font-medium",children:[t.jsx(we,{className:"w-3.5 h-3.5"}),e.products.length," termék - kattints a megtekintéshez:"]}),t.jsx("div",{className:"grid grid-cols-2 gap-2",children:e.products.slice(0,6).map(a=>{var s;return t.jsxs("button",{onClick:()=>V(a,e.products),className:"bg-white rounded-xl p-2.5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary-300 hover:-translate-y-0.5 transition-all text-left group",children:[t.jsxs("div",{className:"aspect-square bg-gray-50 rounded-lg mb-2 overflow-hidden relative",children:[t.jsx("img",{src:((s=a.images)==null?void 0:s[0])||a.image||'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f3f4f6" width="100" height="100"/></svg>',alt:a.name,className:"w-full h-full object-contain group-hover:scale-110 transition-transform duration-300",loading:"lazy",onError:n=>{n.target.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f3f4f6" width="100" height="100"/></svg>'}}),a.salePrice&&a.salePrice<a.price&&t.jsxs("span",{className:"absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded",children:["-",Math.round((1-a.salePrice/a.price)*100),"%"]})]}),t.jsx("p",{className:"text-xs font-medium text-gray-800 line-clamp-2 leading-tight mb-1",children:a.name}),t.jsx("p",{className:"text-sm font-bold text-primary-600",children:se(a.salePrice||a.price)})]},a.id)})}),e.products.length>6&&t.jsxs("button",{onClick:()=>V(e.products[0],e.products),className:"w-full mt-2 py-2.5 text-sm text-primary-600 hover:text-primary-700 font-semibold bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors",children:["+ ",e.products.length-6," további termék megtekintése →"]})]})]},e.id)),v&&t.jsxs("div",{className:"flex gap-3",children:[t.jsx("div",{className:"w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-secondary-700 flex items-center justify-center shadow-sm",children:t.jsx(q,{className:"w-5 h-5 text-white"})}),t.jsx("div",{className:"bg-white rounded-2xl rounded-tl-sm p-4 shadow-md border border-gray-100",children:t.jsxs("div",{className:"flex items-center gap-3",children:[t.jsx(Q,{className:"w-5 h-5 text-primary-500 animate-spin"}),t.jsx("span",{className:"text-sm text-gray-600",children:"Keresem a legjobb ajánlatokat..."})]})})]}),t.jsx("div",{ref:D})]}),y.length<=2&&t.jsxs("div",{className:"p-3 bg-gray-50 border-t border-gray-100",children:[t.jsxs("p",{className:"text-xs text-gray-500 mb-2 flex items-center gap-1.5 font-medium",children:[t.jsx(je,{className:"w-3.5 h-3.5"}),"Népszerű keresések:"]}),t.jsx("div",{className:"flex flex-wrap gap-1.5",children:te.map((e,a)=>t.jsx("button",{onClick:()=>{var s;L(e),(s=z.current)==null||s.focus()},className:"px-3 py-1.5 text-xs bg-white text-gray-700 rounded-full hover:bg-primary-50 hover:text-primary-600 transition-colors border border-gray-200 hover:border-primary-300",children:e},a))})]}),t.jsx("div",{className:"p-4 bg-white border-t border-gray-200",children:t.jsxs("div",{className:"flex gap-2",children:[t.jsx("input",{ref:z,type:"text",value:N,onChange:e=>L(e.target.value),onKeyPress:ee,placeholder:"Pl: Modern kanapé 100 ezer alatt...",className:`
                  flex-1 px-4 py-3.5 rounded-full
                  bg-gray-100 text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white
                  text-sm placeholder:text-gray-400
                  border border-transparent focus:border-primary-300
                `,disabled:v}),t.jsx("button",{onClick:H,disabled:!N.trim()||v,className:`
                  w-12 h-12 rounded-full
                  bg-gradient-to-br from-primary-500 to-secondary-700
                  text-white
                  flex items-center justify-center
                  transition-all
                  hover:scale-105 hover:shadow-lg
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                `,"aria-label":"Küldés",children:v?t.jsx(Q,{className:"w-5 h-5 animate-spin"}):t.jsx(Ae,{className:"w-5 h-5"})})]})})]})]})};export{Te as default};
//# sourceMappingURL=AIChatAssistant.js.map
