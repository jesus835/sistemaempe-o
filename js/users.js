// Módulo de Gestión de Usuarios
function loadUsersModule() {
    console.log('👤 Cargando módulo de Usuarios...');
    const section = document.getElementById('users');
    section.innerHTML = `
        <div class="table-container">
            <div class="table-header">
                <h3>Gestión de Usuarios</h3>
                <button class="btn btn-primary" onclick="openUserModal()">
                    <i class="fas fa-plus"></i> Nuevo Usuario
                </button>
            </div>
            <div class="table-content">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Usuario</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="users-table-body">
                        ${app.data.users.map(user => `
                            <tr>
                                <td>${user.id}</td>
                                <td>${user.username}</td>
                                <td>${user.name}</td>
                                <td>${user.email}</td>
                                <td><span class="badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}">${user.role === 'admin' ? 'Administrador' : 'Usuario'}</span></td>
                                <td><span class="badge ${user.status === 'active' ? 'badge-success' : 'badge-danger'}">${user.status === 'active' ? 'Activo' : 'Inactivo'}</span></td>
                                <td>
                                    <button class="btn btn-secondary" onclick="editUser(${user.id})">Editar</button>
                                    ${user.id !== app.currentUser.id ? `<button class="btn btn-danger" onclick="deleteUser(${user.id})">Eliminar</button>` : ''}
                                    <button class="btn btn-info" onclick="viewUserDetails(${user.id})">Ver</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    console.log(`✅ Módulo de Usuarios cargado exitosamente (${app.data.users.length} usuarios)`);
}
function openUserModal(userId = null) {
    const user = userId ? app.data.users.find(u => u.id === userId) : null;
    const title = user ? 'Editar Usuario' : 'Nuevo Usuario';
    
    const modalContent = `
        <div class="form-container">
            <form id="user-form">
                <input type="hidden" id="user-id" value="${user ? user.id : ''}">
                <div class="form-row">
                    <div class="form-group">
                        <label for="user-username">Nombre de Usuario *</label>
                        <input type="text" id="user-username" value="${user ? user.username : ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="user-name">Nombre Completo *</label>
                        <input type="text" id="user-name" value="${user ? user.name : ''}" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="user-email">Email *</label>
                        <input type="email" id="user-email" value="${user ? user.email : ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="user-phone">Teléfono</label>
                        <input type="tel" id="user-phone" value="${user ? user.phone : ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label for="user-password">Contraseña ${user ? '(dejar vacío para mantener la actual)' : '*'}</label>
                    <input type="password" id="user-password" ${user ? '' : 'required'}>
                </div>
                <div class="form-group">
                    <label for="user-role">Rol *</label>
                    <select id="user-role" required>
                        <option value="user" ${user && user.role === 'user' ? 'selected' : ''}>Usuario Común</option>
                        <option value="admin" ${user && user.role === 'admin' ? 'selected' : ''}>Administrador</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="user-status">Estado</label>
                    <select id="user-status">
                        <option value="active" ${!user || user.status === 'active' ? 'selected' : ''}>Activo</option>
                        <option value="inactive" ${user && user.status === 'inactive' ? 'selected' : ''}>Inactivo</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="user-notes">Notas</label>
                    <textarea id="user-notes" rows="2" placeholder="Información adicional del usuario">${user ? user.notes || '' : ''}</textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">
                        ${user ? 'Actualizar Usuario' : 'Crear Usuario'}
                    </button>
                </div>
            </form>
        </div>
    `;

    app.showModal(title, modalContent);
    
    document.getElementById('user-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveUser();
    });
}

function saveUser() {
    const userId = document.getElementById('user-id').value;
    const existingUser = userId ? app.data.users.find(u => u.id == userId) : null;
    
    // Validar nombre de usuario único
    const username = document.getElementById('user-username').value;
    const isUsernameTaken = app.data.users.some(u => u.username === username && u.id != userId);
    
    if (isUsernameTaken) {
        alert('El nombre de usuario ya está en uso.');
        return;
    }

    const formData = {
        id: userId || app.generateId(),
        username: username,
        name: document.getElementById('user-name').value,
        email: document.getElementById('user-email').value,
        phone: document.getElementById('user-phone').value,
        password: document.getElementById('user-password').value || (existingUser ? existingUser.password : ''),
        role: document.getElementById('user-role').value,
        status: document.getElementById('user-status').value,
        notes: document.getElementById('user-notes').value,
        createdAt: existingUser ? existingUser.createdAt : new Date().toISOString(),
        lastLogin: existingUser ? existingUser.lastLogin : null
    };

    if (userId) {
        // Actualizar usuario existente
        const index = app.data.users.findIndex(u => u.id == userId);
        app.data.users[index] = formData;
    } else {
        // Crear nuevo usuario
        app.data.users.push(formData);
    }

    app.saveData();
    app.closeModal();
    loadUsersModule();
    
    const message = userId ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente';
    alert(message);
}

function editUser(userId) {
    openUserModal(userId);
}

function deleteUser(userId) {
    const user = app.data.users.find(u => u.id === userId);
    if (!user) return;

    // No permitir eliminar el último administrador
    const adminCount = app.data.users.filter(u => u.role === 'admin' && u.id !== userId).length;
    if (user.role === 'admin' && adminCount === 0) {
        alert('No se puede eliminar el último administrador del sistema.');
        return;
    }

    // No permitir que un usuario se elimine a sí mismo
    if (userId === app.currentUser.id) {
        alert('No puedes eliminarte a ti mismo.');
        return;
    }

    if (confirm(`¿Estás seguro de que quieres eliminar al usuario "${user.name}"?`)) {
        app.data.users = app.data.users.filter(u => u.id !== userId);
        app.saveData();
        loadUsersModule();
        alert('Usuario eliminado exitosamente');
    }
}

function resetUserPassword(userId) {
    const user = app.data.users.find(u => u.id === userId);
    if (!user) return;

    if (confirm(`¿Estás seguro de que quieres restablecer la contraseña del usuario "${user.name}"?`)) {
        user.password = 'password123'; // Contraseña temporal
        app.saveData();
        loadUsersModule();
        alert(`Contraseña restablecida. Nueva contraseña temporal: password123`);
    }
}

function toggleUserStatus(userId) {
    const user = app.data.users.find(u => u.id === userId);
    if (!user) return;

    // No permitir desactivar el último administrador
    if (user.role === 'admin' && user.status === 'active') {
        const activeAdmins = app.data.users.filter(u => u.role === 'admin' && u.status === 'active' && u.id !== userId).length;
        if (activeAdmins === 0) {
            alert('No se puede desactivar el último administrador activo.');
            return;
        }
    }

    // No permitir que un usuario se desactive a sí mismo
    if (userId === app.currentUser.id) {
        alert('No puedes cambiar tu propio estado.');
        return;
    }

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'activar' : 'desactivar';
    
    if (confirm(`¿Estás seguro de que quieres ${action} al usuario "${user.name}"?`)) {
        user.status = newStatus;
        app.saveData();
        loadUsersModule();
        alert(`Usuario ${newStatus === 'active' ? 'activado' : 'desactivado'} exitosamente`);
    }
}

function viewUserDetails(userId) {
    const user = app.data.users.find(u => u.id === userId);
    if (!user) return;

    // Calcular estadísticas del usuario
    const userLoans = app.data.loans.filter(loan => loan.userId === userId);
    const userCollections = app.data.collections.filter(collection => collection.userId === userId);
    const totalCollections = userCollections.reduce((sum, collection) => sum + collection.amount, 0);

    const modalContent = `
        <div class="user-details">
            <div class="user-info">
                <h3>${user.name}</h3>
                <p><strong>Usuario:</strong> ${user.username}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Teléfono:</strong> ${user.phone || 'No especificado'}</p>
                <p><strong>Rol:</strong> <span class="badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}">${user.role === 'admin' ? 'Administrador' : 'Usuario'}</span></p>
                <p><strong>Estado:</strong> <span class="badge ${user.status === 'active' ? 'badge-success' : 'badge-danger'}">${user.status === 'active' ? 'Activo' : 'Inactivo'}</span></p>
                <p><strong>Fecha de Creación:</strong> ${app.formatDate(user.createdAt)}</p>
                ${user.lastLogin ? `<p><strong>Último Acceso:</strong> ${app.formatDate(user.lastLogin)}</p>` : ''}
                ${user.notes ? `<p><strong>Notas:</strong> ${user.notes}</p>` : ''}
            </div>
            
            <div class="user-stats">
                <h4>Estadísticas de Actividad</h4>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">Préstamos Creados:</span>
                        <span class="stat-value">${userLoans.length}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Cobros Realizados:</span>
                        <span class="stat-value">${userCollections.length}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Monto Total Cobrado:</span>
                        <span class="stat-value">${app.formatCurrency(totalCollections)}</span>
                    </div>
                </div>
            </div>

            ${userLoans.length > 0 ? `
                <div class="user-loans">
                    <h4>Préstamos Creados</h4>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Cliente</th>
                                    <th>Monto</th>
                                    <th>Fecha</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${userLoans.map(loan => `
                                    <tr>
                                        <td>${loan.id}</td>
                                        <td>${app.getClientName(loan.clientId)}</td>
                                        <td>${app.formatCurrency(loan.amount)}</td>
                                        <td>${app.formatDate(loan.startDate)}</td>
                                        <td>
                                            <span class="status-badge status-${loan.status}">
                                                ${loan.status === 'active' ? 'Activo' : loan.status === 'paid' ? 'Pagado' : 'Cancelado'}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            ` : ''}
        </div>
    `;

    app.showModal(`Detalles del Usuario - ${user.name}`, modalContent);
}

// Agregar estilos CSS para los usuarios
const userStyles = `
    <style>
        .badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
        }
        
        .badge-admin {
            background: #dbeafe;
            color: #1e40af;
        }
        
        .badge-user {
            background: #f3f4f6;
            color: #374151;
        }
        
        .badge-success {
            background: #dcfce7;
            color: #166534;
        }
        
        .badge-danger {
            background: #fef2f2;
            color: #dc2626;
        }
        
        .user-details {
            max-height: 70vh;
            overflow-y: auto;
        }
        
        .user-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .user-info h3 {
            color: #1e293b;
            margin-bottom: 15px;
            font-size: 1.5rem;
        }
        
        .user-info p {
            margin-bottom: 8px;
            color: #64748b;
        }
        
        .user-stats {
            margin-bottom: 20px;
        }
        
        .user-stats h4 {
            color: #1e293b;
            margin-bottom: 15px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .stat-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .stat-label {
            font-weight: 500;
            color: #64748b;
        }
        
        .stat-value {
            font-weight: 600;
            color: #1e293b;
        }
        
        .user-loans h4 {
            color: #1e293b;
            margin-bottom: 15px;
        }
        
        .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .status-active {
            background: #dcfce7;
            color: #166534;
        }
        
        .status-paid {
            background: #f3f4f6;
            color: #374151;
        }
        
        .status-cancelled {
            background: #fef2f2;
            color: #dc2626;
        }
    </style>
`;

// Agregar estilos al head si no existen
if (!document.getElementById('user-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'user-styles';
    styleElement.innerHTML = userStyles;
    document.head.appendChild(styleElement);
}
