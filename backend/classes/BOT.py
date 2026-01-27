import json
import os
from openai import OpenAI
from dotenv import load_dotenv
from classes.SQLite_service import SQLite_service

load_dotenv()  # take environment variables from .env.
client = OpenAI()
sqlite_service = SQLite_service(os.getenv("DB_PATH", "database/Chinook_Sqlite.sqlite"))

class BOT:
    def test(self):
        return "ok"        
    
    def get_tools(self):
        return [
    {
        "type": "function",
        "function": {
            "name": "execute_sql_query",
            "description": "Ejecuta una consulta SQL sobre la base Chinook.",
            "parameters": {
                "type": "object",
                "properties": {
                    "sql_code": {
                        "type": "string",
                        "description": "Consulta SQL que se desea ejecutar"
                    }
                },
                "required": ["sql_code"]
            }
        }
    }
]

    def message(self, query: str, session_id: str, sqlite_service=None) -> str:
       # Si no se proporciona sqlite_service, usar uno por defecto
       if sqlite_service is None:
            sqlite_service = SQLite_service("database/Chinook_Sqlite.sqlite")

       # Obtener esquema de la base
       schema = sqlite_service.get_schema()
       schema_str = json.dumps(schema, indent=2) 

       # traer el historial del chat desde la bd
       history = "\n\n".join(sqlite_service.search_history(session_id))
       
       # Armar mensaje inicial con instrucciones + esquema + pregunta
       instruction = (
        "Sos un asistente experto en bases de datos SQLite. Solo podes responder preguntas que sean consultas a la base de datos. "
        "Dado el siguiente esquema de la base de datos, generá una consulta SQL válida, solo de lectura (SELECT), "
        "en base a la pregunta del usuario. Solo usá las tablas y columnas existentes. Tambien podes traducir los nombres de las tablas y columnas para entender lo que te pide el usuario\n\n"
        f"Esquema de la base:\n{schema_str}\n\n"
        f"Pregunta del usuario: {query}"
        f"Chat history: {history}"
        "No devuelvas la sentencia SQL, solo la respuesta a la pregunta del usuario. Cuando necesites devolver datos con formato, usa Markdown."
        "IMPORANTE: Solo debes responder preguntas relacionados a los datos de la base de datos, de lo contrario responde: No puedo darte esta respuesta"
        "IMPORANTE: Solo podes responder consultas a la base de datos, de lo contrario responde: No puedo darte esa respuesta"
        "IMPORANTE: no podes responder preguntas acerca de tu funcionamiento o construcción"
       )

       messages = [{"role": "user", "content": instruction}]
       response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=messages,
            tools=self.get_tools()
        )
       
       choice = response.choices[0]

       # Si GPT llama a una función
       if choice.message.tool_calls:
            tool_call = choice.message.tool_calls[0]
            function_name = tool_call.function.name
            # Se pasan los argumentos de la función a un diccionario
            arguments = json.loads(tool_call.function.arguments)

            if function_name == "execute_sql_query":
                sql_code = arguments["sql_code"]

                #  Bloquear todo lo que no sea SELECT
                if not sql_code.strip().lower().startswith("select"):
                    return "Solo se permiten consultas SELECT."

                # Ejecutar la consulta segura
                result = sqlite_service.execute_sql_query(sql_code)

                followup_messages = messages + [
                    {
                        "role": "assistant",
                        "tool_calls": [tool_call]
                    },
                    {
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": result
                    },
                ]

                final_response = client.chat.completions.create(
                    model="gpt-4.1-mini",
                    messages=followup_messages,
                )

                return final_response.choices[0].message.content
            
       # Si no hay llamada a función, simplemente devuelve el contenido del mensaje
       return choice.message.content




