// Funções de criptografia para o frontend
// Implementação simplificada sem dependências externas

class ClientCrypto {
    constructor() {
        this.keyCache = new Map();
    }

    // Gera chave aleatória simples
    generateSessionKey() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // Criptografia simples (apenas para demonstração)
    encryptAES(data, key) {
        try {
            // Implementação simplificada - em produção use bibliotecas robustas
            return btoa(data + '::' + key.substring(0, 8));
        } catch (error) {
            console.error('Erro na criptografia AES:', error);
            throw new Error('Falha na criptografia');
        }
    }

    // Descriptografia simples
    decryptAES(encryptedData, key) {
        try {
            const decoded = atob(encryptedData);
            const parts = decoded.split('::');
            return parts[0];
        } catch (error) {
            console.error('Erro na descriptografia AES:', error);
            throw new Error('Falha na descriptografia');
        }
    }

    // Obtém chave pública do usuário (cache para otimização)
    async getPublicKey(userId) {
        if (this.keyCache.has(userId)) {
            return this.keyCache.get(userId);
        }

        try {
            const response = await API.getPublicKey(userId);
            if (response.success) {
                this.keyCache.set(userId, response.data.publicKey);
                return response.data.publicKey;
            }
            throw new Error('Chave pública não encontrada');
        } catch (error) {
            console.error('Erro ao obter chave pública:', error);
            throw error;
        }
    }

    // Criptografia híbrida (simulada - em produção usaria RSA real)
    async hybridEncrypt(data, userId) {
        try {
            // Para esta demonstração, vamos usar apenas AES
            // Em produção real, implementaria RSA + AES
            const sessionKey = this.generateSessionKey();
            const encryptedData = this.encryptAES(data, sessionKey);
            
            // Simula criptografia da chave de sessão com RSA
            const encryptedKey = this.encryptAES(sessionKey, 'demo-rsa-key');
            
            return {
                encryptedData,
                encryptedKey
            };
        } catch (error) {
            console.error('Erro na criptografia híbrida:', error);
            throw error;
        }
    }

    // Descriptografia híbrida (usando API do servidor)
    async hybridDecrypt(encryptedData, encryptedKey) {
        try {
            const response = await API.decryptHybrid(encryptedData, encryptedKey);
            if (response.success) {
                return response.data.decryptedData;
            }
            throw new Error('Falha na descriptografia');
        } catch (error) {
            console.error('Erro na descriptografia híbrida:', error);
            throw error;
        }
    }

    // Hash seguro (SHA-256)
    hash(data) {
        return CryptoJS.SHA256(data).toString();
    }

    // Gera ID único
    generateId() {
        return CryptoJS.lib.WordArray.random(16).toString();
    }

    // Validação de integridade
    validateIntegrity(data, hash) {
        return this.hash(data) === hash;
    }

    // Limpa cache de chaves
    clearKeyCache() {
        this.keyCache.clear();
    }
}

// Instância global de criptografia
const clientCrypto = new ClientCrypto();

// Utilitários de segurança
const Security = {
    // Sanitiza entrada do usuário
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .replace(/[<>]/g, '') // Remove tags básicas
            .trim()
            .slice(0, 1000); // Limita tamanho
    },

    // Valida se dados são seguros
    isSecureData(data) {
        if (!data) return false;
        
        // Verifica padrões maliciosos básicos
        const maliciousPatterns = [
            /<script/i,
            /javascript:/i,
            /onload=/i,
            /onerror=/i
        ];
        
        return !maliciousPatterns.some(pattern => pattern.test(data));
    },

    // Gera token CSRF simples
    generateCSRFToken() {
        return clientCrypto.generateId();
    },

    // Valida email
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Força de senha
    getPasswordStrength(password) {
        let score = 0;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            numbers: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        score = Object.values(checks).filter(Boolean).length;

        return {
            score,
            checks,
            strength: score < 2 ? 'weak' : score < 4 ? 'medium' : 'strong'
        };
    }
};

// Event listeners para segurança
document.addEventListener('DOMContentLoaded', () => {
    // Previne ataques XSS básicos
    document.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            const sanitized = Security.sanitizeInput(e.target.value);
            if (sanitized !== e.target.value) {
                console.warn('Input sanitizado:', e.target.name);
                e.target.value = sanitized;
            }
        }
    });

    // Detecta tentativas de cola maliciosa
    document.addEventListener('paste', (e) => {
        const pastedData = (e.clipboardData || window.clipboardData).getData('text');
        if (!Security.isSecureData(pastedData)) {
            e.preventDefault();
            UI.showToast('Conteúdo potencialmente malicioso detectado', 'warning');
        }
    });
});

// Debug e diagnósticos de segurança
const SecurityDiagnostics = {
    checkBrowserSecurity() {
        const checks = {
            https: location.protocol === 'https:',
            localStorage: typeof Storage !== 'undefined',
            crypto: typeof crypto !== 'undefined',
            fetch: typeof fetch !== 'undefined'
        };

        console.log('Verificações de segurança do browser:', checks);
        return checks;
    },

    checkTokenSecurity() {
        const token = appState.token;
        if (!token) return { valid: false, reason: 'Token ausente' };

        try {
            // Parse básico do JWT (apenas para diagnóstico)
            const parts = token.split('.');
            if (parts.length !== 3) {
                return { valid: false, reason: 'Formato de token inválido' };
            }

            return { valid: true, parts: parts.length };
        } catch (error) {
            return { valid: false, reason: error.message };
        }
    }
};
