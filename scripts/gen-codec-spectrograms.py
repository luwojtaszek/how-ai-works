"""Generate public/audio/kodek/*.webp: mel spectrograms of the codec samples made by
scripts/gen-codec-audio.py, for the codec widget. The picture is an alpha mask (louder = more opaque),
so the page can colour it with a CSS variable in light and dark mode.

Same venv as scripts/gen-codec-audio.py (numpy, pillow), plus ffmpeg:
  ~/.cache/aic-img-venv/bin/python scripts/gen-codec-spectrograms.py
"""
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image

DIR = Path(__file__).resolve().parent.parent / 'public' / 'audio' / 'kodek'
NAMES = ['original', 'dac-1', 'dac-2', 'dac-4', 'dac-9']
SR, NFFT, HOP, MELS = 44100, 2048, 512, 96  # 86 frames per second, like the codec
W, H = 640, 150
FMAX = 16000


def load(name):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', DIR / f'{name}.ogg', '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32)


def mel_bank():
    mel = lambda f: 2595 * np.log10(1 + f / 700)
    imel = lambda m: 700 * (10 ** (m / 2595) - 1)
    pts = imel(np.linspace(mel(0), mel(FMAX), MELS + 2))
    bins = np.floor((NFFT + 1) * pts / SR).astype(int)
    fb = np.zeros((MELS, NFFT // 2 + 1))
    for i in range(MELS):
        a, b, c = bins[i], bins[i + 1], bins[i + 2]
        fb[i, a:b] = (np.arange(a, b) - a) / max(b - a, 1)
        fb[i, b:c] = (c - np.arange(b, c)) / max(c - b, 1)
    return fb


fb = mel_bank()
specs = []
for n in NAMES:
    x = load(n)
    win = np.hanning(NFFT)
    frames = [np.abs(np.fft.rfft(x[i:i + NFFT] * win)) ** 2 for i in range(0, len(x) - NFFT, HOP)]
    specs.append(10 * np.log10(fb @ np.array(frames).T + 1e-10))
top = max(s.max() for s in specs)  # one scale for all files, so they compare
for n, s in zip(NAMES, specs):
    a = np.clip((s - (top - 80)) / 80, 0, 1)[::-1]  # 80 dB range, high frequencies at the top
    img = Image.fromarray((a * 255).astype('uint8')).resize((W, H), Image.BILINEAR)
    out = Image.new('LA', (W, H), (0, 0))
    out.putalpha(img)
    out.save(DIR / f'{n}.webp', quality=85)
    print(n, s.shape)
