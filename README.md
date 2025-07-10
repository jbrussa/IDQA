# IDQA

Intelligent Database Query Assistant

IDQA es una aplicación que permite a un usuario subir una base de datos SQLite, realizar preguntas en lenguaje natural sobre los datos, y recibir respuestas generadas mediante IA.

## Tecnologías

- Frontend: ReactJS
- Backend: Python + FastAPI
- Base de datos: SQLite
- API de IA: OpenAI GPT-4.1

## Requisitos

- Instalar python 3.10 o superior
- Crear entorno virtual con el siguiente comando:

`cd [carpeta del proyecto] 
python -m venv venv`

## Activar entorno

- En windows: .\venv\Scripts\activate
- En linux: . venv/bin/activate

## Instalar librerías

- Actualizar pip
  `pip install --upgrade pip`

- Instalar librerías
  `pip install -r requirements.txt`

## Para ejecutar

- Ejecutar el siguiente comando
  `fastapi dev main.py`



## Aclaración
Es necesario un archivo .env con la APIKEY para el uso de OpenAI
