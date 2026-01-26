/* js/services/error_log.service.js */
import { BaseService } from '../core/BaseService.js';

class ErrorLogServiceClass extends BaseService {
    constructor() {
        super('log_erros', 'Log de Erros');
    }

    async getActiveErrors() {
        try {
            // this.http.get() já busca na API real
            const errors = await this.http.get();
            
            // Filtro de resolvido no cliente (idealmente seria no backend)
            const activeErrors = errors.filter(e => e.resolvido === false);

            return activeErrors.map(err => {
                let equipName = 'Desconhecido';
                let equipSala = '-';
                let equipId = null;

                if (err.computador) {
                    equipName = `PC - ${err.computador.modelo}`;
                    equipSala = err.computador.sala;
                    equipId = err.computador.id;
                } else if (err.impressora) {
                    equipName = `IMP - ${err.impressora.modelo}`;
                    equipSala = err.impressora.sala;
                    equipId = err.impressora.id;
                }

                return {
                    ...err,
                    equipamentoNome: equipName,
                    equipamentoSala: equipSala,
                    id_equipamento_alvo: equipId,
                    data_hora: err.dataHora || err.data_hora
                };
            }).sort((a, b) => {
                const priority = { 'Crítico': 0, 'Alerta': 1, 'Info': 2 };
                const pA = priority[a.severidade] !== undefined ? priority[a.severidade] : 99;
                const pB = priority[b.severidade] !== undefined ? priority[b.severidade] : 99;
                return pA - pB;
            });
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async resolveError(id) {
        // Envia apenas o campo resolvido para o backend via PUT
        return await this.save({ id, resolvido: true });
    }
}

export const ErrorLogService = new ErrorLogServiceClass();