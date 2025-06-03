from fastapi import FastAPI, Query
from openai import OpenAI
from classes.BOT import BOT

app = FastAPI()
client = OpenAI()
bot = BOT()

#Endpoints
@app.get("/ping")
async def ping():
    return {"ping": "pong!"}

@app.get("/query")
async def query(query: str = Query(..., description="Pregunta para el bot")):
    response = bot.message(query)
    return {"response": response}