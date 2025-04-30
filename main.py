from fastapi import FastAPI
from openai import OpenAI
import classes.Bot as Bot

app = FastAPI()
client = OpenAI()
Bot = Bot.BOT()

#Endpoints
@app.get("/ping")
async def ping():
    return {"ping": "pong!"}

@app.get("/query")
async def query():
    return {"ping": "pong!"}