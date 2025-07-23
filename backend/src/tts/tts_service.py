import io
import logging
import os
import tempfile
import warnings

import soundfile as sf
import torch
from fastapi import HTTPException
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
        """Synthesize speech from text and return audio bytes"""
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
                temperature=0.7,
                length_penalty=1.0,
                repetition_penalty=10.0,
                top_k=30,
                top_p=0.85,
            )

            # Convert to bytes using in-memory buffer
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
        """Legacy method: synthesize speech and save to file"""
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
