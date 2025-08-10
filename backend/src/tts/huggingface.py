import os
import re
import torch
import torchaudio
from underthesea import sent_tokenize
from unidecode import unidecode
from huggingface_hub import hf_hub_download, snapshot_download

from TTS.tts.configs.xtts_config import XttsConfig
from TTS.tts.models.xtts import Xtts

# Try to import vinorm, but provide fallback if it fails
try:
    from vinorm import TTSnorm
    VINORM_AVAILABLE = True
except (ImportError, OSError) as e:
    print(f"Warning: vinorm not available ({e}). Using fallback text normalization.")
    VINORM_AVAILABLE = False


class ViXTTS:
    def __init__(self, model_dir="model", repo_id="capleaf/viXTTS", use_deepspeed=False):
        self.model_dir = model_dir
        self.repo_id = repo_id
        self.use_deepspeed = use_deepspeed
        self.model = None

    def _normalize_vietnamese_text(self, text):
        """Normalize Vietnamese text for TTS synthesis."""
        if VINORM_AVAILABLE:
            try:
                normalized = TTSnorm(text, unknown=False, lower=False, rule=True)
            except Exception as e:
                print(f"Warning: vinorm failed ({e}). Using fallback normalization.")
                normalized = self._fallback_vietnamese_normalization(text)
        else:
            normalized = self._fallback_vietnamese_normalization(text)
        
        # Apply common post-processing rules
        return (
            normalized
            .replace("..", ".")
            .replace("!.", "!")
            .replace("?.", "?")
            .replace(" .", ".")
            .replace(" ,", ",")
            .replace('"', "")
            .replace("'", "")
            .replace("AI", "Ây Ai")
            .replace("A.I", "Ây Ai")
        )

    def _fallback_vietnamese_normalization(self, text):
        """Fallback Vietnamese text normalization for TTS when vinorm is not available."""
        
        # Number to word mapping
        number_words = {
            '0': 'không', '1': 'một', '2': 'hai', '3': 'ba', '4': 'bốn',
            '5': 'năm', '6': 'sáu', '7': 'bảy', '8': 'tám', '9': 'chín',
            '10': 'mười', '11': 'mười một', '12': 'mười hai', '13': 'mười ba',
            '14': 'mười bốn', '15': 'mười lăm', '16': 'mười sáu', '17': 'mười bảy',
            '18': 'mười tám', '19': 'mười chín', '20': 'hai mười'
        }
        
        # Month names
        months = {
            '1': 'một', '2': 'hai', '3': 'ba', '4': 'tư', '5': 'năm', '6': 'sáu',
            '7': 'bảy', '8': 'tám', '9': 'chín', '10': 'mười', '11': 'mười một', '12': 'mười hai'
        }
        
        normalized = text.lower()
        
        # Normalize dates (DD/MM/YYYY or DD/MM)
        def normalize_date(match):
            day = match.group(1)
            month = match.group(2)
            year = match.group(3) if match.group(3) else None
            
            day_word = number_words.get(day, self._number_to_vietnamese(int(day)))
            month_word = months.get(month, self._number_to_vietnamese(int(month)))
            
            if year:
                year_word = self._number_to_vietnamese(int(year))
                return f"ngày {day_word} tháng {month_word} năm {year_word}"
            else:
                return f"ngày {day_word} tháng {month_word}"
        
        normalized = re.sub(r'(\d{1,2})/(\d{1,2})/(\d{4})', normalize_date, normalized)
        normalized = re.sub(r'(\d{1,2})/(\d{1,2})', normalize_date, normalized)
        
        # Normalize percentages
        def normalize_percentage(match):
            number = match.group(1)
            return f"{self._number_to_vietnamese(float(number))} phần trăm"
        
        normalized = re.sub(r'(\d+(?:\.\d+)?)%', normalize_percentage, normalized)
        
        # Normalize currency (VND, USD, etc.)
        def normalize_currency(match):
            amount = match.group(1)
            currency = match.group(2).lower()
            amount_word = self._number_to_vietnamese(float(amount.replace(',', '').replace('.', '')))
            
            currency_map = {
                'vnd': 'việt nam đồng',
                'đồng': 'đồng',
                'usd': 'đô la mỹ',
                'eur': 'euro'
            }
            
            currency_word = currency_map.get(currency, currency)
            return f"{amount_word} {currency_word}"
        
        normalized = re.sub(r'([\d,\.]+)\s*(vnd|đồng|usd|eur)', normalize_currency, normalized)
        
        # Normalize large numbers with commas
        def normalize_large_number(match):
            number = match.group(1).replace(',', '').replace('.', '')
            return self._number_to_vietnamese(int(number))
        
        normalized = re.sub(r'(\d{1,3}(?:[,\.]\d{3})+)', normalize_large_number, normalized)
        
        # Normalize simple numbers
        def normalize_simple_number(match):
            number = match.group(1)
            if '.' in number:
                return self._number_to_vietnamese(float(number))
            else:
                return self._number_to_vietnamese(int(number))
        
        normalized = re.sub(r'\b(\d+(?:\.\d+)?)\b', normalize_simple_number, normalized)
        
        # Normalize common abbreviations
        abbreviations = {
            'dr.': 'doctor',
            'mr.': 'mister',
            'mrs.': 'misses',
            'ms.': 'miss',
            'prof.': 'professor',
            'vs.': 'versus',
            'etc.': 'et cetera',
            'e.g.': 'for example',
            'i.e.': 'that is',
            'km': 'ki-lô-mét',
            'cm': 'xen-ti-mét',
            'mm': 'mi-li-mét',
            'kg': 'ki-lô-gam',
            'g': 'gam',
            'mb': 'me-ga-byte',
            'gb': 'gi-ga-byte',
            'tb': 'te-ra-byte'
        }
        
        for abbr, full in abbreviations.items():
            normalized = re.sub(r'\b' + re.escape(abbr) + r'\b', full, normalized, flags=re.IGNORECASE)
        
        return normalized

    def _number_to_vietnamese(self, number):
        """Convert a number to Vietnamese words."""
        if isinstance(number, float):
            if number.is_integer():
                number = int(number)
            else:
                # Handle decimal numbers
                integer_part = int(number)
                decimal_part = str(number).split('.')[1]
                integer_words = self._int_to_vietnamese(integer_part)
                decimal_words = ' '.join([self._digit_to_vietnamese(d) for d in decimal_part])
                return f"{integer_words} phẩy {decimal_words}"
        
        return self._int_to_vietnamese(number)

    def _int_to_vietnamese(self, number):
        """Convert an integer to Vietnamese words."""
        if number == 0:
            return "không"
        
        if number < 0:
            return f"âm {self._int_to_vietnamese(-number)}"
        
        if number < 20:
            ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']
            teens = ['mười', 'mười một', 'mười hai', 'mười ba', 'mười bốn', 'mười lăm',
                    'mười sáu', 'mười bảy', 'mười tám', 'mười chín']
            
            if number < 10:
                return ones[number]
            else:
                return teens[number - 10]
        
        if number < 100:
            tens = number // 10
            ones = number % 10
            tens_words = ['', '', 'hai mười', 'ba mười', 'bốn mười', 'năm mười',
                         'sáu mười', 'bảy mười', 'tám mười', 'chín mười']
            
            if ones == 0:
                return tens_words[tens]
            else:
                return f"{tens_words[tens]} {self._int_to_vietnamese(ones)}"
        
        if number < 1000:
            hundreds = number // 100
            remainder = number % 100
            result = f"{self._int_to_vietnamese(hundreds)} trăm"
            if remainder > 0:
                if remainder < 10:
                    result += f" lẻ {self._int_to_vietnamese(remainder)}"
                else:
                    result += f" {self._int_to_vietnamese(remainder)}"
            return result
        
        if number < 1000000:
            thousands = number // 1000
            remainder = number % 1000
            result = f"{self._int_to_vietnamese(thousands)} nghìn"
            if remainder > 0:
                if remainder < 100:
                    result += f" lẻ {self._int_to_vietnamese(remainder)}"
                else:
                    result += f" {self._int_to_vietnamese(remainder)}"
            return result
        
        if number < 1000000000:
            millions = number // 1000000
            remainder = number % 1000000
            result = f"{self._int_to_vietnamese(millions)} triệu"
            if remainder > 0:
                if remainder < 1000:
                    result += f" lẻ {self._int_to_vietnamese(remainder)}"
                else:
                    result += f" {self._int_to_vietnamese(remainder)}"
            return result
        
        # For larger numbers, use tỷ (billion)
        billions = number // 1000000000
        remainder = number % 1000000000
        result = f"{self._int_to_vietnamese(billions)} tỷ"
        if remainder > 0:
            if remainder < 1000000:
                result += f" lẻ {self._int_to_vietnamese(remainder)}"
            else:
                result += f" {self._int_to_vietnamese(remainder)}"
        return result

    def _digit_to_vietnamese(self, digit):
        """Convert a single digit to Vietnamese word."""
        digit_words = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']
        return digit_words[int(digit)]

    def _calculate_keep_len(self, text):
        word_count = len(text.split())
        num_punct = text.count(".") + text.count("!") + text.count("?") + text.count(",")
        if word_count < 5:
            return 15000 * word_count + 2000 * num_punct
        elif word_count < 10:
            return 13000 * word_count + 2000 * num_punct
        return -1

    def load_model(self):
        os.makedirs(self.model_dir, exist_ok=True)
        required_files = ["model.pth", "config.json", "vocab.json", "speakers_xtts.pth"]

        # Download if missing
        if not all(f in os.listdir(self.model_dir) for f in required_files):
            snapshot_download(
                repo_id=self.repo_id, repo_type="model", local_dir=self.model_dir
            )
            hf_hub_download(
                repo_id="coqui/XTTS-v2",
                filename="speakers_xtts.pth",
                local_dir=self.model_dir,
            )

        config_path = os.path.join(self.model_dir, "config.json")
        config = XttsConfig()
        config.load_json(config_path)
        self.model = Xtts.init_from_config(config)
        self.model.load_checkpoint(config, checkpoint_dir=self.model_dir, use_deepspeed=self.use_deepspeed)
        if torch.cuda.is_available():
            self.model.cuda()

    def tts_from_text(self, text, lang, reference_audio, output_path):
        if self.model is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")

        # Normalize text if Vietnamese
        if lang == "vi":
            text = self._normalize_vietnamese_text(text)

        # Get speaker conditioning
        gpt_cond_latent, speaker_embedding = self.model.get_conditioning_latents(
            audio_path=reference_audio,
            gpt_cond_len=self.model.config.gpt_cond_len,
            max_ref_length=self.model.config.max_ref_len,
            sound_norm_refs=self.model.config.sound_norm_refs,
        )

        # Split into sentences
        sentences = sent_tokenize(text)
        wav_chunks = []
        for sentence in sentences:
            if sentence.strip():
                wav_chunk = self.model.inference(
                    text=sentence,
                    language=lang,
                    gpt_cond_latent=gpt_cond_latent,
                    speaker_embedding=speaker_embedding,
                    temperature=0.3,
                    length_penalty=1.0,
                    repetition_penalty=10.0,
                    top_k=30,
                    top_p=0.85,
                    enable_text_splitting=True,
                )
                keep_len = self._calculate_keep_len(sentence)
                wav_chunk["wav"] = wav_chunk["wav"][:keep_len]
                wav_chunks.append(torch.tensor(wav_chunk["wav"]))

        # Combine and save
        out_wav = torch.cat(wav_chunks, dim=0).unsqueeze(0)
        torchaudio.save(output_path, out_wav, 24000)
        return output_path

    def tts_from_file(self, txt_file, lang, reference_audio, output_path):
        with open(txt_file, "r", encoding="utf-8") as f:
            text = f.read()
        return self.tts_from_text(text, lang, reference_audio, output_path)


def test_text_normalization():
    """Test the Vietnamese text normalization function."""
    tts = ViXTTS()
    
    # Test various text normalization cases
    test_cases = [
        "Ngày 18/09/2023, tôi có 1.500.000 VND",
        "Tôi cao 175cm và nặng 70kg",
        "Tỷ lệ thành công là 95.5%",
        "Dr. Nam và Prof. Hương thảo luận về AI",
        "Có 123 người tham gia sự kiện"
    ]
    
    print("Testing Vietnamese text normalization:")
    print("=" * 50)
    
    for i, text in enumerate(test_cases, 1):
        normalized = tts._normalize_vietnamese_text(text)
        print(f"{i}. Input:  {text}")
        print(f"   Output: {normalized}")
        print()

if __name__ == "__main__":
    # Test normalization first
    # test_text_normalization()
    
    # Uncomment below to run full TTS
    tts = ViXTTS(model_dir="model", repo_id="capleaf/viXTTS")
    tts.load_model()
    tts.tts_from_file(
        txt_file="/Users/tridungduong16/Documents/GitHub/VeritusAI_v3/backend/data/results/doi-song/url_091.txt",
        lang="vi",
        reference_audio="/Users/tridungduong16/Documents/GitHub/VeritusAI_v3/backend/data/output_vietnamese.wav",
        output_path="/Users/tridungduong16/Documents/GitHub/VeritusAI_v3/backend/data/results/doi-song/url_091.wav",
    )
    print("TTS saved to output.wav")
