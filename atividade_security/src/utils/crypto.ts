import crypto from 'crypto';
import CryptoJS from 'crypto-js';
import NodeRSA from 'node-rsa';

// Configuração de criptografia
export class CryptoUtils {
    private static readonly AES_ALGORITHM = 'aes-256-gcm';
    private static readonly KEY_SIZE = 256; // bits
    private static readonly IV_SIZE = 12; // bytes para GCM
    private static readonly TAG_SIZE = 16; // bytes para GCM

    /**
     * Criptografa dados usando AES-256-GCM
     */
    static encryptAES(data: string, key: string): string {
        try {
            const keyBuffer = Buffer.from(key, 'hex');
            const iv = crypto.randomBytes(this.IV_SIZE);
            
            const cipher = crypto.createCipheriv(this.AES_ALGORITHM, keyBuffer, iv);
            
            let encrypted = cipher.update(data, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            const authTag = cipher.getAuthTag();
            
            // Retorna: iv + authTag + encrypted (todos em hex)
            return iv.toString('hex') + authTag.toString('hex') + encrypted;
        } catch (error) {
            throw new Error(`Erro na criptografia AES: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    /**
     * Descriptografa dados usando AES-256-GCM
     */
    static decryptAES(encryptedData: string, key: string): string {
        try {
            const keyBuffer = Buffer.from(key, 'hex');
            
            // Extrai IV, authTag e dados criptografados
            const iv = Buffer.from(encryptedData.slice(0, this.IV_SIZE * 2), 'hex');
            const authTag = Buffer.from(encryptedData.slice(this.IV_SIZE * 2, (this.IV_SIZE + this.TAG_SIZE) * 2), 'hex');
            const encrypted = encryptedData.slice((this.IV_SIZE + this.TAG_SIZE) * 2);
            
            const decipher = crypto.createDecipheriv(this.AES_ALGORITHM, keyBuffer, iv);
            decipher.setAuthTag(authTag);
            
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (error) {
            throw new Error(`Erro na descriptografia AES: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    /**
     * Gera um par de chaves RSA
     */
    static generateRSAKeyPair(): { publicKey: string; privateKey: string } {
        const key = new NodeRSA({ b: 2048 });
        
        return {
            publicKey: key.exportKey('public'),
            privateKey: key.exportKey('private')
        };
    }

    /**
     * Criptografa dados usando chave pública RSA
     */
    static encryptRSA(data: string, publicKey: string): string {
        try {
            const key = new NodeRSA(publicKey);
            return key.encrypt(data, 'base64');
        } catch (error) {
            throw new Error(`Erro na criptografia RSA: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    /**
     * Descriptografa dados usando chave privada RSA
     */
    static decryptRSA(encryptedData: string, privateKey: string): string {
        try {
            const key = new NodeRSA(privateKey);
            return key.decrypt(encryptedData, 'utf8');
        } catch (error) {
            throw new Error(`Erro na descriptografia RSA: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    /**
     * Gera uma chave AES aleatória para sessão
     */
    static generateSessionKey(): string {
        return crypto.randomBytes(32).toString('hex'); // 256 bits
    }

    /**
     * Implementa criptografia híbrida (RSA + AES)
     * Usa RSA para criptografar a chave AES e AES para criptografar os dados
     */
    static hybridEncrypt(data: string, publicKey: string): { encryptedData: string; encryptedKey: string } {
        // Gera chave de sessão AES
        const sessionKey = this.generateSessionKey();
        
        // Criptografa os dados com AES
        const encryptedData = this.encryptAES(data, sessionKey);
        
        // Criptografa a chave de sessão com RSA
        const encryptedKey = this.encryptRSA(sessionKey, publicKey);
        
        return { encryptedData, encryptedKey };
    }

    /**
     * Descriptografa dados usando criptografia híbrida
     */
    static hybridDecrypt(encryptedData: string, encryptedKey: string, privateKey: string): string {
        // Descriptografa a chave de sessão com RSA
        const sessionKey = this.decryptRSA(encryptedKey, privateKey);
        
        // Descriptografa os dados com AES
        return this.decryptAES(encryptedData, sessionKey);
    }

    /**
     * Gera hash seguro para senhas
     */
    static async hashPassword(password: string): Promise<string> {
        const bcrypt = require('bcryptjs');
        const saltRounds = 12;
        return await bcrypt.hash(password, saltRounds);
    }

    /**
     * Verifica senha contra hash
     */
    static async verifyPassword(password: string, hash: string): Promise<boolean> {
        const bcrypt = require('bcryptjs');
        return await bcrypt.compare(password, hash);
    }

    /**
     * Gera hash SHA-256
     */
    static sha256(data: string): string {
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    /**
     * Gera token aleatório seguro
     */
    static generateSecureToken(length: number = 32): string {
        return crypto.randomBytes(length).toString('hex');
    }
}
