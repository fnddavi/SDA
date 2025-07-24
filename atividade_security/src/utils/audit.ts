import Database from './database';
import { AuditLog } from '../models/types';

export class AuditLogger {
    /**
     * Registra uma ação de auditoria
     */
    static async log(
        action: string,
        userId?: string,
        resourceType?: string,
        resourceId?: string,
        ipAddress?: string,
        userAgent?: string,
        details?: any
    ): Promise<void> {
        try {
            await Database.query(
                `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent, details)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [userId, action, resourceType, resourceId, ipAddress, userAgent, details ? JSON.stringify(details) : null]
            );
        } catch (error) {
            console.error('Erro ao registrar log de auditoria:', error);
            // Não relança o erro para não interromper o fluxo principal
        }
    }

    /**
     * Busca logs de auditoria por usuário
     */
    static async getByUser(userId: string, limit: number = 50): Promise<AuditLog[]> {
        try {
            const result = await Database.query(
                `SELECT * FROM audit_logs 
                 WHERE user_id = $1 
                 ORDER BY created_at DESC 
                 LIMIT $2`,
                [userId, limit]
            );
            
            return result.rows.map((row: any) => ({
                ...row,
                details: row.details ? JSON.parse(row.details) : null
            }));
        } catch (error) {
            console.error('Erro ao buscar logs de auditoria:', error);
            return [];
        }
    }

    /**
     * Busca logs de auditoria por ação
     */
    static async getByAction(action: string, limit: number = 100): Promise<AuditLog[]> {
        try {
            const result = await Database.query(
                `SELECT * FROM audit_logs 
                 WHERE action = $1 
                 ORDER BY created_at DESC 
                 LIMIT $2`,
                [action, limit]
            );
            
            return result.rows.map((row: any) => ({
                ...row,
                details: row.details ? JSON.parse(row.details) : null
            }));
        } catch (error) {
            console.error('Erro ao buscar logs de auditoria:', error);
            return [];
        }
    }

    /**
     * Busca logs suspeitos (tentativas de acesso não autorizado)
     */
    static async getSuspiciousActivity(limit: number = 100): Promise<AuditLog[]> {
        try {
            const result = await Database.query(
                `SELECT * FROM audit_logs 
                 WHERE action IN ('UNAUTHORIZED_ACCESS_ATTEMPT', 'FAILED_LOGIN', 'RATE_LIMIT_EXCEEDED')
                 ORDER BY created_at DESC 
                 LIMIT $1`,
                [limit]
            );
            
            return result.rows.map((row: any) => ({
                ...row,
                details: row.details ? JSON.parse(row.details) : null
            }));
        } catch (error) {
            console.error('Erro ao buscar atividade suspeita:', error);
            return [];
        }
    }
}
