import os
from openai import OpenAI


from dotenv import load_dotenv
load_dotenv()  # take environment variables from .env.
client = OpenAI()

class BOT:
    def test(self):
        return "ok"        
    

    def message(self, query: str) -> str:
        
        response = client.responses.create(
            model="gpt-4.1",
            input="Write a one-sentence bedtime story about a unicorn."
        )

        return response.output_text