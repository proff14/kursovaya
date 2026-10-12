import pg8000.native
from config import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

def get_db_connection():
    return pg8000.native.Connection(
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME
    )