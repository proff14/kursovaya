import json
from db import get_db_connection

def handle_get_employees(request_handler):
    try:
        conn = get_db_connection()
        query = """
            SELECT e.id, e.full_name, e.email, e.role, d.name 
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            ORDER BY e.id ASC
        """
        rows = conn.run(query)
        result = [{"id": r[0], "full_name": r[1], "email": r[2], "role": r[3], "department": r[4]} for r in rows]
        request_handler._send_json(result)
    except Exception as e:
        request_handler._send_json({"error": str(e)}, status=500)