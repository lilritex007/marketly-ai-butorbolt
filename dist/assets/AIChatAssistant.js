import{c as J,s as ie,g as oe,a as le,b as S,d as B,e as G,f as ce,j as t,M as de,S as me,X as he,C as ue,B as Z,T as ge,h as xe,P as pe,L as q,i as fe,t as be,k as ke,l as ye,m as ve,n as we}from"./index.js";import{r as h}from"./vendor.js";/**
 * @license lucide-react v0.456.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const je=J("Send",[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]]);/**
 * @license lucide-react v0.456.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ne=J("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]),Ee=({products:M,catalogProducts:E,onShowProducts:P})=>{var V;const[w,A]=h.useState(!1),[y,k]=h.useState([]),[j,C]=h.useState(""),[v,T]=h.useState(!1),I=h.useRef(null),N=h.useRef(null),K=h.useRef(0),p=E&&E.length>0?E:M,s=h.useMemo(()=>{if(!p||p.length===0)return null;const e={},n={under50k:0,under100k:0,under200k:0,over200k:0};let r=1/0,l=0,m=0;const i=new Set,u=new Set;p.forEach(a=>{const g=a.category||"Egyéb",c=g.split(" > ")[0];e[c]||(e[c]={count:0,subcategories:new Set,priceRange:{min:1/0,max:0}}),e[c].count++,g.includes(" > ")&&e[c].subcategories.add(g.split(" > ").slice(1).join(" > "));const x=a.salePrice||a.price||0;x>0&&(r=Math.min(r,x),l=Math.max(l,x),e[c].priceRange.min=Math.min(e[c].priceRange.min,x),e[c].priceRange.max=Math.max(e[c].priceRange.max,x),x<5e4?n.under50k++:x<1e5?n.under100k++:x<2e5?n.under200k++:n.over200k++),a.originalPrice&&a.originalPrice>x&&m++;const f=(a.name||"").toLowerCase();["modern","skandináv","rusztikus","klasszikus","minimalista","vintage"].forEach(b=>{f.includes(b)&&u.add(b)}),["fehér","fekete","szürke","barna","bézs","kék","zöld"].forEach(b=>{f.includes(b)&&i.add(b)})});const d=Object.entries(e).sort((a,g)=>g[1].count-a[1].count).slice(0,15).map(([a,g])=>({name:a,count:g.count,subcategories:Array.from(g.subcategories).slice(0,5),priceRange:g.priceRange}));return{total:M.length,categories:d,priceRange:{min:r,max:l},priceDistribution:n,onSaleCount:m,availableStyles:Array.from(u),availableColors:Array.from(i)}},[p]),Q=h.useCallback((e,n={})=>{if(!p||p.length===0)return{results:[],intent:null};const{limit:r=12}=n;return ie(p,e,{limit:r})},[p]),L=h.useCallback((e,n=6)=>p?p.filter(r=>(r.category||"").toLowerCase().includes(e.toLowerCase())).sort((r,l)=>(l.salePrice||l.price||0)-(r.salePrice||r.price||0)).slice(0,n):[],[p]),H=h.useMemo(()=>oe(),[p]),z=()=>(K.current+=1,`msg_${Date.now()}_${K.current}`);h.useEffect(()=>{var m,i,u,d,a,g;le();const e=S(3);B(2);const n=G();let r="",l=[];if(e.length>0){const c=e[0];r=`Szia újra! 👋

Látom, a "${c.name}" érdekelt.
`,c.price&&(r+=`💡 Hasonló árban (${Math.round(c.price/1e3)}k Ft körül) még több szuper darabot tudok mutatni!

`);const x=(m=c.category)==null?void 0:m.split(" > ")[0];x&&(l=L(x,4).filter(f=>f.id!==c.id)),r+=`📦 ${((i=s==null?void 0:s.total)==null?void 0:i.toLocaleString("hu-HU"))||0} termékből segítek kiválasztani a TÖKÉLETESET!`}else n!=null&&n.styleDNA?(r=`Szia! 👋 A Marketly AI tanácsadója vagyok.

`,r+=`✨ Látom, a ${n.styleDNA} stílust kedveled!
`,r+=`📦 ${((u=s==null?void 0:s.total)==null?void 0:u.toLocaleString("hu-HU"))||0} termék közül pont a NEKED valót keresem!

`,r+="💬 Mondd el, mit keresel, és máris ajánlok!"):(r=`Szia! 👋 A Marketly AI bútortanácsadója vagyok.

`,r+=`📦 ${((d=s==null?void 0:s.total)==null?void 0:d.toLocaleString("hu-HU"))||0} termék közül segítek választani!
`,r+=`💰 Árak: ${Math.round((((a=s==null?void 0:s.priceRange)==null?void 0:a.min)||0)/1e3)}k - ${Math.round((((g=s==null?void 0:s.priceRange)==null?void 0:g.max)||0)/1e3)}k Ft
`,(s==null?void 0:s.onSaleCount)>0&&(r+=`🏷️ ${s.onSaleCount} termék most AKCIÓBAN!

`),r+='💬 Kérdezz bátran - pl. "modern kanapé 150 ezer alatt"');k([{id:z(),role:"assistant",content:r,timestamp:new Date,products:l.length>0?l:void 0}])},[s,L]);const Y=()=>{var e;(e=I.current)==null||e.scrollIntoView({behavior:"smooth"})};h.useEffect(()=>{Y()},[y]),h.useEffect(()=>{w&&N.current&&setTimeout(()=>{var e;return(e=N.current)==null?void 0:e.focus()},100)},[w]);const D=(e,n)=>{var l;const r=y.find(m=>m.id===e);r&&(be(e,n,{query:r.userQuery||"",productCount:((l=r.products)==null?void 0:l.length)||0}),k(m=>m.map(i=>i.id===e?{...i,feedback:n?"positive":"negative"}:i)))},O=(e,n)=>{P&&P(e,n),A(!1)},F=async()=>{var r,l,m,i;if(!j.trim()||v)return;const e=j.trim();C(""),ke(e);const n=z();k(u=>[...u,{id:n,role:"user",content:e,timestamp:new Date}]),T(!0);try{const u=Q(e,{limit:12}),d=u.results||[],a=u.intent,g=ye(),c=S(3),x=B(3),f=G(),b=y.slice(-4).map(o=>`${o.role==="user"?"VÁSÁRLÓ":"TANÁCSADÓ"}: ${o.content.slice(0,150)}`).join(`
`),ee=(s==null?void 0:s.categories.slice(0,10).map(o=>`• ${o.name}: ${o.count} db (${Math.round(o.priceRange.min/1e3)}k - ${Math.round(o.priceRange.max/1e3)}k Ft)`).join(`
`))||"",te=d.length>0?d.slice(0,8).map(o=>{var $;return`• ${o.name} | ${(o.salePrice||o.price||0).toLocaleString("hu-HU")} Ft | ${(($=o.category)==null?void 0:$.split(" > ")[0])||"Egyéb"}${o.salePrice&&o.salePrice<o.price?" [AKCIÓ!]":""}`}).join(`
`):"Nem találtam pontos egyezést, de tudok ajánlani hasonlókat!",re=c.length>0?`Korábban nézett: ${c.map(o=>o.name).join(", ")}`:"",se=a?`
FELISMERT SZÁNDÉK:
- Termék típus: ${a.productTypes.join(", ")||"nincs megadva"}
- Stílus: ${a.styles.join(", ")||"nincs megadva"}
- Szín: ${a.colors.join(", ")||"nincs megadva"}
- Szoba: ${a.rooms.join(", ")||"nincs megadva"}
- Ártartomány: ${a.priceRange?`${a.priceRange.min.toLocaleString()} - ${a.priceRange.max===1/0?"∞":a.priceRange.max.toLocaleString()} Ft`:"nincs megadva"}
- Akciót keres: ${a.isOnSale?"IGEN":"nem"}`:"",ne=f!=null&&f.styleDNA?`Stílus preferencia: ${f.styleDNA}`:"",ae=`Te a Marketly bútorwebshop LEGJOBB AI tanácsadója vagy! A világ legokosabb bútorszakértője. Teljes kínálatot ismered.

===== WEBSHOP KATALÓGUS =====
📦 Összes termék: ${((r=s==null?void 0:s.total)==null?void 0:r.toLocaleString("hu-HU"))||0} db
💰 Árkategória: ${Math.round((((l=s==null?void 0:s.priceRange)==null?void 0:l.min)||0)/1e3)}k - ${Math.round((((m=s==null?void 0:s.priceRange)==null?void 0:m.max)||0)/1e3)}k Ft
🏷️ Akciós termékek: ${(s==null?void 0:s.onSaleCount)||0} db
🎨 Stílusok: ${((i=s==null?void 0:s.availableStyles)==null?void 0:i.join(", "))||"modern, skandináv, klasszikus"}

TOP KATEGÓRIÁK:
${ee}

===== VÁSÁRLÓ KÉRDÉSE =====
"${e}"
${se}

===== VÁSÁRLÓ PROFILJA =====
${g||"Új látogató"}
${ne}
${re}
Kedvelt kategóriák: ${x.join(", ")||"még nincs"}

===== BESZÉLGETÉS ELŐZMÉNYE =====
${b||"Új beszélgetés"}

===== TALÁLT TERMÉKEK (${d.length} db) =====
${te}

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

VÁLASZOLJ MOST a fenti szabályok szerint:`,R=await ve(ae,{temperature:.7,maxTokens:500}),U=z();if(R.success&&R.text)k(o=>[...o,{id:U,role:"assistant",content:R.text,timestamp:new Date,products:d.slice(0,8),userQuery:e}]),we(`${e.slice(0,50)}... kerestél.`);else{const o=d.length>0?d:L("kanapé",4);k($=>[...$,{id:U,role:"assistant",content:d.length>0?`Találtam ${d.length} terméket! 👇 Nézd meg őket lent, és kattints a részletekért!`:"Jelenleg nem tudok konkrét terméket ajánlani, de böngészd a kategóriákat a menüben!",timestamp:new Date,products:o,userQuery:e,isError:!d.length}])}}catch(u){console.error("Chat hiba:",u),k(d=>[...d,{id:z(),role:"assistant",content:"Elnézést, technikai hiba történt. Próbáld újra!",timestamp:new Date,isError:!0}])}finally{T(!1)}},X=e=>{e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),F())},_=h.useMemo(()=>{var m;const e=[];H.slice(0,2).forEach(i=>{e.push(i.text)});const n=S(2);if(n.length>0){const i=(m=n[0].category)==null?void 0:m.split(" > ")[0];i&&!e.some(u=>u.includes(i))&&e.push(`${i} 100 ezer alatt`)}const r=ce(2);return r.length>0&&r[0].query&&!e.includes(r[0].query)&&e.push(r[0].query),["Modern kanapé 150 ezer alatt","Skandináv stílusú bútorok","Akciós termékek","Hálószoba berendezés","Étkező bútorok"].forEach(i=>{e.length<5&&!e.includes(i)&&e.push(i)}),e.slice(0,5)},[H]),W=e=>(e||0).toLocaleString("hu-HU")+" Ft";return t.jsxs(t.Fragment,{children:[!w&&t.jsxs("button",{id:"mkt-butorbolt-chat",onClick:()=>A(!0),className:`
            fixed bottom-[calc(1.5rem+44px)] md:bottom-6 right-4 md:right-6 z-[100]
            w-14 h-14 md:w-16 md:h-16 rounded-full
            bg-gradient-to-br from-primary-500 to-secondary-700
            text-white shadow-2xl
            flex items-center justify-center
            transition-all duration-300
            hover:shadow-primary-500/50 hover:scale-110
            group
          `,"aria-label":"AI Chat megnyitása",children:[t.jsx(de,{className:"w-7 h-7"}),t.jsx("span",{className:"absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg",children:"AI"}),t.jsx("span",{className:"absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none",children:"AI Tanácsadó"})]}),w&&t.jsxs("div",{className:`
          fixed bottom-0 md:bottom-6 right-0 md:right-6 z-[9999]
          w-full md:w-[440px] h-[100dvh] md:h-[650px] md:max-h-[85vh]
          bg-white md:rounded-2xl shadow-2xl
          flex flex-col overflow-hidden border-0 md:border border-gray-200
        `,children:[t.jsxs("div",{className:"bg-gradient-to-r from-primary-500 to-secondary-700 p-4 flex items-center justify-between",children:[t.jsxs("div",{className:"flex items-center gap-3",children:[t.jsx("div",{className:"w-11 h-11 rounded-full bg-white/20 flex items-center justify-center",children:t.jsx(me,{className:"w-6 h-6 text-white"})}),t.jsxs("div",{children:[t.jsx("h3",{className:"text-white font-bold text-lg",children:"AI Tanácsadó"}),t.jsxs("p",{className:"text-white/80 text-xs flex items-center gap-1.5",children:[t.jsx("span",{className:"w-2 h-2 bg-green-400 rounded-full animate-pulse"}),((V=s==null?void 0:s.total)==null?void 0:V.toLocaleString("hu-HU"))||0," termék ismerete"]})]})]}),t.jsx("button",{onClick:()=>A(!1),className:"text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full","aria-label":"Bezárás",children:t.jsx(he,{className:"w-6 h-6"})})]}),t.jsxs("div",{className:"flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white",children:[y.map(e=>t.jsxs("div",{children:[t.jsxs("div",{className:`flex gap-3 ${e.role==="user"?"flex-row-reverse":""}`,children:[t.jsx("div",{className:`
                    w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm
                    ${e.role==="user"?"bg-primary-500":e.isError?"bg-orange-500":"bg-gradient-to-br from-primary-500 to-secondary-700"}
                  `,children:e.role==="user"?t.jsx(Ne,{className:"w-5 h-5 text-white"}):e.isError?t.jsx(ue,{className:"w-5 h-5 text-white"}):t.jsx(Z,{className:"w-5 h-5 text-white"})}),t.jsxs("div",{className:"max-w-[85%]",children:[t.jsx("div",{className:`
                      rounded-2xl p-3.5
                      ${e.role==="user"?"bg-primary-500 text-white rounded-tr-sm":"bg-white text-gray-800 rounded-tl-sm shadow-md border border-gray-100"}
                    `,children:t.jsx("p",{className:"text-sm whitespace-pre-wrap leading-relaxed",children:e.content})}),e.role==="assistant"&&!e.feedback&&!e.isError&&t.jsxs("div",{className:"flex items-center gap-1 mt-1.5 ml-1",children:[t.jsx("button",{onClick:()=>D(e.id,!0),className:"p-1.5 rounded-full hover:bg-green-100 text-gray-400 hover:text-green-600 transition-colors",title:"Hasznos volt",children:t.jsx(ge,{className:"w-3.5 h-3.5"})}),t.jsx("button",{onClick:()=>D(e.id,!1),className:"p-1.5 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors",title:"Nem volt hasznos",children:t.jsx(xe,{className:"w-3.5 h-3.5"})})]}),e.feedback&&t.jsx("div",{className:`text-[10px] mt-1 ml-1 ${e.feedback==="positive"?"text-green-600":"text-gray-400"}`,children:e.feedback==="positive"?"👍 Köszönjük!":"👎 Fejlődünk"})]})]}),e.products&&e.products.length>0&&t.jsxs("div",{className:"ml-12 mt-3",children:[t.jsxs("p",{className:"text-xs text-gray-500 mb-2 flex items-center gap-1.5 font-medium",children:[t.jsx(pe,{className:"w-3.5 h-3.5"}),e.products.length," termék - kattints a megtekintéshez:"]}),t.jsx("div",{className:"grid grid-cols-2 gap-2",children:e.products.slice(0,6).map(n=>{var r;return t.jsxs("button",{onClick:()=>O(n,e.products),className:"bg-white rounded-xl p-2.5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary-300 hover:-translate-y-0.5 transition-all text-left group",children:[t.jsxs("div",{className:"aspect-square bg-gray-50 rounded-lg mb-2 overflow-hidden relative",children:[t.jsx("img",{src:((r=n.images)==null?void 0:r[0])||n.image||'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f3f4f6" width="100" height="100"/></svg>',alt:n.name,className:"w-full h-full object-contain group-hover:scale-110 transition-transform duration-300",loading:"lazy",onError:l=>{l.target.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f3f4f6" width="100" height="100"/></svg>'}}),n.salePrice&&n.salePrice<n.price&&t.jsxs("span",{className:"absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded",children:["-",Math.round((1-n.salePrice/n.price)*100),"%"]})]}),t.jsx("p",{className:"text-xs font-medium text-gray-800 line-clamp-2 leading-tight mb-1",children:n.name}),t.jsx("p",{className:"text-sm font-bold text-primary-600",children:W(n.salePrice||n.price)})]},n.id)})}),e.products.length>6&&t.jsxs("button",{onClick:()=>O(e.products[0],e.products),className:"w-full mt-2 py-2.5 text-sm text-primary-600 hover:text-primary-700 font-semibold bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors",children:["+ ",e.products.length-6," további termék megtekintése →"]})]})]},e.id)),v&&t.jsxs("div",{className:"flex gap-3",children:[t.jsx("div",{className:"w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-secondary-700 flex items-center justify-center shadow-sm",children:t.jsx(Z,{className:"w-5 h-5 text-white"})}),t.jsx("div",{className:"bg-white rounded-2xl rounded-tl-sm p-4 shadow-md border border-gray-100",children:t.jsxs("div",{className:"flex items-center gap-3",children:[t.jsx(q,{className:"w-5 h-5 text-primary-500 animate-spin"}),t.jsx("span",{className:"text-sm text-gray-600",children:"Keresem a legjobb ajánlatokat..."})]})})]}),t.jsx("div",{ref:I})]}),y.length<=2&&t.jsxs("div",{className:"p-3 bg-gray-50 border-t border-gray-100",children:[t.jsxs("p",{className:"text-xs text-gray-500 mb-2 flex items-center gap-1.5 font-medium",children:[t.jsx(fe,{className:"w-3.5 h-3.5"}),"Népszerű keresések:"]}),t.jsx("div",{className:"flex flex-wrap gap-1.5",children:_.map((e,n)=>t.jsx("button",{onClick:()=>{var r;C(e),(r=N.current)==null||r.focus()},className:"px-3 py-1.5 text-xs bg-white text-gray-700 rounded-full hover:bg-primary-50 hover:text-primary-600 transition-colors border border-gray-200 hover:border-primary-300",children:e},n))})]}),t.jsx("div",{className:"p-4 bg-white border-t border-gray-200",children:t.jsxs("div",{className:"flex gap-2",children:[t.jsx("input",{ref:N,type:"text",value:j,onChange:e=>C(e.target.value),onKeyPress:X,placeholder:"Pl: Modern kanapé 100 ezer alatt...",className:`
                  flex-1 px-4 py-3.5 rounded-full
                  bg-gray-100 text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white
                  text-sm placeholder:text-gray-400
                  border border-transparent focus:border-primary-300
                `,disabled:v}),t.jsx("button",{onClick:F,disabled:!j.trim()||v,className:`
                  w-12 h-12 rounded-full
                  bg-gradient-to-br from-primary-500 to-secondary-700
                  text-white
                  flex items-center justify-center
                  transition-all
                  hover:scale-105 hover:shadow-lg
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                `,"aria-label":"Küldés",children:v?t.jsx(q,{className:"w-5 h-5 animate-spin"}):t.jsx(je,{className:"w-5 h-5"})})]})})]})]})};export{Ee as default};
//# sourceMappingURL=AIChatAssistant.js.map
