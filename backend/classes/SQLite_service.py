import json
import sqlite3
from typing import List, Dict
import os
from datetime import datetime,timedelta
from fastapi import HTTPException


class SQLite_service:
    def __init__(self, db_path: str):
        self.db_path = db_path

    def get_connection(self):
        return sqlite3.connect(self.db_path)

    def get_schema(self) -> Dict[str, List[Dict[str, str]]]: 
        """
        Devuelve el esquema de la base de datos:
        {
            "nombre_tabla": [
                {"name": "columna", "type": "tipo"},
                ...
            ],
            ...
        }
        """
        schema = {}
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # Obtener nombres de todas las tablas
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
            tables = cursor.fetchall()  # Lista como: [("clientes",), ("pedidos",)]

            for (table_name,) in tables:
                cursor.execute(f"PRAGMA table_info('{table_name}');")
                columns = cursor.fetchall()
                schema[table_name] = [
                    {"name": col[1], "type": col[2]} for col in columns
                ]

        return schema
    

    def execute_sql_query(self, sql_code: str) -> str:
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(sql_code)

                if sql_code.strip().lower().startswith("select"):
                    # Buscamos el nombre de las columnas
                    columns = [desc[0] for desc in cursor.description]
                    # Obtenemos todas las filas, lista de tuplas
                    rows = cursor.fetchall()
                    # Convertimos las filas a una lista de diccionarios
                    result = [dict(zip(columns, row)) for row in rows]
                    return json.dumps(result, indent=2)
                else:
                    conn.commit()
                    return json.dumps({"status": "success", "rows_affected": cursor.rowcount})

        except sqlite3.Error as e:
            return json.dumps({"status": "error", "message": str(e)})
        
    ## SESIONES

    # Crear tabla de sesiones si no existe
    def create_table_sessions(self) -> None:
        # Ruta completa a la base de datos dentro de 'db'
        db_path = os.path.join("database", "base.db")

       # Usamos with para manejar la conexión automáticamente, se cierra sola
        with sqlite3.connect(db_path) as conn:

            cursor = conn.cursor()
            # Crear la tabla para almacenar sesiones
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS sesiones (
                id TEXT NOT NULL,
                ip TEXT NOT NULL,
                fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)
             # Guardar cambios
            conn.commit()

        return

    def insert_session(self, session_id: str, ip_cliente: str) -> None:
        
        # Fecha y hora actual en formato para la bd
        dateTime = datetime.now().isoformat()   

        db_path = os.path.join("database", "base.db")

        with sqlite3.connect(db_path) as conn:

            cursor = conn.cursor()
            # Insertamos datos en tabla sesiones
            cursor.execute("INSERT INTO sesiones (id, ip, fecha) VALUES (?, ?, ?)", (session_id, ip_cliente, dateTime))   
            conn.commit()

        return


    def fetch_data_session(self, session_id: str) -> list[str]:

        db_path = os.path.join("database", "base.db") 

        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()

            # Busco en bd los datos de la session_id, y me trae solo uno. Si no existe error 400
            sesion = cursor.execute("SELECT * from sesiones where id = ?", (session_id,)).fetchone()
            if not sesion:
                raise HTTPException(status_code=400, detail="No existe la sesión")
        
        return sesion
    
    def check_expiry(self, sesion: list[str]) -> None:
        
         # Compruebo que no hayan pasado 15 minutos desde que se inició la sesión
        dateTime = sesion[2]
        dateTimeFormateado = datetime.fromisoformat(dateTime)
        if  datetime.now() - dateTimeFormateado > timedelta(minutes = 15):
            raise HTTPException(status_code=400, detail="La sesión ha caducado")
        
        return

