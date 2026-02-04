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
       
       instruction = f"""
        You are an expert assistant in SQLite databases specialized in answering questions through database queries.

        Database schema:
        {schema_str}

        Chat history:
        {history}

        User question:
        {query}

        INSTRUCTIONS:

        1. GREETINGS AND BASIC INTERACTIONS:
        - Respond naturally to simple greetings like "hola", "hello", "hi", "buenos días", etc.
        - You can briefly introduce yourself: "¡Hola! Soy tu asistente de base de datos. ¿En qué puedo ayudarte?"
        
        2. DATABASE QUESTIONS:
        - Generate a valid, read-only SQL query (SELECT only)
        - Use only existing tables and columns from the schema
        - Execute the query and return the ANSWER (not the SQL statement)
        - Format results using Markdown when appropriate (tables, lists, etc.)
        - You may interpret table/column names to better understand the question
        
        3. OFF-TOPIC QUESTIONS:
        - For questions about your own functioning, construction, or how you work: 
            "No puedo responder preguntas sobre mi funcionamiento interno."
        - For any other non-database topic (weather, recipes, general knowledge, etc.):
            "Solo puedo ayudarte con consultas sobre la base de datos. ¿Tenés alguna pregunta sobre los datos?"
        
        4. AMBIGUOUS CASES:
        - If unsure whether a question relates to the database, try to interpret it in the database context first
        - If it clearly cannot be a database question, politely redirect

        TONE: Professional but friendly. Don't be cold, but stay focused on your database expertise.
        """

       messages = [{"role": "user", "content": instruction}]
       response = client.chat.completions.create(
            model="gpt-5.1-mini",
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




