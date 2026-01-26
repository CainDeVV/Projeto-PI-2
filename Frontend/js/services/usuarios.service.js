/* js/services/usuarios.service.js */
import { BaseService } from '../core/BaseService.js';
import { EquipamentoService } from './equipamento.service.js';

class UsuariosServiceClass extends BaseService {
    constructor() {
        super('usuarios', 'Usuário');
    }

    // --- LEITURA HIDRATADA (JOIN) ---
    async getAll() {
        try {
            // this.http.get() bate em /usuarios
            const response = await this.http.get();

            return response.map(user => {
                // Tenta resolver o nome do setor vindo do Java
                let nomeSetor = 'N/A';
                
                if (user.setor) {
                    nomeSetor = user.setor.nome || user.setor;
                } else if (user.nomeSetor) {
                    nomeSetor = user.nomeSetor;
                }

                return {
                    ...user,
                    id: user.id,
                    nome: user.nome,
                    email: user.email || user.login || '-',
                    tipo: user.tipo || user.tipoPerfil || 'Comum',
                    setor: nomeSetor,
                    // Mantém objeto original para edição
                    id_setor: (user.setor && user.setor.id) ? user.setor.id : user.id_setor
                };
            });
        } catch (error) {
            console.error("Erro ao buscar usuários da API:", error);
            return [];
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