/* js/core/BaseListPage.js */
import { HeaderComponent } from '../components/header.js';
import { SidebarComponent } from '../components/sidebar.js';
import { TableComponent } from '../components/tables.js';
import { setupGenericSearch } from '../components/search.js';
import { showEmptyState, hideEmptyState } from '../utils.js';
import { showConfirmModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { NavigationService } from '../services/navigation.service.js';
import { SetorService } from '../services/setor.service.js'; 

export class BaseListPage {
    constructor(config, options = {}) {
        const { listElementId, emptyStateId, service, tableConfig, pageName, addPageUrl, deleteMessageFn } = config;
        this.elements = {
            list: document.getElementById(listElementId),
            empty: document.getElementById(emptyStateId)
        };
        this.service = service;
        this.config = tableConfig;
        this.pageName = pageName;
        this.addPageUrl = addPageUrl;
        this.deleteMessageFn = deleteMessageFn;
        this.state = { data: [], selectedItem: null };

        this.options = {
            canAdd: options.canAdd !== undefined ? options.canAdd : true,
            canSelect: options.canSelect !== undefined ? options.canSelect : true,
            showSidebarTree: options.showSidebarTree !== undefined ? options.showSidebarTree : true,
            ...options
        };
        this.header = new HeaderComponent('app-header');
        
        const sidebarEl = document.getElementById('tree-menu-container') || document.getElementById('app-sidebar');
        if (sidebarEl) this.sidebar = new SidebarComponent(sidebarEl.id);
        
        this.table = new TableComponent(this.elements.list);
        this.handleResetSystem = this.handleResetSystem.bind(this);
        this.handleSectorClick = this.handleSectorClick.bind(this);
    }

    async init() {
        this.header.render(this.handleResetSystem, this.pageName);
        if (this.sidebar) {
            let treeData = null;
            if (this.options.showSidebarTree) {
                treeData = await SetorService.getTreeStructure();
            }
            this.sidebar.render(treeData, this.handleSectorClick);
        }

        if (this.options.canAdd && this.addPageUrl) {
            this.bindAddButton();
        } else {
            const btn = document.getElementById('btn-add');
            if (btn) btn.style.display = 'none';
        }
        
        const fields = this.config.searchFields || ['nome'];
        setupGenericSearch('search-input', () => this.state.data, fields, (filtered) => this.renderTable(filtered));

        await this.loadData();
    }

    async loadData() {
        this.state.data = await this.service.getAll();
        this.renderTable(this.state.data);
    }

    renderTable(data) {
        const clickCallback = this.options.canSelect ? (row, item) => this.handleItemSelect(row, item) : null;
        
        const hasData = this.table.render(data, this.config, clickCallback);
        if (hasData) hideEmptyState(this.elements.empty, this.elements.list.id);
        else showEmptyState(this.elements.empty, this.elements.list.id, 'fa-search', 'Nenhum item encontrado');
    }

    // --- MUDANÇA: FILTRO INTELIGENTE HIERÁRQUICO ---
    async handleSectorClick(nodeName) {
        if (!nodeName) return this.handleResetSystem();
        if (!this.options.showSidebarTree) return;

        // 1. Pega lista de TODOS os setores filhos (do nó clicado)
        const allowedSectors = await SetorService.getSectorsUnder(nodeName);

        // 2. Filtra os dados
        const filtered = this.state.data.filter(item => {
            // Se for User/OS/Equip (tem propriedade 'setor')
            if (item.setor && allowedSectors.includes(item.setor)) return true;
            // Se for Tela de Setores (o item É o setor, verificamos 'nome')
            if (item.nome && !item.setor && allowedSectors.includes(item.nome)) return true;
            return false;
        });

        this.renderTable(filtered);
        this.header.updateButtons('sectorSelected');
        
        if (this.options.canAdd) this.bindAddButton();
    }

    handleItemSelect(rowElement, item) {
        if (!this.options.canSelect) return;
        if (!rowElement) { 
            if(this.sidebar) this.sidebar.clearSelection();
            document.querySelectorAll('.user-row').forEach(r => r.classList.remove('selected'));
            return;
        }

        const isSelected = rowElement.classList.contains('selected');
        document.querySelectorAll('.user-row').forEach(r => r.classList.remove('selected'));
        if (isSelected) {
            this.handleResetSelection();
        } else {
            rowElement.classList.add('selected');
            this.state.selectedItem = item;
            this.header.updateButtons('userSelected');
            this.bindContextButtons(item);
            this.onItemSelect(item);
        }
    }

    handleEdit(item) {
        if (this.addPageUrl) NavigationService.navigate(this.addPageUrl, { id: item.id });
    }

    async handleDelete(item) {
        if (!item) return;
        const check = await this.service.checkDependencies(item.id);

        if (!check.allowed) {
            showToast(`Não é possível excluir: ${check.message}`, 'error');
            return;
        }

        showConfirmModal("Excluir", this.deleteMessageFn(item), async () => {
            if (await this.service.delete(item.id)) {
                showToast("Item excluído!", "success");
                this.handleResetSelection();
                this.state.data = this.state.data.filter(i => i.id !== item.id);
                this.renderTable(this.state.data);
            }
        });
    }

    handleResetSelection() {
        this.state.selectedItem = null;
        document.querySelectorAll('.user-row').forEach(r => r.classList.remove('selected'));
        const activeSector = document.querySelector('.active-sector');
        this.header.updateButtons(activeSector ? 'sectorSelected' : 'default');
        if(this.options.canAdd) this.bindAddButton();
        this.onResetSelection();
    }

    handleResetSystem() {
        if(this.sidebar) this.sidebar.clearSelection();
        this.handleResetSelection();
        this.header.toggleSearchMode(false);
        this.loadData();
    }

    bindAddButton() {
        setTimeout(() => {
            const btn = document.getElementById('btn-add');
            if(btn) {
                btn.style.display = 'flex';
                btn.onclick = () => NavigationService.navigate(this.addPageUrl);
            }
        }, 0);
    }

    bindContextButtons(item) {
        setTimeout(() => {
            const btnEdit = document.getElementById('btn-edit');
            const btnDel = document.getElementById('btn-delete');
            if (btnEdit) btnEdit.onclick = () => this.handleEdit(item);
            if (btnDel) btnDel.onclick = () => this.handleDelete(item);
        }, 0);
    }

    onItemSelect(item) {}
    onResetSelection() {}
}