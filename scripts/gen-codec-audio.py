"""Generate public/audio/kodek/*.ogg: one real speech recording encoded with the DAC neural
audio codec (MIT licence) and decoded with 1, 2, 4 and all 9 codebooks, for the audio widget.
The recording comes from LibriSpeech (CC BY 4.0, read from public-domain LibriVox books).

Same venv as scripts/gen-diffusion-frames.py, plus:
  VIRTUAL_ENV=~/.cache/aic-img-venv uv pip install soundfile soxr huggingface_hub pyarrow
  ~/.cache/aic-img-venv/bin/python scripts/gen-codec-audio.py   (needs ffmpeg)
"""
import io
import subprocess
from pathlib import Path

import numpy as np
import pyarrow.parquet as pq
import soundfile as sf
import soxr
import torch
from huggingface_hub import hf_hub_download
from transformers import AutoProcessor, DacModel

MODEL = 'descript/dac_44khz'  # 44.1 kHz, stride 512 -> ~86 frames/s, 9 codebooks of 1024 entries
SAMPLE = ('hf-internal-testing/librispeech_asr_dummy', 'clean/validation-00000-of-00001.parquet', 0)
LAYERS = [1, 2, 4, 9]
SECONDS = 7
OUT = Path(__file__).resolve().parent.parent / 'public' / 'audio' / 'kodek'

repo, file, row = SAMPLE
t = pq.read_table(hf_hub_download(repo, file, repo_type='dataset')).to_pylist()[row]
wav, sr = sf.read(io.BytesIO(t['audio']['bytes']))
print('text:', t['text'])
model, proc = DacModel.from_pretrained(MODEL), AutoProcessor.from_pretrained(MODEL)
x = soxr.resample(wav, sr, proc.sampling_rate)[: SECONDS * proc.sampling_rate].astype(np.float32)
OUT.mkdir(parents=True, exist_ok=True)


def ogg(audio, name):  # high-bitrate Opus, far above the codec's own bitrate, so it adds no audible loss
    tmp = OUT / f'{name}.wav'
    sf.write(tmp, audio, proc.sampling_rate)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-c:a', 'libopus', '-b:a', '96k', OUT / f'{name}.ogg'], check=True)
    tmp.unlink()


ogg(x, 'original')
with torch.no_grad():
    inp = proc(raw_audio=x, sampling_rate=proc.sampling_rate, return_tensors='pt')
    codes = model.encode(inp['input_values']).audio_codes  # (1, 9, frames)
    frames = codes.shape[-1]
    secs = len(x) / proc.sampling_rate
    print('seconds:', secs, 'frames:', frames, 'frames/s:', frames / secs)
    for n in LAYERS:
        y = model.decode(audio_codes=codes[:, :n]).audio_values[0].numpy().reshape(-1)[: len(x)]  # first n codebooks only
        ogg(y, f'dac-{n}')
        print(n, 'codebooks:', n * frames / secs, 'codes/s', round(n * frames / secs * 10 / 1000, 2), 'kbps')
