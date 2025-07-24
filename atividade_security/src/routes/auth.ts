import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken, rateLimitByIP, auditLog } from '../middleware/auth';

const router = Router();

// Rate limiting mais permissivo para desenvolvimento
const authRateLimit = rateLimitByIP(200, 15); // 200 tentativas por 15 minutos

// Rotas públicas (sem autenticação)
router.post('/register', 
    authRateLimit,
    auditLog('USER_REGISTRATION_ATTEMPT', 'user'),
    AuthController.register
);

router.post('/login', 
    authRateLimit,
    auditLog('USER_LOGIN_ATTEMPT', 'authentication'),
    AuthController.login
);

// Rota para obter chave pública (necessária para criptografia híbrida)
router.get('/public-key/:userId', 
    rateLimitByIP(50, 15),
    AuthController.getPublicKey
);

// Rotas protegidas (requerem autenticação)
router.get('/verify-token', 
    authenticateToken,
    auditLog('TOKEN_VERIFICATION', 'authentication'),
    AuthController.verifyToken
);

router.post('/logout', 
    authenticateToken,
    auditLog('USER_LOGOUT', 'authentication'),
    AuthController.logout
);

// Rota para descriptografia híbrida
router.post('/decrypt-hybrid', 
    authenticateToken,
    rateLimitByIP(100, 15),
    auditLog('HYBRID_DECRYPTION', 'crypto'),
    AuthController.decryptHybrid
);

export default router;
