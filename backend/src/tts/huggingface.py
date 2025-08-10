import os
from pathlib import Path
from typing import Iterable, Optional, Union
from concurrent.futures import ThreadPoolExecutor, as_completed

import torch
from tqdm import tqdm
from TTS.api import TTS


class CoquiTextToSpeech:
    """
    Text-to-Speech helper using Coqui TTS (XTTS / viXTTS).

    Defaults:
      - model_name: "tts_models/multilingual/multi-dataset/xtts_v2"
        (change to your viXTTS model name or local path if needed)
      - language: "vi" (Vietnamese)
      - output_format: ".wav"
      - voice cloning via `speaker_wav` (optional, recommended for consistent timbre)

    Notes:
      - For viⓍTTS custom checkpoints: set `model_name` to your local repo/model dir
        or to the published model tag if available, e.g.:
        model_name="/path/to/vixtts" or "tts_models/.../vixtts"
    """

    def __init__(
        self,
        model_name: str = "tts_models/multilingual/multi-dataset/xtts_v2",
        language: str = "vi",
        device: Optional[str] = None,
        use_gpu: Optional[bool] = None,
        progress_bar: bool = False,
        gpu_index: int = 0,
    ):
        if device is None:
            device = "cuda" if torch.cuda.is_available() else "cpu"
        if use_gpu is not None:
            device = "cuda" if (use_gpu and torch.cuda.is_available()) else "cpu"

        self.device = device
        self.language = language
        self.progress_bar = progress_bar

        model_arg = {}
        model_path = None
        config_path = None

        m = Path(model_name)
        if m.exists() and m.is_dir():
            # Find config + ensure a .pth exists
            cfg = None
            for name in ("config.json", "xtts_config.json"):
                p = m / name
                if p.exists():
                    cfg = p
                    break
            if cfg is None:
                js = list(m.glob("*.json"))
                cfg = js[0] if js else None

            pths = sorted(m.glob("*.pth"))
            if not (cfg and pths):
                raise FileNotFoundError(
                    f"Expected config (*.json) and weights (*.pth) in {m}.\n"
                    f"Found: configs={list(m.glob('*.json'))}, pths={pths}"
                )

            # IMPORTANT: For XTTS here, pass the **directory** as model_path
            # (Synthesizer will call Xtts.load_checkpoint(..., checkpoint_dir=<dir>))
            model_arg = {
                "model_path": str(m),           # <-- directory, not the .pth
                "config_path": str(cfg),
            }
        else:
            model_arg = {"model_name": model_name}

        # Initialize Coqui TTS
        self.tts = TTS(progress_bar=progress_bar, **model_arg).to(
            self.device if self.device == "cpu" else f"cuda:{gpu_index}"
        )


    # ---------- Core synthesis ----------

    def synth_text_to_file(
        self,
        text: str,
        out_path: Union[str, Path],
        *,
        speaker_wav: Optional[Union[str, Path]] = None,
        language: Optional[str] = None,
        # XTTS supports some kwargs; keep a passthrough for future tuning:
        **synthesis_kwargs,
    ) -> Path:
        """
        Synthesize `text` to `out_path` (WAV by default).
        If `speaker_wav` is provided, performs voice cloning.
        """
        if not text or not text.strip():
            raise ValueError("Input text is empty.")

        out_path = Path(out_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)

        lang = language or self.language

        # XTTS/viXTTS need both language and speaker_wav for consistent cloning
        if speaker_wav:
            self.tts.tts_to_file(
                text=text,
                file_path=str(out_path),
                speaker_wav=str(speaker_wav),
                language=lang,
                **synthesis_kwargs,
            )
        else:
            # Some multilingual models can still speak without cloning,
            # but quality/timbre will be generic.
            self.tts.tts_to_file(
                text=text,
                file_path=str(out_path),
                language=lang,
                **synthesis_kwargs,
            )

        return out_path

    # ---------- File & folder helpers ----------

    def convert_file(
        self,
        txt_path: Union[str, Path],
        out_path: Optional[Union[str, Path]] = None,
        *,
        speaker_wav: Optional[Union[str, Path]] = None,
        language: Optional[str] = None,
        output_ext: str = ".wav",
        **synthesis_kwargs,
    ) -> Path:
        """
        Read one .txt and synthesize to an audio file.
        """
        txt_path = Path(txt_path)
        if not txt_path.is_file():
            raise FileNotFoundError(f"Text file not found: {txt_path}")

        text = txt_path.read_text(encoding="utf-8")
        out_path = Path(out_path) if out_path else txt_path.with_suffix(output_ext)

        return self.synth_text_to_file(
            text=text,
            out_path=out_path,
            speaker_wav=speaker_wav,
            language=language,
            **synthesis_kwargs,
        )

    def convert_folder(
        self,
        folder: Union[str, Path],
        pattern: str = "*.txt",
        out_dir: Optional[Union[str, Path]] = None,
        *,
        speaker_wav: Optional[Union[str, Path]] = None,
        language: Optional[str] = None,
        output_ext: str = ".wav",
        overwrite: bool = False,
        max_workers: int = 4,
        show_progress: bool = True,
        **synthesis_kwargs,
    ) -> list[Path]:
        """
        Convert all matching .txt files in a folder to audio.
        Returns a list of output Paths. Uses a thread pool.

        Tip:
          - If you're bound by GPU, keep max_workers small (1–2).
          - For CPU-only, you can increase workers but watch I/O.
        """
        folder = Path(folder)
        if not folder.is_dir():
            raise NotADirectoryError(f"Folder not found: {folder}")

        out_dir = Path(out_dir) if out_dir else folder
        out_dir.mkdir(parents=True, exist_ok=True)

        txt_files: Iterable[Path] = sorted(folder.glob(pattern))
        if not txt_files:
            return []

        def _job(txt_file: Path) -> Optional[Path]:
            target = out_dir / txt_file.with_suffix(output_ext).name
            if target.exists() and not overwrite:
                return target
            text = txt_file.read_text(encoding="utf-8")
            return self.synth_text_to_file(
                text=text,
                out_path=target,
                speaker_wav=speaker_wav,
                language=language,
                **synthesis_kwargs,
            )

        results: list[Path] = []
        with ThreadPoolExecutor(max_workers=max_workers) as ex:
            futures = {ex.submit(_job, f): f for f in txt_files}
            iterator = as_completed(futures)
            if show_progress:
                iterator = tqdm(iterator, total=len(futures), desc="Synthesizing")

            for fut in iterator:
                try:
                    outp = fut.result()
                    if outp:
                        results.append(outp)
                except Exception as e:
                    src = futures[fut]
                    print(f"[WARN] Failed on {src.name}: {e}")

        return results


if __name__ == "__main__":
    # Fix the paths - remove the redundant "./backend/" prefix
    TXT_PATH = "./data/results/the-gioi/url_014.txt"
    OUTPUT_PATH = "./data/results/the-gioi-speech/url_014.wav"
    
    # For XTTS models, try using the model directory directly without manual path construction
    tts = CoquiTextToSpeech(
        model_name="./models/viXTTS",  # Let the class handle finding config.json and model.pth
        language="vi",
        device=None,
        progress_bar=False
    )

    result_path = tts.convert_file(
        txt_path=TXT_PATH,
        out_path=OUTPUT_PATH,
        speaker_wav="/Users/tridungduong16/Documents/GitHub/VeritusAI_v3/backend/data/output_vietnamese.wav",  # optional
    )
    print(f"✓ Wrote {result_path}")
