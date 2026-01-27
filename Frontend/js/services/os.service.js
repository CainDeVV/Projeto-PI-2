/* js/services/os.service.js */
import { BaseService } from '../core/BaseService.js';
import { AuthService } from './auth.service.js';
import { APP_CONFIG } from '../config/constants.js'; 

class OsServiceClass extends BaseService {
    constructor() {
        super('ordens-servico', 'Ordem de Serviço'); 
    }

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

    // --- ESCRITA ---
    async save(data) {
        const payload = {
            id: data.id,
            titulo: "Chamado via Sistema",
            descricaoProblema: data.descricao || data.descricaoProblema,
            prioridade: data.prioridade || "Media",
            status: data.status || "Aberto",
            
            dataAbertura: new Date().toISOString(),
            dataFechamento: data.dataFechamento,
            solucao: data.solucao,
            
            setor: { id: parseInt(data.id_setor || 0) },
            solicitante: { id: parseInt(data.id_usuario_solicitante || 0) }
        };

        // Opcionais
        if (data.id_usuario_responsavel) {
            payload.responsavel = { id: parseInt(data.id_usuario_responsavel) };
        }

        // Lógica PC vs Impressora
        if (data.id_computador) {
            payload.computador = { id: parseInt(data.id_computador) };
            payload.impressora = null;
        } else if (data.id_impressora) {
            payload.impressora = { id: parseInt(data.id_impressora) };
            payload.computador = null;
        }

        return await super.save(payload); 
    }

    // Helpers
    async add(d) { return this.save(d); }
    async update(id, d) { return this.save({ ...d, id }); }

    //  AÇÃO ESPECIAL: FECHAR/REABRIR 
    async toggleStatus(id) {
        const item = await this.getById(id);
        if(!item) return;
        
        const novoStatus = item.status === 'Aberto' ? 'Fechado' : 'Aberto';
        
        if (novoStatus === 'Fechado') {
            const currentUser = AuthService.getUser();
            

            const url = `${APP_CONFIG.API_BASE_URL}/${this.endpoint}/${id}/finalizar`;

            await fetch(url, {
                method: 'PUT',
                headers: this.http._getHeaders(),
                body: JSON.stringify({ 
                    solucao: `Fechado via Painel por ${currentUser ? currentUser.nome : 'Sistema'}` 
                })
            });

            this._logAction('UPDATE', `Finalizou a O.S. #${id}`);

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