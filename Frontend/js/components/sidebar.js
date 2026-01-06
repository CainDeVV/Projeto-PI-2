/* js/components/sidebar.js */
import { ROUTES, NavigationService } from '../services/navigation.service.js';
import { DOMUtils } from '../utils.js';

export class SidebarComponent {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentSelection = null;
    }

    render(data, onSelectCallback) {
        if (!this.container) return;
        this.container.innerHTML = '';

        // 1. Navegação Mobile (Prioridade)
        this.container.appendChild(this._createMobileNav());

        // 2. Renderiza a Árvore de Setores (Desktop)
        if (data && Array.isArray(data) && data.length > 0) {
            const treeUl = DOMUtils.create('ul');
            this._buildTree(data, treeUl, onSelectCallback);
            this.container.appendChild(treeUl);
        } else if (data) {
            this.container.appendChild(DOMUtils.create('div', { 
                style: { padding: '15px', color: '#888', textAlign: 'center', fontSize: '13px' } 
            }, 'Nenhum setor encontrado.'));
        }

        // 3. Rodapé de Administração
        this._injectAdminFooter();
    }

    _createMobileNav() {
        // Verifica rotas ativas
        const isPage = (routeList) => {
            if (Array.isArray(routeList)) return routeList.some(r => NavigationService.isCurrentPage(r));
            return NavigationService.isCurrentPage(routeList);
        };

        const createItem = (label, icon, route, isActive) => {
            return DOMUtils.create('li', {
                style: isActive ? { color: 'var(--brand-active)', backgroundColor: 'var(--brand-hover-light)', fontWeight: 'bold' } : {},
                onclick: () => {
                    document.getElementById('app-sidebar')?.classList.remove('sidebar-open');
                    document.body.classList.remove('menu-active');
                    if (route) NavigationService.navigate(route);
                }
            }, `<i class="${icon}"></i> ${label}`);
        };

        // --- ORDEM ATUALIZADA (Igual ao Desktop) ---
        return DOMUtils.create('ul', { className: 'sidebar-mobile-nav' }, [
            createItem('Visão Geral', 'fas fa-chart-pie', ROUTES.DASHBOARD, isPage(ROUTES.DASHBOARD)),
            createItem('NOC / Monitoramento', 'fas fa-heartbeat', ROUTES.MONITORING, isPage(ROUTES.MONITORING)),
            createItem('Equipamento', 'fas fa-laptop', ROUTES.EQUIPMENT_LIST, isPage([ROUTES.EQUIPMENT_LIST, ROUTES.EQUIPMENT_FORM])),
            createItem('O.S.', 'fas fa-tools', ROUTES.OS_LIST, isPage([ROUTES.OS_LIST, ROUTES.OS_FORM])),
            createItem('Usuários', 'fas fa-users', ROUTES.USERS_LIST, isPage([ROUTES.USERS_LIST, ROUTES.USERS_FORM])),
            createItem('Setores', 'fas fa-layer-group', ROUTES.SECTORS_LIST, isPage([ROUTES.SECTORS_LIST, ROUTES.SECTORS_FORM])),
            createItem('Log', 'fas fa-history', ROUTES.LOGS_LIST, isPage(ROUTES.LOGS_LIST)),
            
            DOMUtils.create('hr', { className: 'sidebar-divider' })
        ]);
    }

    _injectAdminFooter() {
        const mainSidebar = document.getElementById('app-sidebar');
        if (!mainSidebar) return;

        // Limpa rodapé antigo
        const oldFooter = mainSidebar.querySelector('.sidebar-footer-actions');
        if (oldFooter) oldFooter.remove();

        // Só exibe na tela de setores
        if (!NavigationService.isCurrentPage(ROUTES.SECTORS_LIST)) return;

        const container = DOMUtils.create('div', { className: 'sidebar-footer-actions' });
        container.appendChild(DOMUtils.create('div', { className: 'sidebar-subtitle' }, 'Administração'));

        // Botões de Ação
        const createBtn = (id, icon, text) => DOMUtils.create('button', {
            id: id, className: 'sidebar-action-btn'
        }, `<i class="${icon}"></i> ${text}`);

        container.appendChild(createBtn('sidebar-btn-cities', 'fas fa-city', 'Cidades'));
        container.appendChild(createBtn('sidebar-btn-companies', 'fas fa-building', 'Empresas'));

        mainSidebar.appendChild(container);
    }

    clearSelection() {
        this.currentSelection = null;
        if (!this.container) return;
        this.container.querySelectorAll('.active-sector').forEach(el => el.classList.remove('active-sector'));
    }
    
    // --- LÓGICA DE ÁRVORE RECURSIVA ---
    _buildTree(nodes, parentElement, onSelectCallback) {
        if (!nodes || !Array.isArray(nodes)) return;
        
        nodes.forEach(node => {
            const isFolder = typeof node === 'object';
            const labelText = isFolder ? node.name : node;

            const contentDiv = DOMUtils.create('div', {
                className: isFolder ? 'tree-item-content folder-node' : 'tree-item-content leaf-node',
                onclick: (e) => {
                    e.stopPropagation();
                    if (isFolder) {
                        this._toggleFolder(contentDiv.parentElement);
                        this._handleLeafClick(contentDiv, labelText, onSelectCallback);
                    } else {
                        this._handleLeafClick(contentDiv, labelText, onSelectCallback);
                        // Fecha menu no mobile ao clicar em item
                        if(window.innerWidth <= 768) {
                            document.getElementById('app-sidebar')?.classList.remove('sidebar-open');
                            document.body.classList.remove('menu-active');
                        }
                    }
                }
            }, `${isFolder ? '<i class="fas fa-chevron-right arrow"></i>' : ''} ${labelText}`);

            const li = DOMUtils.create('li', {}, contentDiv);
            
            if (isFolder && node.children) {
                const subUl = DOMUtils.create('ul', { className: 'tree-children' });
                this._buildTree(node.children, subUl, onSelectCallback);
                li.appendChild(subUl);
            }
            parentElement.appendChild(li);
        });
    }

    _toggleFolder(li) {
        li.classList.toggle('expanded');
    }

    _handleLeafClick(div, label, callback) {
        this.clearSelection();
        if (this.currentSelection === label) {
            if(callback) callback(null); // Deselecionar
        } else {
            div.classList.add('active-sector');
            this.currentSelection = label;
            if(callback) callback(label); 
        }
    }
}