from flask import Flask, request, jsonify
from flask_cors import CORS
import requests, json
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

# Initialize Flask
app = Flask(__name__)
CORS(app)

# Load F1DB JSON data (schema or actual records)
with open("f1db.schema.json", "r", encoding="utf-8") as f:
    f1db = json.load(f)

# Flatten into text chunks
chunks = []
def extract_chunks(obj, path=""):
    if isinstance(obj, dict):
        for k, v in obj.items():
            extract_chunks(v, path + f"{k}.")
    elif isinstance(obj, list):
        for idx, item in enumerate(obj):
            extract_chunks(item, path + f"{idx}.")
    else:
        text = str(obj)
        if len(text) > 20:
            chunks.append((path, text))

extract_chunks(f1db)

# Embed and index
model = SentenceTransformer("all-MiniLM-L6-v2")
texts = [c[1] for c in chunks]
embeddings = model.encode(texts, convert_to_numpy=True)
index = faiss.IndexFlatIP(embeddings.shape[1])
faiss.normalize_L2(embeddings)
index.add(embeddings)

# Ollama endpoint
OLLAMA_API = "http://localhost:11434/api/generate"
conversation_history = []

def retrieve(query, topk=5):
    q_emb = model.encode([query], convert_to_numpy=True)
    faiss.normalize_L2(q_emb)
    D, I = index.search(q_emb, topk)
    return [texts[i] for i in I[0]]

@app.route("/chat", methods=["POST"])
def chat():
    global conversation_history
    data = request.json
    user = data.get("prompt","")
    if not user:
        return jsonify({"error":"Missing prompt"}),400

    # Update history
    conversation_history.append(f"User: {user}")
    conversation_history = conversation_history[-10:]
    
    # Retrieve top chunks
    top_chunks = retrieve(user, topk=5)
    context = "\n".join(f"Context: {tc}" for tc in top_chunks)

    prompt = (
        "You are a helpful assistant knowledgeable in Formula 1 using F1DB data.\n"
        f"{context}\n"
        + "\n".join(conversation_history)
        + "\nAI:"
    )
    
    resp = requests.post(OLLAMA_API, json={
        "model":"llama3.2", "prompt":prompt, "stream":False})
    if resp.status_code != 200:
        return jsonify({"error":f"Ollama status {resp.status_code}"}),500

    ai = resp.json().get("response","")
    conversation_history.append(f"AI: {ai}")
    return jsonify({"response":ai, "history":conversation_history})

@app.route("/reset", methods=["POST"])
def reset():
    conversation_history.clear()
    return jsonify({"status":"cleared"})

if __name__=="__main__":
    app.run(host="0.0.0.0", port=5000)
