import json
import time
from groq import Groq
from app.config import GROQ_API_KEY
from app.services.prompts import SYSTEM_PROMPT

client = Groq(api_key=GROQ_API_KEY)

MODEL = "llama-3.1-8b-instant"

DEFAULT_AI_RESULT = {
    "score": 40,
    "intent": "LOW",
    "reasons": ["Fallback score due to AI failure"]
}

def ask_groq(prompt: str, retries: int = 2) -> dict:
    for attempt in range(retries + 1):
        try:
            completion = client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=300
            )

            content = completion.choices[0].message.content.strip()
            return json.loads(content)

        except Exception as e:
            if attempt == retries:
                print("Groq failed:", e)
                return DEFAULT_AI_RESULT
            time.sleep(1)
