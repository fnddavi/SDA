// Cliente API para comunicação com o backend
class APIClient {
    constructor() {
        this.baseURL = '/api';
    }

    // Método genérico para requisições
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Adiciona token de autenticação se disponível
        if (appState.token) {
            config.headers.Authorization = `Bearer ${appState.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`Erro na requisição ${endpoint}:`, error);
            
            // Se token inválido, redireciona para login
            if (error.message.includes('Token') || error.message.includes('401')) {
                appState.clearUser();
                appState.showScreen('auth');
                UI.showToast('Sessão expirada. Faça login novamente.', 'warning');
            }
            
            throw error;
        }
    }

    // Métodos HTTP
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return this.request(url, {
            method: 'GET'
        });
    }

    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async patch(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    // Métodos específicos da API

    // Autenticação
    async register(userData) {
        return this.post('/auth/register', userData);
    }

    async login(credentials) {
        return this.post('/auth/login', credentials);
    }

    async logout() {
        return this.post('/auth/logout');
    }

    async verifyToken() {
        return this.get('/auth/verify-token');
    }

    async getPublicKey(userId) {
        return this.get(`/auth/public-key/${userId}`);
    }

    async decryptHybrid(encryptedData, encryptedKey) {
        return this.post('/auth/decrypt-hybrid', {
            encryptedData,
            encryptedKey
        });
    }

    // Contatos
    async getContacts() {
        return this.get('/contacts');
    }

    async getContact(id) {
        return this.get(`/contacts/${id}`);
    }

    async createContact(contactData) {
        return this.post('/contacts', contactData);
    }

    async updateContact(id, contactData) {
        return this.put(`/contacts/${id}`, contactData);
    }

    async deleteContact(id) {
        return this.delete(`/contacts/${id}`);
    }

    async searchContacts(query) {
        return this.get('/contacts/search', { q: query });
    }

    async getContactStats() {
        return this.get('/contacts/stats');
    }

    // Health check
    async healthCheck() {
        return this.get('/health');
    }
}

// Instância global da API
const API = new APIClient();
