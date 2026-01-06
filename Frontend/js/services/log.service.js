/* js/services/log.service.js */
import { BaseService } from '../core/BaseService.js';
import { AuthService } from './auth.service.js';

class LogServiceClass extends BaseService {
    constructor() {
        super('logs', null); 
    }

    async add(action, resource, details) {
        const currentUser = AuthService.getUser();
        
        // Dados para salvar
        const userName = currentUser && currentUser.nome ? currentUser.nome : 'Sistema';
        const userId = currentUser && currentUser.id ? currentUser.id : null;

        const logEntry = {
            data_hora: new Date().toISOString(), // SQL: data_hora
            
            // Campos de Texto
            acao: action,       // SQL: acao
            recurso: resource,  // SQL: recurso
            detalhes: details,  // SQL: detalhes
            
            // Dados do Usuário (Para preencher a tabela corretamente)
            usuario_nome: userName, // SQL: usuario_nome
            id_usuario: userId      // SQL: id_usuario (Foreign Key)
        };

        await this.save(logEntry);
    }

    async getRecent() {
        const logs = await this.getAll();
        // Mapeia data_hora (SQL) para date (Frontend) se necessário, ou ajusta o config
        return logs.map(l => ({
            ...l,
            date: l.data_hora, 
            user: l.usuario_nome,
            action: l.acao,
            resource: l.recurso,
            details: l.detalhes
        })).sort((a, b) => new Date(b.date) - new Date(a.date));
    }
}

export const LogService = new LogServiceClass();