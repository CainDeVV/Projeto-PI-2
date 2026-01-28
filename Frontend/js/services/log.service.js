/* js/services/log.service.js */
import { BaseService } from '../core/BaseService.js';
import { AuthService } from './auth.service.js';

class LogServiceClass extends BaseService {
    constructor() {
        super('logs', null); 
    }

    async add(action, resource, details) {
        const currentUser = AuthService.getUser();
        
        const userName = currentUser && currentUser.nome ? currentUser.nome : 'Sistema';
        const userId = currentUser && currentUser.id ? parseInt(currentUser.id) : null;

        const logEntry = {
            // Java: dataHora (Não data_hora)
            dataHora: new Date().toISOString(), 
            
            // Java: acao, recurso, detalhes (Iguais, ok)
            acao: action,
            recurso: resource,
            detalhes: details,
            
            // Java: usuarioNome (Não usuario_nome)
            usuarioNome: userName, 
            
            // Java: usuario (Objeto com ID) - Não id_usuario solto
            usuario: userId ? { id: userId } : null
        };

        await this.save(logEntry);
    }

    async getRecent() {
        try {
            const logs = await this.getAll(); // Já vem ordenado do Backend agora
            
            // Mapeia do Java (CamelCase) para a Tabela (keys do config)
            return logs.map(l => ({
                ...l,
                date: l.dataHora, 
                user: l.usuarioNome || (l.usuario ? l.usuario.nome : 'Sistema'),
                action: l.acao,
                resource: l.recurso,
                details: l.detalhes
            }));
        } catch (error) {
            console.error(error);
            return [];
        }
    }
}

export const LogService = new LogServiceClass();