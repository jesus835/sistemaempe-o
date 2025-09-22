// Módulo de Cobros y Pagos
function loadCollectionsModule() {
    console.log('💵 Cargando módulo de Cobros...');
    const section = document.getElementById('collections');
    section.innerHTML = `
        <div class="collections-header">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <div class="stat-info">
                        <h3 id="today-collections-amount">${app.formatCurrency(app.getTodayCollections())}</h3>
                        <p>Cobros Hoy</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-calendar-week"></i>
                    </div>
                    <div class="stat-info">
                        <h3 id="week-collections-amount">${app.formatCurrency(app.getWeekCollections())}</h3>
                        <p>Cobros Esta Semana</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                    <div class="stat-info">
                        <h3 id="month-collections-amount">${app.formatCurrency(app.getMonthCollections())}</h3>
                        <p>Cobros Este Mes</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="stat-info">
                        <h3 id="overdue-count">${app.getOverdueCount()}</h3>
                        <p>Cuotas Vencidas</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="table-container">
            <div class="table-header">
                <h3>Registro de Cobros</h3>
                <div class="header-actions">
                    <button class="btn btn-secondary" onclick="filterCollections()">
                        <i class="fas fa-filter"></i> Filtrar
                    </button>
                    <button class="btn btn-success" onclick="openCollectionModal()">
                        <i class="fas fa-plus"></i> Nuevo Cobro
                    </button>
                </div>
            </div>
            <div class="table-content">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Préstamo</th>
                            <th>Monto</th>
                            <th>Capital</th>
                            <th>Interés</th>
                            <th>Seguro</th>
                            <th>Impuesto</th>
                            <th>Tipo</th>
                            <th>Usuario</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="collections-table-body">
                        ${app.data.collections.map(collection => `
                            <tr>
                                <td>${collection.id}</td>
                                <td>${app.formatDate(collection.date)}</td>
                                <td>${app.getClientName(collection.clientId)}</td>
                                <td>#${collection.loanId}</td>
                                <td class="text-right">${app.formatCurrency(collection.amount)}</td>
                                <td class="text-right">${app.formatCurrency(collection.principal)}</td>
                                <td class="text-right">${app.formatCurrency(collection.interest)}</td>
                                <td class="text-right">${app.formatCurrency(collection.insurance || 0)}</td>
                                <td class="text-right">${app.formatCurrency(collection.tax || 0)}</td>
                                <td><span class="badge badge-${collection.type}">${getCollectionTypeText(collection.type)}</span></td>
                                <td>${app.getUserName(collection.userId)}</td>
                                <td>
                                    <button class="btn btn-secondary" onclick="viewCollectionDetails(${collection.id})">Ver</button>
                                    <button class="btn btn-danger" onclick="deleteCollection(${collection.id})">Eliminar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="overdue-section">
            <h3>Cuotas Vencidas</h3>
            <div class="table-container">
                <div class="table-content">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Préstamo</th>
                                <th>Monto Vencido</th>
                                <th>Días de Atraso</th>
                                <th>Mora</th>
                                <th>Total a Cobrar</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="overdue-table-body">
                            ${getOverdueLoans().map(loan => {
                                const client = app.data.clients.find(c => c.id === loan.clientId);
                                const daysOverdue = Math.ceil((new Date() - new Date(loan.nextPayment)) / (1000 * 60 * 60 * 24));
                                const penaltyRate = 0.05; // 5% de mora por día (configurable)
                                const penalty = loan.monthlyPayment * penaltyRate * daysOverdue;
                                const totalToCollect = loan.monthlyPayment + penalty;
                                
                                return `
                                    <tr>
                                        <td>${client ? client.name : 'Cliente no encontrado'}</td>
                                        <td>#${loan.id}</td>
                                        <td class="text-right">${app.formatCurrency(loan.monthlyPayment)}</td>
                                        <td class="text-center">${daysOverdue}</td>
                                        <td class="text-right">${app.formatCurrency(penalty)}</td>
                                        <td class="text-right">${app.formatCurrency(totalToCollect)}</td>
                                        <td>
                                            <button class="btn btn-warning" onclick="collectOverduePayment(${loan.id}, ${totalToCollect})">Cobrar con Mora</button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    console.log(`✅ Módulo de Cobros cargado exitosamente (${app.data.collections.length} cobros)`);
}

function openCollectionModal(loanId = null, amount = null) {
    const title = 'Nuevo Cobro';
    
    const modalContent = `
        <div class="form-container">
            <form id="collection-form">
                <input type="hidden" id="collection-loan-id" value="${loanId || ''}">
                
                <div class="form-group">
                    <label for="collection-loan-select">Préstamo *</label>
                    <select id="collection-loan-select" required>
                        <option value="">Seleccionar Préstamo</option>
                        ${app.data.loans.filter(loan => loan.status === 'active').map(loan => {
                            const client = app.data.clients.find(c => c.id === loan.clientId);
                            return `<option value="${loan.id}" ${loanId == loan.id ? 'selected' : ''}>
                                #${loan.id} - ${client ? client.name : 'Cliente no encontrado'} - ${app.formatCurrency(loan.monthlyPayment)}
                            </option>`;
                        }).join('')}
                    </select>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="collection-amount">Monto a Cobrar *</label>
                        <input type="number" id="collection-amount" step="0.01" min="0" value="${amount || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="collection-date">Fecha de Cobro *</label>
                        <input type="date" id="collection-date" value="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="collection-principal">Capital</label>
                        <input type="number" id="collection-principal" step="0.01" min="0" value="0">
                    </div>
                    <div class="form-group">
                        <label for="collection-interest">Interés</label>
                        <input type="number" id="collection-interest" step="0.01" min="0" value="0">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="collection-insurance">Seguro</label>
                        <input type="number" id="collection-insurance" step="0.01" min="0" value="0">
                    </div>
                    <div class="form-group">
                        <label for="collection-tax">Impuesto</label>
                        <input type="number" id="collection-tax" step="0.01" min="0" value="0">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="collection-type">Tipo de Cobro</label>
                    <select id="collection-type">
                        <option value="full">Cuota Completa</option>
                        <option value="partial">Pago Parcial</option>
                        <option value="early">Pago Adelantado</option>
                        <option value="penalty">Pago con Mora</option>
                        <option value="settlement">Liquidación Total</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="collection-payment-method">Método de Pago</label>
                    <select id="collection-payment-method">
                        <option value="cash">Efectivo</option>
                        <option value="transfer">Transferencia</option>
                        <option value="check">Cheque</option>
                        <option value="card">Tarjeta</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="collection-notes">Notas</label>
                    <textarea id="collection-notes" rows="2" placeholder="Observaciones del cobro"></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Registrar Cobro</button>
                </div>
            </form>
        </div>
    `;

    app.showModal(title, modalContent);
    
    document.getElementById('collection-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveCollection();
    });

    // Auto-seleccionar préstamo si se proporciona
    if (loanId) {
        document.getElementById('collection-loan-select').value = loanId;
        updateCollectionFields();
    }

    // Event listeners para actualización automática
    document.getElementById('collection-loan-select').addEventListener('change', updateCollectionFields);
    document.getElementById('collection-principal').addEventListener('input', calculateCollectionTotal);
    document.getElementById('collection-interest').addEventListener('input', calculateCollectionTotal);
    document.getElementById('collection-insurance').addEventListener('input', calculateCollectionTotal);
    document.getElementById('collection-tax').addEventListener('input', calculateCollectionTotal);
}

function updateCollectionFields() {
    const loanId = document.getElementById('collection-loan-select').value;
    if (!loanId) return;

    const loan = app.data.loans.find(l => l.id == loanId);
    if (!loan) return;

    // Establecer valores por defecto basados en el préstamo
    document.getElementById('collection-amount').value = loan.monthlyPayment;
    document.getElementById('collection-principal').value = loan.monthlyPayment * 0.8; // Estimación
    document.getElementById('collection-interest').value = loan.monthlyPayment * 0.2; // Estimación
    document.getElementById('collection-insurance').value = loan.insurance || 0;
    document.getElementById('collection-tax').value = loan.tax || 0;
}

function calculateCollectionTotal() {
    const principal = parseFloat(document.getElementById('collection-principal').value) || 0;
    const interest = parseFloat(document.getElementById('collection-interest').value) || 0;
    const insurance = parseFloat(document.getElementById('collection-insurance').value) || 0;
    const tax = parseFloat(document.getElementById('collection-tax').value) || 0;
    
    const total = principal + interest + insurance + tax;
    document.getElementById('collection-amount').value = total;
}

function saveCollection() {
    const loanId = parseInt(document.getElementById('collection-loan-select').value);
    const amount = parseFloat(document.getElementById('collection-amount').value);
    const date = document.getElementById('collection-date').value;
    const principal = parseFloat(document.getElementById('collection-principal').value) || 0;
    const interest = parseFloat(document.getElementById('collection-interest').value) || 0;
    const insurance = parseFloat(document.getElementById('collection-insurance').value) || 0;
    const tax = parseFloat(document.getElementById('collection-tax').value) || 0;
    const type = document.getElementById('collection-type').value;
    const paymentMethod = document.getElementById('collection-payment-method').value;
    const notes = document.getElementById('collection-notes').value;

    const loan = app.data.loans.find(l => l.id === loanId);
    if (!loan) return;

    const collection = {
        id: app.generateId(),
        loanId: loanId,
        clientId: loan.clientId,
        userId: app.currentUser.id,
        date: date,
        amount: amount,
        principal: principal,
        capital: principal,
        interest: interest,
        insurance: insurance,
        tax: tax,
        total: amount,
        type: type,
        paymentMethod: paymentMethod,
        notes: notes,
        createdAt: new Date().toISOString()
    };

    // Actualizar préstamo
    loan.paidAmount = (loan.paidAmount || 0) + amount;
    loan.remainingAmount = loan.totalPayment - loan.paidAmount;

    if (loan.remainingAmount <= 0) {
        loan.status = 'paid';
        loan.paidAt = new Date().toISOString();
    } else {
        // Calcular próximo pago
        loan.nextPayment = calculateNextPaymentDate(date, loan.paymentFrequency);
    }

    loan.payments = loan.payments || [];
    loan.payments.push(collection);

    // Agregar a colecciones
    app.data.collections.push(collection);

    app.saveData();
    app.closeModal();
    loadCollectionsModule();
    alert('Cobro registrado exitosamente');
}

function collectOverduePayment(loanId, totalAmount) {
    openCollectionModal(loanId, totalAmount);
    // Establecer tipo como pago con mora
    setTimeout(() => {
        document.getElementById('collection-type').value = 'penalty';
    }, 100);
}

function viewCollectionDetails(collectionId) {
    const collection = app.data.collections.find(c => c.id === collectionId);
    if (!collection) return;

    const loan = app.data.loans.find(l => l.id === collection.loanId);
    const client = app.data.clients.find(c => c.id === collection.clientId);
    const user = app.data.users.find(u => u.id === collection.userId);

    const modalContent = `
        <div class="collection-details">
            <div class="collection-info">
                <h3>Cobro #${collection.id}</h3>
                <p><strong>Cliente:</strong> ${client ? client.name : 'Cliente no encontrado'}</p>
                <p><strong>Préstamo:</strong> #${collection.loanId}</p>
                <p><strong>Fecha:</strong> ${app.formatDate(collection.date)}</p>
                <p><strong>Tipo:</strong> <span class="badge badge-${collection.type}">${getCollectionTypeText(collection.type)}</span></p>
                <p><strong>Método de Pago:</strong> ${getPaymentMethodText(collection.paymentMethod)}</p>
                ${collection.notes ? `<p><strong>Notas:</strong> ${collection.notes}</p>` : ''}
            </div>
            
            <div class="collection-breakdown">
                <h4>Desglose del Cobro</h4>
                <div class="breakdown-grid">
                    <div class="breakdown-item">
                        <span class="breakdown-label">Capital:</span>
                        <span class="breakdown-value">${app.formatCurrency(collection.capital)}</span>
                    </div>
                    <div class="breakdown-item">
                        <span class="breakdown-label">Interés:</span>
                        <span class="breakdown-value">${app.formatCurrency(collection.interest)}</span>
                    </div>
                    <div class="breakdown-item">
                        <span class="breakdown-label">Seguro:</span>
                        <span class="breakdown-value">${app.formatCurrency(collection.insurance || 0)}</span>
                    </div>
                    <div class="breakdown-item">
                        <span class="breakdown-label">Impuesto:</span>
                        <span class="breakdown-value">${app.formatCurrency(collection.tax || 0)}</span>
                    </div>
                    <div class="breakdown-item total">
                        <span class="breakdown-label">Total:</span>
                        <span class="breakdown-value">${app.formatCurrency(collection.total)}</span>
                    </div>
                </div>
            </div>
            
            <div class="collection-meta">
                <p><strong>Registrado por:</strong> ${user ? user.name : 'Usuario no encontrado'}</p>
                <p><strong>Fecha de registro:</strong> ${app.formatDate(collection.createdAt)}</p>
            </div>
        </div>
    `;

    app.showModal(`Detalles del Cobro #${collection.id}`, modalContent);
}

function deleteCollection(collectionId) {
    const collection = app.data.collections.find(c => c.id === collectionId);
    if (!collection) return;

    if (confirm(`¿Estás seguro de que quieres eliminar este cobro? Esta acción no se puede deshacer.`)) {
        // Remover de colecciones
        app.data.collections = app.data.collections.filter(c => c.id !== collectionId);

        // Actualizar préstamo
        const loan = app.data.loans.find(l => l.id === collection.loanId);
        if (loan) {
            loan.paidAmount = Math.max(0, (loan.paidAmount || 0) - collection.amount);
            loan.remainingAmount = loan.totalPayment - loan.paidAmount;
            
            if (loan.status === 'paid' && loan.remainingAmount > 0) {
                loan.status = 'active';
                delete loan.paidAt;
            }

            // Remover pago del historial
            loan.payments = loan.payments.filter(p => p.id !== collectionId);
        }

        app.saveData();
        loadCollectionsModule();
        alert('Cobro eliminado exitosamente');
    }
}

function filterCollections() {
    const modalContent = `
        <div class="form-container">
            <form id="filter-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="filter-date-from">Fecha Desde</label>
                        <input type="date" id="filter-date-from">
                    </div>
                    <div class="form-group">
                        <label for="filter-date-to">Fecha Hasta</label>
                        <input type="date" id="filter-date-to">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="filter-client">Cliente</label>
                    <select id="filter-client">
                        <option value="">Todos los clientes</option>
                        ${app.data.clients.map(client => `
                            <option value="${client.id}">${client.name}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="filter-type">Tipo de Cobro</label>
                    <select id="filter-type">
                        <option value="">Todos los tipos</option>
                        <option value="full">Cuota Completa</option>
                        <option value="partial">Pago Parcial</option>
                        <option value="early">Pago Adelantado</option>
                        <option value="penalty">Pago con Mora</option>
                        <option value="settlement">Liquidación Total</option>
                    </select>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Aplicar Filtros</button>
                </div>
            </form>
        </div>
    `;

    app.showModal('Filtrar Cobros', modalContent);
    
    document.getElementById('filter-form').addEventListener('submit', (e) => {
        e.preventDefault();
        applyCollectionFilters();
    });
}

function applyCollectionFilters() {
    const dateFrom = document.getElementById('filter-date-from').value;
    const dateTo = document.getElementById('filter-date-to').value;
    const clientId = document.getElementById('filter-client').value;
    const type = document.getElementById('filter-type').value;

    let filteredCollections = app.data.collections;

    if (dateFrom) {
        filteredCollections = filteredCollections.filter(c => new Date(c.date) >= new Date(dateFrom));
    }

    if (dateTo) {
        filteredCollections = filteredCollections.filter(c => new Date(c.date) <= new Date(dateTo));
    }

    if (clientId) {
        filteredCollections = filteredCollections.filter(c => c.clientId == clientId);
    }

    if (type) {
        filteredCollections = filteredCollections.filter(c => c.type === type);
    }

    // Actualizar tabla con filtros aplicados
    const tableBody = document.getElementById('collections-table-body');
    tableBody.innerHTML = filteredCollections.map(collection => `
        <tr>
            <td>${collection.id}</td>
            <td>${app.formatDate(collection.date)}</td>
            <td>${app.getClientName(collection.clientId)}</td>
            <td>#${collection.loanId}</td>
            <td class="text-right">${app.formatCurrency(collection.amount)}</td>
            <td class="text-right">${app.formatCurrency(collection.principal)}</td>
            <td class="text-right">${app.formatCurrency(collection.interest)}</td>
            <td class="text-right">${app.formatCurrency(collection.insurance || 0)}</td>
            <td class="text-right">${app.formatCurrency(collection.tax || 0)}</td>
            <td><span class="badge badge-${collection.type}">${getCollectionTypeText(collection.type)}</span></td>
            <td>${app.getUserName(collection.userId)}</td>
            <td>
                <button class="btn btn-secondary" onclick="viewCollectionDetails(${collection.id})">Ver</button>
                <button class="btn btn-danger" onclick="deleteCollection(${collection.id})">Eliminar</button>
            </td>
        </tr>
    `).join('');

    app.closeModal();
}

// Funciones auxiliares
function getCollectionTypeText(type) {
    const types = {
        'full': 'Completa',
        'partial': 'Parcial',
        'early': 'Adelantado',
        'penalty': 'Con Mora',
        'settlement': 'Liquidación'
    };
    return types[type] || type;
}

function getPaymentMethodText(method) {
    const methods = {
        'cash': 'Efectivo',
        'transfer': 'Transferencia',
        'check': 'Cheque',
        'card': 'Tarjeta'
    };
    return methods[method] || method;
}

function getOverdueLoans() {
    const today = new Date();
    return app.data.loans.filter(loan => 
        loan.status === 'active' && 
        new Date(loan.nextPayment) < today
    );
}

// Métodos para estadísticas
AszoLoandApp.prototype.getTodayCollections = function() {
    const today = new Date().toDateString();
    return this.data.collections
        .filter(collection => new Date(collection.date).toDateString() === today)
        .reduce((sum, collection) => sum + collection.amount, 0);
};

AszoLoandApp.prototype.getWeekCollections = function() {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return this.data.collections
        .filter(collection => new Date(collection.date) >= weekAgo)
        .reduce((sum, collection) => sum + collection.amount, 0);
};

AszoLoandApp.prototype.getMonthCollections = function() {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    return this.data.collections
        .filter(collection => new Date(collection.date) >= monthAgo)
        .reduce((sum, collection) => sum + collection.amount, 0);
};

AszoLoandApp.prototype.getOverdueCount = function() {
    return getOverdueLoans().length;
};

// Agregar estilos CSS para colecciones
const collectionStyles = `
    <style>
        .collections-header {
            margin-bottom: 30px;
        }
        
        .header-actions {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        
        .overdue-section {
            margin-top: 30px;
        }
        
        .overdue-section h3 {
            color: #dc2626;
            margin-bottom: 15px;
        }
        
        .collection-details {
            max-height: 70vh;
            overflow-y: auto;
        }
        
        .collection-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .collection-info h3 {
            color: #1e293b;
            margin-bottom: 15px;
            font-size: 1.5rem;
        }
        
        .collection-info p {
            margin-bottom: 8px;
            color: #64748b;
        }
        
        .collection-breakdown {
            margin-bottom: 20px;
        }
        
        .collection-breakdown h4 {
            color: #1e293b;
            margin-bottom: 15px;
        }
        
        .breakdown-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .breakdown-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .breakdown-item.total {
            background: #eff6ff;
            border-color: #3b82f6;
            font-weight: 600;
        }
        
        .breakdown-label {
            font-weight: 500;
            color: #64748b;
        }
        
        .breakdown-value {
            font-weight: 600;
            color: #1e293b;
        }
        
        .collection-meta {
            background: #f1f5f9;
            padding: 15px;
            border-radius: 8px;
            font-size: 14px;
            color: #64748b;
        }
        
        .badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .badge-full {
            background: #dcfce7;
            color: #166534;
        }
        
        .badge-partial {
            background: #fef3c7;
            color: #d97706;
        }
        
        .badge-early {
            background: #dbeafe;
            color: #1e40af;
        }
        
        .badge-penalty {
            background: #fef2f2;
            color: #dc2626;
        }
        
        .badge-settlement {
            background: #f3e8ff;
            color: #7c3aed;
        }
    </style>
`;

// Agregar estilos al head si no existen
if (!document.getElementById('collection-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'collection-styles';
    styleElement.innerHTML = collectionStyles;
    document.head.appendChild(styleElement);
}
