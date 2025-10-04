# DIA

An Intelligent Database Query Assistant

DIA is an application that allows a user to upload a SQLite database, ask natural language questions about the data, and receive AI-generated answers.

![Ejemplo de uso](https://github.com/jbrussa/IDQA/raw/main/frontend/src/assets/gif-presentation.gif)

## Technologies

- Frontend: ReactJS
- Backend: Python + FastAPI
- Database: SQLite
- AI API: OpenAI GPT-4.1 mini

## Requirements

- Install Python 3.10 or a newer version.
- Create a virtual environment with the following command:

`cd [project folder] 
python -m venv venv`

## Activating the Environment

- On windows: .\venv\Scripts\activate
- On linux: . venv/bin/activate

## Installing Libraries

- Upgrade pip:
  `pip install --upgrade pip`

- Installing Libraries:
  `pip install -r requirements.txt`

## To Run

- Execute the following command:
  `fastapi dev main.py`

## Note

An .env file with the API key is required to use OpenAI.
