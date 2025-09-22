// Módulo de Sistema de Préstamos
function loadLoansModule() {
    console.log('🏦 Cargando módulo de Préstamos...');
    const section = document.getElementById('loans');
    section.innerHTML = `
        <div class="table-container">
            <div class="table-header">
                <h3>Sistema de Préstamos</h3>
                <button class="btn btn-primary" onclick="openLoanModal()">
                    <i class="fas fa-plus"></i> Nuevo Préstamo
                </button>
            </div>
            <div class="table-content">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cliente</th>
                            <th>Tipo</th>
                            <th>Monto</th>
                            <th>Interés</th>
                            <th>Plazo</th>
                            <th>Fecha Inicio</th>
                            <th>Próximo Pago</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="loans-table-body">
                        ${app.data.loans.map(loan => {
                            const client = app.data.clients.find(c => c.id == loan.clientId);
                            const isOverdue = new Date(loan.nextPayment) < new Date() && loan.status === 'active';
                            const statusClass = isOverdue ? 'status-overdue' : `status-${loan.status}`;
                            const statusText = isOverdue ? 'Vencido' : getStatusText(loan.status);
                            
                            return `
                            <tr>
                                <td>${loan.id}</td>
                                <td>${client ? client.name : 'Cliente no encontrado'}</td>
                                <td>${getLoanTypeName(loan.type)}</td>
                                <td>${app.formatCurrency(loan.amount)}</td>
                                <td>${loan.interestRate}%</td>
                                <td>${loan.term} ${loan.termType}</td>
                                <td>${app.formatDate(loan.startDate)}</td>
                                <td>${app.formatDate(loan.nextPayment)}</td>
                                <td>
                                    <span class="status-badge ${statusClass}">
                                        ${statusText}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-secondary" onclick="viewLoanDetails(${loan.id})">Ver</button>
                                    ${loan.status === 'active' ? `
                                        <button class="btn btn-success" onclick="collectPayment(${loan.id})">Cobrar</button>
                                        <button class="btn btn-warning" onclick="reprogramLoan(${loan.id})">Reprogramar</button>
                                    ` : ''}
                                    ${loan.status === 'active' ? `<button class="btn btn-danger" onclick="cancelLoan(${loan.id})">Cancelar</button>` : ''}
                                </td>
                            </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    console.log(`✅ Módulo de Préstamos cargado exitosamente (${app.data.loans.length} préstamos)`);
}

function openLoanModal(loanId = null) {
    const loan = loanId ? app.data.loans.find(l => l.id === loanId) : null;
    const title = loan ? 'Editar Préstamo' : 'Nuevo Préstamo';
    
    const modalContent = `
        <div class="form-container">
            <form id="loan-form">
                <input type="hidden" id="loan-id" value="${loan ? loan.id : ''}">
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="loan-client">Cliente *</label>
                        <select id="loan-client" required>
                            <option value="">Seleccionar Cliente</option>
                            ${app.data.clients.map(client => `
                                <option value="${client.id}" ${loan && loan.clientId === client.id ? 'selected' : ''}>
                                    ${client.name} - ${client.email}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="loan-type">Tipo de Sistema *</label>
                        <select id="loan-type" required onchange="updateLoanFields()">
                            <option value="">Seleccionar Tipo</option>
                            <option value="simple" ${loan && loan.type === 'simple' ? 'selected' : ''}>Sistema Simple</option>
                            <option value="french" ${loan && loan.type === 'french' ? 'selected' : ''}>Sistema Francés</option>
                            <option value="american" ${loan && loan.type === 'american' ? 'selected' : ''}>Sistema Americano</option>
                            <option value="german" ${loan && loan.type === 'german' ? 'selected' : ''}>Sistema Alemán</option>
                            <option value="manual" ${loan && loan.type === 'manual' ? 'selected' : ''}>Sistema Manual</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="loan-amount">Monto del Préstamo *</label>
                        <input type="number" id="loan-amount" step="0.01" min="0" value="${loan ? loan.amount : ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="loan-interest">Tasa de Interés (%) *</label>
                        <input type="number" id="loan-interest" step="0.01" min="0" max="100" value="${loan ? loan.interestRate : ''}" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="loan-term">Plazo *</label>
                        <input type="number" id="loan-term" min="1" value="${loan ? loan.term : ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="loan-term-type">Tipo de Plazo *</label>
                        <select id="loan-term-type" required>
                            <option value="days" ${loan && loan.termType === 'days' ? 'selected' : ''}>Días</option>
                            <option value="weeks" ${loan && loan.termType === 'weeks' ? 'selected' : ''}>Semanas</option>
                            <option value="months" ${loan && loan.termType === 'months' ? 'selected' : ''}>Meses</option>
                            <option value="years" ${loan && loan.termType === 'years' ? 'selected' : ''}>Años</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="loan-start-date">Fecha de Inicio *</label>
                        <input type="date" id="loan-start-date" value="${loan ? loan.startDate : new Date().toISOString().split('T')[0]}" required>
                    </div>
                    <div class="form-group">
                        <label for="loan-payment-frequency">Frecuencia de Pago *</label>
                        <select id="loan-payment-frequency" required>
                            <option value="daily" ${loan && loan.paymentFrequency === 'daily' ? 'selected' : ''}>Diario</option>
                            <option value="weekly" ${loan && loan.paymentFrequency === 'weekly' ? 'selected' : ''}>Semanal</option>
                            <option value="biweekly" ${loan && loan.paymentFrequency === 'biweekly' ? 'selected' : ''}>Quincenal</option>
                            <option value="monthly" ${loan && loan.paymentFrequency === 'monthly' ? 'selected' : ''}>Mensual</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="loan-insurance">Seguro por Cuota</label>
                        <input type="number" id="loan-insurance" step="0.01" min="0" value="${loan ? loan.insurance || 0 : 0}">
                    </div>
                    <div class="form-group">
                        <label for="loan-tax">Impuesto por Cuota</label>
                        <input type="number" id="loan-tax" step="0.01" min="0" value="${loan ? loan.tax || 0 : 0}">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="loan-notes">Notas</label>
                    <textarea id="loan-notes" rows="3" placeholder="Información adicional del préstamo">${loan ? loan.notes || '' : ''}</textarea>
                </div>
                
                <div class="loan-preview" id="loan-preview" style="display: none;">
                    <h4>Vista Previa del Préstamo</h4>
                    <div class="preview-info">
                        <p><strong>Cuota Mensual:</strong> <span id="preview-monthly-payment"></span></p>
                        <p><strong>Total a Pagar:</strong> <span id="preview-total-payment"></span></p>
                        <p><strong>Total de Intereses:</strong> <span id="preview-total-interest"></span></p>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                    <button type="button" class="btn btn-info" onclick="calculateLoan()">Calcular</button>
                    <button type="submit" class="btn btn-primary">
                        ${loan ? 'Actualizar Préstamo' : 'Crear Préstamo'}
                    </button>
                </div>
            </form>
        </div>
    `;

    app.showModal(title, modalContent);
    
    document.getElementById('loan-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveLoan();
    });

    // Agregar event listeners para cálculo automático
    ['loan-amount', 'loan-interest', 'loan-term', 'loan-term-type', 'loan-payment-frequency'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateLoan);
    });
}

function calculateLoan() {
    const amount = parseFloat(document.getElementById('loan-amount').value) || 0;
    const interestRate = parseFloat(document.getElementById('loan-interest').value) || 0;
    const term = parseInt(document.getElementById('loan-term').value) || 0;
    const termType = document.getElementById('loan-term-type').value;
    const paymentFrequency = document.getElementById('loan-payment-frequency').value;
    const loanType = document.getElementById('loan-type').value;
    
    if (amount > 0 && interestRate >= 0 && term > 0 && loanType) {
        const calculation = calculateLoanPayment(amount, interestRate, term, termType, paymentFrequency, loanType);
        
        document.getElementById('preview-monthly-payment').textContent = app.formatCurrency(calculation.monthlyPayment);
        document.getElementById('preview-total-payment').textContent = app.formatCurrency(calculation.totalPayment);
        document.getElementById('preview-total-interest').textContent = app.formatCurrency(calculation.totalInterest);
        document.getElementById('loan-preview').style.display = 'block';
    }
}

function calculateLoanPayment(amount, interestRate, term, termType, paymentFrequency, loanType) {
    // Convertir plazo a meses para cálculos
    let termInMonths = term;
    switch (termType) {
        case 'days': termInMonths = term / 30; break;
        case 'weeks': termInMonths = term / 4; break;
        case 'years': termInMonths = term * 12; break;
        default: termInMonths = term;
    }
    
    const monthlyRate = interestRate / 100 / 12;
    
    let monthlyPayment, totalPayment, totalInterest;
    
    switch (loanType) {
        case 'simple':
            // Interés simple
            totalInterest = amount * (interestRate / 100) * termInMonths;
            monthlyPayment = (amount + totalInterest) / termInMonths;
            totalPayment = amount + totalInterest;
            break;
            
        case 'french':
            // Sistema francés (cuotas constantes)
            if (monthlyRate === 0) {
                monthlyPayment = amount / termInMonths;
            } else {
                monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, termInMonths)) / 
                                (Math.pow(1 + monthlyRate, termInMonths) - 1);
            }
            totalPayment = monthlyPayment * termInMonths;
            totalInterest = totalPayment - amount;
            break;
            
        case 'american':
            // Sistema americano (solo intereses durante el plazo, capital al final)
            monthlyPayment = (amount * monthlyRate) + (amount / termInMonths);
            totalInterest = amount * monthlyRate * termInMonths;
            totalPayment = amount + totalInterest;
            break;
            
        case 'german':
            // Sistema alemán (cuotas decrecientes)
            const principalPayment = amount / termInMonths;
            const firstInterest = amount * monthlyRate;
            monthlyPayment = principalPayment + firstInterest;
            totalInterest = (amount * monthlyRate * (termInMonths + 1)) / 2;
            totalPayment = amount + totalInterest;
            break;
            
        case 'manual':
            // Sistema manual - el usuario define todo
            monthlyPayment = amount / termInMonths; // Valor por defecto
            totalPayment = amount;
            totalInterest = 0;
            break;
            
        default:
            monthlyPayment = 0;
            totalPayment = 0;
            totalInterest = 0;
    }
    
    return {
        monthlyPayment: monthlyPayment,
        totalPayment: totalPayment,
        totalInterest: totalInterest
    };
}

function saveLoan() {
    const loanId = document.getElementById('loan-id').value;
    const clientId = document.getElementById('loan-client').value;
    const amount = parseFloat(document.getElementById('loan-amount').value);
    const interestRate = parseFloat(document.getElementById('loan-interest').value);
    const term = parseInt(document.getElementById('loan-term').value);
    const termType = document.getElementById('loan-term-type').value;
    const paymentFrequency = document.getElementById('loan-payment-frequency').value;
    const loanType = document.getElementById('loan-type').value;
    const startDate = document.getElementById('loan-start-date').value;
    const insurance = parseFloat(document.getElementById('loan-insurance').value) || 0;
    const tax = parseFloat(document.getElementById('loan-tax').value) || 0;
    const notes = document.getElementById('loan-notes').value;
    
    // Calcular fechas de pago
    const calculation = calculateLoanPayment(amount, interestRate, term, termType, paymentFrequency, loanType);
    const nextPaymentDate = calculateNextPaymentDate(startDate, paymentFrequency);
    
    const loanData = {
        id: loanId || app.generateId(),
        clientId: parseInt(clientId),
        userId: app.currentUser.id,
        type: loanType,
        amount: amount,
        interestRate: interestRate,
        term: term,
        termType: termType,
        paymentFrequency: paymentFrequency,
        startDate: startDate,
        nextPayment: nextPaymentDate,
        status: 'active',
        insurance: insurance,
        tax: tax,
        notes: notes,
        monthlyPayment: calculation.monthlyPayment,
        totalPayment: calculation.totalPayment,
        totalInterest: calculation.totalInterest,
        paidAmount: 0,
        remainingAmount: calculation.totalPayment,
        createdAt: loanId ? app.data.loans.find(l => l.id == loanId).createdAt : new Date().toISOString(),
        payments: loanId ? app.data.loans.find(l => l.id == loanId).payments || [] : []
    };
    
    if (loanId) {
        // Actualizar préstamo existente
        const index = app.data.loans.findIndex(l => l.id == loanId);
        app.data.loans[index] = loanData;
    } else {
        // Crear nuevo préstamo
        app.data.loans.push(loanData);
    }
    
    app.saveData();
    app.closeModal();
    loadLoansModule();
    
    const message = loanId ? 'Préstamo actualizado exitosamente' : 'Préstamo creado exitosamente';
    alert(message);
}

function calculateNextPaymentDate(startDate, frequency) {
    const start = new Date(startDate);
    const next = new Date(start);
    
    switch (frequency) {
        case 'daily':
            next.setDate(start.getDate() + 1);
            break;
        case 'weekly':
            next.setDate(start.getDate() + 7);
            break;
        case 'biweekly':
            next.setDate(start.getDate() + 15);
            break;
        case 'monthly':
            next.setMonth(start.getMonth() + 1);
            break;
    }
    
    return next.toISOString().split('T')[0];
}

function getLoanTypeName(type) {
    const types = {
        'simple': 'Sistema Simple',
        'french': 'Sistema Francés',
        'american': 'Sistema Americano',
        'german': 'Sistema Alemán',
        'manual': 'Sistema Manual'
    };
    return types[type] || type;
}

function getStatusText(status) {
    const statuses = {
        'active': 'Activo',
        'paid': 'Pagado',
        'cancelled': 'Cancelado',
        'overdue': 'Vencido'
    };
    return statuses[status] || status;
}

function viewLoanDetails(loanId) {
    const loan = app.data.loans.find(l => l.id === loanId);
    if (!loan) return;
    
    const client = app.data.clients.find(c => c.id === loan.clientId);
    const payments = loan.payments || [];
    
    const modalContent = `
        <div class="loan-details">
            <div class="loan-info">
                <h3>Préstamo #${loan.id}</h3>
                <p><strong>Cliente:</strong> ${client ? client.name : 'Cliente no encontrado'}</p>
                <p><strong>Tipo:</strong> ${getLoanTypeName(loan.type)}</p>
                <p><strong>Monto:</strong> ${app.formatCurrency(loan.amount)}</p>
                <p><strong>Tasa de Interés:</strong> ${loan.interestRate}%</p>
                <p><strong>Plazo:</strong> ${loan.term} ${loan.termType}</p>
                <p><strong>Frecuencia:</strong> ${loan.paymentFrequency}</p>
                <p><strong>Fecha Inicio:</strong> ${app.formatDate(loan.startDate)}</p>
                <p><strong>Próximo Pago:</strong> ${app.formatDate(loan.nextPayment)}</p>
                <p><strong>Estado:</strong> <span class="status-badge status-${loan.status}">${getStatusText(loan.status)}</span></p>
                ${loan.notes ? `<p><strong>Notas:</strong> ${loan.notes}</p>` : ''}
            </div>
            
            <div class="loan-summary">
                <h4>Resumen Financiero</h4>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="summary-label">Cuota:</span>
                        <span class="summary-value">${app.formatCurrency(loan.monthlyPayment)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Total a Pagar:</span>
                        <span class="summary-value">${app.formatCurrency(loan.totalPayment)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Total Intereses:</span>
                        <span class="summary-value">${app.formatCurrency(loan.totalInterest)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Pagado:</span>
                        <span class="summary-value">${app.formatCurrency(loan.paidAmount)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Restante:</span>
                        <span class="summary-value">${app.formatCurrency(loan.remainingAmount)}</span>
                    </div>
                </div>
            </div>

            ${payments.length > 0 ? `
                <div class="loan-payments">
                    <h4>Historial de Pagos</h4>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Monto</th>
                                    <th>Capital</th>
                                    <th>Interés</th>
                                    <th>Seguro</th>
                                    <th>Impuesto</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${payments.map(payment => `
                                    <tr>
                                        <td>${app.formatDate(payment.date)}</td>
                                        <td>${app.formatCurrency(payment.principal)}</td>
                                        <td>${app.formatCurrency(payment.capital)}</td>
                                        <td>${app.formatCurrency(payment.interest)}</td>
                                        <td>${app.formatCurrency(payment.insurance || 0)}</td>
                                        <td>${app.formatCurrency(payment.tax || 0)}</td>
                                        <td>${app.formatCurrency(payment.total)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            ` : ''}
        </div>
    `;

    app.showModal(`Detalles del Préstamo #${loan.id}`, modalContent);
}

function collectPayment(loanId) {
    const loan = app.data.loans.find(l => l.id === loanId);
    if (!loan) return;
    
    const client = app.data.clients.find(c => c.id === loan.clientId);
    
    const modalContent = `
        <div class="form-container">
            <form id="payment-form">
                <input type="hidden" id="payment-loan-id" value="${loanId}">
                
                <div class="loan-info">
                    <h4>Información del Préstamo</h4>
                    <p><strong>Cliente:</strong> ${client ? client.name : 'Cliente no encontrado'}</p>
                    <p><strong>Cuota Regular:</strong> ${app.formatCurrency(loan.monthlyPayment)}</p>
                    <p><strong>Próximo Pago:</strong> ${app.formatDate(loan.nextPayment)}</p>
                </div>
                
                <div class="form-group">
                    <label for="payment-amount">Monto a Cobrar *</label>
                    <input type="number" id="payment-amount" step="0.01" min="0" value="${loan.monthlyPayment}" required>
                </div>
                
                <div class="form-group">
                    <label for="payment-date">Fecha de Pago *</label>
                    <input type="date" id="payment-date" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                
                <div class="form-group">
                    <label for="payment-type">Tipo de Pago</label>
                    <select id="payment-type">
                        <option value="full">Cuota Completa</option>
                        <option value="partial">Pago Parcial</option>
                        <option value="early">Pago Adelantado</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="payment-notes">Notas</label>
                    <textarea id="payment-notes" rows="2" placeholder="Observaciones del pago"></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Registrar Pago</button>
                </div>
            </form>
        </div>
    `;

    app.showModal(`Cobrar Pago - Préstamo #${loanId}`, modalContent);
    
    document.getElementById('payment-form').addEventListener('submit', (e) => {
        e.preventDefault();
        processPayment();
    });
}

function processPayment() {
    const loanId = parseInt(document.getElementById('payment-loan-id').value);
    const amount = parseFloat(document.getElementById('payment-amount').value);
    const paymentDate = document.getElementById('payment-date').value;
    const paymentType = document.getElementById('payment-type').value;
    const notes = document.getElementById('payment-notes').value;
    
    const loan = app.data.loans.find(l => l.id === loanId);
    if (!loan) return;
    
    // Calcular componentes del pago
    const interestAmount = (loan.amount * loan.interestRate / 100) / 12; // Simplificado
    const principalAmount = amount - interestAmount - (loan.insurance || 0) - (loan.tax || 0);
    
    const payment = {
        id: app.generateId(),
        loanId: loanId,
        clientId: loan.clientId,
        userId: app.currentUser.id,
        date: paymentDate,
        amount: amount,
        principal: principalAmount,
        capital: principalAmount,
        interest: interestAmount,
        insurance: loan.insurance || 0,
        tax: loan.tax || 0,
        total: amount,
        type: paymentType,
        notes: notes
    };
    
    // Actualizar préstamo
    loan.paidAmount = (loan.paidAmount || 0) + amount;
    loan.remainingAmount = loan.totalPayment - loan.paidAmount;
    
    if (loan.remainingAmount <= 0) {
        loan.status = 'paid';
    } else {
        // Calcular próximo pago
        loan.nextPayment = calculateNextPaymentDate(paymentDate, loan.paymentFrequency);
    }
    
    loan.payments = loan.payments || [];
    loan.payments.push(payment);
    
    // Agregar a colecciones
    app.data.collections.push(payment);
    
    app.saveData();
    app.closeModal();
    loadLoansModule();
    alert('Pago registrado exitosamente');
}

function reprogramLoan(loanId) {
    const loan = app.data.loans.find(l => l.id === loanId);
    if (!loan) return;
    
    const modalContent = `
        <div class="form-container">
            <form id="reprogram-form">
                <input type="hidden" id="reprogram-loan-id" value="${loanId}">
                
                <div class="form-group">
                    <label for="new-start-date">Nueva Fecha de Inicio</label>
                    <input type="date" id="new-start-date" value="${loan.startDate}">
                </div>
                
                <div class="form-group">
                    <label for="new-term">Nuevo Plazo</label>
                    <input type="number" id="new-term" min="1" value="${loan.term}">
                </div>
                
                <div class="form-group">
                    <label for="new-interest">Nueva Tasa de Interés (%)</label>
                    <input type="number" id="new-interest" step="0.01" min="0" max="100" value="${loan.interestRate}">
                </div>
                
                <div class="form-group">
                    <label for="reprogram-reason">Motivo de Reprogramación</label>
                    <textarea id="reprogram-reason" rows="3" placeholder="Explicar el motivo de la reprogramación" required></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Reprogramar Préstamo</button>
                </div>
            </form>
        </div>
    `;

    app.showModal(`Reprogramar Préstamo #${loanId}`, modalContent);
    
    document.getElementById('reprogram-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newStartDate = document.getElementById('new-start-date').value;
        const newTerm = parseInt(document.getElementById('new-term').value);
        const newInterest = parseFloat(document.getElementById('new-interest').value);
        const reason = document.getElementById('reprogram-reason').value;
        
        // Actualizar préstamo
        loan.startDate = newStartDate;
        loan.term = newTerm;
        loan.interestRate = newInterest;
        loan.nextPayment = calculateNextPaymentDate(newStartDate, loan.paymentFrequency);
        
        // Recalcular
        const calculation = calculateLoanPayment(loan.amount, newInterest, newTerm, loan.termType, loan.paymentFrequency, loan.type);
        loan.monthlyPayment = calculation.monthlyPayment;
        loan.totalPayment = calculation.totalPayment;
        loan.totalInterest = calculation.totalInterest;
        loan.remainingAmount = loan.totalPayment - (loan.paidAmount || 0);
        
        // Agregar nota de reprogramación
        loan.notes = (loan.notes || '') + `\n\nReprogramado el ${new Date().toLocaleDateString()}: ${reason}`;
        
        app.saveData();
        app.closeModal();
        loadLoansModule();
        alert('Préstamo reprogramado exitosamente');
    });
}

function cancelLoan(loanId) {
    const loan = app.data.loans.find(l => l.id === loanId);
    if (!loan) return;
    
    const client = app.data.clients.find(c => c.id === loan.clientId);
    
    if (confirm(`¿Estás seguro de que quieres cancelar el préstamo #${loanId} del cliente "${client ? client.name : 'Cliente no encontrado'}"?`)) {
        loan.status = 'cancelled';
        loan.cancelledAt = new Date().toISOString();
        app.saveData();
        loadLoansModule();
        alert('Préstamo cancelado exitosamente');
    }
}

// Agregar estilos CSS para préstamos
const loanStyles = `
    <style>
        .loan-details {
            max-height: 70vh;
            overflow-y: auto;
        }
        
        .loan-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .loan-info h3 {
            color: #1e293b;
            margin-bottom: 15px;
            font-size: 1.5rem;
        }
        
        .loan-info p {
            margin-bottom: 8px;
            color: #64748b;
        }
        
        .loan-summary {
            margin-bottom: 20px;
        }
        
        .loan-summary h4 {
            color: #1e293b;
            margin-bottom: 15px;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .summary-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .summary-label {
            font-weight: 500;
            color: #64748b;
        }
        
        .summary-value {
            font-weight: 600;
            color: #1e293b;
        }
        
        .loan-payments h4 {
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
        
        .status-overdue {
            background: #fef3c7;
            color: #d97706;
        }
        
        .preview-info {
            background: #eff6ff;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .preview-info p {
            margin-bottom: 8px;
            color: #1e40af;
        }
    </style>
`;

// Agregar estilos al head si no existen
if (!document.getElementById('loan-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'loan-styles';
    styleElement.innerHTML = loanStyles;
    document.head.appendChild(styleElement);
}
