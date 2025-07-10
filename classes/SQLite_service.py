import json
import sqlite3
from typing import List, Dict

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


