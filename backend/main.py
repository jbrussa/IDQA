import json
from datetime import datetime
from fastapi import FastAPI, Query, UploadFile, File
from fastapi import FastAPI, Request, Body, HTTPException
from openai import OpenAI
from classes.BOT import BOT
import uuid             #Nos permite crear un identificador único a nivel global
from classes.SQLite_service import SQLite_service
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import shutil  ## para coíar el archivo directamente, sin pasarlo a memoria
import os
import re

# Base de datos por defecto para gestión del sistema
DEFAULT_DB = "database/Chinook_Sqlite.sqlite"
SYSTEM_DB = "database/base.db"  # Para sesiones e historial
UPLOAD_FOLDER = "upload-database"  # Carpeta para bases de datos subidas por el usuario

app = FastAPI()
client = OpenAI()
bot = BOT()

# SQLite service para gestión del sistema (sesiones, historial)
system_sqlite_service = SQLite_service(SYSTEM_DB)


# Define the request model para el post
class SQLRequest(BaseModel):
    sql: str
class QueryModel(BaseModel):
    query: str


#  Crear tabla Sesiones y Historial si no existe
system_sqlite_service.create_table_sessions()
system_sqlite_service.create_table_historial()

# Configura los orígenes permitidos
origins = [
    "http://localhost:3000",
    "https://dia-ego8.onrender.com"
]

# Agrega el middleware CORS a la app FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Permite solicitudes de estos orígenes
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permite todos los encabezados
)

#Endpoints
@app.get("/ping")
async def ping():
    return {"ping": "pong"}

@app.post("/query")
async def query(request: Request, query: QueryModel = Body(...)):

    # Recuperar id de sesión
    session_id = request.headers.get("id")
    if session_id is None:
        raise HTTPException(status_code=400, detail="No existe la sesión")

    # Buscar datos sesión
    sesion = system_sqlite_service.fetch_data_session(session_id)

    # Comprobar que la sesión sea de menos de 15 minutos
    system_sqlite_service.check_expiry(sesion)

    # Crear SQLite service dinámico para las consultas de datos
    data_sqlite_service = SQLite_service.create_for_session(session_id, DEFAULT_DB)

    dateTimeQuery = datetime.now()

    response = bot.message(query, session_id, data_sqlite_service)
    dateTimeResponse = datetime.now()

     # Insertar en historial
    system_sqlite_service.insert_historial(session_id, query.query, response, dateTimeQuery, dateTimeResponse)

    return {"response": response}

@app.post("/session")
async def register_session(request: Request) -> dict[str, str]:

    #Crear UUID y obtener IP del cliente
    session_id = str(uuid.uuid4())
    ip_cliente = request.client.host
    
    
    # Insertamos los datos a la bd
    system_sqlite_service.insert_session(session_id, ip_cliente)
    
    return {"id": session_id} 

@app.post("/upload-db")
async def upload_database(request: Request,file: UploadFile = File(...)):
    try:
        #Validaciones
        if not file.filename:
            raise HTTPException(status_code=400, detail="No se proporcionó archivo")

        if not file.filename.lower().endswith(('.db', '.sqlite', '.sqlite3')):
           raise HTTPException(status_code=400, detail="Solo archivos de base de datos")
        
        # Crear carpeta 'upload-database' si no existe
        upload_folder = "upload-database"
        os.makedirs(upload_folder, exist_ok=True)

    # Obtener session_id del header
        session_id = request.headers.get("id")
        if not session_id:
            raise HTTPException(status_code=400, detail="No se proporcionó session ID")
    
        # Determinar extensión del archivo original
        file_extension = os.path.splitext(file.filename)[1]
        # Usar el session_id como nombre del archivo
        saved_filename = f"{session_id}{file_extension}"
        file_path = os.path.join(upload_folder, saved_filename)
        
        #! DEBUG
        print(f"Session ID recibido: {session_id}")
        print(f"Archivo recibido: {file.filename}")

        # Guardar el archivo en una ruta específica
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    
    except Exception as e:
        print(f"Error en upload-db: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
    
    return {"message": "Archivo subido correctamente"}


@app.get("/schema", response_model=dict[str, list[dict[str, str]]])
async def get_schema(request: Request):
    """
    Devuelve el esquema de la base de datos del usuario si ha subido una,
    o el esquema de la base de datos por defecto si no ha subido ninguna.
    """
    # Recupera el session_id del header
    session_id = request.headers.get("id")

    db_path = DEFAULT_DB
    
    # Comprueba si existe un archivo de base de datos para la sesión actual
    if session_id:
        # Lista de posibles extensiones de archivo
        possible_extensions = ['.sqlite', '.db', '.sqlite3']
        uploaded_db_found = False

        for ext in possible_extensions:
            # Crea la ruta al archivo subido con la extensión actual
            uploaded_file_path = os.path.join(UPLOAD_FOLDER, f"{session_id}{ext}")
            # Comprueba si el archivo existe
            if os.path.exists(uploaded_file_path):
                db_path = uploaded_file_path
                print(f"Usando base de datos subida: {db_path}")
                uploaded_db_found = True
        if not uploaded_db_found:
            print(f"Archivo no encontrado para la sesión {session_id}, usando DB por defecto: {db_path}")
    else:
        print("No se proporcionó session_id, usando DB por defecto: {db_path}")

    # Crea una instancia de SQLite_service con la ruta de la base de datos determinada
    data_sqlite_service = SQLite_service(db_path)
    
    # Obtiene el esquema
    schema = data_sqlite_service.get_schema()
    return schema

@app.post("/execute")
async def execute_sql(request: SQLRequest): 
    result =  system_sqlite_service.execute_sql_query(request.sql) 
    return json.loads(result)
