// Funciones de carga de módulos adicionales

function loadWalletsModule() {
    console.log('💼 Cargando módulo de Carteras...');
    const section = document.getElementById('wallets');
    section.innerHTML = `
        <h2>Carteras de Clientes</h2>
        <div class="table-container">
            <div class="table-header">
                <h3>Detalle de Carteras</h3>
            </div>
            <div class="table-content">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Préstamos Activos</th>
                            <th>Monto Total</th>
                            <th>Cobros del Mes</th>
                            <th>Pagos Pendientes</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="wallets-table-body">
                        ${app.data.clients.map(client => {
                            const clientLoans = app.data.loans.filter(loan => loan.clientId === client.id && loan.status === 'active');
                            const totalAmount = clientLoans.reduce((sum, loan) => sum + loan.amount, 0);
                            const monthlyCollections = app.data.collections
                                .filter(collection => collection.clientId === client.id)
                                .filter(collection => {
                                    const collectionDate = new Date(collection.date);
                                    const now = new Date();
                                    return collectionDate.getMonth() === now.getMonth() && collectionDate.getFullYear() === now.getFullYear();
                                })
                                .reduce((sum, collection) => sum + collection.amount, 0);
                            
                            return `
                                <tr>
                                    <td>${client.name}</td>
                                    <td>${clientLoans.length}</td>
                                    <td>${app.formatCurrency(totalAmount)}</td>
                                    <td>${app.formatCurrency(monthlyCollections)}</td>
                                    <td>${clientLoans.filter(loan => new Date(loan.nextPayment) < new Date()).length}</td>
                                    <td>
                                        <button class="btn btn-secondary" onclick="viewClientWallet(${client.id})">Ver Detalle</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    console.log('✅ Módulo de Carteras cargado exitosamente');
}

function loadCashModule() {
    console.log('💰 Cargando módulo de Caja...');
    const section = document.getElementById('cash');
    section.innerHTML = `
        <h2>Módulo de Caja</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-arrow-up"></i>
                </div>
                <div class="stat-info">
                    <h3 id="today-income">${app.formatCurrency(app.getTodayIncome())}</h3>
                    <p>Ingresos Hoy</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-arrow-down"></i>
                </div>
                <div class="stat-info">
                    <h3 id="today-expenses">${app.formatCurrency(app.getTodayExpenses())}</h3>
                    <p>Egresos Hoy</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-calculator"></i>
                </div>
                <div class="stat-info">
                    <h3 id="net-today">${app.formatCurrency(app.getTodayIncome() - app.getTodayExpenses())}</h3>
                    <p>Neto Hoy</p>
                </div>
            </div>
        </div>
        
        <div class="table-container">
            <div class="table-header">
                <h3>Operaciones de Caja</h3>
                <button class="btn btn-primary" onclick="openCashOperationModal()">
                    <i class="fas fa-plus"></i> Nueva Operación
                </button>
            </div>
            <div class="table-content">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Tipo</th>
                            <th>Descripción</th>
                            <th>Monto</th>
                            <th>Usuario</th>
                        </tr>
                    </thead>
                    <tbody id="cash-operations-body">
                        ${app.data.collections.map(collection => `
                            <tr>
                                <td>${app.formatDate(collection.date)}</td>
                                <td><span class="badge badge-success">Ingreso</span></td>
                                <td>Cobro de cuota - ${app.getClientName(collection.clientId)}</td>
                                <td class="text-right">${app.formatCurrency(collection.amount)}</td>
                                <td>${app.getUserName(collection.userId)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    console.log('✅ Módulo de Caja cargado exitosamente');
}

function loadCurrencyModule() {
    console.log('💱 Cargando módulo de Moneda...');
    const section = document.getElementById('currency');
    section.innerHTML = `
        <h2>Configuración de Moneda</h2>
        <div class="form-container">
            <h3>Moneda Actual: ${app.data.currentCurrency.name} (${app.data.currentCurrency.code})</h3>
            <p>Símbolo: ${app.data.currentCurrency.symbol}</p>
            <p>Tipo de Cambio: ${app.data.currentCurrency.rate}</p>
            
            <form id="currency-form">
                <div class="form-group">
                    <label for="currency-select">Seleccionar Moneda</label>
                    <select id="currency-select" required>
                        ${app.data.currencies.map(currency => `
                            <option value="${currency.id}" ${currency.id === app.data.currentCurrency.id ? 'selected' : ''}>
                                ${currency.name} (${currency.code}) - ${currency.symbol}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="exchange-rate">Tipo de Cambio</label>
                    <input type="number" id="exchange-rate" step="0.01" value="${app.data.currentCurrency.rate}" required>
                </div>
                <button type="submit" class="btn btn-primary">Cambiar Moneda</button>
            </form>
        </div>
    `;

    document.getElementById('currency-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const selectedCurrency = app.data.currencies.find(c => c.id == document.getElementById('currency-select').value);
        const newRate = parseFloat(document.getElementById('exchange-rate').value);
        
        app.data.currentCurrency = {
            ...selectedCurrency,
            rate: newRate
        };
        
        app.saveData();
        alert('Moneda actualizada exitosamente');
        loadCurrencyModule();
    });
    console.log('✅ Módulo de Moneda cargado exitosamente');
}

// Funciones auxiliares
function viewClientWallet(clientId) {
    const client = app.data.clients.find(c => c.id === clientId);
    if (!client) return;

    const clientLoans = app.data.loans.filter(loan => loan.clientId === clientId);
    const activeLoans = clientLoans.filter(loan => loan.status === 'active');
    
    const modalContent = `
        <div class="wallet-details">
            <h3>Cartera de ${client.name}</h3>
            <div class="wallet-summary">
                <p><strong>Total de Préstamos:</strong> ${clientLoans.length}</p>
                <p><strong>Préstamos Activos:</strong> ${activeLoans.length}</p>
                <p><strong>Monto Total Prestado:</strong> ${app.formatCurrency(clientLoans.reduce((sum, loan) => sum + loan.amount, 0))}</p>
            </div>
            
            ${activeLoans.length > 0 ? `
                <div class="active-loans">
                    <h4>Préstamos Activos</h4>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Monto</th>
                                <th>Cuota</th>
                                <th>Próximo Pago</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${activeLoans.map(loan => `
                                <tr>
                                    <td>${loan.id}</td>
                                    <td>${app.formatCurrency(loan.amount)}</td>
                                    <td>${app.formatCurrency(loan.monthlyPayment)}</td>
                                    <td>${app.formatDate(loan.nextPayment)}</td>
                                    <td>
                                        <span class="status-badge ${new Date(loan.nextPayment) < new Date() ? 'status-overdue' : 'status-active'}">
                                            ${new Date(loan.nextPayment) < new Date() ? 'Vencido' : 'Al día'}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : ''}
        </div>
    `;

    app.showModal(`Cartera de ${client.name}`, modalContent);
}

function openCashOperationModal() {
    const modalContent = `
        <div class="form-container">
            <form id="cash-operation-form">
                <div class="form-group">
                    <label for="operation-type">Tipo de Operación</label>
                    <select id="operation-type" required>
                        <option value="income">Ingreso</option>
                        <option value="expense">Egreso</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="operation-amount">Monto</label>
                    <input type="number" id="operation-amount" step="0.01" min="0" required>
                </div>
                
                <div class="form-group">
                    <label for="operation-description">Descripción</label>
                    <textarea id="operation-description" rows="2" required></textarea>
                </div>
                
                <div class="form-group">
                    <label for="operation-date">Fecha</label>
                    <input type="date" id="operation-date" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Registrar Operación</button>
                </div>
            </form>
        </div>
    `;

    app.showModal('Nueva Operación de Caja', modalContent);
    
    document.getElementById('cash-operation-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const operation = {
            id: app.generateId(),
            type: document.getElementById('operation-type').value,
            amount: parseFloat(document.getElementById('operation-amount').value),
            description: document.getElementById('operation-description').value,
            date: document.getElementById('operation-date').value,
            userId: app.currentUser.id,
            createdAt: new Date().toISOString()
        };
        
        // Agregar a colecciones (simplificado)
        app.data.collections.push(operation);
        app.saveData();
        app.closeModal();
        loadCashModule();
        alert('Operación registrada exitosamente');
    });
}
