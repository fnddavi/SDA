import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { AuditLogger } from '../utils/audit';

// Estende o tipo Request para incluir user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                username: string;
                email: string;
            };
        }
    }
}

/**
 * Middleware para autenticação JWT
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Token de acesso requerido'
            });
        }
        
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET não configurado');
        }
        
        // Verifica o token
        const decoded = jwt.verify(token, jwtSecret) as any;
        
        // Busca o usuário no banco para garantir que ainda está ativo
        const user = await UserModel.findById(decoded.userId);
        if (!user || !user.is_active) {
            return res.status(401).json({
                success: false,
                error: 'Token inválido ou usuário inativo'
            });
        }
        
        // Adiciona informações do usuário à requisição
        req.user = {
            id: user.id,
            username: user.username,
            email: user.email
        };
        
        next();
    } catch (error) {
        console.error('Erro na autenticação:', error);
        
        // Log da tentativa de acesso não autorizado
        await AuditLogger.log(
            'UNAUTHORIZED_ACCESS_ATTEMPT',
            undefined,
            'authentication',
            undefined,
            req.ip,
            req.get('User-Agent'),
            { error: error instanceof Error ? error.message : 'Erro desconhecido' }
        );
        
        return res.status(403).json({
            success: false,
            error: 'Token inválido'
        });
    }
};

/**
 * Middleware para verificar se o usuário é proprietário do recurso
 */
export const authorizeOwnership = (resourceUserIdParam: string = 'userId') => {
    return (req: Request, res: Response, next: NextFunction) => {
        const resourceUserId = req.params[resourceUserIdParam];
        const authenticatedUserId = req.user?.id;
        
        if (!authenticatedUserId) {
            return res.status(401).json({
                success: false,
                error: 'Usuário não autenticado'
            });
        }
        
        if (resourceUserId && resourceUserId !== authenticatedUserId) {
            return res.status(403).json({
                success: false,
                error: 'Acesso negado: você só pode acessar seus próprios recursos'
            });
        }
        
        next();
    };
};

/**
 * Middleware para rate limiting simples
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimitByIP = (maxRequests: number = 100, windowMinutes: number = 15) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const clientIP = req.ip || 'unknown';
        const now = Date.now();
        const windowMs = windowMinutes * 60 * 1000;
        
        const clientData = requestCounts.get(clientIP);
        
        if (!clientData || now > clientData.resetTime) {
            // Nova janela de tempo
            requestCounts.set(clientIP, {
                count: 1,
                resetTime: now + windowMs
            });
            return next();
        }
        
        if (clientData.count >= maxRequests) {
            return res.status(429).json({
                success: false,
                error: 'Muitas requisições. Tente novamente mais tarde.',
                retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
            });
        }
        
        clientData.count++;
        next();
    };
};

/**
 * Middleware para logging de auditoria
 */
export const auditLog = (action: string, resourceType?: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Armazena o action para uso posterior
        (req as any).auditAction = action;
        (req as any).auditResourceType = resourceType;
        
        // Intercepta o response para logar após a conclusão
        const originalSend = res.send;
        res.send = function(data) {
            // Log apenas em caso de sucesso (2xx)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                AuditLogger.log(
                    action,
                    req.user?.id,
                    resourceType,
                    (req.params.id || req.params.contactId),
                    req.ip,
                    req.get('User-Agent'),
                    {
                        method: req.method,
                        path: req.path,
                        statusCode: res.statusCode
                    }
                ).catch((err: any) => console.error('Erro no log de auditoria:', err));
            }
            
            return originalSend.call(this, data);
        };
        
        next();
    };
};
