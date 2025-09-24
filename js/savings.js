// Módulo de Ahorros
function loadSavingsModule() {
	console.log('🐖 Cargando módulo de Ahorros...');
	const section = document.getElementById('savings');
	section.innerHTML = `
		<div class="table-container">
			<div class="table-header">
				<h3>Cuentas de Ahorro</h3>
				<button class="btn btn-primary" onclick="openSavingsAccountModal()">
					<i class="fas fa-plus"></i> Nueva Cuenta
				</button>
			</div>
			<div class="table-content">
				<table class="table">
					<thead>
						<tr>
							<th>Nº Cuenta</th>
							<th>Cliente</th>
							<th>Tipo</th>
							<th>Saldo</th>
							<th>Acciones</th>
						</tr>
					</thead>
					<tbody id="savings-table-body">
						${app.data.savingsAccounts.map(acc => `
							<tr>
								<td>${acc.accountNumber}</td>
								<td>${app.getClientName(acc.clientId)}</td>
								<td>${acc.type === 'long_term' ? 'Largo Plazo' : 'Normal'}</td>
								<td class="text-right">${app.formatCurrency(getSavingsBalance(acc.id))}</td>
								<td>
									<button class="btn btn-secondary" onclick="viewSavingsAccount(${acc.id})">Ver</button>
									<button class="btn btn-success" onclick="openSavingsTransactionModal(${acc.id}, 'deposit')">Depósito</button>
									<button class="btn btn-warning" onclick="openSavingsTransactionModal(${acc.id}, 'withdraw')">Retiro</button>
								</td>
							</tr>
						`).join('')}
					</tbody>
				</table>
			</div>
		</div>
	`;
	console.log('✅ Módulo de Ahorros cargado exitosamente');
}

function openSavingsAccountModal() {
	const modalContent = `
		<div class="form-container">
			<form id="savings-account-form">
				<div class="form-row">
					<div class="form-group">
						<label for="savings-client">Cliente *</label>
						<select id="savings-client" required>
							<option value="">Seleccionar Cliente</option>
							${app.data.clients.map(c => `<option value="${c.id}">${c.name} - ${c.email}</option>`).join('')}
						</select>
					</div>
					<div class="form-group">
						<label for="savings-type">Tipo de Cuenta *</label>
						<select id="savings-type" required>
							<option value="normal">Normal</option>
							<option value="long_term">Largo Plazo</option>
						</select>
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="savings-account-number">Número de Cuenta *</label>
						<input type="text" id="savings-account-number" required placeholder="Ej. 1001-000001">
					</div>
					<div class="form-group">
						<label for="savings-initial-balance">Saldo Inicial</label>
						<input type="number" id="savings-initial-balance" step="0.01" min="0" value="0">
					</div>
				</div>

				<div class="form-actions">
					<button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
					<button type="submit" class="btn btn-primary">Crear Cuenta</button>
				</div>
			</form>
		</div>
	`;

	app.showModal('Nueva Cuenta de Ahorro', modalContent);

	document.getElementById('savings-account-form').addEventListener('submit', (e) => {
		e.preventDefault();
		createSavingsAccount();
	});
}

function createSavingsAccount() {
	const clientId = parseInt(document.getElementById('savings-client').value);
	const type = document.getElementById('savings-type').value;
	const accountNumber = document.getElementById('savings-account-number').value.trim();
	const initialBalance = parseFloat(document.getElementById('savings-initial-balance').value) || 0;

	if (!clientId || !accountNumber) {
		alert('Complete los campos obligatorios');
		return;
	}

	const account = {
		id: app.generateId(),
		clientId,
		type,
		accountNumber,
		createdAt: new Date().toISOString()
	};

	app.data.savingsAccounts.push(account);
	if (initialBalance > 0) {
		app.data.savingsTransactions.push({
			id: app.generateId(),
			accountId: account.id,
			type: 'deposit',
			amount: initialBalance,
			date: new Date().toISOString().split('T')[0],
			notes: 'Saldo inicial',
			userId: app.currentUser.id
		});
	}

	app.saveData();
	app.closeModal();
	loadSavingsModule();
	alert('Cuenta creada exitosamente');

	// Recibo de apertura de cuenta
	showSavingsAccountOpeningReceipt(account);
}

function getSavingsBalance(accountId) {
	return (app.data.savingsTransactions || [])
		.filter(t => t.accountId === accountId)
		.reduce((sum, t) => sum + (t.type === 'deposit' ? t.amount : -t.amount), 0);
}

function openSavingsTransactionModal(accountId, txType) {
	const account = app.data.savingsAccounts.find(a => a.id === accountId);
	if (!account) return;

	const modalContent = `
		<div class="form-container">
			<form id="savings-tx-form">
				<input type="hidden" id="tx-account-id" value="${accountId}">
				<div class="form-group">
					<label for="tx-amount">Monto *</label>
					<input type="number" id="tx-amount" step="0.01" min="0" required>
				</div>
				<div class="form-group">
					<label for="tx-date">Fecha *</label>
					<input type="date" id="tx-date" value="${new Date().toISOString().split('T')[0]}" required>
				</div>
				<div class="form-group">
					<label for="tx-notes">Notas</label>
					<textarea id="tx-notes" rows="2" placeholder="Detalle de la operación"></textarea>
				</div>
				<div class="form-actions">
					<button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
					<button type="submit" class="btn ${txType === 'deposit' ? 'btn-success' : 'btn-warning'}">${txType === 'deposit' ? 'Registrar Depósito' : 'Registrar Retiro'}</button>
				</div>
			</form>
		</div>
	`;

	app.showModal(`${txType === 'deposit' ? 'Depósito' : 'Retiro'} - Cuenta ${account.accountNumber}`, modalContent);

	document.getElementById('savings-tx-form').addEventListener('submit', (e) => {
		e.preventDefault();
		saveSavingsTransaction(txType);
	});
}

function saveSavingsTransaction(txType) {
	const accountId = parseInt(document.getElementById('tx-account-id').value);
	const amount = parseFloat(document.getElementById('tx-amount').value);
	const date = document.getElementById('tx-date').value;
	const notes = document.getElementById('tx-notes').value;

	if (!amount || amount <= 0) {
		alert('El monto debe ser mayor a cero');
		return;
	}

	if (txType === 'withdraw') {
		const current = getSavingsBalance(accountId);
		if (amount > current) {
			alert('Fondos insuficientes para el retiro');
			return;
		}
	}

	app.data.savingsTransactions.push({
		id: app.generateId(),
		accountId,
		type: txType,
		amount,
		date,
		notes,
		userId: app.currentUser.id
	});

	app.saveData();
	app.closeModal();
	loadSavingsModule();
	alert('Operación registrada');

	// Recibos de depósito/retiro
	const acc = app.data.savingsAccounts.find(a => a.id === accountId);
	showSavingsTransactionReceipt(acc, { type: txType, amount, date, notes });
}

function viewSavingsAccount(accountId) {
	const account = app.data.savingsAccounts.find(a => a.id === accountId);
	if (!account) return;
	const balance = getSavingsBalance(accountId);
	const txs = (app.data.savingsTransactions || []).filter(t => t.accountId === accountId).sort((a,b) => new Date(b.date) - new Date(a.date));

	const modalContent = `
		<div class="loan-details">
			<div class="loan-info">
				<h3>Cuenta ${account.accountNumber}</h3>
				<p><strong>Cliente:</strong> ${app.getClientName(account.clientId)}</p>
				<p><strong>Tipo:</strong> ${account.type === 'long_term' ? 'Largo Plazo' : 'Normal'}</p>
				<p><strong>Saldo:</strong> ${app.formatCurrency(balance)}</p>
			</div>
			${txs.length ? `
			<div class="loan-payments">
				<h4>Movimientos</h4>
				<div class="table-container">
					<table class="table">
						<thead>
							<tr>
								<th>Fecha</th>
								<th>Tipo</th>
								<th>Monto</th>
								<th>Notas</th>
							</tr>
						</thead>
						<tbody>
							${txs.map(t => `
								<tr>
									<td>${app.formatDate(t.date)}</td>
									<td>${t.type === 'deposit' ? 'Depósito' : 'Retiro'}</td>
									<td>${app.formatCurrency(t.amount)}</td>
									<td>${t.notes || ''}</td>
								</tr>
							`).join('')}
						</tbody>
					</table>
				</div>
			</div>
			` : ''}
		</div>
	`;

	app.showModal(`Cuenta de Ahorro ${account.accountNumber}`, modalContent);
}

function showSavingsAccountOpeningReceipt(account) {
	const client = app.data.clients.find(c => c.id === account.clientId);
	const businessName = app.data.config.businessName || 'TV Pinula Demo Cobro';
	const html = `
		<div class="contract-actions"><button class="btn btn-primary" onclick="printContract()"><i class="fas fa-print"></i> Imprimir</button></div>
		<div class="contract-content">
			<div class="contract-header"><h1>${businessName}</h1><h2>APERTURA DE CUENTA DE AHORRO</h2></div>
			<div class="contract-section">
				<div class="contract-info-grid">
					<div class="contract-info-item"><span class="contract-info-label">Cliente:</span><br>${client ? client.name : '-'}</div>
					<div class="contract-info-item"><span class="contract-info-label">Nº Cuenta:</span><br>${account.accountNumber}</div>
					<div class="contract-info-item"><span class="contract-info-label">Tipo:</span><br>${account.type === 'long_term' ? 'Largo Plazo' : 'Normal'}</div>
					<div class="contract-info-item"><span class="contract-info-label">Fecha:</span><br>${new Date().toLocaleDateString('es-ES')}</div>
				</div>
			</div>
		</div>
	`;
	const section = document.getElementById('savings');
	section.innerHTML = html;
}

function showSavingsTransactionReceipt(account, tx) {
	const client = app.data.clients.find(c => c.id === account.clientId);
	const businessName = app.data.config.businessName || 'TV Pinula Demo Cobro';
	const html = `
		<div class="contract-actions"><button class="btn btn-primary" onclick="printContract()"><i class="fas fa-print"></i> Imprimir</button></div>
		<div class="contract-content">
			<div class="contract-header"><h1>${businessName}</h1><h2>${tx.type === 'deposit' ? 'DEPÓSITO' : 'RETIRO'} DE AHORRO</h2></div>
			<div class="contract-section">
				<div class="contract-info-grid">
					<div class="contract-info-item"><span class="contract-info-label">Cliente:</span><br>${client ? client.name : '-'}</div>
					<div class="contract-info-item"><span class="contract-info-label">Nº Cuenta:</span><br>${account.accountNumber}</div>
					<div class="contract-info-item"><span class="contract-info-label">Fecha:</span><br>${app.formatDate(tx.date)}</div>
					<div class="contract-info-item"><span class="contract-info-label">Monto:</span><br>${app.formatCurrency(tx.amount)}</div>
				</div>
				${tx.notes ? `<p><strong>Notas:</strong> ${tx.notes}</p>` : ''}
			</div>
		</div>
	`;
	const section = document.getElementById('savings');
	section.innerHTML = html;
}

// Estilos mínimos reutilizando clases de préstamos/tablas


