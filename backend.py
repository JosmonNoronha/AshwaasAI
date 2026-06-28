# ====================================================================
# CELL 1: INSTALL DEPENDENCIES
# ====================================================================
# CELL 1: INSTALL ALL DEPENDENCIES
!pip install -q transformers==4.44.2 tokenizers==0.19.1
!pip install -q peft==0.12.0
!pip install -q accelerate==0.34.2
!pip install -q bitsandbytes==0.43.3
!pip install -q sentence-transformers
!pip install -q faiss-cpu
!pip install -q rapidfuzz
!pip install -q sentencepiece sacremoses
!pip install -q indic-nlp-library
!pip install -q indictranstoolkit
!pip install -q faster-whisper

# Restart runtime after this cell!
!pip install bitsandbytes --upgrade
!pip install triton --upgrade
# ====================================================================
# CELL 2: IMPORTS
# ====================================================================
import torch
import numpy as np
import json
import os
from itertools import product
from rapidfuzz import process, fuzz
from sentence_transformers import SentenceTransformer
import faiss
import pandas as pd
from transformers import (
    AutoModelForCausalLM, AutoTokenizer,
    AutoModelForSeq2SeqLM, pipeline
)
from peft import AutoPeftModelForCausalLM
from google.colab import drive


# ====================================================================
# CELL 3: CONFIG
# ====================================================================
TINYLLAMA_PATH   = "/content/drive/MyDrive/working/new/tinyllama_therapist"
MERGED_PATH      = "/content/drive/MyDrive/kavishModelCorrectors/merged_model"
KONKANI_XL       = "/content/drive/MyDrive/kavishModelCorrectors/db/konkani_translated.xlsx"
NOISE_XL         = "/content/drive/MyDrive/kavishModelCorrectors/final_results.xlsx"
VOCAB_PATH       = "/content/drive/MyDrive/kavishModelCorrectors/db/bert_gom.vocab"
SESSION_PATH     = "/content/drive/MyDrive/kavishModelCorrectors/session_memory.json"
WHISPER_PATH     = "/content/drive/MyDrive/whisper-small-konkani-faster1"
RECORD_SECONDS   = 30
FUZZY_TOP_K      = 2       # candidates per unknown word
FUZZY_THRESHOLD  = 70      # minimum similarity score (0-100)
RAG_TOP_K        = 3

# ====================================================================
# CELL 4: LOAD VOCAB + NOISE MAP
# ====================================================================
konkani_df = pd.read_excel(KONKANI_XL).drop_duplicates(subset=["message"]).reset_index(drop=True)
english_sentences = konkani_df["message"].dropna().tolist()
konkani_sentences = konkani_df["konkani_translation"].dropna().tolist()

noise_df  = pd.read_excel(NOISE_XL)
noise_map = dict(zip(
    noise_df["predicted"].dropna().str.lower().str.strip(),
    noise_df["actual"].dropna().str.strip()
))

# Build clean vocab
clean_vocab = set()
for s in konkani_sentences:
    for w in str(s).split():
        clean_vocab.add(w.strip().lower())

with open(VOCAB_PATH, "r", encoding="utf-8") as f:
    vocab_words = {l.strip().lower() for l in f if l.strip()}
vocab_words = {w for w in vocab_words if len(w) > 1 and not w.startswith("[")}
clean_vocab = clean_vocab.union(vocab_words)

# Pre-build sorted vocab list for fuzzy matching
vocab_list = sorted(clean_vocab)
print(f"Vocab size: {len(clean_vocab)}")

# ====================================================================
# CELL 5: RAG INDEX
# ====================================================================
print("Building RAG index...")
embedder = SentenceTransformer("all-MiniLM-L6-v2")
english_embeddings = embedder.encode(english_sentences, show_progress_bar=True).astype("float32")
faiss.normalize_L2(english_embeddings)
index = faiss.IndexFlatIP(english_embeddings.shape[1])
index.add(english_embeddings)
print(f"RAG index: {index.ntotal} entries")

# ====================================================================
# CELL 6: LOAD TRANSLATION MODELS (IndicTrans2)
# ====================================================================
print("Loading IndicTrans2 models...")
import subprocess, sys
subprocess.run([sys.executable, "-m", "pip", "install", "-q", "indictranstoolkit"], check=True)
from IndicTransToolkit.processor import IndicProcessor
ip = IndicProcessor(inference=True)

# Konkani → English
kon2en_name      = "ai4bharat/indictrans2-indic-en-1B"
kon2en_tokenizer = AutoTokenizer.from_pretrained(kon2en_name, trust_remote_code=True)
kon2en_model     = AutoModelForSeq2SeqLM.from_pretrained(kon2en_name, trust_remote_code=True).to("cuda")

# English → Konkani
en2kon_name      = "ai4bharat/indictrans2-en-indic-1B"
en2kon_tokenizer = AutoTokenizer.from_pretrained(en2kon_name, trust_remote_code=True)
en2kon_model     = AutoModelForSeq2SeqLM.from_pretrained(en2kon_name, trust_remote_code=True).to("cuda")

print("IndicTrans2 loaded!")

# ====================================================================
# CELL 7: LOAD GEMMA 2B (SENSE MAKER)
# ====================================================================
print("Loading microsoft/phi-2 sense maker...")
from transformers import BitsAndBytesConfig
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_use_double_quant=True,
    bnb_4bit_compute_dtype=torch.bfloat16,
)
gemma_tokenizer = AutoTokenizer.from_pretrained("microsoft/phi-2", trust_remote_code=True)
gemma_tokenizer.pad_token = gemma_tokenizer.eos_token
gemma_model = AutoModelForCausalLM.from_pretrained(
    "microsoft/phi-2",
    quantization_config=bnb_config,
    device_map="auto",
    trust_remote_code=True,
)
gemma_pipeline = pipeline(
    "text-generation",
    model=gemma_model,
    tokenizer=gemma_tokenizer,
    max_new_tokens=80,
    temperature=0.3,
    do_sample=True,
    pad_token_id=gemma_tokenizer.eos_token_id,
)
print("Phi-2 sense maker loaded!")

import json
from peft import LoraConfig
import inspect

config_path = f"{TINYLLAMA_PATH}/adapter_config.json"
with open(config_path) as f:
    config = json.load(f)

# Get all valid LoraConfig keys
valid_keys = set(inspect.signature(LoraConfig.__init__).parameters.keys())
valid_keys.discard("self")

# Remove any key not in valid_keys
removed = [k for k in list(config.keys()) if k not in valid_keys]
for k in removed:
    config.pop(k)

print("Removed keys:", removed)
print("Remaining keys:", list(config.keys()))

with open(config_path, "w") as f:
    json.dump(config, f, indent=2)

print("✅ Fixed!")
# ====================================================================
# CELL 8: LOAD TINYLLAMA (THERAPIST)
# ====================================================================
print("Loading TinyLlama therapist...")
# Step 1: Load base model directly (bypass PEFT loader's tokenizer issue)
from transformers import LlamaForCausalLM
from peft import PeftModel

base_model = LlamaForCausalLM.from_pretrained(
    "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
    torch_dtype=torch.float16,
    device_map="auto"
)

tinyllama_tokenizer = AutoTokenizer.from_pretrained(
    "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
    use_fast=False
)

# Step 2: Load your LoRA adapter on top
tinyllama_model = PeftModel.from_pretrained(base_model, TINYLLAMA_PATH)
tinyllama_model.eval()
print("✅ TinyLlama loaded!")
tinyllama_model.eval()
print("TinyLlama loaded!")

# ====================================================================
# CELL 8b: LOAD WHISPER ASR + AUDIO RECORDER
# ====================================================================
print("Loading Whisper ASR...")
from faster_whisper import WhisperModel

whisper_model = WhisperModel(
    WHISPER_PATH,
    device="cuda" if torch.cuda.is_available() else "cpu",
    compute_type="float16" if torch.cuda.is_available() else "int8",
)
print("✅ Whisper loaded!")

def record_and_transcribe() -> str:
    """Record from Colab microphone via raw PCM and return Whisper transcription."""
    from google.colab.output import eval_js
    import base64

    print(f"\n🎤 Listening for {RECORD_SECONDS}s... Speak now!")

    # Records raw float32 PCM at 16kHz directly from the browser AudioContext.
    # Avoids WebM/codec decoding — Python receives the array as-is.
    js = f"""
    async function record() {{
      const stream = await navigator.mediaDevices.getUserMedia({{audio: true, video: false}});
      const ctx = new AudioContext({{sampleRate: 16000}});
      const src = ctx.createMediaStreamSource(stream);
      const proc = ctx.createScriptProcessor(4096, 1, 1);
      const chunks = [];
      proc.onaudioprocess = (e) => chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
      src.connect(proc);
      proc.connect(ctx.destination);
      await new Promise(r => setTimeout(r, {RECORD_SECONDS * 1000}));
      proc.disconnect(); src.disconnect(); stream.getTracks().forEach(t => t.stop());
      const total = chunks.reduce((a, c) => a + c.length, 0);
      const out = new Float32Array(total);
      let off = 0;
      for (const c of chunks) {{ out.set(c, off); off += c.length; }}
      const bytes = new Uint8Array(out.buffer);
      let bin = '';
      for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      return btoa(bin);
    }}
    record()
    """

    b64 = eval_js(js)
    if not b64:
        print("⚠ No audio captured.")
        return ""

    audio = np.frombuffer(base64.b64decode(b64), dtype=np.float32).copy()

    max_val = np.abs(audio).max()
    if max_val < 1e-4:
        print("⚠ Audio too quiet — nothing detected.")
        return ""
    audio /= max_val

    segments, _ = whisper_model.transcribe(
        audio,
        language="mr",
        beam_size=3,
        temperature=0.0,
        vad_filter=True,
        vad_parameters=dict(threshold=0.2, min_speech_duration_ms=200),
    )
    text = " ".join(seg.text.strip() for seg in segments).strip()
    if text:
        print(f"📝 Transcribed: {text}")
    else:
        print("⚠ Whisper detected no speech.")
    return text

# ====================================================================
# CELL 9: PIPELINE FUNCTIONS
# ====================================================================
# ── Step 1: Fuzzy word expansion ─────────────────────────────────────
def expand_words(transcript: str) -> list[list[str]]:
    """
    For each word:
      - if in vocab or noise_map → single option
      - else → top FUZZY_TOP_K fuzzy matches (if score >= threshold)
    Returns a list of per-word candidate lists.
    """
    words = transcript.strip().split()
    per_word_candidates = []

    for word in words:
        w = word.lower().strip()

        if w in clean_vocab:
            per_word_candidates.append([word])                      # exact vocab hit
        elif w in noise_map:
            per_word_candidates.append([noise_map[w]])              # noise map hit
        else:
            matches = process.extract(
                w, vocab_list,
                scorer=fuzz.ratio,
                limit=FUZZY_TOP_K
            )
            candidates = [m[0] for m in matches if m[1] >= FUZZY_THRESHOLD]
            per_word_candidates.append(candidates if candidates else [word])  # fallback: keep original

    return per_word_candidates

def generate_candidate_sentences(per_word_candidates: list[list[str]]) -> list[str]:
    """Cartesian product of all per-word candidates → all sentence combinations."""
    combos = list(product(*per_word_candidates))
    return [" ".join(c) for c in combos]

# ── Step 2: Translate Konkani → English ──────────────────────────────
def translate_to_english(text: str) -> str:
    batch = ip.preprocess_batch([text], src_lang="gom_Deva", tgt_lang="eng_Latn")
    inputs = kon2en_tokenizer(batch, truncation=True, padding="longest", return_tensors="pt").to("cuda")
    with torch.no_grad():
        outputs = kon2en_model.generate(**inputs, num_beams=5, num_return_sequences=1, max_length=256)
    decoded = kon2en_tokenizer.batch_decode(outputs, skip_special_tokens=True, clean_up_tokenization_spaces=True)
    return ip.postprocess_batch(decoded, lang="eng_Latn")[0]

def translate_to_konkani(text: str) -> str:
    batch = ip.preprocess_batch([text], src_lang="eng_Latn", tgt_lang="gom_Deva")
    inputs = en2kon_tokenizer(batch, truncation=True, padding="longest", return_tensors="pt").to("cuda")
    with torch.no_grad():
        outputs = en2kon_model.generate(**inputs, num_beams=5, num_return_sequences=1, max_length=256)
    decoded = en2kon_tokenizer.batch_decode(outputs, skip_special_tokens=True, clean_up_tokenization_spaces=True)
    return ip.postprocess_batch(decoded, lang="gom_Deva")[0]

# ── Step 3: RAG retrieval ─────────────────────────────────────────────
def rag_retrieve(english_input: str, top_k: int = RAG_TOP_K) -> list[str]:
    q = embedder.encode([english_input]).astype("float32")
    faiss.normalize_L2(q)
    _, indices = index.search(q, top_k)
    return [english_sentences[i] for i in indices[0] if i < len(english_sentences)]

# ── Step 4: Gemma sense maker ─────────────────────────────────────────
def make_sense(candidate_translations: list[str], retrieved_contexts: list[str]) -> tuple[str, str]:
    """
    Given noisy english translations + RAG contexts,
    Gemma figures out:
      1. The most sensible english interpretation
      2. A short context label (situation summary)
    Returns (clean_english_input, context_label)
    """
    translations_block = "\n".join([f"- {t}" for t in candidate_translations])
    context_block      = "\n".join([f"- {c}" for c in retrieved_contexts])

    prompt = f"""You are helping a mental health app. A student spoke in Konkani and below are noisy English translations.
Pick the interpretation that sounds like a mental health concern a student would express.
Ignore translations that mention travel, countries, or unrelated topics.

Translations:
{translations_block}

Similar student mental health sentences:
{context_block}

Reply ONLY in this JSON format:
{{"interpretation": "...", "context": "..."}}"""

    output = gemma_pipeline(prompt)[0]["generated_text"]
    # Strip prompt from output
    response = output[len(prompt):].strip()

    try:
        # Find JSON in response
        start = response.index("{")
        end   = response.rindex("}") + 1
        parsed = json.loads(response[start:end])
        return parsed["interpretation"], parsed["context"]
    except Exception:
        # Fallback: use first translation and generic context
        return candidate_translations[0], "User is experiencing emotional distress"

# ── Step 5: TinyLlama therapist ───────────────────────────────────────
def therapy_response(context: str, user_message: str) -> str:
    if "tinyllama_tokenizer" not in globals() or "tinyllama_model" not in globals():
        raise RuntimeError("TinyLlama not loaded — re-run Cell 8 first.")
    prompt = (
        f"<|system|>\nYou are a compassionate mental health support assistant.</s>\n"
        f"<|user|>\n{context}: {user_message}</s>\n"
        f"<|assistant|>\n"
    )
    inputs = tinyllama_tokenizer(prompt, return_tensors="pt").to(tinyllama_model.device)
    input_length = inputs["input_ids"].shape[1]

    with torch.no_grad():
        outputs = tinyllama_model.generate(
            **inputs,
            max_new_tokens=150,
            temperature=0.7,
            top_p=0.9,
            do_sample=True,
            pad_token_id=tinyllama_tokenizer.pad_token_id,
            eos_token_id=tinyllama_tokenizer.eos_token_id,
            repetition_penalty=1.15,
        )

    new_tokens = outputs[0][input_length:]
    return tinyllama_tokenizer.decode(new_tokens, skip_special_tokens=True).strip()

# ====================================================================
# CELL 10: SESSION MEMORY
# ====================================================================
def load_session_memory() -> dict:
    """Load previous session summary if it exists."""
    if os.path.exists(SESSION_PATH):
        with open(SESSION_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"summary": None, "turns": []}

def save_session_memory(memory: dict):
    with open(SESSION_PATH, "w", encoding="utf-8") as f:
        json.dump(memory, f, ensure_ascii=False, indent=2)

def summarize_session(turns: list[dict]) -> str:
    """Use Gemma to summarize the session into a context string for next time."""
    if not turns:
        return ""
    turns_text = "\n".join([f"User: {t['user']}\nTherapist: {t['therapist']}" for t in turns])
    prompt = f"""Summarize this mental health support conversation in 2-3 sentences.
Focus on the user's main problems, emotional state, and any progress made.
This summary will be used to give the therapist context in the next session.

Conversation:
{turns_text}

Summary:"""
    output = gemma_pipeline(prompt)[0]["generated_text"]
    return output[len(prompt):].strip()

# ====================================================================
# CELL 11: FULL PIPELINE
# ====================================================================
def run_pipeline(konkani_input: str, memory: dict) -> dict:
    print(f"\n{'='*60}")
    print(f"INPUT: {konkani_input}")

    # ── Step 1: Fuzzy expand + generate candidate sentences
    per_word_candidates = expand_words(konkani_input)
    candidate_sentences = generate_candidate_sentences(per_word_candidates)
    print(f"\n[1] Candidate sentences ({len(candidate_sentences)}):")
    for s in candidate_sentences:
        print(f"   • {s}")

    # ── Step 2: Translate best candidate to English
    english_candidates = [translate_to_english(candidate_sentences[0])]
    print(f"\n[2] English translation: {english_candidates[0]}")

    # ── Step 3: RAG on first (most likely) translation
    retrieved = rag_retrieve(english_candidates[0])
    print(f"\n[3] RAG contexts:")
    for r in retrieved:
        print(f"   • {r}")

    # ── Step 4: Gemma sense maker
    interpretation, context_label = make_sense(english_candidates, retrieved)
    print(f"\n[4] Interpretation: {interpretation}")
    print(f"    Context label:   {context_label}")

    # ── Inject previous session memory into context if available
    if memory.get("summary"):
        context_label = f"{context_label}. Previous session: {memory['summary']}"

    # ── Step 5: TinyLlama therapy response
    english_response = therapy_response(context_label, interpretation)
    print(f"\n[5] Therapy response (EN): {english_response}")

    # ── Step 6: Translate back to Konkani
    konkani_response = translate_to_konkani(english_response)
    print(f"\n[6] Therapy response (Konkani): {konkani_response}")

    return {
        "candidates":          candidate_sentences,
        "english_candidates":  english_candidates,
        "interpretation":      interpretation,
        "context_label":       context_label,
        "english_response":    english_response,
        "konkani_response":    konkani_response,
    }

# ====================================================================
# CELL 12: SESSION LOOP
# ====================================================================
def run_session():
    memory = load_session_memory()

    if memory["summary"]:
        print(f"\n📝 Resuming session. Previous summary:\n{memory['summary']}\n")
    else:
        print("\n🆕 New session started.\n")

    turns = []
    print("Press ■ Stop in Colab to end the session.\n")

    try:
        while True:
            user_input = record_and_transcribe()

            if not user_input:
                print("Nothing transcribed — try again.\n")
                continue

            result = run_pipeline(user_input, memory)

            turns.append({
                "user":      result["interpretation"],
                "therapist": result["english_response"],
            })

            print(f"\n🤖 Response: {result['konkani_response']}\n")

    except KeyboardInterrupt:
        print("\nSession stopped.")

    finally:
        if turns:
            print("\n💾 Summarizing session...")
            memory["summary"] = summarize_session(turns)
            memory["turns"]   = turns
            save_session_memory(memory)
            print(f"Session saved. Summary:\n{memory['summary']}")

# ── Run it
run_session()
