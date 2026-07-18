import os
import requests
from typing import List, Dict
from dotenv import load_dotenv

load_dotenv()

SUPPORTED_MODELS = {
    "llama-3.1-8b-instant": {
        "id": "llama-3.1-8b-instant",
        "name": "Llama 3.1 8B (Groq)",
        "provider": "groq",
        "model_id": "llama-3.1-8b-instant",
        "endpoint": "https://api.groq.com/openai/v1/chat/completions",
        "env_key": "GROQ_API_KEY"
    },
    "llama-3.3-70b-versatile": {
        "id": "llama-3.3-70b-versatile",
        "name": "Llama 3.3 70B (Groq)",
        "provider": "groq",
        "model_id": "llama-3.3-70b-versatile",
        "endpoint": "https://api.groq.com/openai/v1/chat/completions",
        "env_key": "GROQ_API_KEY"
    },
    "meta-llama/llama-3.3-70b-instruct:free": {
        "id": "meta-llama/llama-3.3-70b-instruct:free",
        "name": "Llama 3.3 70B (OpenRouter Free)",
        "provider": "openrouter",
        "model_id": "meta-llama/llama-3.3-70b-instruct:free",
        "endpoint": "https://openrouter.ai/api/v1/chat/completions",
        "env_key": "OPEN_ROUTER_API_KEY"
    },
    "meta-llama/llama-3.2-3b-instruct:free": {
        "id": "meta-llama/llama-3.2-3b-instruct:free",
        "name": "Llama 3.2 3B (OpenRouter Free)",
        "provider": "openrouter",
        "model_id": "meta-llama/llama-3.2-3b-instruct:free",
        "endpoint": "https://openrouter.ai/api/v1/chat/completions",
        "env_key": "OPEN_ROUTER_API_KEY"
    },
    "qwen/qwen3-coder:free": {
        "id": "qwen/qwen3-coder:free",
        "name": "Qwen 3 Coder (OpenRouter Free)",
        "provider": "openrouter",
        "model_id": "qwen/qwen3-coder:free",
        "endpoint": "https://openrouter.ai/api/v1/chat/completions",
        "env_key": "OPEN_ROUTER_API_KEY"
    }
}

def get_available_models() -> List[Dict]:
    """Return list of supported models with their key active status."""
    models_list = []
    for model_key, details in SUPPORTED_MODELS.items():
        active = True
        if details["env_key"]:
            key_val = os.getenv(details["env_key"])
            active = bool(key_val and key_val.strip())
            
        models_list.append({
            "id": details["id"],
            "name": details["name"],
            "provider": details["provider"],
            "active": active
        })
    return models_list

def _execute_llm_request(model_details: dict, history: List[Dict[str, str]]) -> tuple:
    """Helper to execute the requests and return (response_text, error_message)"""
    api_key = os.getenv(model_details["env_key"])
    if not api_key or not api_key.strip():
        return None, (f"⚠️ **Configuration Missing**\n\n"
                      f"The key `{model_details['env_key']}` is not configured in your backend `.env` file.\n"
                      f"Please add it to enable the **{model_details['name']}** model.")

    headers = {
        "Authorization": f"Bearer {api_key.strip()}",
        "Content-Type": "application/json"
    }
    
    if model_details["provider"] == "openrouter":
        headers["HTTP-Referer"] = "http://localhost:5173"
        headers["X-Title"] = "DverseAI Chat"

    payload = {
        "model": model_details["model_id"],
        "messages": history,
        "temperature": 0.7
    }

    try:
        response = requests.post(
            model_details["endpoint"],
            headers=headers,
            json=payload,
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            return result["choices"][0]["message"]["content"], None
        else:
            error_detail = response.text
            try:
                error_json = response.json()
                if "error" in error_json:
                    error_detail = error_json["error"].get("message", response.text)
            except Exception:
                pass
            return None, (f"❌ **API Error ({response.status_code})**\n\n"
                          f"Failed to query {model_details['provider'].upper()}: {error_detail}")
                          
    except requests.exceptions.Timeout:
        return None, "⏳ **Request Timeout**\n\nConnection to the AI provider timed out. Please try again."
    except Exception as e:
        return None, f"💥 **Error**\n\nAn unexpected connection error occurred: {str(e)}"

def generate_bot_response(history: List[Dict[str, str]], model_id: str) -> str:
    """
    Generate response using selected model and full history.
    history is a list of dicts: [{"role": "user"|"assistant", "content": "..."}]
    """
    # Fallback to default model if none specified or invalid
    if not model_id or model_id not in SUPPORTED_MODELS:
        model_id = "llama-3.1-8b-instant"

    model_details = SUPPORTED_MODELS.get(model_id)

    # 1. Attempt standard execution of the selected model
    res, err = _execute_llm_request(model_details, history)
    if res:
        return res

    # 2. Trigger automatic failover to the stable Groq Llama 3.1 model if the selection failed
    if model_id != "llama-3.1-8b-instant":
        stable_details = SUPPORTED_MODELS["llama-3.1-8b-instant"]
        fallback_res, fallback_err = _execute_llm_request(stable_details, history)
        if fallback_res:
            return (fallback_res + 
                    f"\n\n---\n*💡 Note: Switched to Llama 3.1 8B (Groq) dynamically due to rate limits/errors on the selected model ({model_details['name']}).*")

    # 3. If fallback fails as well, return original query error details
    return err

def summarize_messages(history: List[Dict[str, str]], model_id: str) -> str:
    """Generate a brief 1-2 sentence summary of the earlier chat transcript."""
    if not model_id or model_id not in SUPPORTED_MODELS:
        model_id = "llama-3.1-8b-instant"

    model_details = SUPPORTED_MODELS.get(model_id)
    if not model_details:
        return "Previous conversation context."

    api_key = os.getenv(model_details["env_key"])
    if not api_key or not api_key.strip():
        return "Earlier discussion summary."

    headers = {
        "Authorization": f"Bearer {api_key.strip()}",
        "Content-Type": "application/json"
    }

    dialogue_blocks = []
    for msg in history:
        sender_label = "User" if msg["role"] == "user" else "Assistant"
        dialogue_blocks.append(f"{sender_label}: {msg['content']}")
    history_text = "\n".join(dialogue_blocks)

    prompt = (
        "Summarize the following chat transcript briefly in 1 or 2 sentences, "
        "focusing strictly on facts (e.g. user name or preferences). "
        "Do not include conversational filler:\n\n"
        f"{history_text}"
    )

    payload = {
        "model": model_details["model_id"],
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2
    }

    try:
        response = requests.post(
            model_details["endpoint"],
            headers=headers,
            json=payload,
            timeout=10
        )
        if response.status_code == 200:
            return response.json()["choices"][0]["message"]["content"]
    except Exception:
        pass

    return "Earlier discussion regarding general topics."
