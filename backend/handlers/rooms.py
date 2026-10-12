import json
from db import get_db_connection

def handle_get_rooms(request_handler):
    try:
        conn = get_db_connection()
        rows = conn.run("SELECT id, name, capacity, equipment, is_active FROM rooms ORDER BY id ASC")
        result = [{"id": r[0], "name": r[1], "capacity": r[2], "equipment": r[3], "is_active": r[4]} for r in rows]
        request_handler._send_json(result)
    except Exception as e:
        request_handler._send_json({"error": str(e)}, status=500)