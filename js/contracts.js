// Módulo de Contratos
function loadContractsModule() {
    console.log('📄 Cargando módulo de Contratos...');
    const section = document.getElementById('contracts');
    section.innerHTML = `
        <div class="contracts-header">
            <h2>Generador de Contratos</h2>
            <p>Genera contratos profesionales para préstamos y empeños</p>
        </div>

        <div class="contracts-actions">
            <div class="action-card">
                <div class="action-icon loan-contract">
                    <i class="fas fa-hand-holding-usd"></i>
                </div>
                <div class="action-info">
                    <h3>Contrato de Préstamo</h3>
                    <p>Genera contratos de préstamo con términos y condiciones legales</p>
                    <button class="btn btn-primary" onclick="generateLoanContract()">
                        <i class="fas fa-file-contract"></i> Generar Contrato
                    </button>
                </div>
            </div>

            <div class="action-card">
                <div class="action-icon pawn-contract">
                    <i class="fas fa-gem"></i>
                </div>
                <div class="action-info">
                    <h3>Contrato de Empeño</h3>
                    <p>Genera contratos de empeño para artículos de valor</p>
                    <button class="btn btn-warning" onclick="generatePawnContract()">
                        <i class="fas fa-file-contract"></i> Generar Contrato
                    </button>
                </div>
            </div>
        </div>

        <div class="contracts-history">
            <h3>Contratos Generados Recientemente</h3>
            <div class="table-container">
                <div class="table-content">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Tipo</th>
                                <th>Cliente</th>
                                <th>Monto/Artículo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="contracts-history-body">
                            ${getContractsHistory().map(contract => `
                                <tr>
                                    <td>${app.formatDate(contract.date)}</td>
                                    <td><span class="badge ${contract.type === 'préstamo' ? 'badge-primary' : 'badge-warning'}">${contract.type}</span></td>
                                    <td>${contract.clientName}</td>
                                    <td>${contract.amount}</td>
                                    <td>
                                        <button class="btn btn-secondary" onclick="viewContract('${contract.id}')">Ver</button>
                                        <button class="btn btn-danger" onclick="deleteContract('${contract.id}')">Eliminar</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    console.log('✅ Módulo de Contratos cargado exitosamente');
}

function generateLoanContract() {
    console.log('📄 Generando contrato de préstamo...');
    
    // Verificar si hay préstamos disponibles
    if (!app.data.loans || app.data.loans.length === 0) {
        alert('No hay préstamos disponibles para generar contratos');
        return;
    }

    const modalContent = `
        <div class="form-container">
            <h3>Generar Contrato de Préstamo</h3>
            <p>Selecciona el préstamo para generar el contrato:</p>
            
            <div class="form-group">
                <label for="loan-select">Seleccionar Préstamo</label>
                <select id="loan-select" required>
                    <option value="">-- Seleccionar Préstamo --</option>
                    ${app.data.loans.map(loan => {
                        const client = app.data.clients.find(c => c.id == loan.clientId);
                        const clientName = client ? client.name : 'Cliente no encontrado';
                        return `<option value="${loan.id}">${clientName} - $${loan.amount}</option>`;
                    }).join('')}
                </select>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                <button type="button" class="btn btn-primary" onclick="createLoanContract()">
                    <i class="fas fa-file-contract"></i> Generar Contrato
                </button>
            </div>
        </div>
    `;

    app.showModal('Generar Contrato de Préstamo', modalContent);
}

function generatePawnContract() {
    console.log('💎 Generando contrato de empeño...');
    
    const modalContent = `
        <div class="form-container">
            <h3>Generar Contrato de Empeño</h3>
            <p>Ingresa los datos para el contrato de empeño:</p>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="pawn-client">Cliente *</label>
                    <select id="pawn-client" required>
                        <option value="">Seleccionar Cliente</option>
                        ${app.data.clients.map(client => `
                            <option value="${client.id}">${client.name} - ${client.email}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="pawn-amount">Monto del Empeño *</label>
                    <input type="number" id="pawn-amount" step="0.01" min="0" required placeholder="0.00">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="pawn-item">Artículo Empeñado *</label>
                    <input type="text" id="pawn-item" required placeholder="Ej: Anillo de oro, Reloj, etc.">
                </div>
                <div class="form-group">
                    <label for="pawn-description">Descripción del Artículo</label>
                    <textarea id="pawn-description" rows="3" placeholder="Descripción detallada del artículo"></textarea>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="pawn-interest">Tasa de Interés (%)</label>
                    <input type="number" id="pawn-interest" step="0.01" min="0" value="5" placeholder="5.00">
                </div>
                <div class="form-group">
                    <label for="pawn-term">Plazo (días)</label>
                    <input type="number" id="pawn-term" min="1" value="30" placeholder="30">
                </div>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                <button type="button" class="btn btn-warning" onclick="createPawnContract()">
                    <i class="fas fa-file-contract"></i> Generar Contrato
                </button>
            </div>
        </div>
    `;

    app.showModal('Generar Contrato de Empeño', modalContent);
}

function createLoanContract() {
    const loanSelect = document.getElementById('loan-select');
    
    if (!loanSelect || !loanSelect.value) {
        alert('Por favor selecciona un préstamo');
        return;
    }
    
    const loan = app.data.loans.find(l => l.id == loanSelect.value);
    const client = app.data.clients.find(c => c.id == loan.clientId);
    
    if (!loan || !client) {
        alert('No se encontró la información del préstamo o cliente');
        return;
    }
    
    // Cerrar modal
    app.closeModal();
    
    // Mostrar contrato en la página actual
    const section = document.getElementById('contracts');
    const today = new Date().toLocaleDateString('es-ES');
    const businessName = app.data.config.businessName || 'TV Pinula Demo Cobro';
    
    section.innerHTML = `
        <div class="contract-actions">
            <button class="btn btn-secondary" onclick="loadContractsModule()">
                <i class="fas fa-arrow-left"></i> Volver a Contratos
            </button>
            <button class="btn btn-primary" onclick="printContract()">
                <i class="fas fa-print"></i> Imprimir
            </button>
        </div>
        
        <div class="contract-content">
            <div class="contract-header">
                <h1>${businessName}</h1>
                <h2>CONTRATO DE PRÉSTAMO</h2>
            </div>
            
            <div class="contract-section">
                <h3>INFORMACIÓN DEL CLIENTE</h3>
                <div class="contract-info-grid">
                    <div class="contract-info-item">
                        <span class="contract-info-label">Nombre Completo:</span><br>
                        ${client.name}
                    </div>
                    <div class="contract-info-item">
                        <span class="contract-info-label">Documento:</span><br>
                        ${client.document || 'No especificado'}
                    </div>
                    <div class="contract-info-item">
                        <span class="contract-info-label">Dirección:</span><br>
                        ${client.address || 'No especificada'}
                    </div>
                    <div class="contract-info-item">
                        <span class="contract-info-label">Teléfono:</span><br>
                        ${client.phone || 'No especificado'}
                    </div>
                </div>
            </div>
            
            <div class="contract-section">
                <h3>DETALLES DEL PRÉSTAMO</h3>
                <div class="contract-info-grid">
                    <div class="contract-info-item">
                        <span class="contract-info-label">Monto del Préstamo:</span><br>
                        $${loan.amount}
                    </div>
                    <div class="contract-info-item">
                        <span class="contract-info-label">Tipo de Préstamo:</span><br>
                        ${loan.type}
                    </div>
                    <div class="contract-info-item">
                        <span class="contract-info-label">Tasa de Interés:</span><br>
                        ${loan.interestRate}%
                    </div>
                    <div class="contract-info-item">
                        <span class="contract-info-label">Plazo:</span><br>
                        ${loan.term} ${loan.termType || 'meses'}
                    </div>
                    <div class="contract-info-item">
                        <span class="contract-info-label">Fecha de Contrato:</span><br>
                        ${today}
                    </div>
                    <div class="contract-info-item">
                        <span class="contract-info-label">Próximo Pago:</span><br>
                        ${loan.nextPayment ? new Date(loan.nextPayment).toLocaleDateString('es-ES') : 'No especificado'}
                    </div>
                </div>
            </div>
            
            <div class="contract-section">
                <h3>TÉRMINOS Y CONDICIONES</h3>
                <p><strong>1. OBLIGACIONES DEL PRESTATARIO:</strong></p>
                <p>El prestatario se compromete a pagar el monto del préstamo de $${loan.amount} más los intereses correspondientes del ${loan.interestRate}% anual.</p>
                
                <p><strong>2. PLAZO DE PAGO:</strong></p>
                <p>El préstamo debe ser cancelado en un plazo de ${loan.term} ${loan.termType || 'meses'}.</p>
                
                <p><strong>3. PENALIZACIONES:</strong></p>
                <p>En caso de retraso en los pagos, se aplicarán las penalizaciones establecidas en la legislación vigente.</p>
                
                <p><strong>4. JURISDICCIÓN:</strong></p>
                <p>Este contrato se regirá por las leyes de la República y cualquier disputa será resuelta en los tribunales competentes.</p>
            </div>
            
            <div class="contract-signature-section">
                <h3>FIRMAS</h3>
                <p>En constancia de lo anterior, las partes firman el presente contrato en la fecha indicada.</p>
                
                <div class="contract-signature-line">
                    <div class="contract-signature-box">
                        <div class="contract-signature-line-element"></div>
                        <strong>PRESTATARIO</strong><br>
                        ${client.name}
                    </div>
                    <div class="contract-signature-box">
                        <div class="contract-signature-line-element"></div>
                        <strong>PRESTAMISTA</strong><br>
                        ${businessName}
                    </div>
                </div>
                
                <div style="margin-top: 30px; text-align: center;">
                    <p><strong>Fecha:</strong> _________________________</p>
                    <p><strong>Lugar:</strong> _________________________</p>
                </div>
            </div>
            
            <div class="contract-footer">
                <p>Contrato generado el ${new Date().toLocaleString('es-ES')} por ${businessName}</p>
            </div>
        </div>
    `;
    
    // Guardar en historial
    saveContractToHistory('préstamo', client.name, `$${loan.amount}`);
}

function createPawnContract() {
    const clientId = document.getElementById('pawn-client').value;
    const amount = document.getElementById('pawn-amount').value;
    const item = document.getElementById('pawn-item').value;
    const description = document.getElementById('pawn-description').value;
    const interest = document.getElementById('pawn-interest').value;
    const term = document.getElementById('pawn-term').value;
    
    if (!clientId || !amount || !item) {
        alert('Por favor completa todos los campos obligatorios');
        return;
    }
    
    const client = app.data.clients.find(c => c.id == clientId);
    
    if (!client) {
        alert('Cliente no encontrado');
        return;
    }
    
    // Cerrar modal
    app.closeModal();
    
    // Mostrar contrato en la página actual
    const section = document.getElementById('contracts');
    const today = new Date().toLocaleDateString('es-ES');
    const dueDate = new Date(Date.now() + (term * 24 * 60 * 60 * 1000)).toLocaleDateString('es-ES');
    const businessName = app.data.config.businessName || 'TV Pinula Demo Cobro';
    
    section.innerHTML = `
        <div class="contract-actions">
            <button class="btn btn-secondary" onclick="loadContractsModule()">
                <i class="fas fa-arrow-left"></i> Volver a Contratos
            </button>
            <button class="btn btn-primary" onclick="printContract()">
                <i class="fas fa-print"></i> Imprimir
            </button>
        </div>
        
        <div class="contract-content">
            <div class="contract-header">
                <h1>${businessName}</h1>
                <h2>CONTRATO DE EMPEÑO</h2>
            </div>
            
            <div class="contract-section">
                <h3>INFORMACIÓN DEL CLIENTE</h3>
                <div class="contract-info-grid">
                    <div class="contract-info-item">
                        <span class="contract-info-label">Nombre Completo:</span><br>
                        ${client.name}
                    </div>
                    <div class="contract-info-item">
                        <span class="contract-info-label">Documento:</span><br>
                        ${client.document || 'No especificado'}
                    </div>
                    <div class="contract-info-item">
                        <span class="contract-info-label">Dirección:</span><br>
                        ${client.address || 'No especificada'}
                    </div>
                    <div class="contract-info-item">
                        <span class="contract-info-label">Teléfono:</span><br>
                        ${client.phone || 'No especificado'}
                    </div>
                </div>
            </div>
            
            <div class="contract-section">
                <h3>DETALLES DEL EMPEÑO</h3>
                <div class="contract-info-grid">
                    <div class="contract-info-item">
                        <span class="contract-info-label">Monto del Empeño:</span><br>
                        $${amount}
                    </div>
                    <div class="contract-info-item">
                        <span class="contract-info-label">Artículo Empeñado:</span><br>
                        ${item}
                    </div>
                    <div class="contract-info-item">
                        <span class="contract-info-label">Tasa de Interés:</span><br>
                        ${interest}% mensual
                    </div>
                    <div class="contract-info-item">
                        <span class="contract-info-label">Plazo:</span><br>
                        ${term} días
                    </div>
                    <div class="contract-info-item">
                        <span class="contract-info-label">Fecha de Vencimiento:</span><br>
                        ${dueDate}
                    </div>
                    <div class="contract-info-item">
                        <span class="contract-info-label">Fecha de Contrato:</span><br>
                        ${today}
                    </div>
                </div>
            </div>
            
            <div class="contract-section">
                <h3>DESCRIPCIÓN DEL ARTÍCULO</h3>
                <div class="contract-item-description">
                    <p><strong>Artículo:</strong> ${item}</p>
                    <p><strong>Descripción:</strong> ${description || 'No se proporcionó descripción adicional'}</p>
                </div>
            </div>
            
            <div class="contract-section">
                <h3>TÉRMINOS Y CONDICIONES</h3>
                <p><strong>1. OBJETO DEL EMPEÑO:</strong></p>
                <p>El cliente empeña el artículo "${item}" por un monto de $${amount} con una tasa de interés del ${interest}% mensual.</p>
                
                <p><strong>2. PLAZO DE REDENCIÓN:</strong></p>
                <p>El plazo para redimir el artículo es de ${term} días, contados a partir de la fecha de este contrato (${today}).</p>
                
                <p><strong>3. INTERESES:</strong></p>
                <p>Los intereses se calcularán sobre el monto del empeño al ${interest}% mensual. En caso de no redimir el artículo en el plazo establecido, los intereses continuarán acumulándose.</p>
                
                <p><strong>4. RENOVACIÓN:</strong></p>
                <p>El contrato puede ser renovado previo pago de los intereses acumulados hasta la fecha de renovación.</p>
                
                <p><strong>5. VENTA DEL ARTÍCULO:</strong></p>
                <p>Si el artículo no es redimido en el plazo establecido, la empresa podrá proceder a su venta para recuperar el monto prestado más los intereses acumulados.</p>
                
                <p><strong>6. JURISDICCIÓN:</strong></p>
                <p>Este contrato se regirá por las leyes de la República y cualquier disputa será resuelta en los tribunales competentes.</p>
            </div>
            
            <div class="contract-signature-section">
                <h3>FIRMAS</h3>
                <p>En constancia de lo anterior, las partes firman el presente contrato de empeño en la fecha indicada.</p>
                
                <div class="contract-signature-line">
                    <div class="contract-signature-box">
                        <div class="contract-signature-line-element"></div>
                        <strong>EMPEÑANTE</strong><br>
                        ${client.name}
                    </div>
                    <div class="contract-signature-box">
                        <div class="contract-signature-line-element"></div>
                        <strong>EMPEÑISTA</strong><br>
                        ${businessName}
                    </div>
                </div>
                
                <div style="margin-top: 30px; text-align: center;">
                    <p><strong>Fecha:</strong> _________________________</p>
                    <p><strong>Lugar:</strong> _________________________</p>
                </div>
            </div>
            
            <div class="contract-footer">
                <p>Contrato de empeño generado el ${new Date().toLocaleString('es-ES')} por ${businessName}</p>
            </div>
        </div>
    `;
    
    // Guardar en historial
    saveContractToHistory('empeño', client.name, item);
}

function getContractsHistory() {
    const history = JSON.parse(localStorage.getItem('aszoLoand_contractsHistory')) || [];
    return history.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function saveContractToHistory(type, clientName, amount) {
    const history = getContractsHistory();
    const contract = {
        id: app.generateId(),
        date: new Date().toISOString(),
        type: type,
        clientName: clientName,
        amount: amount
    };
    
    history.unshift(contract);
    
    // Mantener solo los últimos 50 contratos
    if (history.length > 50) {
        history.splice(50);
    }
    
    localStorage.setItem('aszoLoand_contractsHistory', JSON.stringify(history));
}

function viewContract(contractId) {
    // Simular vista de contrato
    alert('Función de vista de contrato en desarrollo');
}

function deleteContract(contractId) {
    if (confirm('¿Estás seguro de que quieres eliminar este contrato del historial?')) {
        const history = getContractsHistory();
        const filteredHistory = history.filter(contract => contract.id !== contractId);
        localStorage.setItem('aszoLoand_contractsHistory', JSON.stringify(filteredHistory));
        loadContractsModule();
        alert('Contrato eliminado del historial exitosamente');
    }
}

function printContract() {
    // Ocultar botones de acción antes de imprimir
    const contractActions = document.querySelector('.contract-actions');
    if (contractActions) {
        contractActions.style.display = 'none';
    }
    
    // Imprimir
    window.print();
    
    // Mostrar botones de acción después de imprimir
    if (contractActions) {
        contractActions.style.display = 'block';
    }
}

// Agregar estilos CSS para contratos
const contractsStyles = `
    <style>
        .contracts-header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .contracts-actions {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .action-card {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        
        .action-icon {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            margin: 0 auto 15px;
        }
        
        .loan-contract {
            background: #3b82f6;
        }
        
        .pawn-contract {
            background: #e67e22;
        }
        
        .action-info h3 {
            margin-bottom: 10px;
            color: #1e293b;
        }
        
        .action-info p {
            margin-bottom: 15px;
            color: #64748b;
        }
        
        .contracts-history {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .contracts-history h3 {
            margin-bottom: 15px;
            color: #1e293b;
        }
        
        .badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .badge-primary {
            background: #dbeafe;
            color: #1e40af;
        }
        
        .badge-warning {
            background: #fef3c7;
            color: #92400e;
        }
        
        .btn-warning {
            background: #e67e22;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s ease;
        }
        
        .btn-warning:hover {
            background: #d35400;
            transform: translateY(-1px);
        }
        
        .btn-warning i {
            margin-right: 6px;
        }
    </style>
`;

// Agregar estilos al head si no existen
if (!document.getElementById('contracts-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'contracts-styles';
    styleElement.innerHTML = contractsStyles;
    document.head.appendChild(styleElement);
}
