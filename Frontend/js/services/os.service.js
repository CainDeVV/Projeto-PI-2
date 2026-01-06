/* js/services/os.service.js */
import { BaseService } from '../core/BaseService.js';
import { MockDatabase } from '../core/MockDatabase.js';
import { AuthService } from './auth.service.js';
import { APP_CONFIG } from '../config/constants.js'; // Importante para checar o modo

class OsServiceClass extends BaseService {
    constructor() {
        super('os', 'Ordem de Serviço');
    }

    // --- LEITURA HIDRATADA (JOIN) ---
    async getAll() {
        // SE FOR API REAL: O Backend já deve retornar os dados com joins feitos (DTO)
        if (!APP_CONFIG.USE_MOCK_DATA) {
            return this.http.get();
        }

        // --- LÓGICA DO MOCK (JOIN MANUAL) ---
        const osList = await MockDatabase.get('os');
        const sectors = await MockDatabase.get('sectors');
        const equipments = await MockDatabase.get('equipments');
        const users = await MockDatabase.get('users');

        return osList.map(os => {
            // 1. Resolver Setor
            const sec = sectors.find(s => String(s.id) === String(os.id_setor));
            
            // 2. Resolver Equipamento
            const equipId = os.id_computador || os.id_impressora || os.equipamentoId;
            const equip = equipments.find(e => String(e.id) === String(equipId));
            
            // 3. RESOLVER SOLICITANTE (Quem pediu a O.S.)
            const solUser = users.find(u => String(u.id) === String(os.id_usuario_solicitante));
            const nomeSolicitante = solUser ? solUser.nome : (os.solicitante || 'Usuário Desconhecido');

            // 4. RESOLVER RESPONSÁVEL (Técnico que está atendendo)
            const tecUser = users.find(u => String(u.id) === String(os.id_usuario_responsavel));
            const nomeTecnico = tecUser ? tecUser.nome : '-';

            return {
                ...os,
                id: os.id,
                
                // Colunas da Tabela
                setor: sec ? sec.nome : 'N/A',
                equipamentoName: equip 
                    ? `${equip.tipo === 'computador' ? 'PC' : 'IMP'} - ${equip.modelo}` 
                    : (os.equipamentoName || 'Genérico'),
                
                equipamentoSala: equip && equip.sala ? equip.sala : '-',
                descricao: os.descricao_problema || os.descricao,
                
                solicitante: nomeSolicitante,
                responsavel: nomeTecnico,
                
                dataAbertura: os.data_abertura || os.dataAbertura,
                dataFechamento: os.data_fechamento || os.dataFechamento,
                
                status: os.status,
                solucao: os.solucao
            };
        });
    }

    // --- ESCRITA ---
    async add(osData) {
        const payload = {
            ...osData,
            descricao_problema: osData.descricao,
            data_abertura: osData.dataAbertura,
            status: 'Aberto',
            
            // IDs
            id_setor: osData.id_setor,
            id_usuario_solicitante: osData.id_usuario_solicitante,
            id_usuario_responsavel: null, // Nova OS começa sem técnico
            
            id_computador: osData.id_computador,
            id_impressora: osData.id_impressora
        };
        
        // CORREÇÃO: Usa this.save() para abstrair Mock/API
        return await this.save(payload);
    }

    async update(id, osData) {
        const payload = { ...osData };
        
        if(osData.descricao) payload.descricao_problema = osData.descricao;
        if(osData.dataAbertura) payload.data_abertura = osData.dataAbertura;
        if(osData.dataFechamento) payload.data_fechamento = osData.dataFechamento;
        
        if(osData.id_usuario_responsavel !== undefined) {
            payload.id_usuario_responsavel = osData.id_usuario_responsavel;
        }

        // CORREÇÃO: Usa this.save() e garante o ID no objeto
        return await this.save({ ...payload, id });
    }

    async toggleStatus(id) {
        const item = await this.getById(id);
        if (!item) return null;
        
        const novoStatus = item.status === 'Aberto' ? 'Fechado' : 'Aberto';
        const closeDate = novoStatus === 'Fechado' ? new Date().toISOString() : null;
        
        let updateData = {
            status: novoStatus, 
            data_fechamento: closeDate
        };

        // Lógica: Ao FECHAR, o usuário logado vira o RESPONSÁVEL (se já não tiver um)
        if (novoStatus === 'Fechado') {
            const currentUser = AuthService.getUser();
            updateData.solucao = `Concluído por ${currentUser ? currentUser.nome : 'Sistema'}.`;
            
            if (!item.id_usuario_responsavel && currentUser) {
                updateData.id_usuario_responsavel = currentUser.id;
            }
        } else {
            updateData.solucao = ''; 
        }

        await this.update(id, updateData);
        return { ...item, ...updateData };
    }

    async getByUser(userIdOrName) {
        const all = await this.getAll();
        // Filtra onde o usuário é o solicitante OU o responsável
        return all.filter(os => 
            String(os.id_usuario_solicitante) === String(userIdOrName) || 
            String(os.id_usuario_responsavel) === String(userIdOrName) ||
            os.solicitante === userIdOrName 
        );
    }
}

export const OsService = new OsServiceClass();