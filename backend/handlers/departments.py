import json
from db import get_db_connection

def handle_get_departments(request_handler):
    try:
        conn = get_db_connection()
        rows = conn.run("SELECT id, name, description FROM departments ORDER BY id ASC")
        result = [{"id": r[0], "name": r[1], "description": r[2]} for r in rows]
        request_handler._send_json(result)
    except Exception as e:
        request_handler._send_json({"error": str(e)}, status=500)