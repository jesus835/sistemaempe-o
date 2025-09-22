// Módulo de Respaldos y Configuración
function loadBackupModule() {
    console.log('💾 Cargando módulo de Respaldos...');
    const section = document.getElementById('backup');
    section.innerHTML = `
        <div class="backup-header">
            <h2>Sistema de Respaldos</h2>
            <p>Gestiona las copias de seguridad y configuración del sistema</p>
        </div>

        <div class="backup-actions">
            <div class="action-card">
                <div class="action-icon">
                    <i class="fas fa-download"></i>
                </div>
                <div class="action-info">
                    <h3>Crear Respaldo</h3>
                    <p>Genera una copia de seguridad completa del sistema</p>
                    <button class="btn btn-primary" onclick="createBackup()">
                        <i class="fas fa-download"></i> Crear Respaldo
                    </button>
                </div>
            </div>

            <div class="action-card">
                <div class="action-icon">
                    <i class="fas fa-upload"></i>
                </div>
                <div class="action-info">
                    <h3>Restaurar Respaldo</h3>
                    <p>Restaura el sistema desde una copia de seguridad</p>
                    <button class="btn btn-success" onclick="restoreBackup()">
                        <i class="fas fa-upload"></i> Restaurar Respaldo
                    </button>
                </div>
            </div>

            <div class="action-card">
                <div class="action-icon">
                    <i class="fas fa-cog"></i>
                </div>
                <div class="action-info">
                    <h3>Configuración</h3>
                    <p>Configuración del sistema y respaldos automáticos</p>
                    <button class="btn btn-secondary" onclick="openBackupConfig()">
                        <i class="fas fa-cog"></i> Configurar
                    </button>
                </div>
            </div>
        </div>

        <div class="backup-history">
            <h3>Historial de Respaldos</h3>
            <div class="table-container">
                <div class="table-content">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Tipo</th>
                                <th>Tamaño</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="backup-history-body">
                            ${getBackupHistory().map(backup => `
                                <tr>
                                    <td>${app.formatDate(backup.date)}</td>
                                    <td>${backup.type}</td>
                                    <td>${backup.size}</td>
                                    <td><span class="badge badge-success">Completado</span></td>
                                    <td>
                                        <button class="btn btn-secondary" onclick="downloadBackup('${backup.id}')">Descargar</button>
                                        <button class="btn btn-danger" onclick="deleteBackup('${backup.id}')">Eliminar</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="system-info">
            <h3>Información del Sistema</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Versión:</span>
                    <span class="info-value">AszoLoand v1.0</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Último Respaldo:</span>
                    <span class="info-value">${getLastBackupDate()}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Total Clientes:</span>
                    <span class="info-value">${app.data.clients.length}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Total Préstamos:</span>
                    <span class="info-value">${app.data.loans.length}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Total Cobros:</span>
                    <span class="info-value">${app.data.collections.length}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Espacio Usado:</span>
                    <span class="info-value">${calculateStorageUsed()}</span>
                </div>
            </div>
        </div>
    `;
    console.log('✅ Módulo de Respaldos cargado exitosamente');
}

function createBackup() {
    const backupData = {
        clients: app.data.clients,
        users: app.data.users,
        loans: app.data.loans,
        collections: app.data.collections,
        currencies: app.data.currencies,
        currentCurrency: app.data.currentCurrency,
        config: app.data.config,
        backupDate: new Date().toISOString(),
        version: '1.0'
    };

    const backupJson = JSON.stringify(backupData, null, 2);
    const backupBlob = new Blob([backupJson], { type: 'application/json' });
    const backupUrl = URL.createObjectURL(backupBlob);

    // Crear enlace de descarga
    const downloadLink = document.createElement('a');
    downloadLink.href = backupUrl;
    downloadLink.download = `aszoLoand_backup_${new Date().toISOString().split('T')[0]}.json`;
    downloadLink.click();

    // Limpiar URL
    URL.revokeObjectURL(backupUrl);

    // Guardar en historial
    saveBackupToHistory('Manual', backupBlob.size);

    alert('Respaldo creado exitosamente');
}

function restoreBackup() {
    const modalContent = `
        <div class="form-container">
            <h3>Restaurar Respaldo</h3>
            <p><strong>Advertencia:</strong> Esta acción reemplazará todos los datos actuales. Asegúrate de crear un respaldo antes de continuar.</p>
            
            <div class="form-group">
                <label for="backup-file">Seleccionar archivo de respaldo</label>
                <input type="file" id="backup-file" accept=".json" required>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                <button type="button" class="btn btn-danger" onclick="confirmRestore()">Restaurar</button>
            </div>
        </div>
    `;

    app.showModal('Restaurar Respaldo', modalContent);
}

function confirmRestore() {
    const fileInput = document.getElementById('backup-file');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Por favor selecciona un archivo de respaldo');
        return;
    }

    if (confirm('¿Estás seguro de que quieres restaurar este respaldo? Todos los datos actuales serán reemplazados.')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const backupData = JSON.parse(e.target.result);
                
                // Validar estructura del respaldo
                if (validateBackupData(backupData)) {
                    // Restaurar datos
                    app.data.clients = backupData.clients || [];
                    app.data.users = backupData.users || [];
                    app.data.loans = backupData.loans || [];
                    app.data.collections = backupData.collections || [];
                    app.data.currencies = backupData.currencies || [];
                    app.data.currentCurrency = backupData.currentCurrency || app.data.currentCurrency;
                    app.data.config = backupData.config || app.data.config;
                    
                    app.saveData();
                    app.closeModal();
                    alert('Respaldo restaurado exitosamente. La página se recargará.');
                    location.reload();
                } else {
                    alert('El archivo de respaldo no es válido');
                }
            } catch (error) {
                alert('Error al leer el archivo de respaldo: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
}

function validateBackupData(data) {
    return data && 
           typeof data === 'object' && 
           Array.isArray(data.clients) && 
           Array.isArray(data.users) && 
           Array.isArray(data.loans) && 
           Array.isArray(data.collections);
}

function openBackupConfig() {
    const config = app.data.backupConfig || {
        autoBackup: false,
        backupFrequency: 'daily',
        backupTime: '02:00',
        keepBackups: 30,
        emailNotifications: false,
        emailAddress: ''
    };

    const modalContent = `
        <div class="form-container">
            <h3>Configuración de Respaldos</h3>
            <form id="backup-config-form">
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="auto-backup" ${config.autoBackup ? 'checked' : ''}>
                        Respaldo Automático
                    </label>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="backup-frequency">Frecuencia</label>
                        <select id="backup-frequency" ${!config.autoBackup ? 'disabled' : ''}>
                            <option value="daily" ${config.backupFrequency === 'daily' ? 'selected' : ''}>Diario</option>
                            <option value="weekly" ${config.backupFrequency === 'weekly' ? 'selected' : ''}>Semanal</option>
                            <option value="monthly" ${config.backupFrequency === 'monthly' ? 'selected' : ''}>Mensual</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="backup-time">Hora</label>
                        <input type="time" id="backup-time" value="${config.backupTime}" ${!config.autoBackup ? 'disabled' : ''}>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="keep-backups">Conservar Respaldos (días)</label>
                    <input type="number" id="keep-backups" min="1" max="365" value="${config.keepBackups}" ${!config.autoBackup ? 'disabled' : ''}>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="email-notifications" ${config.emailNotifications ? 'checked' : ''}>
                        Notificaciones por Email
                    </label>
                </div>
                
                <div class="form-group">
                    <label for="email-address">Email para Notificaciones</label>
                    <input type="email" id="email-address" value="${config.emailAddress}" ${!config.emailNotifications ? 'disabled' : ''}>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar Configuración</button>
                </div>
            </form>
        </div>
    `;

    app.showModal('Configuración de Respaldos', modalContent);
    
    document.getElementById('backup-config-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveBackupConfig();
    });

    // Habilitar/deshabilitar campos según checkbox
    document.getElementById('auto-backup').addEventListener('change', function() {
        const isEnabled = this.checked;
        document.getElementById('backup-frequency').disabled = !isEnabled;
        document.getElementById('backup-time').disabled = !isEnabled;
        document.getElementById('keep-backups').disabled = !isEnabled;
    });

    document.getElementById('email-notifications').addEventListener('change', function() {
        document.getElementById('email-address').disabled = !this.checked;
    });
}

function saveBackupConfig() {
    const config = {
        autoBackup: document.getElementById('auto-backup').checked,
        backupFrequency: document.getElementById('backup-frequency').value,
        backupTime: document.getElementById('backup-time').value,
        keepBackups: parseInt(document.getElementById('keep-backups').value),
        emailNotifications: document.getElementById('email-notifications').checked,
        emailAddress: document.getElementById('email-address').value
    };

    app.data.backupConfig = config;
    app.saveData();
    app.closeModal();
    alert('Configuración guardada exitosamente');
}

function getBackupHistory() {
    const history = JSON.parse(localStorage.getItem('aszoLoand_backupHistory')) || [];
    return history.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function saveBackupToHistory(type, size) {
    const history = getBackupHistory();
    const backup = {
        id: app.generateId(),
        date: new Date().toISOString(),
        type: type,
        size: formatFileSize(size)
    };
    
    history.unshift(backup);
    
    // Mantener solo los últimos 50 respaldos
    if (history.length > 50) {
        history.splice(50);
    }
    
    localStorage.setItem('aszoLoand_backupHistory', JSON.stringify(history));
}

function downloadBackup(backupId) {
    // Simular descarga de respaldo específico
    alert('Descargando respaldo...');
}

function deleteBackup(backupId) {
    if (confirm('¿Estás seguro de que quieres eliminar este respaldo?')) {
        const history = getBackupHistory();
        const filteredHistory = history.filter(backup => backup.id !== backupId);
        localStorage.setItem('aszoLoand_backupHistory', JSON.stringify(filteredHistory));
        loadBackupModule();
        alert('Respaldo eliminado exitosamente');
    }
}

function getLastBackupDate() {
    const history = getBackupHistory();
    if (history.length > 0) {
        return app.formatDate(history[0].date);
    }
    return 'Nunca';
}

function calculateStorageUsed() {
    const dataSize = JSON.stringify(app.data).length;
    return formatFileSize(dataSize);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Agregar estilos CSS para respaldos
const backupStyles = `
    <style>
        .backup-header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .backup-actions {
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
            background: #3b82f6;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            margin: 0 auto 15px;
        }
        
        .action-info h3 {
            margin-bottom: 10px;
            color: #1e293b;
        }
        
        .action-info p {
            margin-bottom: 15px;
            color: #64748b;
        }
        
        .backup-history {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 30px;
        }
        
        .backup-history h3 {
            margin-bottom: 15px;
            color: #1e293b;
        }
        
        .system-info {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .system-info h3 {
            margin-bottom: 15px;
            color: #1e293b;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            background: #f8fafc;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
        }
        
        .info-label {
            font-weight: 500;
            color: #64748b;
        }
        
        .info-value {
            font-weight: 600;
            color: #1e293b;
        }
        
        .badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .badge-success {
            background: #dcfce7;
            color: #166534;
        }
    </style>
`;

// Agregar estilos al head si no existen
if (!document.getElementById('backup-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'backup-styles';
    styleElement.innerHTML = backupStyles;
    document.head.appendChild(styleElement);
}
