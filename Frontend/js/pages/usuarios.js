/* js/pages/usuarios.js */
import { BaseListPage } from '../core/BaseListPage.js';
import { UsuariosService } from '../services/usuarios.service.js';
import { USERS_TABLE_CONFIG } from '../config/usuarios.config.js';
import { setupInputMasks } from '../components/inputs.js';
import { ROUTES } from '../services/navigation.service.js';
import { AuthService } from '../services/auth.service.js';
import { showToast } from '../components/toast.js';

class UsuariosPage extends BaseListPage {
    constructor() {
        super({
            listElementId: 'users-list',
            emptyStateId: 'empty-state',
            service: UsuariosService,
            tableConfig: USERS_TABLE_CONFIG,
            pageName: 'users',
            addPageUrl: ROUTES.USERS_FORM,
            deleteMessageFn: (item) => `Tem certeza que deseja excluir <strong>${item.nome}</strong>?`
        });
        
        this.currentUser = AuthService.getUser();
    }

    async init() {
        await super.init();
        setupInputMasks();
        // Não precisamos mais chamar applySecurityPatch aqui
    }

    // --- OTIMIZAÇÃO: Sobrescrita Limpa (Override) ---
    
    // O Pai (BaseListPage) chama este método automaticamente quando clicam em "Editar"
    handleEdit(item) {
        // 1. Verificação de Segurança
        if (!this.checkPermission(item)) {
            return; // Se não tiver permissão, para aqui. Não navega.
        }

        // 2. Se passou na segurança, chama o comportamento padrão do pai (Navegar)
        super.handleEdit(item);
    }

    // O Pai chama este método automaticamente quando clicam em "Excluir"
    handleDelete(item) {
        // 1. Verificação de Segurança
        if (!this.checkPermission(item)) {
            return;
        }

        // 2. Se passou, chama o comportamento padrão do pai (Modal de confirmação + Exclusão)
        super.handleDelete(item);
    }

    // --- LÓGICA DE NEGÓCIO (Permissões) ---
    checkPermission(targetUser) {
        if (!this.currentUser) return false;

        const myRole = (this.currentUser.tipo || '').toLowerCase();
        const targetRole = (targetUser.tipo || '').toLowerCase();
        
        // Admin pode tudo
        if (myRole.includes('admin')) return true;

        // Técnico só mexe em usuários comuns
        if (myRole.includes('técnico') || myRole.includes('tecnico')) {
            if (targetRole.includes('usuário') || targetRole.includes('comum')) {
                return true;
            }
            showToast('Acesso Negado: Técnicos gerenciam apenas Usuários Comuns.', 'error');
            return false;
        }

        return false;
    }
}

new UsuariosPage().init();