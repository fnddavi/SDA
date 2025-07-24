import Database from '../utils/database';
import { CryptoUtils } from '../utils/crypto';
import { Contact, CreateContactInput, ContactProfile } from './types';

export class ContactModel {
    /**
     * Cria um novo contato
     */
    static async create(userId: string, input: CreateContactInput): Promise<string> {
        try {
            const aesKey = process.env.AES_KEY!;
            
            // Criptografa todos os campos
            const nameEncrypted = CryptoUtils.encryptAES(input.name, aesKey);
            const emailEncrypted = input.email ? CryptoUtils.encryptAES(input.email, aesKey) : null;
            const phoneEncrypted = input.phone ? CryptoUtils.encryptAES(input.phone, aesKey) : null;
            const addressEncrypted = input.address ? CryptoUtils.encryptAES(input.address, aesKey) : null;
            const notesEncrypted = input.notes ? CryptoUtils.encryptAES(input.notes, aesKey) : null;
            
            const result = await Database.query(
                `INSERT INTO contacts (user_id, name_encrypted, email_encrypted, phone_encrypted, address_encrypted, notes_encrypted)
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
                [userId, nameEncrypted, emailEncrypted, phoneEncrypted, addressEncrypted, notesEncrypted]
            );
            
            return result.rows[0].id;
        } catch (error) {
            console.error('Erro ao criar contato:', error);
            throw new Error('Erro ao criar contato');
        }
    }

    /**
     * Lista todos os contatos de um usuário (descriptografados)
     */
    static async listByUser(userId: string): Promise<ContactProfile[]> {
        try {
            const result = await Database.query(
                'SELECT * FROM contacts WHERE user_id = $1 ORDER BY created_at DESC',
                [userId]
            );
            
            const aesKey = process.env.AES_KEY!;
            
            return result.rows.map((contact: Contact) => ({
                id: contact.id,
                name: CryptoUtils.decryptAES(contact.name_encrypted, aesKey),
                email: contact.email_encrypted ? CryptoUtils.decryptAES(contact.email_encrypted, aesKey) : undefined,
                phone: contact.phone_encrypted ? CryptoUtils.decryptAES(contact.phone_encrypted, aesKey) : undefined,
                address: contact.address_encrypted ? CryptoUtils.decryptAES(contact.address_encrypted, aesKey) : undefined,
                notes: contact.notes_encrypted ? CryptoUtils.decryptAES(contact.notes_encrypted, aesKey) : undefined,
                created_at: contact.created_at,
                updated_at: contact.updated_at
            }));
        } catch (error) {
            console.error('Erro ao listar contatos:', error);
            throw new Error('Erro ao carregar contatos');
        }
    }

    /**
     * Busca um contato específico do usuário
     */
    static async findByUserAndId(userId: string, contactId: string): Promise<ContactProfile | null> {
        try {
            const result = await Database.query(
                'SELECT * FROM contacts WHERE user_id = $1 AND id = $2',
                [userId, contactId]
            );
            
            if (!result.rows[0]) return null;
            
            const contact: Contact = result.rows[0];
            const aesKey = process.env.AES_KEY!;
            
            return {
                id: contact.id,
                name: CryptoUtils.decryptAES(contact.name_encrypted, aesKey),
                email: contact.email_encrypted ? CryptoUtils.decryptAES(contact.email_encrypted, aesKey) : undefined,
                phone: contact.phone_encrypted ? CryptoUtils.decryptAES(contact.phone_encrypted, aesKey) : undefined,
                address: contact.address_encrypted ? CryptoUtils.decryptAES(contact.address_encrypted, aesKey) : undefined,
                notes: contact.notes_encrypted ? CryptoUtils.decryptAES(contact.notes_encrypted, aesKey) : undefined,
                created_at: contact.created_at,
                updated_at: contact.updated_at
            };
        } catch (error) {
            console.error('Erro ao buscar contato:', error);
            throw new Error('Erro ao carregar contato');
        }
    }

    /**
     * Atualiza um contato
     */
    static async update(userId: string, contactId: string, input: Partial<CreateContactInput>): Promise<boolean> {
        try {
            // Verifica se o contato pertence ao usuário
            const existing = await Database.query(
                'SELECT id FROM contacts WHERE user_id = $1 AND id = $2',
                [userId, contactId]
            );
            
            if (!existing.rows[0]) return false;
            
            const aesKey = process.env.AES_KEY!;
            const updates: string[] = [];
            const values: any[] = [];
            let paramCount = 1;
            
            if (input.name !== undefined) {
                updates.push(`name_encrypted = $${paramCount++}`);
                values.push(CryptoUtils.encryptAES(input.name, aesKey));
            }
            
            if (input.email !== undefined) {
                updates.push(`email_encrypted = $${paramCount++}`);
                values.push(input.email ? CryptoUtils.encryptAES(input.email, aesKey) : null);
            }
            
            if (input.phone !== undefined) {
                updates.push(`phone_encrypted = $${paramCount++}`);
                values.push(input.phone ? CryptoUtils.encryptAES(input.phone, aesKey) : null);
            }
            
            if (input.address !== undefined) {
                updates.push(`address_encrypted = $${paramCount++}`);
                values.push(input.address ? CryptoUtils.encryptAES(input.address, aesKey) : null);
            }
            
            if (input.notes !== undefined) {
                updates.push(`notes_encrypted = $${paramCount++}`);
                values.push(input.notes ? CryptoUtils.encryptAES(input.notes, aesKey) : null);
            }
            
            if (updates.length === 0) return true;
            
            values.push(userId, contactId);
            
            await Database.query(
                `UPDATE contacts SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
                 WHERE user_id = $${paramCount++} AND id = $${paramCount++}`,
                values
            );
            
            return true;
        } catch (error) {
            console.error('Erro ao atualizar contato:', error);
            throw new Error('Erro ao atualizar contato');
        }
    }

    /**
     * Remove um contato
     */
    static async delete(userId: string, contactId: string): Promise<boolean> {
        try {
            const result = await Database.query(
                'DELETE FROM contacts WHERE user_id = $1 AND id = $2',
                [userId, contactId]
            );
            
            return result.rowCount > 0;
        } catch (error) {
            console.error('Erro ao deletar contato:', error);
            throw new Error('Erro ao deletar contato');
        }
    }

    /**
     * Conta total de contatos do usuário
     */
    static async countByUser(userId: string): Promise<number> {
        try {
            const result = await Database.query(
                'SELECT COUNT(*) as total FROM contacts WHERE user_id = $1',
                [userId]
            );
            
            return parseInt(result.rows[0].total);
        } catch (error) {
            console.error('Erro ao contar contatos:', error);
            return 0;
        }
    }

    /**
     * Busca contatos por nome (busca parcial)
     */
    static async searchByName(userId: string, searchTerm: string): Promise<ContactProfile[]> {
        try {
            // Esta é uma implementação simplificada - idealmente precisaríamos de busca full-text
            // em dados criptografados, o que é complexo. Para demo, vamos descriptografar e filtrar.
            const allContacts = await this.listByUser(userId);
            
            return allContacts.filter(contact => 
                contact.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        } catch (error) {
            console.error('Erro ao buscar contatos:', error);
            throw new Error('Erro ao buscar contatos');
        }
    }
}
