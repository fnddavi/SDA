-- 🔍 CONSULTAS DE DEMONSTRAÇÃO DO SISTEMA DE CONTATOS SEGUROS
-- ================================================================

-- 📊 1. ESTATÍSTICAS GERAIS DO SISTEMA
-- ===================================

-- Contagem de usuários registrados
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN last_login IS NOT NULL THEN 1 END) as usuarios_ativos,
    COUNT(CASE WHEN last_login IS NULL THEN 1 END) as usuarios_nunca_logaram
FROM users;

-- Estatísticas de contatos por usuário
SELECT 
    u.username,
    u.full_name,
    COUNT(c.id) as total_contatos,
    u.created_at as data_registro,
    u.last_login as ultimo_login
FROM users u
LEFT JOIN contacts c ON u.id = c.user_id
GROUP BY u.id, u.username, u.full_name, u.created_at, u.last_login
ORDER BY total_contatos DESC;

-- 🔐 2. VERIFICAÇÕES DE SEGURANÇA
-- ===============================

-- Verificar se as senhas estão hasheadas (devem começar com $2b$)
SELECT 
    username,
    email,
    CASE 
        WHEN password_hash LIKE '$2b$%' THEN '✅ Hash bcrypt válido'
        ELSE '❌ Hash inválido'
    END as status_senha,
    LENGTH(password_hash) as tamanho_hash
FROM users;

-- Verificar se os dados dos contatos estão criptografados
SELECT 
    u.username,
    c.name,
    CASE 
        WHEN c.encrypted_data LIKE '%:%' THEN '✅ Dados criptografados'
        ELSE '❌ Dados não criptografados'
    END as status_criptografia,
    LENGTH(c.encrypted_data) as tamanho_dados_criptografados
FROM contacts c
JOIN users u ON c.user_id = u.id
LIMIT 5;

-- 📈 3. LOGS DE AUDITORIA (se houver dados)
-- =========================================

-- Últimas atividades do sistema
SELECT 
    al.action,
    al.user_id,
    u.username,
    al.ip_address,
    al.user_agent,
    al.created_at,
    al.details
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
ORDER BY al.created_at DESC
LIMIT 10;

-- Contagem de ações por tipo
SELECT 
    action,
    COUNT(*) as total_ocorrencias,
    COUNT(DISTINCT user_id) as usuarios_unicos,
    MIN(created_at) as primeira_ocorrencia,
    MAX(created_at) as ultima_ocorrencia
FROM audit_logs
GROUP BY action
ORDER BY total_ocorrencias DESC;

-- Atividades por usuário
SELECT 
    u.username,
    COUNT(al.id) as total_atividades,
    COUNT(DISTINCT al.action) as tipos_acao_diferentes,
    MIN(al.created_at) as primeira_atividade,
    MAX(al.created_at) as ultima_atividade
FROM users u
LEFT JOIN audit_logs al ON u.id = al.user_id
GROUP BY u.id, u.username
ORDER BY total_atividades DESC;

-- 🔍 4. ANÁLISES DETALHADAS
-- =========================

-- Usuários mais ativos (com mais contatos)
SELECT 
    u.username,
    u.email,
    u.full_name,
    COUNT(c.id) as total_contatos,
    u.created_at as usuario_desde,
    EXTRACT(DAY FROM NOW() - u.created_at) as dias_no_sistema
FROM users u
LEFT JOIN contacts c ON u.id = c.user_id
GROUP BY u.id, u.username, u.email, u.full_name, u.created_at
HAVING COUNT(c.id) > 0
ORDER BY total_contatos DESC;

-- Contatos criados nas últimas 24 horas
SELECT 
    u.username,
    COUNT(c.id) as contatos_recentes
FROM users u
JOIN contacts c ON u.id = c.user_id
WHERE c.created_at >= NOW() - INTERVAL '24 hours'
GROUP BY u.id, u.username
ORDER BY contatos_recentes DESC;

-- 🛡️ 5. VERIFICAÇÕES DE INTEGRIDADE
-- ==================================

-- Verificar integridade referencial
SELECT 
    'Contatos órfãos' as tipo_problema,
    COUNT(*) as total
FROM contacts c
LEFT JOIN users u ON c.user_id = u.id
WHERE u.id IS NULL

UNION ALL

SELECT 
    'Logs órfãos' as tipo_problema,
    COUNT(*) as total
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
WHERE al.user_id IS NOT NULL AND u.id IS NULL;

-- Verificar UUIDs válidos
SELECT 
    'Usuários com UUID inválido' as tipo_problema,
    COUNT(*) as total
FROM users
WHERE id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'

UNION ALL

SELECT 
    'Contatos com UUID inválido' as tipo_problema,
    COUNT(*) as total
FROM contacts
WHERE id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- 📊 6. MÉTRICAS DE PERFORMANCE
-- =============================

-- Tamanho das tabelas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as tamanho_total,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as tamanho_dados
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Informações sobre índices
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexname::text)) as tamanho_indice
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexname::text) DESC;

-- 🔐 7. CONSULTAS DE DEMONSTRAÇÃO DE SEGURANÇA
-- =============================================

-- Mostrar que não conseguimos ver dados sensíveis descriptografados
SELECT 
    u.username as usuario,
    c.name as nome_contato,
    '***CRIPTOGRAFADO***' as email_protegido,
    '***CRIPTOGRAFADO***' as telefone_protegido,
    SUBSTRING(c.encrypted_data, 1, 50) || '...' as amostra_dados_criptografados,
    c.created_at
FROM contacts c
JOIN users u ON c.user_id = u.id
ORDER BY c.created_at DESC
LIMIT 5;

-- Verificar que senhas estão hasheadas de forma segura
SELECT 
    username,
    email,
    SUBSTRING(password_hash, 1, 20) || '...' as hash_senha_parcial,
    'bcrypt 12 rounds' as algoritmo_hash,
    LENGTH(password_hash) as tamanho_hash_completo
FROM users;

-- 📈 8. CONSULTA RESUMO EXECUTIVO
-- ===============================
SELECT 
    'Total de Usuários' as metrica,
    COUNT(*)::text as valor
FROM users

UNION ALL

SELECT 
    'Total de Contatos' as metrica,
    COUNT(*)::text as valor
FROM contacts

UNION ALL

SELECT 
    'Total de Logs de Auditoria' as metrica,
    COUNT(*)::text as valor
FROM audit_logs

UNION ALL

SELECT 
    'Usuários Ativos (já fizeram login)' as metrica,
    COUNT(*)::text as valor
FROM users
WHERE last_login IS NOT NULL

UNION ALL

SELECT 
    'Média de Contatos por Usuário' as metrica,
    ROUND(AVG(contact_count), 2)::text as valor
FROM (
    SELECT COUNT(c.id) as contact_count
    FROM users u
    LEFT JOIN contacts c ON u.id = c.user_id
    GROUP BY u.id
) subquery;

-- 🚀 9. CONSULTA PARA DEMONSTRAR CRIPTOGRAFIA
-- ============================================

-- Esta consulta mostra como os dados estão protegidos
SELECT 
    'Dados Visíveis no Banco' as categoria,
    'Nome do Contato' as campo,
    'Visível (não sensível)' as status
    
UNION ALL

SELECT 
    'Dados Visíveis no Banco' as categoria,
    'Email/Telefone/Empresa/Notas' as campo,
    'CRIPTOGRAFADOS (não visíveis)' as status
    
UNION ALL

SELECT 
    'Autenticação' as categoria,
    'Senhas dos Usuários' as campo,
    'HASHEADAS com bcrypt' as status;
