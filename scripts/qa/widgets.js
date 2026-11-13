(()=>{const bad=/\bNaN\b|undefined|\bnull\b|Infinity|TODO/;const hits=[];const W=innerWidth;const EN=document.documentElement.lang==='en';
const plText=()=>{const c=document.querySelector('main').cloneNode(true);c.querySelectorAll('[lang="pl"],.site-foot').forEach(e=>e.remove());return (c.innerText.match(/[^\s]*[ąćęłńśźżĄĆĘŁŃŚŹŻ][^\s]*/g)||[]);};
const scan=t=>{const m=[...document.querySelectorAll('main .lab, main .demo')].map(e=>e.innerText).join('\n').match(bad);if(m)hits.push(t+':'+m[0]);if(document.documentElement.scrollWidth>W)hits.push(t+':overflow '+document.documentElement.scrollWidth);if(EN){const p=plText();if(p.length)hits.push(t+':PL['+[...new Set(p)].slice(0,5).join(' ')+']');}};
scan('init');
for(const r of document.querySelectorAll('main input[type=range]')){for(const v of [r.min,r.max,r.defaultValue]){r.value=v;r.dispatchEvent(new Event('input',{bubbles:true}));r.dispatchEvent(new Event('change',{bubbles:true}));scan(r.id+'='+v);}}
for(const s of document.querySelectorAll('main select')){for(const o of s.options){s.value=o.value;s.dispatchEvent(new Event('change',{bubbles:true}));scan(s.id+'='+o.value);}}
for(const c of document.querySelectorAll('main input[type=checkbox]')){c.click();scan('cb:'+c.id);c.click();}
for(const b of document.querySelectorAll('main button:not(:disabled)')){if(b.classList.contains('pl-play')||b.closest('.gt'))continue;b.click();scan('btn:'+b.textContent.trim().slice(0,18));}
for(let i=0;i<40;i++){const n=[...document.querySelectorAll('main .pl-next')].find(b=>!b.disabled);if(!n)break;n.click();scan('next'+i);}
// a real pointer must reach every zoomable image: element.click() bypasses an overlay that covers it
document.documentElement.style.scrollBehavior='auto';
for(const im of document.querySelectorAll('main img.zoomable')){if(!im.offsetParent)continue;const b=im.getBoundingClientRect();scrollTo(0,Math.max(0,b.top+scrollY+b.height/2-innerHeight/2));const r=im.getBoundingClientRect();if(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)!==im)hits.push('covered:'+(im.alt||im.src).slice(0,24));}
return W+'px '+([...new Set(hits)].slice(0,4).join(' | ')||'ok')})()
