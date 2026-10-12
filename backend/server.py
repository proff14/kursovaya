import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from config import SERVER_PORT
from handlers.departments import handle_get_departments
from handlers.employees import handle_get_employees
from handlers.rooms import handle_get_rooms
from handlers.bookings import handle_get_bookings, handle_create_booking, handle_delete_booking

class RequestHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def _send_json(self, data, status=200):
        self._set_headers(status)
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        try:
            if self.path == '/api/departments':
                handle_get_departments(self)
            elif self.path == '/api/employees':
                handle_get_employees(self)
            elif self.path == '/api/rooms':
                handle_get_rooms(self)
            elif self.path.startswith('/api/bookings'):
                handle_get_bookings(self)
            else:
                self._send_json({"error": "Not Found"}, status=404)
        except Exception as e:
            print(f"[ОШИБКА GET]: {e}")
            self._send_json({"error": str(e)}, status=500)

    def do_POST(self):
        try:
            if self.path == '/api/bookings':
                handle_create_booking(self)
            else:
                self._send_json({"error": "Not Found"}, status=404)
        except Exception as e:
            print(f"[ОШИБКА POST]: {e}")
            self._send_json({"error": str(e)}, status=500)

    def do_DELETE(self):
        try:
            clean_path = self.path.rstrip('/')
            if clean_path.startswith('/api/bookings/'):
                booking_id_str = clean_path.split('/')[-1]
                booking_id = int(booking_id_str)
                handle_delete_booking(self, booking_id)
            else:
                self._send_json({"error": "Not Found"}, status=404)
        except ValueError:
            self._send_json({"error": "Некорректный ID"}, status=400)
        except Exception as e:
            print(f"[ОШИБКА DELETE]: {e}")
            self._send_json({"error": str(e)}, status=500)

def run():
    # Явно связываем с 127.0.0.1
    server_address = ('127.0.0.1', SERVER_PORT)
    httpd = HTTPServer(server_address, RequestHandler)
    print("==========================================")
    print(f" Сервер запущен на http://127.0.0.1:{SERVER_PORT}")
    print("==========================================")
    httpd.serve_forever()

if __name__ == '__main__':
    run()