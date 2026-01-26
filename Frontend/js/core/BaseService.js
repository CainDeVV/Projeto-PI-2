/* js/core/BaseService.js */
import { HttpClient } from './HttpClient.js';

export class BaseService {
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

        if (this.resourceLabel) {
            itemLabel = item.modelo || item.serie || item.nome || item.descricao || 'Item';
        }

        if (isUpdate) {
            result = await this.http.put(item.id, item);
        } else {
            result = await this.http.post(item);
        }

        // Grava Log (Apenas se salvar com sucesso)
        if (this.resourceLabel) {
            await this._logAction(
                isUpdate ? 'UPDATE' : 'CREATE', 
                `${isUpdate ? 'Editou' : 'Criou'} ${itemLabel}`
            );
        }

        return result;
    }

    async delete(id) {
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