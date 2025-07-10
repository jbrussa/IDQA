import json
from fastapi import FastAPI, Query
from openai import OpenAI
from classes.BOT import BOT
from classes.SQLite_service import SQLite_service
from pydantic import BaseModel

app = FastAPI()
client = OpenAI()
bot = BOT()
sqlite_service = SQLite_service("database/Chinook_Sqlite.sqlite")

# Define the request model para el post
class SQLRequest(BaseModel):
    sql: str

#Endpoints
@app.get("/ping")
async def ping():
    return {"ping": "pong"}

@app.get("/query")
async def query(query: str = Query(..., description="Pregunta para el bot")):
    response = bot.message(query)
    return {"response": response}

@app.get("/schema", response_model=dict[str, list[dict[str, str]]])
async def get_schema():
    schema = sqlite_service.get_schema()
    return schema

@app.post("/execute")
async def execute_sql(request: SQLRequest): 
    result = sqlite_service.execute_sql_query(request.sql) 
    return json.loads(result)