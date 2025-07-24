// Funções de autenticação

// Alterna entre formulários de login e registro
function switchToRegister() {
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('register-form').classList.add('active');
}

function switchToLogin() {
    document.getElementById('register-form').classList.remove('active');
    document.getElementById('login-form').classList.add('active');
}

// Manipulador de login
async function handleLogin(event) {
    event.preventDefault();
    UI.showLoading();

    try {
        const formData = new FormData(event.target);
        const credentials = {
            username: formData.get('username'),
            password: formData.get('password')
        };

        const response = await API.login(credentials);
        
        if (response.success) {
            appState.setUser(response.user, response.token);
            UI.showToast('Login realizado com sucesso!', 'success');
            
            // Carrega dados do usuário e muda para tela principal
            await loadUserData();
            appState.showScreen('app');
            
            // Limpa formulário
            UI.clearForm('loginForm');
        } else {
            UI.showToast(response.message || 'Erro no login', 'error');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        UI.showToast(error.message || 'Erro no login. Tente novamente.', 'error');
    } finally {
        UI.hideLoading();
    }
}

// Manipulador de registro
async function handleRegister(event) {
    event.preventDefault();
    UI.showLoading();

    try {
        const formData = new FormData(event.target);
        const userData = {
            username: formData.get('username'),
            email: formData.get('email'),
            fullName: formData.get('fullName'),
            password: formData.get('password')
        };

        // Validações do lado cliente
        if (userData.password.length < 8) {
            UI.showToast('A senha deve ter pelo menos 8 caracteres', 'error');
            return;
        }

        if (!isValidEmail(userData.email)) {
            UI.showToast('Email inválido', 'error');
            return;
        }

        const response = await API.register(userData);
        
        if (response.success) {
            UI.showToast('Cadastro realizado com sucesso! Faça login.', 'success');
            UI.clearForm('registerForm');
            switchToLogin();
        } else {
            UI.showToast(response.message || 'Erro no cadastro', 'error');
        }
    } catch (error) {
        console.error('Erro no registro:', error);
        UI.showToast(error.message || 'Erro no cadastro. Tente novamente.', 'error');
    } finally {
        UI.hideLoading();
    }
}

// Logout
async function logout() {
    try {
        UI.showLoading();
        
        // Chama API de logout para auditoria
        await API.logout();
        
        // Limpa estado local
        appState.clearUser();
        appState.setContacts([]);
        
        // Volta para tela de login
        appState.showScreen('auth');
        switchToLogin();
        
        UI.showToast('Logout realizado com sucesso', 'success');
    } catch (error) {
        console.error('Erro no logout:', error);
        // Mesmo com erro na API, limpa localmente
        appState.clearUser();
        appState.showScreen('auth');
    } finally {
        UI.hideLoading();
    }
}

// Validação de email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validação de senha forte
function isStrongPassword(password) {
    // Pelo menos 8 caracteres, 1 maiúscula, 1 minúscula, 1 número
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return strongRegex.test(password);
}

// Feedback visual para força da senha
function updatePasswordStrength(password) {
    const indicators = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        number: /\d/.test(password),
        special: /[@$!%*?&]/.test(password)
    };
    
    const score = Object.values(indicators).filter(Boolean).length;
    
    return {
        score,
        strength: score < 2 ? 'weak' : score < 4 ? 'medium' : 'strong',
        indicators
    };
}
