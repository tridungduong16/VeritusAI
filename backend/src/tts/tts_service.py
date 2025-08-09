import io
import logging
import os
import re
import tempfile
import warnings
import soundfile as sf
import torch
from fastapi import HTTPException
from typing import List, Optional
from TTS.tts.configs.xtts_config import XttsConfig
from TTS.tts.models.xtts import Xtts
from src.app_config import app_config
warnings.filterwarnings("ignore")

class TTSService:
    def __init__(self, model_path: str = None):
        self.device = "cpu"
        self.logger = logging.getLogger(__name__)
        torch.set_num_threads(2)
        try:
            if model_path is None:
                model_path = app_config.TTS_MODEL_PATH
            if model_path and os.path.exists(model_path):
                config_path = os.path.join(model_path, "config.json")
                if os.path.exists(config_path):
                    self.config = XttsConfig()
                    self.config.load_json(config_path)
                    self.model = Xtts.init_from_config(self.config)
                    self.model.load_checkpoint(
                        self.config, checkpoint_dir=model_path, eval=True
                    )
                    self.model.to(self.device)
                    self.logger.info(f"viXTTS model loaded from {model_path}")
                else:
                    raise FileNotFoundError(f"config.json not found in {model_path}")
            else:
                raise FileNotFoundError(
                    f"Model path {model_path} does not exist or is invalid."
                )
        except Exception as e:
            self.logger.error(f"Error loading viXTTS model: {e}")
            raise e

    def synthesize_speech(
        self, text: str, speaker_wav: str = None, language: str = "vi"
    ):
        try:
            self.logger.debug(f"TTS synthesis for: '{text[:50]}...'")
            gpt_cond_latent = None
            speaker_embedding = None
            if speaker_wav:
                gpt_cond_latent, speaker_embedding = (
                    self.model.get_conditioning_latents(
                        audio_path=speaker_wav,
                        gpt_cond_len=self.config.gpt_cond_len,
                        max_ref_length=self.config.max_ref_len,
                        sound_norm_refs=self.config.sound_norm_refs,
                    )
                )
            else:
                sample_path = os.path.join(app_config.TTS_MODEL_PATH, "vi_sample.wav")
                if os.path.exists(sample_path):
                    gpt_cond_latent, speaker_embedding = (
                        self.model.get_conditioning_latents(
                            audio_path=sample_path,
                            gpt_cond_len=self.config.gpt_cond_len,
                            max_ref_length=self.config.max_ref_len,
                            sound_norm_refs=self.config.sound_norm_refs,
                        )
                    )
                else:
                    raise HTTPException(
                        status_code=400, detail="No speaker reference available."
                    )
            outputs = self.model.inference(
                text=text,
                language=language,
                gpt_cond_latent=gpt_cond_latent,
                speaker_embedding=speaker_embedding,
                temperature=0.1,
                length_penalty=1.0,
                repetition_penalty=10.0,
                top_k=5,
                top_p=0.1,
            )
            audio_buffer = io.BytesIO()
            sf.write(
                audio_buffer,
                outputs["wav"],
                self.config.audio.sample_rate,
                format="WAV",
            )
            audio_bytes = audio_buffer.getvalue()
            audio_buffer.close()
            self.logger.debug(f"TTS completed, audio size: {len(audio_bytes)} bytes")
            return audio_bytes
        except HTTPException as e:
            self.logger.error(f"HTTP error in TTS synthesis: {e.detail}")
            raise e
        except Exception as e:
            self.logger.error(f"Error in speech synthesis: {e}")
            raise HTTPException(
                status_code=500, detail=f"Speech synthesis failed: {str(e)}"
            )

    def synthesize_speech_to_file(
        self, text: str, speaker_wav: str = None, language: str = "vi"
    ):
        try:
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_file:
                output_path = tmp_file.name
            audio_bytes = self.synthesize_speech(text, speaker_wav, language)
            with open(output_path, "wb") as f:
                f.write(audio_bytes)
            self.logger.debug(f"TTS audio saved to: {output_path}")
            return output_path
        except Exception as e:
            self.logger.error(f"Error in file-based synthesis: {e}")
            raise HTTPException(
                status_code=500, detail=f"Speech synthesis failed: {str(e)}"
            )

    def _markdown_to_text(self, content: str) -> str:
        """Convert basic Markdown content to plain text.

        This function performs lightweight cleanup to make Markdown more TTS-
        friendly. It removes code fences, inline code, images, converts links
        to their text, strips headings/emphasis markers, and normalizes
        whitespace.

        Args:
            content (str): Raw Markdown content.

        Returns:
            str: Plain text suitable for TTS input.
        """
        # Remove fenced code blocks
        text = re.sub(r"```[\s\S]*?```", " ", content)
        # Remove inline code
        text = re.sub(r"`[^`]*`", " ", text)
        # Replace images with their alt text
        text = re.sub(r"!\[([^\]]*)\]\([^\)]*\)", r"\1", text)
        # Replace links with their visible text
        text = re.sub(r"\[([^\]]+)\]\(([^\)]*)\)", r"\1", text)
        # Strip Markdown list markers and headings/emphasis
        text = re.sub(r"^\s{0,3}([*\-+]\s+)", "", text, flags=re.MULTILINE)
        text = re.sub(r"^\s{0,6}#{1,6}\s*", "", text, flags=re.MULTILINE)
        text = re.sub(r"[*_]{1,3}([^*_]+)[*_]{1,3}", r"\1", text)
        # Remove leftover HTML tags (basic sanitization)
        text = re.sub(r"<[^>]+>", " ", text)
        # Normalize whitespace
        text = re.sub(r"\s+", " ", text).strip()
        return text

    def convert_markdown_folder_to_speech(
        self,
        input_folder: str,
        output_folder: str,
        speaker_wav: Optional[str] = None,
        language: str = "vi",
        overwrite: bool = False,
    ) -> List[str]:
        """Convert all Markdown files in a folder to speech files.

        For each ``.md`` file in ``input_folder``, this function reads the
        Markdown, converts it to plain text, synthesizes speech using the
        configured TTS model, and writes a ``.wav`` file with the same base
        filename to ``output_folder``.

        Args:
            input_folder (str): Path to the directory containing ``.md`` files.
            output_folder (str): Path to the directory to write ``.wav`` files.
            speaker_wav (Optional[str]): Optional path to a reference speaker
                WAV file for voice cloning.
            language (str): Language code for synthesis. Defaults to ``"vi"``.
            overwrite (bool): Whether to overwrite existing output files.

        Returns:
            List[str]: List of absolute paths to generated ``.wav`` files.

        Raises:
            HTTPException: If the input folder does not exist or another error
                occurs during processing.
        """
        try:
            if not os.path.isdir(input_folder):
                raise HTTPException(
                    status_code=400,
                    detail=f"Input folder not found: {input_folder}",
                )

            os.makedirs(output_folder, exist_ok=True)

            generated_files: List[str] = []
            for entry in sorted(os.listdir(input_folder)):
                if not entry.lower().endswith(".md"):
                    continue

                input_path = os.path.join(input_folder, entry)
                if not os.path.isfile(input_path):
                    continue

                base_name, _ = os.path.splitext(entry)
                output_path = os.path.join(output_folder, f"{base_name}.wav")

                if os.path.exists(output_path) and not overwrite:
                    self.logger.info(
                        f"Skipping existing file (overwrite=False): {output_path}"
                    )
                    generated_files.append(os.path.abspath(output_path))
                    continue

                try:
                    with open(input_path, "r", encoding="utf-8") as f:
                        markdown_content = f.read()
                    text = self._markdown_to_text(markdown_content)
                    if not text:
                        self.logger.warning(
                            f"Empty content after Markdown cleanup: {input_path}"
                        )
                        continue

                    self.logger.debug(
                        f"Synthesizing TTS for '{entry}' (length={len(text)})"
                    )
                    audio_bytes = self.synthesize_speech(
                        text=text, speaker_wav=speaker_wav, language=language
                    )
                    with open(output_path, "wb") as out_f:
                        out_f.write(audio_bytes)
                    generated_files.append(os.path.abspath(output_path))
                    self.logger.info(f"Generated: {output_path}")
                except HTTPException:
                    # Re-raise HTTPExceptions to respect status codes upstream
                    raise
                except Exception as file_err:
                    self.logger.error(
                        f"Failed to process '{input_path}': {file_err}"
                    )
                    continue

            return generated_files
        except HTTPException:
            raise
        except Exception as e:
            self.logger.error(
                f"Error converting Markdown folder to speech: {str(e)}"
            )
            raise HTTPException(
                status_code=500,
                detail=f"Folder-to-speech conversion failed: {str(e)}",
            )
