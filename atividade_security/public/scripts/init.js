// Inicialização simplificada da aplicação
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, inicializando aplicação...');
    
    // Verifica se todos os elementos necessários estão presentes
    const authScreen = document.getElementById('auth-screen');
    const appScreen = document.getElementById('app-screen');
    
    if (!authScreen || !appScreen) {
        console.error('Elementos principais não encontrados');
        return;
    }
    
    console.log('Elementos encontrados, aplicação iniciada');
    
    // Mostra a tela de autenticação por padrão
    authScreen.classList.add('active');
    appScreen.classList.remove('active');
    
    // Adiciona event listeners básicos
    setupBasicEventListeners();
});

function setupBasicEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Formulário de login submetido');
            handleLogin();
        });
    }
    
    // Register form  
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Formulário de registro submetido');
            handleRegister();
        });
    }
    
    // Show register
    const showRegisterBtn = document.getElementById('showRegister');
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', function() {
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('register-form').style.display = 'block';
        });
    }
    
    // Show login
    const showLoginBtn = document.getElementById('showLogin');
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', function() {
            document.getElementById('register-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
        });
    }
}

async function handleLogin() {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    
    if (!email || !password) {
        alert('Por favor, preencha todos os campos');
        return;
    }
    
    try {
        console.log('Tentando fazer login...');
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('Login bem-sucedido');
            localStorage.setItem('token', data.token);
            showAppScreen();
            loadContacts();
        } else {
            alert(data.message || 'Erro no login');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        alert('Erro de conexão');
    }
}

async function handleRegister() {
    const name = document.getElementById('registerName')?.value;
    const email = document.getElementById('registerEmail')?.value;
    const password = document.getElementById('registerPassword')?.value;
    
    if (!name || !email || !password) {
        alert('Por favor, preencha todos os campos');
        return;
    }
    
    // Validação de senha
    if (password.length < 8) {
        alert('A senha deve ter pelo menos 8 caracteres');
        return;
    }
    
    try {
        console.log('Tentando registrar usuário...');
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                username: email.split('@')[0], // Usa a parte do email antes do @ como username
                fullName: name,
                email: email, 
                password: password 
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('Registro bem-sucedido');
            alert('Usuário registrado com sucesso! Faça login para continuar.');
            document.getElementById('register-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
        } else {
            alert(data.error || data.message || 'Erro no registro');
        }
    } catch (error) {
        console.error('Erro no registro:', error);
        alert('Erro de conexão');
    }
}

function showAppScreen() {
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('app-screen').classList.add('active');
    
    // Configurar funcionalidade de contatos
    setupContactsSection();
}

function setupContactsSection() {
    // Adicionar contato
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleAddContact);
    }
    
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

async function handleAddContact(e) {
    e.preventDefault();
    
    const name = document.getElementById('contactName')?.value;
    const email = document.getElementById('contactEmail')?.value;
    const phone = document.getElementById('contactPhone')?.value;
    const notes = document.getElementById('contactNotes')?.value;
    
    if (!name || !email || !phone) {
        alert('Por favor, preencha pelo menos nome, email e telefone');
        return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Sessão expirada. Faça login novamente.');
        return;
    }
    
    try {
        const response = await fetch('/api/contacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, email, phone, notes })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Contato adicionado com sucesso!');
            document.getElementById('contactForm').reset();
            loadContacts(); // Recarrega a lista
        } else {
            alert(data.error || 'Erro ao adicionar contato');
        }
    } catch (error) {
        console.error('Erro ao adicionar contato:', error);
        alert('Erro de conexão');
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    document.getElementById('app-screen').classList.remove('active');
    document.getElementById('auth-screen').classList.add('active');
    document.getElementById('contactsList').innerHTML = '';
}

async function loadContacts() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        const response = await fetch('/api/contacts', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const contacts = await response.json();
            displayContacts(contacts);
        }
    } catch (error) {
        console.error('Erro ao carregar contatos:', error);
    }
}

function displayContacts(contacts) {
    const container = document.getElementById('contactsList');
    if (!container) return;
    
    if (contacts.length === 0) {
        container.innerHTML = '<p>Nenhum contato encontrado. Adicione seu primeiro contato!</p>';
        return;
    }
    
    container.innerHTML = contacts.map(contact => `
        <div class="contact-item">
            <div class="contact-header">
                <h3>👤 ${contact.name}</h3>
                <small>Criado em: ${new Date(contact.created_at).toLocaleDateString('pt-BR')}</small>
            </div>
            <div class="contact-details">
                <p>📧 <strong>Email:</strong> ${contact.email}</p>
                <p>📱 <strong>Telefone:</strong> ${contact.phone}</p>
                ${contact.notes ? `<p>📝 <strong>Notas:</strong> ${contact.notes}</p>` : ''}
            </div>
        </div>
    `).join('');
}

// Verifica se há token ao carregar a página
if (localStorage.getItem('token')) {
    console.log('Token encontrado, verificando...');
    // TODO: Validar token com o servidor
}
