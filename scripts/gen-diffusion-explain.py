"""Generate public/img/obrazy/ex-*: real internals of one Stable Diffusion 1.5 run for the
image-generation illustrations: prompt tokens, latent channels, predictions with and
without the prompt, cross-attention maps per word, image-to-image edits and inpainting.

Same venv and model as scripts/gen-diffusion-frames.py:
  ~/.cache/aic-img-venv/bin/python scripts/gen-diffusion-explain.py
"""
from pathlib import Path

import numpy as np
import torch
import torch.nn.functional as F
from diffusers import (DDIMScheduler, StableDiffusionImg2ImgPipeline, StableDiffusionInpaintPipeline,
                       StableDiffusionPipeline)
from PIL import Image

MODEL = 'stable-diffusion-v1-5/stable-diffusion-v1-5'
INPAINT_MODEL = 'stable-diffusion-v1-5/stable-diffusion-inpainting'  # same licence, extra mask input
PROMPT = 'a red lighthouse on a rocky cliff above a stormy sea, photograph'
EDIT = 'a red lighthouse on a snowy cliff above a frozen sea at night, photograph'
INPAINT = 'a white windmill on a rocky cliff above a stormy sea, photograph'
WORDS = ['red', 'lighthouse', 'cliff', 'sea', 'stormy']
STEPS, SEED, CFG, PEEK = 20, 7, 7.5, 1  # PEEK: step at which predictions are compared
STRENGTHS = [0.3, 0.5, 0.7, 0.9]
OUT = Path(__file__).resolve().parent.parent / 'public' / 'img' / 'obrazy'
SIZE = 256

torch.set_grad_enabled(False)
pipe = StableDiffusionPipeline.from_pretrained(MODEL, variant='fp16', torch_dtype=torch.float32, safety_checker=None)
pipe.scheduler = DDIMScheduler.from_config(pipe.scheduler.config)
unet, vae, sch, tok = pipe.unet, pipe.vae, pipe.scheduler, pipe.tokenizer
enc = lambda p: pipe.encode_prompt(p, 'cpu', 1, True)[:2]


def decode(lat):
    img = vae.decode(lat / vae.config.scaling_factor).sample
    return pipe.image_processor.postprocess(img)[0]


def save(img, name):
    img.resize((SIZE, SIZE)).save(OUT / f'ex-{name}.webp', quality=80)


def channels(lat, name):  # the 4 latent channels as a 2x2 grey grid, each normalised on its own
    tiles = []
    for c in lat[0]:
        a = ((c - c.min()) / (c.max() - c.min()) * 255).byte().numpy()
        tiles.append(Image.fromarray(a).resize((128, 128), Image.NEAREST))
    g = Image.new('LA', (258, 258), (0, 0))  # transparent gaps, so the grid works on light and dark pages
    for i, t in enumerate(tiles):
        g.paste(t.convert('LA'), ((i % 2) * 130, (i // 2) * 130))
    g.save(OUT / f'ex-{name}.webp', quality=85)


class Grab:  # cross-attention processor that keeps the prompt half's attention to each text token
    def __init__(self):
        self.maps = []

    def __call__(self, attn, hidden, encoder_hidden_states=None, attention_mask=None, **kw):
        cross = encoder_hidden_states is not None
        ctx = encoder_hidden_states if cross else hidden
        q, k, v = attn.to_q(hidden), attn.to_k(ctx), attn.to_v(ctx)
        q, k, v = (attn.head_to_batch_dim(x) for x in (q, k, v))
        p = attn.get_attention_scores(q, k, None)
        if cross and p.shape[1] == 256 and self.on:  # 16x16 layers, prompt half of the CFG batch
            h = attn.heads
            self.maps.append(p.view(-1, h, 256, p.shape[-1])[1].mean(0))
        out = attn.batch_to_head_dim(torch.bmm(p, v))
        return attn.to_out[1](attn.to_out[0](out))


grab = Grab()
grab.on = True
orig = dict(unet.attn_processors)
unet.set_attn_processor({n: (grab if n.endswith('attn2.processor') else pipe.unet.attn_processors[n]) for n in unet.attn_processors})

OUT.mkdir(parents=True, exist_ok=True)
ids = tok(PROMPT).input_ids  # the station shows these tokens

neg, emb = enc(PROMPT)[1], enc(PROMPT)[0]
ac = sch.alphas_cumprod


def x0_of(lat, eps, t):
    a = ac[t]
    return (lat - (1 - a).sqrt() * eps) / a.sqrt()


def loop(lat, emb, neg, ts, peek=False):
    for i, t in enumerate(ts, 1):
        e = unet(torch.cat([lat] * 2), t, encoder_hidden_states=torch.cat([neg, emb])).sample
        eu, ec = e.chunk(2)
        eps = eu + CFG * (ec - eu)
        if peek and i == PEEK:
            save(decode(x0_of(lat, eu, t)), 'uncond')
            save(decode(x0_of(lat, ec, t)), 'cond')
            save(decode(x0_of(lat, eps, t)), 'guided')
        if peek and i == 4:  # the grid the network gets in step 4 (its prediction is x0-04 from gen-diffusion-frames.py)
            channels(lat, 'lat-mid')
        lat = sch.step(eps, t, lat).prev_sample
        print('step', i, flush=True)
    return lat


# 1. base run: latents, predictions at PEEK, attention maps
sch.set_timesteps(STEPS)
lat = torch.randn((1, 4, 64, 64), generator=torch.Generator().manual_seed(SEED))
z0 = loop(lat, emb, neg, sch.timesteps, peek=True)
channels(z0, 'lat-end')
final = decode(z0)
save(final, 'final')
grab.on = False

ix = {w: ids.index(tok(w).input_ids[1]) for w in WORDS}
A = torch.stack(grab.maps).mean(0)  # 256 x 77
base = np.asarray(final.resize((SIZE, SIZE))).astype(float)
amap = {}
for w, j in ix.items():
    m = A[:, j].view(1, 1, 16, 16)
    m = F.interpolate(m, size=(SIZE, SIZE), mode='bicubic')[0, 0].numpy()
    m = np.clip((m - m.min()) / (m.max() - m.min()), 0, 1)
    amap[w] = A[:, j].view(16, 16)
    heat = np.stack([255 * np.ones_like(m), 120 + 135 * m, 40 * np.ones_like(m)], -1)  # warm orange
    img = base * 0.35 * (1 - m[..., None]) + (base * 0.35 + heat * 0.65) * m[..., None]
    Image.fromarray(img.clip(0, 255).astype('uint8')).save(OUT / f'ex-attn-{w}.webp', quality=80)

# 2. image-to-image: the finished image, partly re-noised, denoised with a new prompt (standard pipeline)
unet.set_attn_processor(orig)
i2i = StableDiffusionImg2ImgPipeline(**pipe.components)
for s in STRENGTHS:
    img = i2i(EDIT, image=final, strength=s, num_inference_steps=STEPS, guidance_scale=CFG,
              generator=torch.Generator().manual_seed(SEED)).images[0]
    save(img, f'edit-{int(s * 100)}')

# 3. inpainting: a model trained with a mask input regenerates only the box around the lighthouse
m = amap['lighthouse']
m = (m > m.quantile(0.9)).nonzero()
y0, x0_, y1, x1 = m[:, 0].min(), m[:, 1].min(), m[:, 0].max() + 1, m[:, 1].max() + 1
box = [int(v) * 32 for v in (x0_ - 1, y0 - 1, x1 + 1, y1 + 1)]  # 16x16 attention cells -> 512 px, one cell margin
mask = Image.new('L', (512, 512), 0)
mask.paste(255, (max(box[0], 0), max(box[1], 0), min(box[2], 512), min(box[3], 512)))
over = np.asarray(final).astype(float)
mm = np.asarray(mask)[..., None] / 255
save(Image.fromarray((over * (1 - 0.55 * mm) + 255 * 0.55 * mm).astype('uint8')), 'mask')
inp = StableDiffusionInpaintPipeline.from_pretrained(INPAINT_MODEL, variant='fp16', torch_dtype=torch.float32, safety_checker=None)
inp.scheduler = DDIMScheduler.from_config(inp.scheduler.config)
img = inp(INPAINT, image=final, mask_image=mask, num_inference_steps=STEPS, guidance_scale=CFG,
          generator=torch.Generator().manual_seed(SEED)).images[0]
save(img, 'inpaint')
