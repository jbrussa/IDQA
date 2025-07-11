import json
from datetime import datetime
from fastapi import FastAPI, Query
from fastapi import FastAPI, Request, HTTPException
from openai import OpenAI
from classes.BOT import BOT
import uuid             #Nos permite crear un identificador único a nivel global
from classes.SQLite_service import SQLite_service
from pydantic import BaseModel

app = FastAPI()
client = OpenAI()
bot = BOT()
sqlite_service = SQLite_service("database/Chinook_Sqlite.sqlite")

# Define the request model para el post
class SQLRequest(BaseModel):
    sql: str


#  Crear tabla Sesiones y Historial si no existe
sqlite_service.create_table_sessions()
sqlite_service.create_table_historial()


#Endpoints
@app.get("/ping")
async def ping():
    return {"ping": "pong"}

@app.get("/query")
async def query(request: Request, query: str = Query(..., description="Pregunta para el bot")):

    # Recuperar id de sesión
    session_id = request.headers.get("id")
    if session_id is None:
        raise HTTPException(status_code=400, detail="No existe la sesión")

    # Buscar datos sesión
    sesion = sqlite_service.fetch_data_session(session_id)

    # Comprobar que la sesión sea de menos de 15 minutos
    sqlite_service.check_expiry(sesion)

    dateTimeQuery = datetime.now()

    response = bot.message(query, session_id)
    dateTimeResponse = datetime.now()

     # Insertar en historial
    sqlite_service.insert_historial(session_id, query, response, dateTimeQuery, dateTimeResponse)

    return {"response": response}

@app.post("/session")
async def register_session(request: Request) -> dict[str, str]:

    #Crear UUID y obtener IP del cliente
    session_id = str(uuid.uuid4())
    ip_cliente = request.client.host
    
    
    # Insertamos los datos a la bd
    sqlite_service.insert_session(session_id, ip_cliente)
    
    return {"id": session_id} 



@app.get("/schema", response_model=dict[str, list[dict[str, str]]])
async def get_schema():
    schema = sqlite_service.get_schema()
    return schema

@app.post("/execute")
async def execute_sql(request: SQLRequest): 
    result = sqlite_service.execute_sql_query(request.sql) 
    return json.loads(result)
