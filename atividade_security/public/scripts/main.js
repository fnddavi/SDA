// Gerenciamento de estado da aplicação
class AppState {
    constructor() {
        this.user = null;
        this.token = localStorage.getItem('token');
        this.contacts = [];
        this.currentScreen = 'auth';
    }

    setUser(user, token) {
        this.user = user;
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        }
    }

    clearUser() {
        this.user = null;
        this.token = null;
        localStorage.removeItem('token');
    }

    setContacts(contacts) {
        this.contacts = contacts;
    }

    addContact(contact) {
        this.contacts.unshift(contact);
    }

    updateContact(contactId, updatedContact) {
        const index = this.contacts.findIndex(c => c.id === contactId);
        if (index !== -1) {
            this.contacts[index] = { ...this.contacts[index], ...updatedContact };
        }
    }

    removeContact(contactId) {
        this.contacts = this.contacts.filter(c => c.id !== contactId);
    }

    showScreen(screenName) {
        // Esconde todas as telas
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Mostra a tela solicitada
        const screen = document.getElementById(`${screenName}-screen`);
        if (screen) {
            screen.classList.add('active');
            this.currentScreen = screenName;
        }
    }
}

// Instância global do estado
const appState = new AppState();

// Utilitários UI
const UI = {
    showLoading() {
        document.getElementById('loading').style.display = 'flex';
    },

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    },

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    },

    clearForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
        }
    },

    setFormData(formId, data) {
        const form = document.getElementById(formId);
        if (form) {
            Object.keys(data).forEach(key => {
                const field = form.querySelector(`[name="${key}"]`);
                if (field) {
                    field.value = data[key] || '';
                }
            });
        }
    }
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', async () => {
    UI.showLoading();
    
    try {
        // Verifica se há token válido
        if (appState.token) {
            await verifyToken();
        } else {
            appState.showScreen('auth');
        }
    } catch (error) {
        console.error('Erro na inicialização:', error);
        appState.showScreen('auth');
    } finally {
        UI.hideLoading();
    }
    
    // Configura event listeners
    setupEventListeners();
});

// Event listeners
function setupEventListeners() {
    // Forms de autenticação
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // Form de contatos
    document.getElementById('contactForm').addEventListener('submit', handleContactSubmit);
    
    // Busca
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchContacts();
        }
    });
    
    // Fechar modal ao clicar fora
    document.getElementById('contactModal').addEventListener('click', (e) => {
        if (e.target.id === 'contactModal') {
            closeContactModal();
        }
    });
}

// Verificação de token
async function verifyToken() {
    try {
        const response = await API.get('/auth/verify-token');
        if (response.success) {
            appState.setUser(response.user, appState.token);
            await loadUserData();
            appState.showScreen('app');
        } else {
            throw new Error('Token inválido');
        }
    } catch (error) {
        console.error('Token inválido:', error);
        appState.clearUser();
        appState.showScreen('auth');
        throw error;
    }
}

// Carrega dados do usuário
async function loadUserData() {
    try {
        // Atualiza informações do usuário na UI
        document.getElementById('userName').textContent = appState.user.fullName;
        
        // Carrega contatos
        await loadContacts();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        UI.showToast('Erro ao carregar dados do usuário', 'error');
    }
}

// Função para debugar problemas
function debugApp() {
    console.log('Estado da aplicação:', {
        user: appState.user,
        token: appState.token ? 'Presente' : 'Ausente',
        contacts: appState.contacts.length,
        currentScreen: appState.currentScreen
    });
}
