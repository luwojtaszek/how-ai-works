"""Print how cross-attention in the lighthouse run of Stable Diffusion 1.5 is shared between the
prompt tokens: overall, per step for the start token, and early (steps 1-4) vs late (5-20) per word.
The image-generation page quotes these numbers. Same model, prompt, seed and settings as
scripts/gen-diffusion-explain.py (16x16 cross-attention layers, prompt half of the CFG batch, heads averaged).

  ~/.cache/aic-img-venv/bin/python scripts/gen-attention-share.py
"""
import torch
from diffusers import DDIMScheduler, StableDiffusionPipeline
MODEL='stable-diffusion-v1-5/stable-diffusion-v1-5'
PROMPT='a red lighthouse on a rocky cliff above a stormy sea, photograph'
torch.set_grad_enabled(False)
pipe=StableDiffusionPipeline.from_pretrained(MODEL,variant='fp16',torch_dtype=torch.float32,safety_checker=None)
pipe.scheduler=DDIMScheduler.from_config(pipe.scheduler.config)
unet,sch,tok=pipe.unet,pipe.scheduler,pipe.tokenizer
emb,neg=pipe.encode_prompt(PROMPT,'cpu',1,True)[:2]
class Grab:
    def __init__(s): s.step=0; s.maps={}
    def __call__(s,attn,hidden,encoder_hidden_states=None,attention_mask=None,**kw):
        cross=encoder_hidden_states is not None
        ctx=encoder_hidden_states if cross else hidden
        q,k,v=attn.to_q(hidden),attn.to_k(ctx),attn.to_v(ctx)
        q,k,v=(attn.head_to_batch_dim(x) for x in (q,k,v))
        p=attn.get_attention_scores(q,k,None)
        if cross and p.shape[1]==256:
            s.maps.setdefault(s.step,[]).append(p.view(-1,attn.heads,256,p.shape[-1])[1].mean(0))
        out=attn.batch_to_head_dim(torch.bmm(p,v))
        return attn.to_out[1](attn.to_out[0](out))
g=Grab()
unet.set_attn_processor({n:(g if n.endswith('attn2.processor') else unet.attn_processors[n]) for n in unet.attn_processors})
sch.set_timesteps(20)
lat=torch.randn((1,4,64,64),generator=torch.Generator().manual_seed(7))
for i,t in enumerate(sch.timesteps,1):
    g.step=i
    e=unet(torch.cat([lat]*2),t,encoder_hidden_states=torch.cat([neg,emb])).sample
    eu,ec=e.chunk(2); eps=eu+7.5*(ec-eu)
    lat=sch.step(eps,t,lat).prev_sample
    print('step',i,flush=True)
ids=tok(PROMPT).input_ids
names=[tok.decode([x]) for x in ids]
A={i:torch.stack(m).mean(0) for i,m in g.maps.items()}  # 256x77 per step
allA=torch.stack(list(A.values())).mean(0)
mass=allA.mean(0)  # mean over image positions: share of attention per token (sums to 1)
print('n tokens',len(ids))
for j,nm in enumerate(names): print(f'{j:2d} {nm!r:16} {mass[j]*100:6.2f}%')
print('padding (after EOT) total', round(float(mass[len(ids):].sum()*100),2),'%')
early=torch.stack([A[i] for i in range(1,5)]).mean(0); late=torch.stack([A[i] for i in range(5,21)]).mean(0)
for w in ['red','lighthouse','cliff','sea','stormy','a','photograph']:
    j=ids.index(tok(w).input_ids[1])
    a,b=early[:,j],late[:,j]
    c=torch.corrcoef(torch.stack([a,b]))[0,1]
    print(w,'corr early/late',round(float(c),3),'mass early',round(float(a.mean()*100),2),'late',round(float(b.mean()*100),2))
for i in (1,4,10,20): print('step',i,'SOT mass',round(float(A[i].mean(0)[0]*100),1),'%')
