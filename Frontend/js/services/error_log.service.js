/* js/services/error_log.service.js */
import { BaseService } from '../core/BaseService.js';
import { MockDatabase } from '../core/MockDatabase.js';
import { APP_CONFIG } from '../config/constants.js';

class ErrorLogServiceClass extends BaseService {
    constructor() {
        super('log_erros', 'Log de Erros');
    }

    async getActiveErrors() {
        if (!APP_CONFIG.USE_MOCK_DATA) {
            // API Real: GET /api/log_erros?active=true (Exemplo)
            // Aqui assumimos que o getAll da API já retorna o necessário ou filtramos depois
            const errors = await this.http.get(); 
            return errors.filter(e => e.resolvido === false); // Filtro no cliente por garantia
        }

        // --- LÓGICA DO MOCK ---
        const errors = await MockDatabase.get('log_erros');
        const equipments = await MockDatabase.get('equipments');

        // 1. Filtra apenas NÃO RESOLVIDOS
        const activeErrors = errors.filter(e => e.resolvido === false);

        // 2. Hidratação (Join)
        const enriched = activeErrors.map(err => {
            const equipId = err.id_computador || err.id_impressora;
            const equip = equipments.find(e => String(e.id) === String(equipId));

            return {
                ...err,
                equipamentoNome: equip ? `${equip.tipo.toUpperCase()} - ${equip.modelo}` : 'Desconhecido',
                equipamentoSala: equip ? equip.sala : '-',
                id_equipamento_alvo: equipId
            };
        });

        // 3. Ordenação (Crítico > Alerta > Info)
        const priority = { 'Crítico': 0, 'Alerta': 1, 'Info': 2 };
        
        return enriched.sort((a, b) => {
            const pA = priority[a.severidade] !== undefined ? priority[a.severidade] : 99;
            const pB = priority[b.severidade] !== undefined ? priority[b.severidade] : 99;
            
            if (pA === pB) {
                return new Date(b.data_hora) - new Date(a.data_hora);
            }
            return pA - pB;
        });
    }

    // --- NOVO MÉTODO CENTRALIZADO ---
    async resolveError(id) {
        if (APP_CONFIG.USE_MOCK_DATA) {
            // Lógica Mock: Atualiza LocalStorage
            const errors = await MockDatabase.get('log_erros');
            const index = errors.findIndex(e => String(e.id) === String(id));
            if (index !== -1) {
                errors[index].resolvido = true;
                localStorage.setItem('app_log_erros', JSON.stringify(errors));
                
                // Opcional: Logar auditoria
                this._logAction('UPDATE', `Erro #${id} marcado como resolvido manualmente.`);
                return true;
            }
            return false;
        } else {
            // Lógica API Real: PUT /api/log_erros/{id}/resolve
            // O BaseService não tem um método customizado genérico, então usamos o put parcial ou endpoint específico
            // Aqui simulamos um update parcial enviando apenas o campo resolvido
            return await this.save({ id, resolvido: true });
        }
    }
}

export const ErrorLogService = new ErrorLogServiceClass();