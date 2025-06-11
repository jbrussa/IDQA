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
        conn = self.get_connection()
        cursor = conn.cursor()

        # Obtener nombres de todas las tablas
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
        # tables será una lista como: [("clientes",), ("pedidos",)]
        tables = cursor.fetchall()  

        for (table_name,) in tables:
            cursor.execute(f"PRAGMA table_info('{table_name}');")
            columns = cursor.fetchall()
            schema[table_name] = [
                {"name": col[1], "type": col[2]} for col in columns
            ]

        conn.close()
        return schema