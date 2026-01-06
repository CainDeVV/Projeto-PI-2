/* js/services/usuarios.service.js */
import { BaseService } from '../core/BaseService.js';
import { EquipamentoService } from './equipamento.service.js';
import { MockDatabase } from '../core/MockDatabase.js';
import { APP_CONFIG } from '../config/constants.js'; // Importante para verificar o modo

class UsuariosServiceClass extends BaseService {
    constructor() {
        super('users', 'Usuário');
    }

    // --- LEITURA HIDRATADA (JOIN) ---
    async getAll() {
        // SE FOR API REAL: Retorna direto (Backend entrega DTO pronto)
        if (!APP_CONFIG.USE_MOCK_DATA) {
            return this.http.get();
        }

        // --- LÓGICA DO MOCK (JOIN MANUAL) ---
        const users = await MockDatabase.get('users');
        const sectors = await MockDatabase.get('sectors');

        return users.map(user => {
            // Busca o setor onde o ID bate
            const sectorObj = sectors.find(s => String(s.id) === String(user.id_setor));
            
            return {
                ...user,
                // Campo 'setor' vira o Nome (para a coluna da tabela)
                setor: sectorObj ? sectorObj.nome : 'N/A', 
                // Mantém 'id_setor' original para edição
                id_setor: user.id_setor
            };
        });
    }

    // --- ESCRITA (Padronizada via BaseService) ---
    
    async add(userData) {
        // Recebe { nome, cpf, senha, tipo, id_setor }
        // this.save lida com a decisão Mock vs API
        return await this.save(userData);
    }

    async update(id, userData) {
        // Garante envio do ID para ser tratado como PUT
        return await this.save({ ...userData, id });
    }

    // --- MANUTENÇÃO / FILTROS ---
    
    async getBySector(sectorName) {
        // Filtra os usuários que, após a hidratação, possuem esse nome de setor
        const all = await this.getAll();
        return all.filter(u => u.setor === sectorName);
    }

    // Verifica se pode excluir (Regra de Negócio)
    async checkDependencies(id) {
        const userToDelete = await this.getById(id);
        if (!userToDelete) return { allowed: true };

        const allEquipments = await EquipamentoService.getAll();
        
        // Verifica se existe algum equipamento vinculado a este usuário.
        // Checagem Híbrida:
        // 1. Pelo Nome (eq.usuario) -> Como o Mock atual funciona
        // 2. Pelo ID (eq.id_usuario) -> Como o Banco Relacional funciona
        const hasEquipment = allEquipments.some(eq => 
            eq.usuario === userToDelete.nome || 
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