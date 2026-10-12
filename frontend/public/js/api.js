class ApiClient {
    constructor(baseUrl = 'http://127.0.0.1:8000') {
        this.baseUrl = baseUrl;
    }

    async _request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `Ошибка сервера: ${response.status}`);
            }
            return await response.json();
        } catch (err) {
            console.error('Fetch error:', err);
            throw err;
        }
    }

    async getDepartments() { return this._request('/api/departments'); }
    async getEmployees() { return this._request('/api/employees'); }
    async getRooms() { return this._request('/api/rooms'); }
    async getBookings() { return this._request('/api/bookings'); }
    
    async createBooking(data) {
        return this._request('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    }

    async deleteBooking(id) {
        return this._request(`/api/bookings/${id}`, {
            method: 'DELETE'
        });
    }
}

const api = new ApiClient();