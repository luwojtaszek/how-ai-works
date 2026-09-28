(()=>{const out=[];const W=innerWidth;const sel=e=>{let s=e.tagName.toLowerCase();if(e.id)s+='#'+e.id;else if(e.classList.length)s+='.'+[...e.classList].slice(0,2).join('.');const p=e.closest('[id]');return (p&&p!==e?'#'+p.id+' ':'')+s;};
function check(tag){
 if(document.documentElement.scrollWidth>W)out.push(tag+' page-overflow '+document.documentElement.scrollWidth);
 for(const e of document.querySelectorAll('body *')){if(e.closest('svg')||e.closest('.scroll')||e.closest('[hidden]')||e.closest('#search')||e.closest('#toc:not(:popover-open)')&&W<=900)continue;
  const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden')continue;
  const r=e.getBoundingClientRect();if(!r.width||!r.height)continue;
  if((cs.overflowX!=='visible'||cs.overflowY!=='visible')&&e.textContent.trim()&&!['auto','scroll'].includes(cs.overflowX)&&!['auto','scroll'].includes(cs.overflowY)){
    if(e.scrollWidth>e.clientWidth+2&&cs.textOverflow!=='ellipsis'&&!['INPUT','SELECT','TEXTAREA','IMG'].includes(e.tagName))out.push(tag+' clipX '+sel(e)+' '+e.scrollWidth+'>'+e.clientWidth);
    if(e.scrollHeight>e.clientHeight+2&&!['INPUT','SELECT','TEXTAREA'].includes(e.tagName))out.push(tag+' clipY '+sel(e)+' '+e.scrollHeight+'>'+e.clientHeight);}
  const lab=e.closest('.lab,.gt,.say,.fups,.card,.lane');if(lab&&lab!==e){const L=lab.getBoundingClientRect();if(r.right>L.right+1||r.left<L.left-1)out.push(tag+' escapes '+sel(e)+' by '+Math.round(Math.max(r.right-L.right,L.left-r.left)));}
  if(W<=900&&(e.tagName==='BUTTON'||e.tagName==='A'&&e.closest('.lab'))&&r.height<28&&e.offsetParent)out.push(tag+' small-target '+sel(e)+' '+Math.round(r.width)+'x'+Math.round(r.height));}
 for(const t of document.querySelectorAll('main svg text')){const s=t.ownerSVGElement.getBoundingClientRect(),r=t.getBoundingClientRect();if(r.width&&(r.right>s.right+2||r.left<s.left-2||r.bottom>s.bottom+2||r.top<s.top-2))out.push(tag+' svgtext-out '+sel(t.ownerSVGElement)+' "'+t.textContent.slice(0,14)+'"');}}
check('start');
for(let i=0;i<60;i++){const n=[...document.querySelectorAll('main .pl-next')].find(b=>!b.disabled);if(!n)break;n.click();}
check('end');
return [...new Set(out)].slice(0,8).join(' || ')||'ok'})()
