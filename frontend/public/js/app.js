let currentTab = 'bookings';

async function switchTab(tabName, btnElement) {
    currentTab = tabName;
    
    // Обновление активного состояния кнопок
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (btnElement) {
        btnElement.classList.add('active');
    }

    const content = document.getElementById('content');
    content.innerHTML = '<p style="color: #94a3b8;">Загрузка данных...</p>';

    try {
        if (tabName === 'bookings') {
            await renderBookingsView(content);
        } else if (tabName === 'rooms') {
            const data = await api.getRooms();
            renderTable(content, ['ID', 'Название', 'Вместимость', 'Оборудование', 'Активна'], 
                data.map(r => [r.id, r.name, r.capacity || '—', r.equipment || '—', r.is_active ? 'Да' : 'Нет']));
        } else if (tabName === 'employees') {
            const data = await api.getEmployees();
            renderTable(content, ['ID', 'ФИО', 'Email', 'Роль', 'Отдел'], 
                data.map(e => [e.id, e.full_name, e.email, e.role, e.department || '—']));
        } else if (tabName === 'departments') {
            const data = await api.getDepartments();
            renderTable(content, ['ID', 'Название', 'Описание'], 
                data.map(d => [d.id, d.name, d.description || '—']));
        }
    } catch (e) {
        content.innerHTML = `<p style="color: #ef4444;">Ошибка загрузки данных: ${e.message}</p>`;
    }
}

async function renderBookingsView(container) {
    const [bookings, rooms, employees] = await Promise.all([
        api.getBookings(),
        api.getRooms(),
        api.getEmployees()
    ]);

    let html = `
        <div class="card">
            <h3>Создать бронирование</h3>
            <form id="createBookingForm" onsubmit="handleCreateBooking(event)" class="form-grid">
                <div class="form-group">
                    <label>Переговорная:</label>
                    <select id="roomSelect" required>
                        ${rooms.map(r => `<option value="${r.id}">${r.name} (${r.capacity || 6} чел.)</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Сотрудник:</label>
                    <select id="employeeSelect" required>
                        ${employees.map(e => `<option value="${e.id}">${e.full_name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Заголовок встречи:</label>
                    <input type="text" id="titleInput" placeholder="Например: Совещание" required />
                </div>
                <div class="form-group">
                    <label>Время начала:</label>
                    <input type="datetime-local" id="startTimeInput" required />
                </div>
                <div class="form-group">
                    <label>Время окончания:</label>
                    <input type="datetime-local" id="endTimeInput" required />
                </div>
                <div class="form-group" style="grid-column: 1 / -1; margin-top: 8px;">
                    <button type="submit" class="btn btn-primary" style="width: max-content;">Забронировать</button>
                </div>
            </form>
            <div id="formMessage"></div>
        </div>
    `;

    container.innerHTML = html;

    const tableDiv = document.createElement('div');
    container.appendChild(tableDiv);

    renderTableWithActions(tableDiv, 
        ['ID', 'Комната', 'Сотрудник', 'Начало', 'Окончание', 'Заголовок', 'Статус', 'Действия'], 
        bookings
    );
}

async function handleCreateBooking(event) {
    event.preventDefault();
    const msgDiv = document.getElementById('formMessage');
    msgDiv.innerHTML = '<span style="color: #94a3b8;">Сохранение...</span>';

    const data = {
        room_id: document.getElementById('roomSelect').value,
        employee_id: document.getElementById('employeeSelect').value,
        title: document.getElementById('titleInput').value,
        start_time: document.getElementById('startTimeInput').value,
        end_time: document.getElementById('endTimeInput').value
    };

    try {
        await api.createBooking(data);
        msgDiv.innerHTML = '<span style="color: #10b981;">Бронирование успешно создано!</span>';
        setTimeout(() => switchTab('bookings', document.querySelector('.tab-btn.active')), 600);
    } catch (e) {
        msgDiv.innerHTML = `<span style="color: #ef4444;">${e.message}</span>`;
    }
}

async function deleteBookingItem(id) {
    if (!confirm(`Удалить бронирование #${id}?`)) return;
    try {
        await api.deleteBooking(id);
        switchTab('bookings', document.querySelector('.tab-btn.active'));
    } catch (e) {
        alert(`Ошибка удаления: ${e.message}`);
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return dateStr.replace('T', ' ').substring(0, 16);
}

function renderTableWithActions(container, headers, bookings) {
    let html = '<div class="table-container"><table><thead><tr>';
    headers.forEach(h => html += `<th>${h}</th>`);
    html += '</tr></thead><tbody>';

    if (bookings.length === 0) {
        html += `<tr><td colspan="${headers.length}" style="text-align: center; color: #94a3b8;">Записей пока нет</td></tr>`;
    } else {
        bookings.forEach(b => {
            html += `<tr>
                <td>${b.id}</td>
                <td>${b.room_name}</td>
                <td>${b.employee_name}</td>
                <td>${formatDate(b.start_time)}</td>
                <td>${formatDate(b.end_time)}</td>
                <td>${b.title || '—'}</td>
                <td><span class="badge">${b.status}</span></td>
                <td><button onclick="deleteBookingItem(${b.id})" class="btn btn-danger">Удалить</button></td>
            </tr>`;
        });
    }

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function renderTable(container, headers, rows) {
    let html = '<div class="table-container"><table><thead><tr>';
    headers.forEach(h => html += `<th>${h}</th>`);
    html += '</tr></thead><tbody>';

    if (rows.length === 0) {
        html += `<tr><td colspan="${headers.length}" style="text-align: center; color: #94a3b8;">Записей пока нет</td></tr>`;
    } else {
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => html += `<td>${cell !== null && cell !== undefined ? cell : '—'}</td>`);
            html += '</tr>';
        });
    }

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => switchTab('bookings', document.querySelector('.tab-btn')));