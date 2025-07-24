import { Router } from 'express';
import { ContactController } from '../controllers/ContactController';
import { authenticateToken, rateLimitByIP, auditLog } from '../middleware/auth';

const router = Router();

// Todas as rotas de contatos requerem autenticação
router.use(authenticateToken);

// Rate limiting para operações de contatos
const contactRateLimit = rateLimitByIP(200, 15); // 200 operações por 15 minutos

// Listar contatos do usuário
router.get('/', 
    contactRateLimit,
    auditLog('CONTACTS_LIST', 'contact'),
    ContactController.list
);

// Buscar contatos por termo
router.get('/search', 
    contactRateLimit,
    auditLog('CONTACTS_SEARCH', 'contact'),
    ContactController.search
);

// Estatísticas dos contatos
router.get('/stats', 
    contactRateLimit,
    auditLog('CONTACTS_STATS', 'contact'),
    ContactController.stats
);

// Buscar contato específico
router.get('/:id', 
    contactRateLimit,
    auditLog('CONTACT_VIEW', 'contact'),
    ContactController.getById
);

// Criar novo contato
router.post('/', 
    contactRateLimit,
    auditLog('CONTACT_CREATE', 'contact'),
    ContactController.create
);

// Atualizar contato
router.put('/:id', 
    contactRateLimit,
    auditLog('CONTACT_UPDATE', 'contact'),
    ContactController.update
);

// Atualização parcial do contato
router.patch('/:id', 
    contactRateLimit,
    auditLog('CONTACT_PARTIAL_UPDATE', 'contact'),
    ContactController.update
);

// Deletar contato
router.delete('/:id', 
    contactRateLimit,
    auditLog('CONTACT_DELETE', 'contact'),
    ContactController.delete
);

export default router;
