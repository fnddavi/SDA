import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { AuditLogger } from '../utils/audit';
import { CryptoUtils } from '../utils/crypto';
import { CreateUserInput, LoginInput, AuthResponse } from '../models/types';

export class AuthController {
    /**
     * Registro de novo usuário
     */
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const { username, email, password, fullName }: CreateUserInput = req.body;
            
            // Validação básica
            if (!username || !email || !password || !fullName) {
                res.status(400).json({
                    success: false,
                    error: 'Todos os campos são obrigatórios'
                });
                return;
            }
            
            // Validação de senha forte
            if (password.length < 8) {
                res.status(400).json({
                    success: false,
                    error: 'A senha deve ter pelo menos 8 caracteres'
                });
                return;
            }
            
            // Validação de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                res.status(400).json({
                    success: false,
                    error: 'Email inválido'
                });
                return;
            }
            
            // Cria o usuário
            const userId = await UserModel.create({
                username,
                email,
                password,
                fullName
            });
            
            // Log de auditoria
            await AuditLogger.log(
                'USER_REGISTERED',
                userId,
                'user',
                userId,
                req.ip,
                req.get('User-Agent'),
                { username, email }
            );
            
            res.status(201).json({
                success: true,
                message: 'Usuário criado com sucesso',
                data: { userId }
            });
            
        } catch (error) {
            console.error('Erro no registro:', error);
            
            await AuditLogger.log(
                'USER_REGISTRATION_FAILED',
                undefined,
                'user',
                undefined,
                req.ip,
                req.get('User-Agent'),
                { 
                    error: error instanceof Error ? error.message : 'Erro desconhecido',
                    username: req.body.username 
                }
            );
            
            if (error instanceof Error && error.message.includes('já existe')) {
                res.status(409).json({
                    success: false,
                    error: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: 'Erro interno do servidor'
                });
            }
        }
    }

    /**
     * Login do usuário
     */
    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password }: { email: string; password: string } = req.body;
            
            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    error: 'Email e senha são obrigatórios'
                });
                return;
            }
            
            // Verifica credenciais usando email
            const user = await UserModel.findByEmail(email);
            if (!user) {
                await AuditLogger.log(
                    'FAILED_LOGIN',
                    undefined,
                    'authentication',
                    undefined,
                    req.ip,
                    req.get('User-Agent'),
                    { email }
                );
                
                res.status(401).json({
                    success: false,
                    error: 'Credenciais inválidas'
                });
                return;
            }

            // Verifica a senha
            const isValidPassword = await CryptoUtils.verifyPassword(password, user.password_hash);
            if (!isValidPassword) {
                await AuditLogger.log(
                    'FAILED_LOGIN',
                    user.id,
                    'authentication',
                    user.id,
                    req.ip,
                    req.get('User-Agent'),
                    { email }
                );
                
                res.status(401).json({
                    success: false,
                    error: 'Credenciais inválidas'
                });
                return;
            }
            
            // Atualiza último login
            await UserModel.updateLastLogin(user.id);
            
            // Gera token JWT
            const jwtSecret = process.env.JWT_SECRET!;
            const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
            const token = jwt.sign(
                { userId: user.id, username: user.username },
                jwtSecret,
                { expiresIn } as jwt.SignOptions
            );
            
            // Busca perfil completo
            const userProfile = await UserModel.getProfile(user.id);
            
            // Log de auditoria
            await AuditLogger.log(
                'USER_LOGIN',
                user.id,
                'authentication',
                user.id,
                req.ip,
                req.get('User-Agent'),
                { email }
            );
            
            const response: AuthResponse = {
                success: true,
                token,
                user: userProfile!,
                message: 'Login realizado com sucesso'
            };
            
            res.json(response);
            
        } catch (error) {
            console.error('Erro no login:', error);
            
            await AuditLogger.log(
                'LOGIN_ERROR',
                undefined,
                'authentication',
                undefined,
                req.ip,
                req.get('User-Agent'),
                { 
                    error: error instanceof Error ? error.message : 'Erro desconhecido',
                    username: req.body.username 
                }
            );
            
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Obtém chave pública do usuário para criptografia híbrida
     */
    static async getPublicKey(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            
            const publicKey = await UserModel.getPublicKey(userId);
            if (!publicKey) {
                res.status(404).json({
                    success: false,
                    error: 'Chave pública não encontrada'
                });
                return;
            }
            
            res.json({
                success: true,
                data: { publicKey }
            });
            
        } catch (error) {
            console.error('Erro ao buscar chave pública:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Endpoint para descriptografar dados híbridos (usado pelo frontend)
     */
    static async decryptHybrid(req: Request, res: Response): Promise<void> {
        try {
            const { encryptedData, encryptedKey } = req.body;
            const userId = req.user!.id;
            
            if (!encryptedData || !encryptedKey) {
                res.status(400).json({
                    success: false,
                    error: 'Dados criptografados e chave são obrigatórios'
                });
                return;
            }
            
            // Obtém chave privada do usuário
            const privateKey = await UserModel.getPrivateKey(userId);
            if (!privateKey) {
                res.status(404).json({
                    success: false,
                    error: 'Chave privada não encontrada'
                });
                return;
            }
            
            // Descriptografa os dados
            const decryptedData = CryptoUtils.hybridDecrypt(encryptedData, encryptedKey, privateKey);
            
            res.json({
                success: true,
                data: { decryptedData }
            });
            
        } catch (error) {
            console.error('Erro na descriptografia híbrida:', error);
            res.status(500).json({
                success: false,
                error: 'Erro ao descriptografar dados'
            });
        }
    }

    /**
     * Verifica se o token ainda é válido
     */
    static async verifyToken(req: Request, res: Response): Promise<void> {
        try {
            // Se chegou aqui, o token é válido (passou pelo middleware)
            const userProfile = await UserModel.getProfile(req.user!.id);
            
            res.json({
                success: true,
                user: userProfile,
                message: 'Token válido'
            });
            
        } catch (error) {
            console.error('Erro na verificação do token:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    }

    /**
     * Logout (invalidação do token seria feita no frontend)
     */
    static async logout(req: Request, res: Response): Promise<void> {
        try {
            // Log de auditoria
            await AuditLogger.log(
                'USER_LOGOUT',
                req.user!.id,
                'authentication',
                req.user!.id,
                req.ip,
                req.get('User-Agent')
            );
            
            res.json({
                success: true,
                message: 'Logout realizado com sucesso'
            });
            
        } catch (error) {
            console.error('Erro no logout:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    }
}
