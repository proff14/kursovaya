import json
from urllib.parse import parse_qs, urlparse
from db import get_db_connection

def handle_get_bookings(request_handler):
    try:
        conn = get_db_connection()
        sql = """
            SELECT b.id, r.name, e.full_name, b.start_time, b.end_time, b.title, b.status
            FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            JOIN employees e ON b.employee_id = e.id
            ORDER BY b.id DESC
        """
        rows = conn.run(sql)
        result = [{
            "id": r[0], "room_name": r[1], "employee_name": r[2],
            "start_time": str(r[3]), "end_time": str(r[4]), "title": r[5], "status": r[6]
        } for r in rows]
        request_handler._send_json(result)
    except Exception as e:
        request_handler._send_json({"error": str(e)}, status=500)

def handle_create_booking(request_handler):
    try:
        content_length = int(request_handler.headers['Content-Length'])
        post_data = request_handler.rfile.read(content_length)
        body = json.loads(post_data.decode('utf-8'))

        conn = get_db_connection()
        
        # Проверка пересечения временных интервалов
        check_query = """
            SELECT id FROM bookings
            WHERE room_id = :room_id
              AND status = 'CONFIRMED'
              AND NOT (end_time <= :start_time OR start_time >= :end_time)
        """
        conflicts = conn.run(check_query, 
                             room_id=int(body['room_id']), 
                             start_time=body['start_time'], 
                             end_time=body['end_time'])

        if conflicts:
            request_handler._send_json({"error": "Временной слот уже занят!"}, status=409)
            return

        insert_query = """
            INSERT INTO bookings (room_id, employee_id, start_time, end_time, title, status)
            VALUES (:room_id, :employee_id, :start_time, :end_time, :title, 'CONFIRMED')
            RETURNING id;
        """
        result = conn.run(insert_query,
                          room_id=int(body['room_id']),
                          employee_id=int(body['employee_id']),
                          start_time=body['start_time'],
                          end_time=body['end_time'],
                          title=body['title'])
        request_handler._send_json({"id": result[0][0], "message": "Успешно забронировано"}, status=201)
    except Exception as e:
        request_handler._send_json({"error": str(e)}, status=500)

def handle_delete_booking(request_handler, booking_id):
    try:
        conn = get_db_connection()
        conn.run("DELETE FROM bookings WHERE id = :id", id=booking_id)
        request_handler._send_json({"message": "Бронирование удалено"}, status=200)
    except Exception as e:
        request_handler._send_json({"error": str(e)}, status=500)