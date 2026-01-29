import{c as f,r,j as e,m as g,L as j,A as M}from"./index.js";/**
 * @license lucide-react v0.456.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const R=f("MicOff",[["line",{x1:"2",x2:"22",y1:"2",y2:"22",key:"a6p6uj"}],["path",{d:"M18.89 13.23A7.12 7.12 0 0 0 19 12v-2",key:"80xlxr"}],["path",{d:"M5 10v2a7 7 0 0 0 12 5",key:"p2k8kg"}],["path",{d:"M15 9.34V5a3 3 0 0 0-5.68-1.33",key:"1gzdoj"}],["path",{d:"M9 9v3a3 3 0 0 0 5.12 2.12",key:"r2i35w"}],["line",{x1:"12",x2:"12",y1:"19",y2:"22",key:"x3vr5v"}]]);/**
 * @license lucide-react v0.456.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=f("Mic",[["path",{d:"M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z",key:"131961"}],["path",{d:"M19 10v2a7 7 0 0 1-14 0v-2",key:"1vc78b"}],["line",{x1:"12",x2:"12",y1:"19",y2:"22",key:"x3vr5v"}]]);/**
 * @license lucide-react v0.456.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=f("Volume2",[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["path",{d:"M16 9a5 5 0 0 1 0 6",key:"1q6k2b"}],["path",{d:"M19.364 18.364a9 9 0 0 0 0-12.728",key:"ijwkga"}]]),z=({onSearchQuery:w,className:b=""})=>{const[n,o]=r.useState(!1),[u,m]=r.useState(""),[p,h]=r.useState(!1),[i,a]=r.useState(null),t=r.useRef(null);r.useEffect(()=>{if(!("webkitSpeechRecognition"in window)&&!("SpeechRecognition"in window)){a("A böngésző nem támogatja a hangfelismerést.");return}const x=window.SpeechRecognition||window.webkitSpeechRecognition;return t.current=new x,t.current.continuous=!1,t.current.interimResults=!0,t.current.lang="hu-HU",t.current.onresult=s=>{let l="",c="";for(let d=s.resultIndex;d<s.results.length;d++){const y=s.results[d][0].transcript;s.results[d].isFinal?c+=y:l+=y}m(c||l),c&&k(c)},t.current.onerror=s=>{o(!1),s.error==="no-speech"?a("Nem hallottam semmit. Próbáld újra!"):s.error==="not-allowed"?a("Mikrofon hozzáférés megtagadva."):a(`Hiba: ${s.error}`),setTimeout(()=>a(null),3e3)},t.current.onend=()=>{o(!1)},()=>{t.current&&t.current.stop()}},[]);const k=async x=>{var s;h(!0),(s=window.navigator)!=null&&s.vibrate&&window.navigator.vibrate(50);try{const l=x.trim().toLowerCase();w&&await w(l),setTimeout(()=>{m(""),h(!1)},2e3)}catch{a("Nem sikerült feldolgozni a keresést."),h(!1)}},N=()=>{t.current&&(n?(t.current.stop(),o(!1)):(m(""),a(null),t.current.start(),o(!0)))};return e.jsxs("div",{className:`relative ${b}`,children:[e.jsxs(g.button,{onClick:N,disabled:p||!!i,className:`
          relative overflow-hidden
          p-3 rounded-full
          transition-all duration-300
          ${n?"bg-red-500 text-white shadow-lg shadow-red-500/50":"bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"}
          disabled:opacity-50 disabled:cursor-not-allowed
        `,whileHover:{scale:1.05},whileTap:{scale:.95},children:[p?e.jsx(j,{className:"w-5 h-5 animate-spin"}):n?e.jsx(R,{className:"w-5 h-5"}):e.jsx(S,{className:"w-5 h-5"}),n&&e.jsx(g.div,{className:"absolute inset-0 bg-red-500 rounded-full",animate:{scale:[1,1.5,1],opacity:[.5,0,.5]},transition:{duration:1.5,repeat:1/0,ease:"easeInOut"}})]}),e.jsx(M,{children:(u||i)&&e.jsx(g.div,{initial:{opacity:0,y:10,scale:.9},animate:{opacity:1,y:0,scale:1},exit:{opacity:0,y:10,scale:.9},className:"absolute top-full right-0 mt-2 z-50 min-w-[250px]",children:e.jsx("div",{className:`
              rounded-xl shadow-2xl p-4 border-2
              ${i?"bg-red-50 border-red-200":"bg-white border-indigo-200"}
            `,children:i?e.jsxs("div",{className:"flex items-start gap-2 text-red-700",children:[e.jsx(v,{className:"w-5 h-5 mt-0.5 flex-shrink-0"}),e.jsx("span",{className:"text-sm",children:i})]}):e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex items-center gap-2 text-indigo-600",children:[e.jsx(v,{className:"w-5 h-5"}),e.jsx("span",{className:"text-sm font-medium",children:"Hallgatom..."})]}),e.jsxs("p",{className:"text-gray-900 font-medium",children:['"',u,'"']}),p&&e.jsxs("div",{className:"flex items-center gap-2 text-xs text-gray-500",children:[e.jsx(j,{className:"w-3 h-3 animate-spin"}),e.jsx("span",{children:"Keresés..."})]})]})})})}),!n&&!u&&!i&&e.jsx("div",{className:"absolute top-full right-0 mt-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap",children:"Kattints és mondj valamit 🎤"})]})};export{z as default};
//# sourceMappingURL=index2.js.map
