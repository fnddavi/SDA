import Database from '../utils/database';
import { CryptoUtils } from '../utils/crypto';
import { User, CreateUserInput, UserProfile, UserKeys } from './types';

export class UserModel {
    /**
     * Cria um novo usuário
     */
    static async create(input: CreateUserInput): Promise<string> {
        const client = await Database.beginTransaction();
        
        try {
            // Verifica se username já existe
            const existingUser = await Database.query(
                'SELECT id FROM users WHERE username = $1 OR email = $2',
                [input.username, input.email]
            );
            
            if (existingUser.rows.length > 0) {
                throw new Error('Username ou email já existe');
            }

            // Hash da senha
            const passwordHash = await CryptoUtils.hashPassword(input.password);
            
            // Criptografa o nome completo
            const aesKey = process.env.AES_KEY!;
            const fullNameEncrypted = CryptoUtils.encryptAES(input.fullName, aesKey);
            
            // Insere o usuário
            const userResult = await client.query(
                `INSERT INTO users (username, email, password_hash, full_name_encrypted) 
                 VALUES ($1, $2, $3, $4) RETURNING id`,
                [input.username, input.email, passwordHash, fullNameEncrypted]
            );
            
            const userId = userResult.rows[0].id;
            
            // Gera par de chaves RSA para o usuário
            const { publicKey, privateKey } = CryptoUtils.generateRSAKeyPair();
            
            // Criptografa a chave privada com AES
            const privateKeyEncrypted = CryptoUtils.encryptAES(privateKey, aesKey);
            
            // Armazena as chaves
            await client.query(
                `INSERT INTO user_keys (user_id, public_key, private_key_encrypted) 
                 VALUES ($1, $2, $3)`,
                [userId, publicKey, privateKeyEncrypted]
            );
            
            await Database.commitTransaction(client);
            return userId;
            
        } catch (error) {
            await Database.rollbackTransaction(client);
            throw error;
        }
    }

    /**
     * Busca usuário por username
     */
    static async findByUsername(username: string): Promise<User | null> {
        const result = await Database.query(
            'SELECT * FROM users WHERE username = $1 AND is_active = true',
            [username]
        );
        
        return result.rows[0] || null;
    }

    /**
     * Busca usuário por email
     */
    static async findByEmail(email: string): Promise<User | null> {
        const result = await Database.query(
            'SELECT * FROM users WHERE email = $1 AND is_active = true',
            [email]
        );
        
        return result.rows[0] || null;
    }

    /**
     * Busca usuário por ID
     */
    static async findById(id: string): Promise<User | null> {
        const result = await Database.query(
            'SELECT * FROM users WHERE id = $1 AND is_active = true',
            [id]
        );
        
        return result.rows[0] || null;
    }

    /**
     * Retorna perfil do usuário (dados descriptografados)
     */
    static async getProfile(id: string): Promise<UserProfile | null> {
        const user = await this.findById(id);
        if (!user) return null;
        
        try {
            const aesKey = process.env.AES_KEY!;
            const fullName = CryptoUtils.decryptAES(user.full_name_encrypted, aesKey);
            
            return {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName,
                created_at: user.created_at,
                last_login: user.last_login
            };
        } catch (error) {
            console.error('Erro ao descriptografar dados do usuário:', error);
            throw new Error('Erro ao carregar perfil do usuário');
        }
    }

    /**
     * Atualiza último login
     */
    static async updateLastLogin(id: string): Promise<void> {
        await Database.query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
            [id]
        );
    }

    /**
     * Obtém chave pública do usuário
     */
    static async getPublicKey(userId: string): Promise<string | null> {
        const result = await Database.query(
            'SELECT public_key FROM user_keys WHERE user_id = $1 AND is_active = true',
            [userId]
        );
        
        return result.rows[0]?.public_key || null;
    }

    /**
     * Obtém chave privada descriptografada do usuário
     */
    static async getPrivateKey(userId: string): Promise<string | null> {
        const result = await Database.query(
            'SELECT private_key_encrypted FROM user_keys WHERE user_id = $1 AND is_active = true',
            [userId]
        );
        
        if (!result.rows[0]) return null;
        
        try {
            const aesKey = process.env.AES_KEY!;
            return CryptoUtils.decryptAES(result.rows[0].private_key_encrypted, aesKey);
        } catch (error) {
            console.error('Erro ao descriptografar chave privada:', error);
            return null;
        }
    }

    /**
     * Verifica senha do usuário
     */
    static async verifyPassword(username: string, password: string): Promise<User | null> {
        const user = await this.findByUsername(username);
        if (!user) return null;
        
        const isValid = await CryptoUtils.verifyPassword(password, user.password_hash);
        return isValid ? user : null;
    }

    /**
     * Desativa usuário (soft delete)
     */
    static async deactivate(id: string): Promise<void> {
        await Database.query(
            'UPDATE users SET is_active = false WHERE id = $1',
            [id]
        );
    }

    /**
     * Lista todos os usuários (apenas dados não sensíveis)
     */
    static async list(): Promise<{ id: string; username: string; email: string; created_at: Date }[]> {
        const result = await Database.query(
            'SELECT id, username, email, created_at FROM users WHERE is_active = true ORDER BY created_at DESC'
        );
        
        return result.rows;
    }
}
