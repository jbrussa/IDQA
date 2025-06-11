import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()  # take environment variables from .env.
client = OpenAI()

class BOT:
    def test(self):
        return "ok"        
    

    def message(self, query: str) -> str:
        response = client.chat.completions.create(
            model="gpt-4.1",
            messages=[
                {"role": "user", "content": query}
            ]
    )
        return response.choices[0].message.content