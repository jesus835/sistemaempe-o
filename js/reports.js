// Módulo de Reportes y Exportación
function loadReportsModule() {
    console.log('📊 Cargando módulo de Reportes...');
    const section = document.getElementById('reports');
    section.innerHTML = `
        <div class="reports-header">
            <h2>Reportes y Exportación</h2>
            <p>Genere y exporte reportes detallados del sistema</p>
        </div>

        <div class="reports-grid">
            <div class="report-card" onclick="generateClientReport()">
                <div class="report-icon">
                    <i class="fas fa-users"></i>
                </div>
                <div class="report-info">
                    <h3>Reporte de Clientes</h3>
                    <p>Listado completo de clientes con información detallada</p>
                </div>
            </div>

            <div class="report-card" onclick="generateLoanReport()">
                <div class="report-icon">
                    <i class="fas fa-hand-holding-usd"></i>
                </div>
                <div class="report-info">
                    <h3>Reporte de Préstamos</h3>
                    <p>Estado de todos los préstamos activos y completados</p>
                </div>
            </div>

            <div class="report-card" onclick="generateCollectionReport()">
                <div class="report-icon">
                    <i class="fas fa-money-bill-wave"></i>
                </div>
                <div class="report-info">
                    <h3>Reporte de Cobros</h3>
                    <p>Historial de cobros por período</p>
                </div>
            </div>

            <div class="report-card" onclick="generateOverdueReport()">
                <div class="report-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="report-info">
                    <h3>Reporte de Vencidos</h3>
                    <p>Préstamos y cuotas vencidas</p>
                </div>
            </div>

            <div class="report-card" onclick="generateCashFlowReport()">
                <div class="report-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="report-info">
                    <h3>Flujo de Caja</h3>
                    <p>Ingresos y egresos por período</p>
                </div>
            </div>

            <div class="report-card" onclick="generatePaymentSchedule()">
                <div class="report-icon">
                    <i class="fas fa-calendar-alt"></i>
                </div>
                <div class="report-info">
                    <h3>Cronograma de Pagos</h3>
                    <p>Calendario de pagos por cliente</p>
                </div>
            </div>
        </div>

        <div class="export-section">
            <h3>Exportación a Excel</h3>
            <div class="export-options">
                <button class="btn btn-success" onclick="exportToExcel('clients')">
                    <i class="fas fa-file-excel"></i> Exportar Clientes
                </button>
                <button class="btn btn-success" onclick="exportToExcel('loans')">
                    <i class="fas fa-file-excel"></i> Exportar Préstamos
                </button>
                <button class="btn btn-success" onclick="exportToExcel('collections')">
                    <i class="fas fa-file-excel"></i> Exportar Cobros
                </button>
            </div>
        </div>
    `;
    console.log('✅ Módulo de Reportes cargado exitosamente');
}

function generateClientReport() {
    const modalContent = `
        <div class="form-container">
            <h3>Reporte de Clientes</h3>
            <form id="client-report-form">
                <div class="form-group">
                    <label for="client-report-filter">Filtrar por:</label>
                    <select id="client-report-filter">
                        <option value="all">Todos los clientes</option>
                        <option value="with-loans">Clientes con préstamos</option>
                        <option value="active-loans">Clientes con préstamos activos</option>
                        <option value="overdue">Clientes con préstamos vencidos</option>
                    </select>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Generar Reporte</button>
                </div>
            </form>
        </div>
    `;

    app.showModal('Generar Reporte de Clientes', modalContent);
    
    document.getElementById('client-report-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const filter = document.getElementById('client-report-filter').value;
        showClientReport(filter);
    });
}

function showClientReport(filter) {
    let clients = app.data.clients;
    
    switch (filter) {
        case 'with-loans':
            clients = clients.filter(client => 
                app.data.loans.some(loan => loan.clientId === client.id)
            );
            break;
        case 'active-loans':
            clients = clients.filter(client => 
                app.data.loans.some(loan => loan.clientId === client.id && loan.status === 'active')
            );
            break;
        case 'overdue':
            const today = new Date();
            clients = clients.filter(client => 
                app.data.loans.some(loan => 
                    loan.clientId === client.id && 
                    loan.status === 'active' && 
                    new Date(loan.nextPayment) < today
                )
            );
            break;
    }

    const reportContent = generateClientReportHTML(clients);
    app.closeModal();
    showReportModal('Reporte de Clientes', reportContent);
}

function generateClientReportHTML(clients) {
    return `
        <div class="report-content">
            <div class="report-header">
                <h2>Reporte de Clientes</h2>
                <p>Generado el: ${new Date().toLocaleDateString()}</p>
                <p>Total de clientes: ${clients.length}</p>
            </div>
            
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>DNI</th>
                            <th>Préstamos</th>
                            <th>Total Prestado</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${clients.map(client => {
                            const clientLoans = app.data.loans.filter(loan => loan.clientId === client.id);
                            const totalLoaned = clientLoans.reduce((sum, loan) => sum + loan.amount, 0);
                            const activeLoans = clientLoans.filter(loan => loan.status === 'active');
                            const overdueLoans = activeLoans.filter(loan => new Date(loan.nextPayment) < new Date());
                            
                            let status = 'Sin préstamos';
                            let statusClass = 'status-none';
                            
                            if (activeLoans.length > 0) {
                                if (overdueLoans.length > 0) {
                                    status = 'Con vencidos';
                                    statusClass = 'status-overdue';
                                } else {
                                    status = 'Al día';
                                    statusClass = 'status-current';
                                }
                            } else if (clientLoans.length > 0) {
                                status = 'Completado';
                                statusClass = 'status-completed';
                            }
                            
                            return `
                                <tr>
                                    <td>${client.id}</td>
                                    <td>${client.name}</td>
                                    <td>${client.email}</td>
                                    <td>${client.phone}</td>
                                    <td>${client.dni || '-'}</td>
                                    <td>${clientLoans.length}</td>
                                    <td>${app.formatCurrency(totalLoaned)}</td>
                                    <td><span class="status-badge ${statusClass}">${status}</span></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="report-actions">
                <button class="btn btn-primary" onclick="printReport()">
                    <i class="fas fa-print"></i> Imprimir
                </button>
                <button class="btn btn-success" onclick="exportReportToExcel('clients')">
                    <i class="fas fa-file-excel"></i> Exportar Excel
                </button>
            </div>
        </div>
    `;
}

function generateLoanReport() {
    const modalContent = `
        <div class="form-container">
            <h3>Reporte de Préstamos</h3>
            <form id="loan-report-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="loan-report-date-from">Fecha Desde</label>
                        <input type="date" id="loan-report-date-from">
                    </div>
                    <div class="form-group">
                        <label for="loan-report-date-to">Fecha Hasta</label>
                        <input type="date" id="loan-report-date-to">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="loan-report-status">Estado</label>
                    <select id="loan-report-status">
                        <option value="all">Todos</option>
                        <option value="active">Activos</option>
                        <option value="paid">Pagados</option>
                        <option value="cancelled">Cancelados</option>
                        <option value="overdue">Vencidos</option>
                    </select>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Generar Reporte</button>
                </div>
            </form>
        </div>
    `;

    app.showModal('Generar Reporte de Préstamos', modalContent);
    
    document.getElementById('loan-report-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const dateFrom = document.getElementById('loan-report-date-from').value;
        const dateTo = document.getElementById('loan-report-date-to').value;
        const status = document.getElementById('loan-report-status').value;
        showLoanReport(dateFrom, dateTo, status);
    });
}

function showLoanReport(dateFrom, dateTo, status) {
    let loans = app.data.loans;
    
    // Filtrar por fechas
    if (dateFrom) {
        loans = loans.filter(loan => new Date(loan.startDate) >= new Date(dateFrom));
    }
    if (dateTo) {
        loans = loans.filter(loan => new Date(loan.startDate) <= new Date(dateTo));
    }
    
    // Filtrar por estado
    if (status !== 'all') {
        if (status === 'overdue') {
            const today = new Date();
            loans = loans.filter(loan => 
                loan.status === 'active' && new Date(loan.nextPayment) < today
            );
        } else {
            loans = loans.filter(loan => loan.status === status);
        }
    }

    const reportContent = generateLoanReportHTML(loans);
    app.closeModal();
    showReportModal('Reporte de Préstamos', reportContent);
}

function generateLoanReportHTML(loans) {
    const totalAmount = loans.reduce((sum, loan) => sum + loan.amount, 0);
    const totalPaid = loans.reduce((sum, loan) => sum + (loan.paidAmount || 0), 0);
    const totalRemaining = loans.reduce((sum, loan) => sum + (loan.remainingAmount || 0), 0);
    
    return `
        <div class="report-content">
            <div class="report-header">
                <h2>Reporte de Préstamos</h2>
                <p>Generado el: ${new Date().toLocaleDateString()}</p>
                <p>Total de préstamos: ${loans.length}</p>
            </div>
            
            <div class="report-summary">
                <div class="summary-item">
                    <span class="summary-label">Monto Total:</span>
                    <span class="summary-value">${app.formatCurrency(totalAmount)}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Total Pagado:</span>
                    <span class="summary-value">${app.formatCurrency(totalPaid)}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Total Pendiente:</span>
                    <span class="summary-value">${app.formatCurrency(totalRemaining)}</span>
                </div>
            </div>
            
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cliente</th>
                            <th>Tipo</th>
                            <th>Monto</th>
                            <th>Interés</th>
                            <th>Cuota</th>
                            <th>Pagado</th>
                            <th>Restante</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${loans.map(loan => {
                            const client = app.data.clients.find(c => c.id === loan.clientId);
                            return `
                                <tr>
                                    <td>${loan.id}</td>
                                    <td>${client ? client.name : 'Cliente no encontrado'}</td>
                                    <td>${getLoanTypeName(loan.type)}</td>
                                    <td>${app.formatCurrency(loan.amount)}</td>
                                    <td>${loan.interestRate}%</td>
                                    <td>${app.formatCurrency(loan.monthlyPayment)}</td>
                                    <td>${app.formatCurrency(loan.paidAmount || 0)}</td>
                                    <td>${app.formatCurrency(loan.remainingAmount || 0)}</td>
                                    <td><span class="status-badge status-${loan.status}">${getStatusText(loan.status)}</span></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="report-actions">
                <button class="btn btn-primary" onclick="printReport()">
                    <i class="fas fa-print"></i> Imprimir
                </button>
                <button class="btn btn-success" onclick="exportReportToExcel('loans')">
                    <i class="fas fa-file-excel"></i> Exportar Excel
                </button>
            </div>
        </div>
    `;
}

function showReportModal(title, content) {
    const modalContent = `
        <div class="report-modal">
            <div class="report-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="app.closeModal()">&times;</button>
            </div>
            <div class="report-body">
                ${content}
            </div>
        </div>
    `;
    
    app.showModal(title, modalContent);
}

function printReport() {
    window.print();
}

function exportReportToExcel(type) {
    // Simulación de exportación a Excel
    alert('Funcionalidad de exportación a Excel será implementada próximamente');
}

function exportToExcel(type) {
    alert(`Exportando ${type} a Excel...`);
}

// Agregar estilos CSS para reportes
const reportStyles = `
    <style>
        .reports-header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .reports-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .report-card {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            cursor: pointer;
            transition: transform 0.3s ease;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .report-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .report-icon {
            width: 60px;
            height: 60px;
            border-radius: 12px;
            background: #3b82f6;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
        }
        
        .report-info h3 {
            margin-bottom: 8px;
            color: #1e293b;
        }
        
        .report-info p {
            color: #64748b;
            font-size: 14px;
        }
        
        .export-section {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .export-section h3 {
            margin-bottom: 15px;
            color: #1e293b;
        }
        
        .export-options {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .report-content {
            max-height: 70vh;
            overflow-y: auto;
        }
        
        .report-header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .report-header h2 {
            color: #1e293b;
            margin-bottom: 10px;
        }
        
        .report-summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
            padding: 20px;
            background: #f8fafc;
            border-radius: 8px;
        }
        
        .summary-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            background: white;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
        }
        
        .summary-label {
            font-weight: 500;
            color: #64748b;
        }
        
        .summary-value {
            font-weight: 600;
            color: #1e293b;
        }
        
        .report-actions {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #e2e8f0;
        }
        
        .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .status-none {
            background: #f3f4f6;
            color: #374151;
        }
        
        .status-current {
            background: #dcfce7;
            color: #166534;
        }
        
        .status-overdue {
            background: #fef2f2;
            color: #dc2626;
        }
        
        .status-completed {
            background: #dbeafe;
            color: #1e40af;
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
        
        @media print {
            .report-actions {
                display: none;
            }
            
            .modal-overlay {
                position: static;
                background: none;
            }
            
            .modal {
                box-shadow: none;
                border: none;
            }
        }
    </style>
`;

// Agregar estilos al head si no existen
if (!document.getElementById('report-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'report-styles';
    styleElement.innerHTML = reportStyles;
    document.head.appendChild(styleElement);
}
