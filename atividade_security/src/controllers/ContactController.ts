import { Request, Response } from 'express';
import { ContactModel } from '../models/Contact';
import { AuditLogger } from '../utils/audit';
import { CreateContactInput } from '../models/types';

export class ContactController {
    /**
     * Lista todos os contatos do usuário
     */
    static async list(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const contacts = await ContactModel.listByUser(userId);
            
            res.json({
                success: true,
                data: contacts,
                message: `${contacts.length} contatos encontrados`
            });
            
        } catch (error) {
            console.error('Erro ao listar contatos:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Busca um contato específico
     */
    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const contactId = req.params.id;
            
            const contact = await ContactModel.findByUserAndId(userId, contactId);
            if (!contact) {
                res.status(404).json({
                    success: false,
                    error: 'Contato não encontrado'
                });
                return;
            }
            
            res.json({
                success: true,
                data: contact
            });
            
        } catch (error) {
            console.error('Erro ao buscar contato:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Cria um novo contato
     */
    static async create(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const contactData: CreateContactInput = req.body;
            
            // Validação básica
            if (!contactData.name || contactData.name.trim() === '') {
                res.status(400).json({
                    success: false,
                    error: 'Nome do contato é obrigatório'
                });
                return;
            }
            
            // Validação de email se fornecido
            if (contactData.email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(contactData.email)) {
                    res.status(400).json({
                        success: false,
                        error: 'Email inválido'
                    });
                    return;
                }
            }
            
            const contactId = await ContactModel.create(userId, contactData);
            
            // Log de auditoria
            await AuditLogger.log(
                'CONTACT_CREATED',
                userId,
                'contact',
                contactId,
                req.ip,
                req.get('User-Agent'),
                { contactName: contactData.name }
            );
            
            res.status(201).json({
                success: true,
                data: { contactId },
                message: 'Contato criado com sucesso'
            });
            
        } catch (error) {
            console.error('Erro ao criar contato:', error);
            
            await AuditLogger.log(
                'CONTACT_CREATE_FAILED',
                req.user!.id,
                'contact',
                undefined,
                req.ip,
                req.get('User-Agent'),
                { 
                    error: error instanceof Error ? error.message : 'Erro desconhecido',
                    contactData: req.body.name 
                }
            );
            
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Atualiza um contato
     */
    static async update(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const contactId = req.params.id;
            const updateData: Partial<CreateContactInput> = req.body;
            
            // Validação de email se fornecido
            if (updateData.email && updateData.email.trim() !== '') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(updateData.email)) {
                    res.status(400).json({
                        success: false,
                        error: 'Email inválido'
                    });
                    return;
                }
            }
            
            const success = await ContactModel.update(userId, contactId, updateData);
            if (!success) {
                res.status(404).json({
                    success: false,
                    error: 'Contato não encontrado'
                });
                return;
            }
            
            // Log de auditoria
            await AuditLogger.log(
                'CONTACT_UPDATED',
                userId,
                'contact',
                contactId,
                req.ip,
                req.get('User-Agent'),
                { updatedFields: Object.keys(updateData) }
            );
            
            res.json({
                success: true,
                message: 'Contato atualizado com sucesso'
            });
            
        } catch (error) {
            console.error('Erro ao atualizar contato:', error);
            
            await AuditLogger.log(
                'CONTACT_UPDATE_FAILED',
                req.user!.id,
                'contact',
                req.params.id,
                req.ip,
                req.get('User-Agent'),
                { error: error instanceof Error ? error.message : 'Erro desconhecido' }
            );
            
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Remove um contato
     */
    static async delete(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const contactId = req.params.id;
            
            const success = await ContactModel.delete(userId, contactId);
            if (!success) {
                res.status(404).json({
                    success: false,
                    error: 'Contato não encontrado'
                });
                return;
            }
            
            // Log de auditoria
            await AuditLogger.log(
                'CONTACT_DELETED',
                userId,
                'contact',
                contactId,
                req.ip,
                req.get('User-Agent')
            );
            
            res.json({
                success: true,
                message: 'Contato removido com sucesso'
            });
            
        } catch (error) {
            console.error('Erro ao deletar contato:', error);
            
            await AuditLogger.log(
                'CONTACT_DELETE_FAILED',
                req.user!.id,
                'contact',
                req.params.id,
                req.ip,
                req.get('User-Agent'),
                { error: error instanceof Error ? error.message : 'Erro desconhecido' }
            );
            
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Busca contatos por nome
     */
    static async search(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const searchTerm = req.query.q as string;
            
            if (!searchTerm || searchTerm.trim() === '') {
                res.status(400).json({
                    success: false,
                    error: 'Termo de busca é obrigatório'
                });
                return;
            }
            
            const contacts = await ContactModel.searchByName(userId, searchTerm);
            
            res.json({
                success: true,
                data: contacts,
                message: `${contacts.length} contatos encontrados`
            });
            
        } catch (error) {
            console.error('Erro ao buscar contatos:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Estatísticas dos contatos do usuário
     */
    static async stats(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const totalContacts = await ContactModel.countByUser(userId);
            
            res.json({
                success: true,
                data: {
                    totalContacts,
                    userId
                }
            });
            
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    }
}
