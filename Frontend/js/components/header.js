/* js/components/header.js */
import { ROUTES } from '../services/navigation.service.js';
import { DOMUtils } from '../utils.js'; 
import { AuthService } from '../services/auth.service.js'; 

export class HeaderComponent {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.activePage = 'users';
        this.onResetCallback = null;
    }

    render(onResetCallback, activePage = 'users') {
        this.onResetCallback = onResetCallback;
        this.activePage = activePage;
        
        // 1. Gera os itens de navegação baseados no usuário
        const navContent = this._generateNavContent();

        // 2. Renderiza a estrutura do Header
        this.container.innerHTML = `
            <div class="header-left">
                <button class="btn-mobile-toggle" id="btn-menu-toggle"><i class="fas fa-bars"></i></button>
                <div class="logo-circle" id="btn-logo" title="Ir para Menu Principal"></div>
                
                <nav class="nav-menu">
                    ${navContent}
                </nav>

                <div class="search-container">
                    <input type="text" id="search-input" placeholder="Pesquisar..." autocomplete="off">
                    <i class="fas fa-times search-close-btn" id="btn-close-search" title="Fechar"></i>
                </div>
            </div>
            
            <div class="header-right">
                <button id="btn-logout-header" class="btn-action" title="Sair" style="color: white; border: 1px solid rgba(255,255,255,0.3); margin-right: 10px;">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
                <div id="header-actions" style="display:flex; gap:10px;"></div>
            </div>
        `;

        // 3. Inicializa eventos e botões
        this._bindEvents();
        this.updateButtons('default');
    }

    // Helper para gerar HTML dos links
    _generateNavContent() {
        const user = AuthService.getUser();
        const isCommonUser = user && (user.tipo === 'Comum' || user.tipo === 'Usuário Comum');
        
        const getClass = (page) => this.activePage === page ? 'active' : '';
        const createLink = (route, pageName, icon, label) => 
            `<a href="${route}" class="nav-item ${getClass(pageName)}"><i class="fas ${icon}"></i> ${label}</a>`;

        if (isCommonUser) {
            return createLink(ROUTES.USER_PANEL, 'history', 'fa-history', 'Histórico');
        }

        // Menu Admin/Técnico - ORDEM ATUALIZADA
        // 1. Visão Geral (Dashboard)
        // 2. NOC (Monitoramento)
        // 3. Equipamento
        // 4. O.S.
        // 5. Usuários
        // 6. Setores
        // 7. Log
        return `
            ${createLink(ROUTES.DASHBOARD, 'dashboard', 'fa-chart-pie', 'Visão Geral')}
            ${createLink(ROUTES.MONITORING, 'monitoramento', 'fa-heartbeat', 'NOC')}
            ${createLink(ROUTES.EQUIPMENT_LIST, 'equipment', 'fa-laptop', 'Equipamento')}
            ${createLink(ROUTES.OS_LIST, 'os', 'fa-tools', 'O.S.')}
            ${createLink(ROUTES.USERS_LIST, 'users', 'fa-users', 'Usuários')}
            ${createLink(ROUTES.SECTORS_LIST, 'sectors', 'fa-layer-group', 'Setores')}
            ${createLink(ROUTES.LOGS_LIST, 'logs', 'fa-history', 'Log')}
        `;
    }

    _bindEvents() {
        const btnLogo = this.container.querySelector('#btn-logo');
        if (btnLogo) btnLogo.onclick = this.onResetCallback;

        const btnLogout = this.container.querySelector('#btn-logout-header');
        if (btnLogout) btnLogout.onclick = () => AuthService.logout();

        // Toggle Sidebar Mobile
        const btnMenu = this.container.querySelector('#btn-menu-toggle');
        if (btnMenu) {
            btnMenu.onclick = (e) => {
                e.stopPropagation();
                document.getElementById('app-sidebar')?.classList.toggle('sidebar-open');
                document.body.classList.toggle('menu-active');
            };
        }

        // Toggle Pesquisa
        const closeSearch = this.container.querySelector('#btn-close-search');
        if (closeSearch) {
            closeSearch.onclick = (e) => {
                e.preventDefault();
                this.toggleSearchMode(false);
                const input = this.container.querySelector('#search-input');
                if (input) {
                    input.value = '';
                    input.dispatchEvent(new Event('input'));
                }
                if (this.onResetCallback) this.onResetCallback();
            };
        }

        // Fechar menu ao clicar fora
        document.addEventListener('click', (e) => {
            if (document.body.classList.contains('menu-active') && 
                !document.getElementById('app-sidebar').contains(e.target) && 
                !e.target.closest('#btn-menu-toggle')) {
                
                document.getElementById('app-sidebar')?.classList.remove('sidebar-open');
                document.body.classList.remove('menu-active');
            }
        });
    }

    toggleSearchMode(active) {
        if (active) {
            document.body.classList.add('search-mode');
            setTimeout(() => this.container.querySelector('#search-input')?.focus(), 50);
        } else {
            document.body.classList.remove('search-mode');
        }
    }

    updateButtons(state) {
        const container = this.container.querySelector('#header-actions');
        if (!container) return;
        container.innerHTML = ''; 

        const createBtn = (id, icon, title, onClick) => {
            return DOMUtils.create('button', {
                id: id, className: 'btn-action', title: title, onclick: onClick
            }, `<i class="${icon}"></i>`);
        };

        const buttons = [];

        // Definição das ações para cada estado
        const actions = {
            back: () => {
                if (document.body.classList.contains('search-mode')) this.toggleSearchMode(false);
                else if (this.onResetCallback) this.onResetCallback();
            },
            search: () => this.toggleSearchMode(true)
        };

        // --- LÓGICA DE ESTADOS ---

        // 1. DASHBOARD (NOVO): Sem botões de ação, apenas Logout (que já é fixo no HTML)
        if (state === 'dashboard') {
            // Não adiciona nada ao array buttons
        }
        // 2. LISTAS PADRÃO
        else if (state === 'default' || state === 'sectorSelected') {
            buttons.push(createBtn('btn-back', 'fas fa-arrow-left', 'Voltar', actions.back));
            buttons.push(createBtn('btn-search-trigger', 'fas fa-search', 'Pesquisar', actions.search));
            buttons.push(createBtn('btn-add', 'fas fa-plus', 'Adicionar', null)); 
        } 
        // 3. ITEM SELECIONADO
        else if (state === 'userSelected') {
            buttons.push(createBtn('btn-back', 'fas fa-arrow-left', 'Voltar', actions.back));
            buttons.push(createBtn('btn-search-trigger', 'fas fa-search', 'Pesquisar', actions.search));
            buttons.push(createBtn('btn-edit', 'fas fa-pen', 'Alterar', null));
            buttons.push(createBtn('btn-delete', 'fas fa-trash', 'Excluir', null));
        }
        // 4. APENAS VOLTAR
        else if (state === 'only-back') {
            buttons.push(createBtn('btn-back', 'fas fa-arrow-left', 'Voltar', () => {
                if (this.onResetCallback) this.onResetCallback();
            }));
        }
        // 5. O.S. SELECIONADA
        else if (state === 'osSelected') {
            buttons.push(createBtn('btn-back', 'fas fa-arrow-left', 'Voltar', () => {
                if (this.onResetCallback) this.onResetCallback();
            }));
            buttons.push(createBtn('btn-status', 'fas fa-check-circle', 'Concluir/Reabrir', null));
            buttons.push(createBtn('btn-edit', 'fas fa-pen', 'Alterar', null));
            buttons.push(createBtn('btn-delete', 'fas fa-trash', 'Excluir', null));
        }

        buttons.forEach(btn => container.appendChild(btn));
    }
}