// Módulo de Gestión de Clientes
function loadClientsModule() {
    console.log('👥 Cargando módulo de Clientes...');
    const section = document.getElementById('clients');
    section.innerHTML = `
        <div class="table-container">
            <div class="table-header">
                <h3>Gestión de Clientes</h3>
                <button class="btn btn-primary" onclick="openClientModal()">
                    <i class="fas fa-plus"></i> Nuevo Cliente
                </button>
            </div>
            <div class="table-content">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Dirección</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="clients-table-body">
                        ${app.data.clients.map(client => `
                            <tr>
                                <td>${client.id}</td>
                                <td>${client.name}</td>
                                <td>${client.email}</td>
                                <td>${client.phone}</td>
                                <td>${client.address}</td>
                                <td>
                                    <button class="btn btn-secondary" onclick="editClient(${client.id})">Editar</button>
                                    <button class="btn btn-danger" onclick="deleteClient(${client.id})">Eliminar</button>
                                    <button class="btn btn-info" onclick="viewClientDetails(${client.id})">Ver</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    console.log(`✅ Módulo de Clientes cargado exitosamente (${app.data.clients.length} clientes)`);
}
function openClientModal(clientId = null) {
    console.log(`📝 Abriendo modal de cliente ${clientId ? 'para editar' : 'nuevo'}`);
    const client = clientId ? app.data.clients.find(c => c.id === clientId) : null;
    const title = client ? 'Editar Cliente' : 'Nuevo Cliente';
    
    const modalContent = `
        <div class="form-container">
            <form id="client-form">
                <input type="hidden" id="client-id" value="${client ? client.id : ''}">
                <div class="form-row">
                    <div class="form-group">
                        <label for="client-name">Nombre Completo *</label>
                        <input type="text" id="client-name" value="${client ? client.name : ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="client-email">Email *</label>
                        <input type="email" id="client-email" value="${client ? client.email : ''}" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="client-phone">Teléfono *</label>
                        <input type="tel" id="client-phone" value="${client ? client.phone : ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="client-dni">DNI/Cédula</label>
                        <input type="text" id="client-dni" value="${client ? client.dni : ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label for="client-address">Dirección</label>
                    <textarea id="client-address" rows="3">${client ? client.address : ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="client-birthdate">Fecha de Nacimiento</label>
                        <input type="date" id="client-birthdate" value="${client ? client.birthdate : ''}">
                    </div>
                    <div class="form-group">
                        <label for="client-occupation">Ocupación</label>
                        <input type="text" id="client-occupation" value="${client ? client.occupation : ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label for="client-notes">Notas</label>
                    <textarea id="client-notes" rows="2" placeholder="Información adicional del cliente">${client ? client.notes : ''}</textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">
                        ${client ? 'Actualizar Cliente' : 'Crear Cliente'}
                    </button>
                </div>
            </form>
        </div>
    `;

    app.showModal(title, modalContent);
    
    document.getElementById('client-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveClient();
    });
}

function saveClient() {
    console.log('💾 Guardando cliente...');
    const formData = {
        id: document.getElementById('client-id').value || app.generateId(),
        name: document.getElementById('client-name').value,
        email: document.getElementById('client-email').value,
        phone: document.getElementById('client-phone').value,
        dni: document.getElementById('client-dni').value,
        address: document.getElementById('client-address').value,
        birthdate: document.getElementById('client-birthdate').value,
        occupation: document.getElementById('client-occupation').value,
        notes: document.getElementById('client-notes').value,
        createdAt: document.getElementById('client-id').value ? 
            app.data.clients.find(c => c.id == document.getElementById('client-id').value).createdAt : 
            new Date().toISOString()
    };

    if (document.getElementById('client-id').value) {
        // Actualizar cliente existente
        console.log(`🔄 Actualizando cliente ID: ${formData.id}`);
        const index = app.data.clients.findIndex(c => c.id == document.getElementById('client-id').value);
        app.data.clients[index] = formData;
    } else {
        // Crear nuevo cliente
        console.log(`➕ Creando nuevo cliente: ${formData.name}`);
        app.data.clients.push(formData);
    }

    app.saveData();
    app.closeModal();
    loadClientsModule();
    
    const message = document.getElementById('client-id').value ? 'Cliente actualizado exitosamente' : 'Cliente creado exitosamente';
    console.log(`✅ ${message}`);
    alert(message);
}

function editClient(clientId) {
    console.log(`✏️ Editando cliente ID: ${clientId}`);
    openClientModal(clientId);
}

function deleteClient(clientId) {
    console.log(`🗑️ Eliminando cliente ID: ${clientId}`);
    const client = app.data.clients.find(c => c.id === clientId);
    if (!client) {
        console.log('❌ Cliente no encontrado');
        return;
    }

    // Verificar si el cliente tiene préstamos activos
    const hasActiveLoans = app.data.loans.some(loan => loan.clientId === clientId && loan.status === 'active');
    
    if (hasActiveLoans) {
        console.log('⚠️ No se puede eliminar cliente con préstamos activos');
        alert('No se puede eliminar el cliente porque tiene préstamos activos.');
        return;
    }

    if (confirm(`¿Estás seguro de que quieres eliminar al cliente "${client.name}"?`)) {
        console.log(`🗑️ Eliminando cliente: ${client.name}`);
        app.data.clients = app.data.clients.filter(c => c.id !== clientId);
        app.saveData();
        loadClientsModule();
        console.log('✅ Cliente eliminado exitosamente');
        alert('Cliente eliminado exitosamente');
    }
}

function viewClientDetails(clientId) {
    const client = app.data.clients.find(c => c.id === clientId);
    if (!client) return;

    const clientLoans = app.data.loans.filter(loan => loan.clientId === clientId);
    const totalLoaned = clientLoans.reduce((sum, loan) => sum + loan.amount, 0);
    const activeLoans = clientLoans.filter(loan => loan.status === 'active');
    const paidLoans = clientLoans.filter(loan => loan.status === 'paid');

    const modalContent = `
        <div class="client-details">
            <div class="client-info">
                <h3>${client.name}</h3>
                <p><strong>Email:</strong> ${client.email}</p>
                <p><strong>Teléfono:</strong> ${client.phone}</p>
                <p><strong>DNI:</strong> ${client.dni || 'No especificado'}</p>
                <p><strong>Dirección:</strong> ${client.address || 'No especificada'}</p>
                <p><strong>Ocupación:</strong> ${client.occupation || 'No especificada'}</p>
                ${client.notes ? `<p><strong>Notas:</strong> ${client.notes}</p>` : ''}
            </div>
            
            <div class="client-stats">
                <h4>Estadísticas de Préstamos</h4>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">Total Préstamos:</span>
                        <span class="stat-value">${clientLoans.length}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Préstamos Activos:</span>
                        <span class="stat-value">${activeLoans.length}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Préstamos Pagados:</span>
                        <span class="stat-value">${paidLoans.length}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Monto Total Prestado:</span>
                        <span class="stat-value">${app.formatCurrency(totalLoaned)}</span>
                    </div>
                </div>
            </div>

            ${activeLoans.length > 0 ? `
                <div class="client-loans">
                    <h4>Préstamos Activos</h4>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Monto</th>
                                    <th>Fecha Inicio</th>
                                    <th>Próximo Pago</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${activeLoans.map(loan => `
                                    <tr>
                                        <td>${loan.id}</td>
                                        <td>${app.formatCurrency(loan.amount)}</td>
                                        <td>${app.formatDate(loan.startDate)}</td>
                                        <td>${app.formatDate(loan.nextPayment)}</td>
                                        <td>
                                            <span class="status-badge ${new Date(loan.nextPayment) < new Date() ? 'status-overdue' : 'status-active'}">
                                                ${new Date(loan.nextPayment) < new Date() ? 'Vencido' : 'Activo'}
                                            </span>
                                        </td>
                                        <td>
                                            <button class="btn btn-secondary" onclick="viewLoanDetails(${loan.id})">Ver</button>
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

    app.showModal(`Detalles del Cliente - ${client.name}`, modalContent);
}

// Agregar estilos CSS para los detalles del cliente
const clientStyles = `
    <style>
        .client-details {
            max-height: 70vh;
            overflow-y: auto;
        }
        
        .client-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .client-info h3 {
            color: #1e293b;
            margin-bottom: 15px;
            font-size: 1.5rem;
        }
        
        .client-info p {
            margin-bottom: 8px;
            color: #64748b;
        }
        
        .client-stats {
            margin-bottom: 20px;
        }
        
        .client-stats h4 {
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
        
        .client-loans h4 {
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
        
        .status-overdue {
            background: #fef2f2;
            color: #dc2626;
        }
        
        .form-actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            margin-top: 20px;
        }
    </style>
`;

// Agregar estilos al head si no existen
if (!document.getElementById('client-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'client-styles';
    styleElement.innerHTML = clientStyles;
    document.head.appendChild(styleElement);
}
