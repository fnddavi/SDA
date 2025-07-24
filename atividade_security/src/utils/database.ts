import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'security_app',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 20, // máximo de conexões no pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Classe para gerenciar conexões com o banco
export class Database {
    static pool = pool;

    /**
     * Executa uma query no banco de dados
     */
    static async query(text: string, params?: any[]): Promise<any> {
        const start = Date.now();
        try {
            const result = await pool.query(text, params);
            const duration = Date.now() - start;
            
            console.log('Executed query', { 
                text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
                duration, 
                rows: result.rowCount 
            });
            
            return result;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }

    /**
     * Inicia uma transação
     */
    static async beginTransaction() {
        const client = await pool.connect();
        await client.query('BEGIN');
        return client;
    }

    /**
     * Confirma uma transação
     */
    static async commitTransaction(client: any) {
        await client.query('COMMIT');
        client.release();
    }

    /**
     * Desfaz uma transação
     */
    static async rollbackTransaction(client: any) {
        await client.query('ROLLBACK');
        client.release();
    }

    /**
     * Verifica se a conexão com o banco está funcionando
     */
    static async testConnection(): Promise<boolean> {
        try {
            await pool.query('SELECT NOW()');
            console.log('✅ Conexão com o banco de dados estabelecida com sucesso');
            return true;
        } catch (error) {
            console.error('❌ Erro ao conectar com o banco de dados:', error);
            return false;
        }
    }

    /**
     * Fecha todas as conexões do pool
     */
    static async closePool(): Promise<void> {
        await pool.end();
        console.log('Pool de conexões fechado');
    }
}

// Event handlers para o pool
pool.on('connect', () => {
    console.log('Nova conexão estabelecida com o banco');
});

pool.on('error', (err, client) => {
    console.error('Erro inesperado no cliente do banco:', err);
    process.exit(-1);
});

export default Database;
