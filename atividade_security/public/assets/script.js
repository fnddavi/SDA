// Estado da aplicação
let authToken = localStorage.getItem('token');
let currentUser = null;

// Elementos do DOM
const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const messagesContainer = document.getElementById('messages');
const loginForm = document.getElementById('login-form').querySelector('form');
const registerForm = document.getElementById('register-form').querySelector('form');
const contactForm = document.getElementById('contact-form');
const contactsList = document.getElementById('contactsList');

// Inicialização
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 App iniciada');
    setupEventListeners();

    if (authToken) {
        console.log('Token encontrado, tentando login automático');
        showAppScreen();
        loadContacts();
    }
});

// Event Listeners
function setupEventListeners() {
    // Tabs
    document.getElementById('login-tab').addEventListener('click', showLoginForm);
    document.getElementById('register-tab').addEventListener('click', showRegisterForm);

    // Forms
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    contactForm.addEventListener('submit', handleAddContact);

    // Logout
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
}

// Alternância de formulários
function showLoginForm() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-tab').classList.add('active');
    document.getElementById('register-tab').classList.remove('active');
}

function showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('login-tab').classList.remove('active');
    document.getElementById('register-tab').classList.add('active');
}

// Registro
async function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    showMessage('Registrando usuário...', 'info');

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: email.split('@')[0],
                fullName: name,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('✅ Usuário registrado com sucesso! Agora faça login.', 'success');
            registerForm.reset();
            showLoginForm();
        } else {
            showMessage('❌ ' + (data.error || 'Erro no registro'), 'error');
        }
    } catch (error) {
        showMessage('❌ Erro de conexão: ' + error.message, 'error');
    }
}

// Login
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    showMessage('Fazendo login...', 'info');

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('token', authToken);

            showMessage('✅ Login realizado com sucesso!', 'success');
            loginForm.reset();

            setTimeout(() => {
                showAppScreen();
                loadContacts();
            }, 1000);
        } else {
            showMessage('❌ ' + (data.error || 'Erro no login'), 'error');
        }
    } catch (error) {
        showMessage('❌ Erro de conexão: ' + error.message, 'error');
    }
}

// Adicionar contato
async function handleAddContact(event) {
    event.preventDefault();

    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const phone = document.getElementById('contactPhone').value;
    const company = document.getElementById('contactCompany').value;
    const notes = document.getElementById('contactNotes').value;

    showMessage('Adicionando contato...', 'info');

    try {
        const response = await fetch('/api/contacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ name, email, phone, company, notes })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('✅ Contato adicionado com sucesso!', 'success');
            contactForm.reset();
            loadContacts();
        } else {
            showMessage('❌ ' + (data.error || 'Erro ao adicionar contato'), 'error');
        }
    } catch (error) {
        showMessage('❌ Erro de conexão: ' + error.message, 'error');
    }
}

// Carregar contatos
async function loadContacts() {
    try {
        const response = await fetch('/api/contacts', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();

        if (response.ok) {
            displayContacts(data.data || []);
        } else {
            showMessage('❌ Erro ao carregar contatos: ' + data.error, 'error');
        }
    } catch (error) {
        showMessage('❌ Erro de conexão ao carregar contatos', 'error');
    }
}

// Exibir contatos
function displayContacts(contacts) {
    if (contacts.length === 0) {
        contactsList.innerHTML = '<div class="message info">📝 Nenhum contato encontrado. Adicione seu primeiro contato!</div>';
        return;
    }

    contactsList.innerHTML = contacts.map(contact => `
        <div class="contact-item">
            <div class="contact-header">
                <h3>👤 ${contact.name}</h3>
                <small>Criado em: ${new Date(contact.created_at).toLocaleDateString('pt-BR')}</small>
            </div>
            <p><strong>📧 Email:</strong> ${contact.email}</p>
            <p><strong>📱 Telefone:</strong> ${contact.phone}</p>
            ${contact.company ? `<p><strong>🏢 Empresa:</strong> ${contact.company}</p>` : ''}
            ${contact.notes ? `<p><strong>📝 Observações:</strong> ${contact.notes}</p>` : ''}
        </div>
    `).join('');
}

// Alternância de telas
function showAppScreen() {
    authScreen.classList.remove('active');
    appScreen.classList.add('active');

    if (currentUser) {
        document.getElementById('user-info').textContent = `Bem-vindo, ${currentUser.fullName}!`;
    }
}

function showAuthScreen() {
    appScreen.classList.remove('active');
    authScreen.classList.add('active');
    document.getElementById('user-info').textContent = '';
}

// Logout
function handleLogout() {
    localStorage.removeItem('token');
    authToken = null;
    currentUser = null;
    showAuthScreen();
    contactsList.innerHTML = '';
    showMessage('👋 Logout realizado com sucesso!', 'info');
}

// Mostrar mensagens
function showMessage(text, type) {
    const existing = messagesContainer.querySelector('.message');
    if (existing) existing.remove();

    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;

    messagesContainer.appendChild(message);

    setTimeout(() => {
        if (message.parentNode) {
            message.remove();
        }
    }, 5000);
}