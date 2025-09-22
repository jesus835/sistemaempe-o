// Sistema AszoLoand - Aplicación Principal
class AszoLoandApp {
    constructor() {
        this.currentUser = null;
        this.data = {
            clients: JSON.parse(localStorage.getItem('aszoLoand_clients')) || [
                { id: 1, name: 'Juan Pérez', email: 'juan.perez@email.com', phone: '+1 234 567 8901', dni: '12345678', address: 'Calle Principal 123', birthdate: '1985-05-15', occupation: 'Ingeniero', notes: 'Cliente preferencial', createdAt: new Date().toISOString() },
                { id: 2, name: 'María González', email: 'maria.gonzalez@email.com', phone: '+1 234 567 8902', dni: '87654321', address: 'Avenida Central 456', birthdate: '1990-08-22', occupation: 'Contadora', notes: 'Nuevo cliente', createdAt: new Date().toISOString() },
                { id: 3, name: 'Carlos Rodríguez', email: 'carlos.rodriguez@email.com', phone: '+1 234 567 8903', dni: '11223344', address: 'Plaza Mayor 789', birthdate: '1978-12-10', occupation: 'Comerciante', notes: 'Cliente frecuente', createdAt: new Date().toISOString() }
            ],
            users: JSON.parse(localStorage.getItem('aszoLoand_users')) || [
                { id: 1, username: 'admin', password: 'admin', name: 'Administrador', role: 'admin', email: 'admin@aszoloand.com', status: 'active' },
                { id: 2, username: 'usuario', password: 'usuario', name: 'Usuario Común', role: 'user', email: 'usuario@aszoloand.com', status: 'active' }
            ],
            loans: JSON.parse(localStorage.getItem('aszoLoand_loans')) || [
                { id: 1, clientId: 1, userId: 1, type: 'french', amount: 5000, interestRate: 12, term: 12, termType: 'months', paymentFrequency: 'monthly', startDate: '2024-01-01', nextPayment: '2024-02-01', status: 'active', insurance: 50, tax: 25, notes: 'Préstamo para compra de vehículo', monthlyPayment: 444.24, totalPayment: 5330.88, totalInterest: 330.88, paidAmount: 444.24, remainingAmount: 4886.64, createdAt: '2024-01-01T00:00:00.000Z', payments: [] },
                { id: 2, clientId: 2, userId: 1, type: 'simple', amount: 2000, interestRate: 15, term: 6, termType: 'months', paymentFrequency: 'monthly', startDate: '2024-01-15', nextPayment: '2024-02-15', status: 'active', insurance: 20, tax: 10, notes: 'Préstamo personal', monthlyPayment: 366.67, totalPayment: 2200, totalInterest: 200, paidAmount: 0, remainingAmount: 2200, createdAt: '2024-01-15T00:00:00.000Z', payments: [] }
            ],
            collections: JSON.parse(localStorage.getItem('aszoLoand_collections')) || [
                { id: 1, loanId: 1, clientId: 1, userId: 1, date: '2024-01-01', amount: 519.24, principal: 444.24, capital: 444.24, interest: 41.67, insurance: 50, tax: 25, total: 519.24, type: 'full', paymentMethod: 'cash', notes: 'Primera cuota', createdAt: '2024-01-01T00:00:00.000Z' }
            ],
            currencies: [
                { id: 1, code: 'USD', name: 'Dólar Americano', symbol: '$', rate: 1 },
                { id: 2, code: 'EUR', name: 'Euro', symbol: '€', rate: 0.85 },
                { id: 3, code: 'PEN', name: 'Sol Peruano', symbol: 'S/', rate: 3.8 },
                { id: 4, code: 'MXN', name: 'Peso Mexicano', symbol: '$', rate: 20.5 },
                { id: 5, code: 'COP', name: 'Peso Colombiano', symbol: '$', rate: 4100 }
            ],
            currentCurrency: JSON.parse(localStorage.getItem('aszoLoand_currency')) || { id: 1, code: 'USD', name: 'Dólar Americano', symbol: '$', rate: 1 },
            config: JSON.parse(localStorage.getItem('aszoLoand_config')) || {
                businessName: 'TV Pinula Demo Cobro',
                address: 'Dirección de la empresa',
                phone: '+1 234 567 8900',
                email: 'info@aszoloand.com',
                logo: 'images/logo.png'
            }
        };
        this.init();
    }

    init() {
        console.log('🚀 Inicializando AszoLoand App...');
        console.log('📊 Datos iniciales:', {
            clientes: this.data.clients.length,
            usuarios: this.data.users.length,
            prestamos: this.data.loans.length,
            cobros: this.data.collections.length
        });
        this.bindEvents();
        this.checkAuth();
        this.loadDashboard();
        console.log('✅ AszoLoand App inicializada correctamente');
    }

    bindEvents() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.setActiveNav(link);
            });
        });
    }

    handleLogin() {
        console.log('🔐 Procesando login...');
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        console.log(`👤 Usuario: ${username}`);
        const user = this.data.users.find(u => u.username === username && u.password === password);
        
        if (user) {
            console.log(`✅ Login exitoso para: ${user.name} (${user.role})`);
            this.currentUser = user;
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('main-system').style.display = 'flex';
            document.getElementById('current-user').textContent = user.name;
            this.loadDashboard();
        } else {
            console.log('❌ Login fallido: credenciales incorrectas');
            alert('Usuario o contraseña incorrectos');
        }
    }

    logout() {
        this.currentUser = null;
        document.getElementById('login-screen').style.display = 'block';
        document.getElementById('main-system').style.display = 'none';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }

    checkAuth() {
        // Verificar si hay sesión activa
        const savedUser = localStorage.getItem('aszoLoand_currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('main-system').style.display = 'flex';
            document.getElementById('current-user').textContent = this.currentUser.name;
        }
    }

    setActiveNav(activeLink) {
        const sectionName = activeLink.getAttribute('onclick').match(/show(\w+)/)[1];
        console.log(`📱 Navegando a sección: ${sectionName}`);
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');

        // Ocultar todas las secciones
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Mostrar sección correspondiente
        const targetSection = sectionName.toLowerCase();
        const section = document.getElementById(targetSection);
        if (section) {
            section.classList.add('active');
            console.log(`✅ Sección ${targetSection} activada`);
        } else {
            console.log(`❌ Sección ${targetSection} no encontrada`);
        }
    }

    loadDashboard() {
        console.log('📊 Cargando Dashboard...');
        const dashboard = document.getElementById('dashboard');
        if (!dashboard.classList.contains('active')) {
            console.log('⏸️ Dashboard no está activo, saltando carga');
            return;
        }

        // Calcular estadísticas
        const totalClients = this.data.clients.length;
        const activeLoans = this.data.loans.filter(loan => loan.status === 'active').length;
        const todayCollections = this.data.collections
            .filter(collection => {
                const today = new Date().toDateString();
                return new Date(collection.date).toDateString() === today;
            })
            .reduce((sum, collection) => sum + collection.amount, 0);
        const overdueLoans = this.data.loans.filter(loan => {
            const today = new Date();
            return loan.status === 'active' && new Date(loan.nextPayment) < today;
        }).length;

        console.log('📈 Estadísticas calculadas:', {
            totalClients,
            activeLoans,
            todayCollections,
            overdueLoans
        });

        // Actualizar estadísticas
        document.getElementById('total-clients').textContent = totalClients;
        document.getElementById('active-loans').textContent = activeLoans;
        document.getElementById('today-collections').textContent = this.data.currentCurrency.symbol + todayCollections.toFixed(2);
        document.getElementById('overdue-loans').textContent = overdueLoans;
        
        // Cargar préstamos vencidos
        this.loadOverdueLoans();
        
        console.log('✅ Dashboard cargado exitosamente');
    }

    saveData() {
        console.log('💾 Guardando datos en localStorage...');
        localStorage.setItem('aszoLoand_clients', JSON.stringify(this.data.clients));
        localStorage.setItem('aszoLoand_users', JSON.stringify(this.data.users));
        localStorage.setItem('aszoLoand_loans', JSON.stringify(this.data.loans));
        localStorage.setItem('aszoLoand_collections', JSON.stringify(this.data.collections));
        localStorage.setItem('aszoLoand_currency', JSON.stringify(this.data.currentCurrency));
        localStorage.setItem('aszoLoand_config', JSON.stringify(this.data.config));
        if (this.currentUser) {
            localStorage.setItem('aszoLoand_currentUser', JSON.stringify(this.currentUser));
        }
        console.log('✅ Datos guardados exitosamente');
    }

    showModal(title, content) {
        console.log(`🪟 Abriendo modal: ${title}`);
        const overlay = document.getElementById('modal-overlay');
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').style.display='none'">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        `;
        
        overlay.innerHTML = '';
        overlay.appendChild(modal);
        overlay.style.display = 'flex';
    }

    closeModal() {
        console.log('🚪 Cerrando modal');
        document.getElementById('modal-overlay').style.display = 'none';
    }

    formatCurrency(amount) {
        return this.data.currentCurrency.symbol + parseFloat(amount).toFixed(2);
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('es-ES');
    }

    generateId() {
        return Math.floor(Date.now() + Math.random() * 1000);
    }

    // Métodos auxiliares
    getClientName(clientId) {
        console.log(`🔍 Buscando cliente con ID: ${clientId} (tipo: ${typeof clientId})`);
        console.log('📋 Clientes disponibles:', this.data.clients.map(c => ({ id: c.id, name: c.name, type: typeof c.id })));
        
        const client = this.data.clients.find(c => c.id == clientId); // Usar == en lugar de === para comparación flexible
        const result = client ? client.name : 'Cliente no encontrado';
        console.log(`✅ Resultado: ${result}`);
        return result;
    }

    getUserName(userId) {
        const user = this.data.users.find(u => u.id === userId);
        return user ? user.name : 'Usuario no encontrado';
    }

    getTodayIncome() {
        const today = new Date().toDateString();
        return this.data.collections
            .filter(collection => new Date(collection.date).toDateString() === today)
            .reduce((sum, collection) => sum + collection.amount, 0);
    }

    getTodayExpenses() {
        // Por ahora solo retornamos 0, se puede expandir con un módulo de egresos
        return 0;
    }

    loadOverdueLoans() {
        const overdueTableBody = document.getElementById('overdue-dashboard-body');
        if (!overdueTableBody) return;

        const today = new Date();
        const overdueLoans = this.data.loans.filter(loan => 
            loan.status === 'active' && new Date(loan.nextPayment) < today
        );

        if (overdueLoans.length === 0) {
            overdueTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center" style="padding: 20px; color: #64748b;">
                        <i class="fas fa-check-circle" style="color: #10b981; margin-right: 8px;"></i>
                        No hay préstamos vencidos
                    </td>
                </tr>
            `;
            return;
        }

        overdueTableBody.innerHTML = overdueLoans.map(loan => {
            const client = this.data.clients.find(c => c.id == loan.clientId);
            const daysOverdue = Math.ceil((today - new Date(loan.nextPayment)) / (1000 * 60 * 60 * 24));
            
            return `
                <tr>
                    <td>${client ? client.name : 'Cliente no encontrado'}</td>
                    <td>#${loan.id}</td>
                    <td class="text-right">${this.formatCurrency(loan.monthlyPayment)}</td>
                    <td class="text-center">
                        <span class="badge badge-danger">${daysOverdue} días</span>
                    </td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="collectOverduePayment(${loan.id}, ${loan.monthlyPayment})">
                            <i class="fas fa-exclamation-triangle"></i> Cobrar
                        </button>
                        <button class="btn btn-info btn-sm" onclick="viewLoanDetails(${loan.id})">
                            <i class="fas fa-eye"></i> Ver
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
}

// Funciones globales para navegación
function showDashboard() {
    console.log('🏠 Navegando a Dashboard');
    const link = document.querySelector('[onclick="showDashboard()"]');
    app.setActiveNav(link);
    app.loadDashboard();
}

function showClients() {
    console.log('👥 Navegando a Clientes');
    const link = document.querySelector('[onclick="showClients()"]');
    app.setActiveNav(link);
    
    // Cargar contenido después de activar la sección
    setTimeout(() => {
        if (typeof loadClientsModule === 'function') {
            console.log('📋 Cargando módulo de clientes...');
            loadClientsModule();
        } else {
            console.log('❌ Función loadClientsModule no encontrada');
        }
    }, 100);
}

function showUsers() {
    console.log('👤 Navegando a Usuarios');
    const link = document.querySelector('[onclick="showUsers()"]');
    app.setActiveNav(link);
    
    setTimeout(() => {
        if (typeof loadUsersModule === 'function') {
            console.log('📋 Cargando módulo de usuarios...');
            loadUsersModule();
        } else {
            console.log('❌ Función loadUsersModule no encontrada');
        }
    }, 100);
}

function showWallets() {
    console.log('💼 Navegando a Carteras');
    const link = document.querySelector('[onclick="showWallets()"]');
    app.setActiveNav(link);
    
    setTimeout(() => {
        if (typeof loadWalletsModule === 'function') {
            console.log('📋 Cargando módulo de carteras...');
            loadWalletsModule();
        } else {
            console.log('❌ Función loadWalletsModule no encontrada');
        }
    }, 100);
}

function showCash() {
    console.log('💰 Navegando a Caja');
    const link = document.querySelector('[onclick="showCash()"]');
    app.setActiveNav(link);
    
    setTimeout(() => {
        if (typeof loadCashModule === 'function') {
            console.log('📋 Cargando módulo de caja...');
            loadCashModule();
        } else {
            console.log('❌ Función loadCashModule no encontrada');
        }
    }, 100);
}

function showCurrency() {
    console.log('💱 Navegando a Moneda');
    const link = document.querySelector('[onclick="showCurrency()"]');
    app.setActiveNav(link);
    
    setTimeout(() => {
        if (typeof loadCurrencyModule === 'function') {
            console.log('📋 Cargando módulo de moneda...');
            loadCurrencyModule();
        } else {
            console.log('❌ Función loadCurrencyModule no encontrada');
        }
    }, 100);
}

function showLoans() {
    console.log('🏦 Navegando a Préstamos');
    const link = document.querySelector('[onclick="showLoans()"]');
    app.setActiveNav(link);
    
    setTimeout(() => {
        if (typeof loadLoansModule === 'function') {
            console.log('📋 Cargando módulo de préstamos...');
            loadLoansModule();
        } else {
            console.log('❌ Función loadLoansModule no encontrada');
        }
    }, 100);
}

function showCollections() {
    console.log('💵 Navegando a Cobros');
    const link = document.querySelector('[onclick="showCollections()"]');
    app.setActiveNav(link);
    
    setTimeout(() => {
        if (typeof loadCollectionsModule === 'function') {
            console.log('📋 Cargando módulo de cobros...');
            loadCollectionsModule();
        } else {
            console.log('❌ Función loadCollectionsModule no encontrada');
        }
    }, 100);
}

function showReports() {
    console.log('📊 Navegando a Reportes');
    const link = document.querySelector('[onclick="showReports()"]');
    app.setActiveNav(link);
    
    setTimeout(() => {
        if (typeof loadReportsModule === 'function') {
            console.log('📋 Cargando módulo de reportes...');
            loadReportsModule();
        } else {
            console.log('❌ Función loadReportsModule no encontrada');
        }
    }, 100);
}

function showBackup() {
    console.log('💾 Navegando a Respaldos');
    const link = document.querySelector('[onclick="showBackup()"]');
    app.setActiveNav(link);
    
    setTimeout(() => {
        if (typeof loadBackupModule === 'function') {
            console.log('📋 Cargando módulo de respaldos...');
            loadBackupModule();
        } else {
            console.log('❌ Función loadBackupModule no encontrada');
        }
    }, 100);
}

function showConfig() {
    app.showModal('Configuración del Sistema', `
        <div class="form-container">
            <form id="config-form">
                <div class="form-group">
                    <label for="businessName">Nombre del Negocio</label>
                    <input type="text" id="businessName" value="${app.data.config.businessName}" required>
                </div>
                <div class="form-group">
                    <label for="address">Dirección</label>
                    <input type="text" id="address" value="${app.data.config.address}" required>
                </div>
                <div class="form-group">
                    <label for="phone">Teléfono</label>
                    <input type="text" id="phone" value="${app.data.config.phone}" required>
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" value="${app.data.config.email}" required>
                </div>
                <div class="form-group">
                    <label for="logo">Logo (URL)</label>
                    <input type="url" id="logo" value="${app.data.config.logo}">
                </div>
                <button type="submit" class="btn btn-primary">Guardar Configuración</button>
            </form>
        </div>
    `);

    document.getElementById('config-form').addEventListener('submit', (e) => {
        e.preventDefault();
        app.data.config = {
            businessName: document.getElementById('businessName').value,
            address: document.getElementById('address').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            logo: document.getElementById('logo').value
        };
        app.saveData();
        app.closeModal();
        alert('Configuración guardada exitosamente');
    });
}

function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('aszoLoand_currentUser');
        app.logout();
    }
}

// Funciones para menú móvil
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-overlay');
    
    if (sidebar.classList.contains('open')) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-overlay');
    
    sidebar.classList.add('open');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevenir scroll del body
}

function closeMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-overlay');
    
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
    document.body.style.overflow = ''; // Restaurar scroll del body
}

// Cerrar menú móvil cuando se selecciona una opción
function closeMobileMenuOnClick() {
    // Cerrar menú móvil después de hacer clic en un enlace
    setTimeout(() => {
        closeMobileMenu();
    }, 100);
}

// Cerrar menú móvil con tecla Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeMobileMenu();
    }
});

// Inicializar aplicación
let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌐 DOM cargado, inicializando aplicación...');
    app = new AszoLoandApp();
    
    // Verificar funciones disponibles
    console.log('🔍 Verificando funciones disponibles:');
    console.log('  - loadClientsModule:', typeof loadClientsModule);
    console.log('  - loadUsersModule:', typeof loadUsersModule);
    console.log('  - loadWalletsModule:', typeof loadWalletsModule);
    console.log('  - loadCashModule:', typeof loadCashModule);
    console.log('  - loadCurrencyModule:', typeof loadCurrencyModule);
    console.log('  - loadLoansModule:', typeof loadLoansModule);
    console.log('  - loadCollectionsModule:', typeof loadCollectionsModule);
    console.log('  - loadReportsModule:', typeof loadReportsModule);
    console.log('  - loadBackupModule:', typeof loadBackupModule);
    
    console.log('🎉 Aplicación lista para usar');
});