
import os
import json
import pandas as pd
import librosa
import numpy as np
import noisereduce as nr
from vosk import Model, KaldiRecognizer
from jiwer import wer
import unicodedata
from scipy.signal import butter, lfilter

AUDIO_DIRECTORIES = {
    "English": "./EN",
    "Italian": "./IT",
    "Spanish": "./ES",
}

LANGUAGE_MODELS = {
    "English": "./vosk-model-en-us-0.22-lgraph",
    "Italian": "./vosk-model-it-0.22",
    "Spanish": "./vosk-model-es-0.42",
}

TRANSCRIPTIONS = {
    "English": {
        'checkin.wav': 'where is the check-in desk',
        'parents.wav': 'i have lost my parents',
        'suitcase.wav': 'please, I have lost my suitcase.',
        'what_time.wav': 'what time is my plane?',
        'where.wav': 'where are the restaurants and shops?',
        'your_sentence1.mp3': 'hello do you know where is the mrt station',
        'your_sentence2.mp3': 'hello my name is nisha'

    },
    "Italian": {
        'checkin_it.wav': 'dove e il bancone',
        'suitcase_it.wav': 'per favore, ho perso la mia valigia.',
        'what_time_it.wav': 'a che ora e il mio aereo?',
    },
    "Spanish": {
        'checkin_es.wav': 'donde estan los mostradores',
        'parents_es.wav': 'he perdido a mis padres',
        'suitcase_es.wav': 'Por favor, he perdido mi maleta.',
        'what_time_es.wav': '¿A qué hora es mi avión?',
        'where_es.wav': '¿Dónde están los restaurantes y las tiendas?',
    },
}

# Normalize text for comparison
def normalize_text(text):
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    text = text.lower().strip()
    text = text.replace("check in", "check-in")
    return text

# Load Vosk model for a given language
def load_language_model(language):
    model_path = LANGUAGE_MODELS.get(language)
    if not model_path:
        raise ValueError(f"Model not found for language: {language}")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model directory does not exist: {model_path}")
    print(f"Loading Vosk model for {language} from {model_path}...")
    return Model(model_path)

# Helper function to apply a low-pass filter
def apply_low_pass_filter(data, cutoff, fs, order=5):
    nyquist = 0.5 * fs 
    normal_cutoff = cutoff / nyquist
    b, a = butter(order, normal_cutoff, btype='low', analog=False)
    filtered_data = lfilter(b, a, data)
    return filtered_data

# Preprocess audio file with low-pass filter
def preprocess_audio(file_path):
    audio, sr = librosa.load(file_path, sr=None)
    if sr not in [8000, 16000]:
        print(f"Resampling {file_path} from {sr} Hz to 16000 Hz.")
        audio = librosa.resample(audio, orig_sr=sr, target_sr=16000)

    # Apply low-pass filter (cutoff frequency is 4000 Hz for 16000 Hz sampling rate)
    cutoff_frequency = 4000
    audio = apply_low_pass_filter(audio, cutoff=cutoff_frequency, fs=16000)

    # Reduce noise
    audio = nr.reduce_noise(y=audio, sr=16000)

    # Normalize audio
    audio = librosa.util.normalize(audio)

    # Convert to int16 format
    audio_int16 = np.int16(audio * 32767)
    return audio_int16, 16000

# Transcribe audio using Vosk
def transcribe_audio(model, audio_int16, sr):
    recognizer = KaldiRecognizer(model, sr)
    recognizer.SetWords(True)
    audio_bytes = audio_int16.tobytes()
    if recognizer.AcceptWaveform(audio_bytes):
        result = json.loads(recognizer.Result())
    else:
        result = json.loads(recognizer.FinalResult())
    return result.get("text", "")

# Calculate Word Error Rate
def calculate_word_error_rate(reference, hypothesis):
    return wer(normalize_text(reference), normalize_text(hypothesis)) * 100

# Log results in a user-friendly format
def log_results(language, file_name, reference, hypothesis, wer_score):
    print(f"Processed {file_name} ({language}):")
    print(f"  Reference: {reference}")
    print(f"  Hypothesis: {hypothesis}")
    print(f"  WER: {wer_score:.2f}%")
    print("-" * 50)

def main():
    results = []

    for language, directory in AUDIO_DIRECTORIES.items():
        try:
            model = load_language_model(language)
        except Exception as e:
            print(f"Error loading model for {language}: {e}")
            continue

        for file_name, ref_transcription in TRANSCRIPTIONS[language].items():
            file_path = os.path.join(directory, file_name)
            if not os.path.exists(file_path):
                print(f"Audio file not found: {file_path}")
                continue

            try:
                audio_int16, sr = preprocess_audio(file_path)
                hyp_transcription = transcribe_audio(model, audio_int16, sr)
                wer_score = calculate_word_error_rate(ref_transcription, hyp_transcription)

                results.append([language, file_name, ref_transcription, hyp_transcription, wer_score])
                log_results(language, file_name, ref_transcription, hyp_transcription, wer_score)
            except Exception as e:
                print(f"Error processing {file_name}: {e}")

    df = pd.DataFrame(results, columns=["Language", "File", "Reference", "Hypothesis", "WER"])
    df["WER"] = df["WER"].astype(float)

    # Calculate and display the average WER per language
    average_wer_per_language = df.groupby("Language")["WER"].mean()
    print("\nFinal Results:")
    print(df)
    print("\nAverage WER per Language:")
    print(average_wer_per_language)

    # Save results to CSV
    output_csv = "WER_results.csv"
    try:
        df.to_csv(output_csv, index=False)
        print(f"\nResults saved to {output_csv}")
    except Exception as e:
        print(f"Error saving results: {e}")

if __name__ == "__main__":
    main()

