from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

OLLAMA_API_URL = "http://localhost:11434/api/generate"

# Global conversation memory
conversation_history = []

@app.route("/chat", methods=["POST"])
def chat():
    global conversation_history  # Declare global to modify the variable

    try:
        data = request.json
        user_input = data.get("prompt", "")

        if not user_input:
            return jsonify({"error": "Missing prompt"}), 400

        MAX_HISTORY = 10

        # Append user message to history
        conversation_history.append(f"User: {user_input}")

        # Keep only last MAX_HISTORY messages
        conversation_history = conversation_history[-MAX_HISTORY:]

        # Build full prompt with instructions + conversation history
        history_text = "\n".join(conversation_history)
        full_prompt = (
            "You are a helpful assistant who replies briefly and concisely.\n"
            "Remember all previous conversation.\n"
            f"{history_text}\nAI:"
)


        payload = {
            "model": "llama3.2",   # Your Ollama model name
            "prompt": full_prompt,
            "stream": False
        }

        response = requests.post(OLLAMA_API_URL, json=payload)

        if response.status_code == 200:
            result = response.json()
            ai_response = result.get("response", "")

            # Append AI response to history
            conversation_history.append(f"AI: {ai_response}")

            return jsonify({"response": ai_response, "history": conversation_history})
        else:
            return jsonify({"error": f"Ollama returned status {response.status_code}"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/reset", methods=["POST"])
def reset():
    global conversation_history
    conversation_history = []
    return jsonify({"status": "conversation history cleared"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
