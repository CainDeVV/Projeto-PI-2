/* js/services/usuarios.service.js */
import { BaseService } from '../core/BaseService.js';
import { EquipamentoService } from './equipamento.service.js';

class UsuariosServiceClass extends BaseService {
    constructor() {
        super('usuarios', 'Usuário');
    }

    // Transforma os dados do Java em um formato simples para o HTML
    _normalize(user) {
        if (!user) return null;

        // 1. Resolve o nome visual do setor
        let nomeSetor = 'N/A';
        if (user.setor) {
            nomeSetor = user.setor.nome || user.setor;
        } else if (user.nomeSetor) {
            nomeSetor = user.nomeSetor;
        }

        const setorId = (user.setor && user.setor.id) ? user.setor.id : user.id_setor;

        return {
            ...user,
            id: user.id,
            nome: user.nome,
            email: user.email || user.login || '-',
            tipo: user.tipo || user.tipoPerfil || 'Comum',
            setor: nomeSetor,
            
            id_setor: setorId
        };
    }

    // --- LEITURA LISTA (GetAll) ---
    async getAll() {
        try {
            const response = await this.http.get();
            return response.map(user => this._normalize(user));
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            return [];
        }
    }

    // --- LEITURA ÚNICA (GetById) ---
    async getById(id) {
        try {
            const user = await this.http.get(id);
            return this._normalize(user);
        } catch (error) {
            console.error("Erro ao buscar usuário por ID:", error);
            return null;
        }
    }

    async getBySector(sectorName) {
        const all = await this.getAll();
        return all.filter(u => u.setor === sectorName);
    }

    // Verifica se pode excluir (Regra de Negócio)
    async checkDependencies(id) {
        const userToDelete = await this.getById(id);
        if (!userToDelete) return { allowed: true };

        const allEquipments = await EquipamentoService.getAll();
        
        const hasEquipment = allEquipments.some(eq => 
            (eq.usuario && eq.usuario === userToDelete.nome) || 
            String(eq.id_usuario) === String(id)
        );

        if (hasEquipment) {
            return { 
                allowed: false, 
                message: 'Este usuário possui equipamentos vinculados. Transfira-os antes de excluir.' 
            };
        }
        
        return { allowed: true };
    }
}

export const UsuariosService = new UsuariosServiceClass();