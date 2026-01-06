/* js/core/BaseService.js */
import { HttpClient } from './HttpClient.js';
// Não importamos mais database.js nem constants.js aqui!

export class BaseService {
    /**
     * @param {string} endpoint - O nome do recurso na API (ex: 'users')
     * @param {string} resourceLabel - Nome legível para Logs (ex: 'Usuário')
     */
    constructor(endpoint, resourceLabel = null) {
        this.http = new HttpClient(endpoint);
        this.resourceLabel = resourceLabel;
    }

    async getAll() {
        return this.http.get();
    }

    async getById(id) {
        return this.http.get(id);
    }

    async save(item) {
        let result;
        const isUpdate = !!item.id;
        let itemLabel = 'Item';

        // Lógica de Log (Nome do item)
        if (this.resourceLabel) {
            // Se for update, tenta pegar o nome antigo, senão usa o do item atual
            itemLabel = item.modelo || item.serie || item.nome || item.descricao || 'Item';
        }

        // --- AQUI A MÁGICA ACONTECE ---
        // Não importa se é Mock ou Real, o método é o mesmo
        if (isUpdate) {
            result = await this.http.put(item.id, item);
        } else {
            result = await this.http.post(item);
        }

        // Grava Log (Ainda no Frontend por enquanto, mas centralizado)
        if (this.resourceLabel) {
            await this._logAction(
                isUpdate ? 'UPDATE' : 'CREATE', 
                `${isUpdate ? 'Editou' : 'Criou'} ${itemLabel}`
            );
        }

        return result;
    }

    async delete(id) {
        // Pega o item antes de deletar para poder logar o nome
        let itemLabel = 'Item';
        try {
            const item = await this.getById(id);
            if (item) itemLabel = item.modelo || item.serie || item.nome || 'Item';
        } catch(e) {}

        const success = await this.http.delete(id);

        if (success && this.resourceLabel) {
            await this._logAction('DELETE', `Excluiu ${itemLabel}`);
        }

        return success;
    }

    // Hook de Integridade (Mantido do passo anterior)
    async checkDependencies(id) {
        return { allowed: true };
    }

    async _logAction(action, details) {
        try {
            const { LogService } = await import('../services/log.service.js');
            await LogService.add(action, this.resourceLabel, details);
        } catch (e) {
            console.error("Erro ao gravar log:", e);
        }
    }
}