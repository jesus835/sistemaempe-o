// Módulo de Inversiones y Contrato de Inversión
function loadInvestmentsModule() {
	const section = document.getElementById('investments');
	section.innerHTML = `
		<div class="table-container">
			<div class="table-header">
				<h3>Inversiones</h3>
				<div>
					<button class="btn btn-primary" onclick="openInvestmentModal()"><i class="fas fa-plus"></i> Nueva Inversión</button>
					<button class="btn btn-secondary" onclick="openInvestmentContractModal()"><i class="fas fa-file-contract"></i> Contrato</button>
				</div>
			</div>
			<div class="table-content">
				<table class="table">
					<thead>
						<tr>
							<th>ID</th>
							<th>Cliente</th>
							<th>Monto</th>
							<th>Tasa</th>
							<th>Plazo</th>
							<th>Inicio</th>
							<th>Fin</th>
							<th>Acciones</th>
						</tr>
					</thead>
					<tbody id="investments-table-body">
						${(app.data.investments || []).map(inv => `
							<tr>
								<td>${inv.id}</td>
								<td>${app.getClientName(inv.clientId)}</td>
								<td class="text-right">${app.formatCurrency(inv.amount)}</td>
								<td>${inv.rate}%</td>
								<td>${inv.term} meses</td>
								<td>${app.formatDate(inv.startDate)}</td>
								<td>${app.formatDate(inv.endDate)}</td>
								<td>
									<button class="btn btn-secondary" onclick="viewInvestment(${inv.id})">Ver</button>
									<button class="btn btn-primary" onclick="generateInvestmentContract(${inv.id})">Contrato</button>
								</td>
							</tr>
						`).join('')}
					</tbody>
				</table>
			</div>
		</div>
	`;
}

function openInvestmentModal() {
	const modalContent = `
		<div class="form-container">
			<form id="investment-form">
				<div class="form-row">
					<div class="form-group">
						<label for="inv-client">Cliente *</label>
						<select id="inv-client" required>
							<option value="">Seleccionar Cliente</option>
							${app.data.clients.map(c => `<option value="${c.id}">${c.name} - ${c.email}</option>`).join('')}
						</select>
					</div>
					<div class="form-group">
						<label for="inv-amount">Monto *</label>
						<input type="number" id="inv-amount" min="0" step="0.01" required>
					</div>
				</div>
				<div class="form-row">
					<div class="form-group">
						<label for="inv-rate">Tasa (%) *</label>
						<input type="number" id="inv-rate" min="0" step="0.01" required>
					</div>
					<div class="form-group">
						<label for="inv-term">Plazo (meses) *</label>
						<input type="number" id="inv-term" min="1" required>
					</div>
				</div>
				<div class="form-row">
					<div class="form-group">
						<label for="inv-start">Fecha Inicio *</label>
						<input type="date" id="inv-start" value="${new Date().toISOString().split('T')[0]}" required>
					</div>
				</div>
				<div class="form-actions">
					<button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
					<button type="submit" class="btn btn-primary">Guardar</button>
				</div>
			</form>
		</div>
	`;

	app.showModal('Nueva Inversión', modalContent);
	document.getElementById('investment-form').addEventListener('submit', (e) => {
		e.preventDefault();
		saveInvestment();
	});
}

function saveInvestment() {
	app.data.investments = app.data.investments || [];
	const clientId = parseInt(document.getElementById('inv-client').value);
	const amount = parseFloat(document.getElementById('inv-amount').value);
	const rate = parseFloat(document.getElementById('inv-rate').value);
	const term = parseInt(document.getElementById('inv-term').value);
	const startDate = document.getElementById('inv-start').value;
	const endDate = new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + term)).toISOString().split('T')[0];

	if (!clientId || !amount || !rate || !term) {
		alert('Complete los campos obligatorios');
		return;
	}

	const investment = {
		id: app.generateId(),
		clientId,
		amount,
		rate,
		term,
		startDate,
		endDate,
		createdAt: new Date().toISOString()
	};

	app.data.investments.push(investment);
	app.saveData();
	app.closeModal();
	loadInvestmentsModule();
	alert('Inversión creada');

	// Recibo de apertura de inversión
	showInvestmentOpeningReceipt(investment);
}

function viewInvestment(id) {
	const inv = (app.data.investments || []).find(i => i.id === id);
	if (!inv) return;
	const client = app.data.clients.find(c => c.id === inv.clientId);
	const modalContent = `
		<div class="loan-details">
			<div class="loan-info">
				<h3>Inversión #${inv.id}</h3>
				<p><strong>Cliente:</strong> ${client ? client.name : '-'}</p>
				<p><strong>Monto:</strong> ${app.formatCurrency(inv.amount)}</p>
				<p><strong>Tasa:</strong> ${inv.rate}%</p>
				<p><strong>Plazo:</strong> ${inv.term} meses</p>
				<p><strong>Inicio:</strong> ${app.formatDate(inv.startDate)}</p>
				<p><strong>Fin:</strong> ${app.formatDate(inv.endDate)}</p>
			</div>
		</div>
	`;
	app.showModal(`Inversión #${inv.id}`, modalContent);
}

function openInvestmentContractModal() {
	// Permite generar contrato desde selección de inversión
	if (!app.data.investments || app.data.investments.length === 0) {
		alert('No hay inversiones registradas');
		return;
	}
	const modalContent = `
		<div class="form-container">
			<div class="form-group">
				<label for="inv-select">Seleccionar Inversión</label>
				<select id="inv-select">
					${app.data.investments.map(i => `<option value="${i.id}">#${i.id} - ${app.getClientName(i.clientId)} - ${app.formatCurrency(i.amount)}</option>`).join('')}
				</select>
			</div>
			<div class="form-actions">
				<button class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
				<button class="btn btn-primary" onclick="generateInvestmentContract(parseInt(document.getElementById('inv-select').value))">
					<i class="fas fa-file-signature"></i> Generar Contrato
				</button>
			</div>
		</div>
	`;
	app.showModal('Contrato de Inversión', modalContent);
}

function generateInvestmentContract(invId) {
	const inv = (app.data.investments || []).find(i => i.id === invId);
	if (!inv) return;
	const client = app.data.clients.find(c => c.id === inv.clientId);
	const section = document.getElementById('contracts');
	const businessName = app.data.config.businessName || 'TV Pinula Demo Cobro';
	const today = new Date().toLocaleDateString('es-ES');

	section.innerHTML = `
		<div class="contract-actions">
			<button class="btn btn-secondary" onclick="showInvestments()">
				<i class="fas fa-arrow-left"></i> Volver
			</button>
			<button class="btn btn-primary" onclick="printContract()">
				<i class="fas fa-print"></i> Imprimir
			</button>
		</div>
		<div class="contract-content">
			<div class="contract-header">
				<h1>${businessName}</h1>
				<h2>CONTRATO DE INVERSIÓN</h2>
			</div>
			<div class="contract-section">
				<h3>DATOS DEL INVERSIONISTA</h3>
				<p><strong>Nombre:</strong> ${client ? client.name : '-'}</p>
				<p><strong>Documento:</strong> ${client?.document || 'No especificado'}</p>
			</div>
			<div class="contract-section">
				<h3>DETALLES DE LA INVERSIÓN</h3>
				<p><strong>Monto:</strong> ${app.formatCurrency(inv.amount)}</p>
				<p><strong>Tasa:</strong> ${inv.rate}% anual</p>
				<p><strong>Plazo:</strong> ${inv.term} meses (del ${app.formatDate(inv.startDate)} al ${app.formatDate(inv.endDate)})</p>
				<p><strong>Fecha de Contrato:</strong> ${today}</p>
			</div>
			<div class="contract-section">
				<h3>TÉRMINOS</h3>
				<p>El inversionista entrega a ${businessName} la suma indicada, y la empresa reconoce la obligación de pagar intereses al porcentaje pactado y devolver el capital al vencimiento del plazo.</p>
				<p>Los pagos de intereses podrán realizarse de forma mensual o al vencimiento, según acuerdo de las partes.</p>
			</div>
			<div class="contract-signature-section">
				<h3>FIRMAS</h3>
				<div class="contract-signature-line">
					<div class="contract-signature-box">
						<div class="contract-signature-line-element"></div>
						<strong>INVERSIONISTA</strong><br>
						${client ? client.name : '-'}
					</div>
					<div class="contract-signature-box">
						<div class="contract-signature-line-element"></div>
						<strong>EMPRESA</strong><br>
						${businessName}
					</div>
				</div>
			</div>
			<div class="contract-footer">
				<p>Contrato de inversión generado el ${new Date().toLocaleString('es-ES')} por ${businessName}</p>
			</div>
		</div>
	`;
}

function showInvestmentOpeningReceipt(inv) {
	const client = app.data.clients.find(c => c.id === inv.clientId);
	const businessName = app.data.config.businessName || 'TV Pinula Demo Cobro';
	const html = `
		<div class="contract-actions"><button class="btn btn-primary" onclick="printContract()"><i class="fas fa-print"></i> Imprimir</button></div>
		<div class="contract-content">
			<div class="contract-header"><h1>${businessName}</h1><h2>APERTURA DE INVERSIÓN</h2></div>
			<div class="contract-section">
				<div class="contract-info-grid">
					<div class="contract-info-item"><span class="contract-info-label">Inversionista:</span><br>${client ? client.name : '-'}</div>
					<div class="contract-info-item"><span class="contract-info-label">Monto:</span><br>${app.formatCurrency(inv.amount)}</div>
					<div class="contract-info-item"><span class="contract-info-label">Tasa:</span><br>${inv.rate}%</div>
					<div class="contract-info-item"><span class="contract-info-label">Plazo:</span><br>${inv.term} meses</div>
				</div>
			</div>
		</div>
	`;
	const section = document.getElementById('investments');
	section.innerHTML = html;
}



