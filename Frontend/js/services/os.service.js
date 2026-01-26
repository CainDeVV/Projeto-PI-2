/* js/services/os.service.js */
import { BaseService } from '../core/BaseService.js';
import { AuthService } from './auth.service.js';

class OsServiceClass extends BaseService {
    constructor() {
        super('ordens-servico', 'Ordem de Serviço');
    }

    // --- HELPER: Traduz Java -> Frontend ---
    _mapToFrontend(os) {
        const setorNome = os.setor ? os.setor.nome : 'N/A';
        let equipName = 'Genérico';
        let equipSala = '-';

        if (os.computador) {
            equipName = `PC - ${os.computador.modelo}`;
            equipSala = os.computador.sala;
        } else if (os.impressora) {
            equipName = `IMP - ${os.impressora.modelo}`;
            equipSala = os.impressora.sala;
        }

        return {
            ...os,
            id: os.id,
            
            // Visuais
            setor: setorNome,
            equipamentoName: equipName,
            equipamentoSala: equipSala,
            solicitante: os.solicitante ? os.solicitante.nome : 'Desconhecido',
            responsavel: os.responsavel ? os.responsavel.nome : '-',

            // Formulário (Edição)
            descricao: os.descricaoProblema || os.descricao,
            
            // IDs para os <select>
            id_setor: os.setor ? os.setor.id : null,
            id_usuario_solicitante: os.solicitante ? os.solicitante.id : null,
            id_usuario_responsavel: os.responsavel ? os.responsavel.id : null,
            id_computador: os.computador ? os.computador.id : null,
            id_impressora: os.impressora ? os.impressora.id : null
        };
    }

    // --- LEITURAS ---
    async getAll() {
        try {
            const list = await this.http.get();
            return list.map(os => this._mapToFrontend(os));
        } catch (e) { return []; }
    }

    async getById(id) {
        try {
            const os = await this.http.get(id);
            return this._mapToFrontend(os);
        } catch (e) { return null; }
    }

    // --- ESCRITA (CRIAÇÃO E ATUALIZAÇÃO) ---
    async save(data) {
        // Formata para o Java (Objetos Aninhados)
        const payload = {
            id: data.id,
            titulo: "Chamado via Sistema",
            descricaoProblema: data.descricao || data.descricaoProblema,
            prioridade: "Media",
            status: data.status || "Aberto",
            dataFechamento: data.dataFechamento,
            solucao: data.solucao,
            
            // Relacionamentos Obrigatórios
            setor: { id: parseInt(data.id_setor) },
            solicitante: { id: parseInt(data.id_usuario_solicitante) }
        };

        if (data.id_usuario_responsavel) {
            payload.responsavel = { id: parseInt(data.id_usuario_responsavel) };
        }

        if (data.id_computador) {
            payload.computador = { id: parseInt(data.id_computador) };
        } else if (data.id_impressora) {
            payload.impressora = { id: parseInt(data.id_impressora) };
        }

        return await super.save(payload);
    }

    // Helpers
    async add(d) { return this.save(d); }
    async update(id, d) { return this.save({ ...d, id }); }

    async toggleStatus(id) {
        const item = await this.getById(id);
        if(!item) return;
        
        if (item.status === 'Aberto') {
            const user = AuthService.getUser();
            await fetch(`${this.http.apiBase}/ordens-servico/${id}/finalizar`, {
                method: 'PUT',
                headers: this.http._getHeaders(),
                body: JSON.stringify({ solucao: `Fechado por ${user ? user.nome : 'Sistema'}` })
            });
        } else {
            await this.save({ 
                id, status: 'Aberto', dataFechamento: null, solucao: null,
                id_setor: item.id_setor, id_usuario_solicitante: item.id_usuario_solicitante
            });
        }
    }

    async getByUser(name) {
        const all = await this.getAll();
        return all.filter(os => os.solicitante === name || os.responsavel === name);
    }
}

export const OsService = new OsServiceClass();