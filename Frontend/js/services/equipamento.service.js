/* js/services/equipamento.service.js */
import { BaseService } from '../core/BaseService.js';
import { MockDatabase } from '../core/MockDatabase.js';
import { APP_CONFIG } from '../config/constants.js'; // Importante para verificar o modo

class EquipamentoServiceClass extends BaseService {
    constructor() {
        super('equipments', 'Equipamento');
    }

    // --- LEITURA HIDRATADA (JOIN) ---
    async getAll() {
        // SE FOR API REAL: O Backend já deve retornar os dados com joins feitos (DTO)
        if (!APP_CONFIG.USE_MOCK_DATA) {
            return this.http.get();
        }

        // --- LÓGICA DO MOCK (JOIN MANUAL) ---
        const equips = await MockDatabase.get('equipments');
        const sectors = await MockDatabase.get('sectors');
        const users = await MockDatabase.get('users');

        const hydratedData = equips.map(eq => {
            const sec = sectors.find(s => String(s.id) === String(eq.id_setor));
            
            // Resolve Usuário
            let userName = eq.usuario || '-'; 
            if (eq.id_usuario) {
                const u = users.find(user => String(user.id) === String(eq.id_usuario));
                if (u) userName = u.nome;
            }

            return {
                ...eq,
                // Nome para exibir na tabela
                setor: sec ? sec.nome : 'N/A',
                // Nome do usuário resolvido
                usuario: userName,
                
                // IDs mantidos para formulários
                id_setor: eq.id_setor,
                id_usuario: eq.id_usuario
            };
        });

        // Ordenação (Computadores primeiro)
        return hydratedData.sort((a, b) => {
            if (a.tipo === b.tipo) return 0;
            return a.tipo === 'computador' ? -1 : 1;
        });
    }

    // --- ESCRITA ---
    async add(data) {
        return await this.save(data); // Usa o método save do BaseService
    }

    async update(id, data) {
        // Garante que o ID esteja no objeto para o save() identificar que é update
        return await this.save({ ...data, id });
    }

    // --- FILTROS ---
    async getBySector(sectorName) {
        const data = await this.getAll();
        return data.filter(e => e.setor === sectorName);
    }

    async getPrintersByParentId(parentId) {
        const data = await this.getAll();
        return data.filter(e => e.tipo === 'impressora' && String(e.connectedTo) === String(parentId));
    }

    // --- HISTÓRICO DE ERROS ---
    async getErrorHistory(equipId) {
        // Se for API Real, chamaria algo como /api/equipments/{id}/errors
        if (!APP_CONFIG.USE_MOCK_DATA) {
            return this.http.http.get(`${this.endpoint}/${equipId}/errors`); 
            // Nota: Acessei this.http.http porque o wrapper BaseService encapsula o HttpClient
            // Mas idealmente o HttpClient teria um método request genérico.
            // Para simplificar aqui, vamos assumir que o MockDatabase lida com isso.
        }

        const allErrors = await MockDatabase.get('log_erros');
        
        return allErrors.filter(err => 
            String(err.id_computador) === String(equipId) || 
            String(err.id_impressora) === String(equipId)
        ).sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora));
    }

    // --- VERIFICAÇÕES DE INTEGRIDADE ---
    async checkDependencies(id) {
        const childPrinters = await this.getPrintersByParentId(id);
        
        if (childPrinters.length > 0) {
            return {
                allowed: false,
                message: `Possui ${childPrinters.length} impressora(s) conectada(s).`
            };
        }

        // Import dinâmico para evitar dependência circular
        const { OsService } = await import('./os.service.js');
        const allOs = await OsService.getAll();
        
        const hasOpenOs = allOs.some(os => 
            (String(os.id_computador) === String(id) || String(os.id_impressora) === String(id)) 
            && os.status === 'Aberto'
        );

        if (hasOpenOs) {
            return {
                allowed: false,
                message: 'Existe O.S. ABERTA para este equipamento.'
            };
        }

        return { allowed: true };
    }
}

export const EquipamentoService = new EquipamentoServiceClass();