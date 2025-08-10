import os
from pathlib import Path
from typing import Iterable, Optional, Union
from concurrent.futures import ThreadPoolExecutor, as_completed
from openai import OpenAI
from src.app_config import app_config

os.environ["OPENAI_API_KEY"] = app_config.OPENAI_API_KEY


class VNTextToSpeech:
    """
    Vietnamese Text-to-Speech helper using OpenAI Audio API.

    - Default model: gpt-4o-mini-tts (supports prompting for tone, speed, etc.)
    - Default voice: "coral"
    - Default format: "mp3"

    Notes:
      * Provide clear disclosure that the voice is AI-generated (policy requirement).
      * Voices are currently optimized for English, but model can speak multiple languages.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = "gpt-4o-mini-tts",
        voice: str = "coral",
        response_format: str = "mp3",
        default_instructions: str = (
            "Đọc tiếng Việt rõ ràng, tự nhiên, tốc độ vừa phải, "
            "ngắt câu hợp lý, giữ nguyên dấu và tên riêng."
        ),
    ):
        """
        Create a client and set sensible defaults for Vietnamese speech.
        """
        if api_key:
            os.environ["OPENAI_API_KEY"] = api_key

        self.client = OpenAI()
        self.model = model
        self.voice = voice
        self.response_format = response_format  # mp3 | wav | opus | flac | aac | pcm
        self.default_instructions = default_instructions

    def synthesize_to_file(
        self,
        text: str,
        out_path: Union[str, Path],
        *,
        voice: Optional[str] = None,
        model: Optional[str] = None,
        response_format: Optional[str] = None,
        instructions: Optional[str] = None,
        stream: bool = True,
    ) -> Path:
        """
        Convert `text` to speech and write to `out_path`.
        Uses streamed response by default for faster start/playback.

        Returns the destination Path.
        """
        if not text or not text.strip():
            raise ValueError("Input text is empty.")

        out_path = Path(out_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)

        voice = voice or self.voice
        model = model or self.model
        response_format = response_format or self.response_format
        instructions = instructions or self.default_instructions

        if stream:
            # Streaming write (chunked) – fastest for longer content
            with self.client.audio.speech.with_streaming_response.create(
                model=model,
                voice=voice,
                input=text,
                instructions=instructions,
                response_format=response_format,
            ) as response:
                response.stream_to_file(out_path)
        else:
            # Non-streaming – receive full bytes then write
            response = self.client.audio.speech.create(
                model=model,
                voice=voice,
                input=text,
                instructions=instructions,
                response_format=response_format,
            )
            # response is a binary-like object; write to disk
            with open(out_path, "wb") as f:
                f.write(response.read())

        return out_path

    def convert_file(
        self,
        txt_path: Union[str, Path],
        out_path: Optional[Union[str, Path]] = None,
        *,
        response_format: Optional[str] = None,
        voice: Optional[str] = None,
        model: Optional[str] = None,
        instructions: Optional[str] = None,
        stream: bool = True,
    ) -> Path:
        """
        Read a single .txt file and synthesize one audio file.
        If `out_path` is not given, writes next to the .txt with the chosen extension.
        """
        txt_path = Path(txt_path)
        if not txt_path.is_file():
            raise FileNotFoundError(f"Text file not found: {txt_path}")

        text = txt_path.read_text(encoding="utf-8")
        ext = f".{(response_format or self.response_format).lower()}"
        out_path = Path(out_path) if out_path else txt_path.with_suffix(ext)

        return self.synthesize_to_file(
            text=text,
            out_path=out_path,
            voice=voice,
            model=model,
            response_format=response_format,
            instructions=instructions,
            stream=stream,
        )

    def convert_folder(
        self,
        folder: Union[str, Path],
        pattern: str = "*.txt",
        out_dir: Optional[Union[str, Path]] = None,
        *,
        response_format: Optional[str] = None,
        voice: Optional[str] = None,
        model: Optional[str] = None,
        instructions: Optional[str] = None,
        stream: bool = True,
        max_workers: int = 4,
        overwrite: bool = False,
    ) -> list[Path]:
        """
        Convert all matching .txt files in `folder` to audio.
        Returns list of output Paths. Uses a thread pool for parallelism.

        - `out_dir`: where to place audio files (mirrors filenames). Defaults to `folder`.
        - `overwrite`: if False, skips files that already exist.
        """
        folder = Path(folder)
        if not folder.is_dir():
            raise NotADirectoryError(f"Folder not found: {folder}")

        out_dir = Path(out_dir) if out_dir else folder
        out_dir.mkdir(parents=True, exist_ok=True)
        ext = f".{(response_format or self.response_format).lower()}"

        txt_files: Iterable[Path] = sorted(folder.glob(pattern))
        if not txt_files:
            return []

        futures = {}
        results: list[Path] = []

        def _job(txt_file: Path) -> Optional[Path]:
            target = (out_dir / txt_file.with_suffix(ext).name)
            if target.exists() and not overwrite:
                return target
            text = txt_file.read_text(encoding="utf-8")
            return self.synthesize_to_file(
                text=text,
                out_path=target,
                voice=voice,
                model=model,
                response_format=response_format,
                instructions=instructions,
                stream=stream,
            )

        with ThreadPoolExecutor(max_workers=max_workers) as ex:
            for f in txt_files:
                futures[ex.submit(_job, f)] = f

            for fut in as_completed(futures):
                try:
                    outp = fut.result()
                    if outp:
                        results.append(outp)
                except Exception as e:
                    # You might want to log or collect errors here instead of raising
                    print(f"[WARN] Failed on {futures[fut].name}: {e}")

        return results


if __name__ == "__main__":
    tts = VNTextToSpeech(
        model="gpt-4o-mini-tts",
        voice="coral",
        response_format="mp3",
    )
    out_path = tts.convert_file("/Users/tridungduong16/Documents/GitHub/VeritusAI_v3/data/results/doi-song/url_090.txt")

    # 2) Whole folder (all .txt) to WAV in ./audio_out
    # outs = tts.convert_folder(
    #     "texts_vi",
    #     pattern="*.txt",
    #     out_dir="audio_out",
    #     response_format="wav",  # for lower latency playback in some apps
    #     max_workers=4,
    # )
    # print("Wrote:", outs)
