"""Generate public/img/obrazy/*.webp: real denoising steps of Stable Diffusion 1.5
for the image-generation widget (noisy image and the model's current guess after a few
steps, plus final images for several guidance scales and seeds).

Run on CPU (about 15 minutes) in a throwaway venv, e.g.:
  uv venv ~/.cache/aic-img-venv && VIRTUAL_ENV=~/.cache/aic-img-venv uv pip install \
    --index-url https://download.pytorch.org/whl/cpu torch && \
    VIRTUAL_ENV=~/.cache/aic-img-venv uv pip install diffusers transformers accelerate pillow
  ~/.cache/aic-img-venv/bin/python scripts/gen-diffusion-frames.py
"""
from pathlib import Path

import torch
from diffusers import DDIMScheduler, StableDiffusionPipeline

MODEL = 'stable-diffusion-v1-5/stable-diffusion-v1-5'  # CreativeML OpenRAIL-M, no licence gate
PROMPT = 'a red lighthouse on a rocky cliff above a stormy sea, photograph'
STEPS = 20
SEED = 7
CFGS = [1.0, 3.0, 7.5, 20.0]  # the step grid uses 7.5, the default in SD 1.5
SEEDS = [8, 9]  # extra finals at 7.5: same prompt, different starting noise
OUT = Path(__file__).resolve().parent.parent / 'public' / 'img' / 'obrazy'
SIZE = 256  # the widget shows 256 px; the model runs at its native 512 px
FRAMES = {0, 1, 4, 20}  # steps shown in the widget

torch.set_grad_enabled(False)
pipe = StableDiffusionPipeline.from_pretrained(MODEL, variant='fp16', torch_dtype=torch.float32, safety_checker=None)
pipe.scheduler = DDIMScheduler.from_config(pipe.scheduler.config)
unet, vae, sch = pipe.unet, pipe.vae, pipe.scheduler
emb, neg = pipe.encode_prompt(PROMPT, 'cpu', 1, True)[:2]


def save(lat, name):
    img = vae.decode(lat / vae.config.scaling_factor).sample
    img = pipe.image_processor.postprocess(img)[0].resize((SIZE, SIZE))
    img.save(OUT / f'{name}.webp', quality=80)


def run(cfg, seed, frames):
    sch.set_timesteps(STEPS)
    lat = torch.randn((1, 4, 64, 64), generator=torch.Generator().manual_seed(seed))
    if frames:
        save(lat, 'xt-00')  # start: pure noise
    for i, t in enumerate(sch.timesteps, 1):
        if cfg == 1.0:  # no guidance: one pass with the prompt only
            eps = unet(lat, t, encoder_hidden_states=emb).sample
        else:  # classifier-free guidance: with and without the prompt, then extrapolate
            e = unet(torch.cat([lat] * 2), t, encoder_hidden_states=torch.cat([neg, emb])).sample
            eu, ec = e.chunk(2)
            eps = eu + cfg * (ec - eu)
        out = sch.step(eps, t, lat)
        lat = out.prev_sample
        if frames and i in FRAMES:
            save(lat, f'xt-{i:02d}')
            save(out.pred_original_sample, f'x0-{i:02d}')
        print(cfg, seed, i, flush=True)
    return lat


OUT.mkdir(parents=True, exist_ok=True)
for cfg in CFGS:
    save(run(cfg, SEED, frames=cfg == 7.5), f'cfg-{cfg:g}')
for seed in SEEDS:
    save(run(7.5, seed, frames=False), f'seed-{seed}')
