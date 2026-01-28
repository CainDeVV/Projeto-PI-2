/* js/pages/equipamento.js */
import { BaseListPage } from '../core/BaseListPage.js';
import { EquipamentoService } from '../services/equipamento.service.js';
import { TABLE_COLUMNS, TAB_IDS } from '../config/equipamento.config.js';
import { renderGenericTable } from '../components/tables.js';
import { switchTab, resetTabs } from '../components/tabs.js';
import { ROUTES, NavigationService } from '../services/navigation.service.js'; // Importar NavigationService
import { DOMUtils } from '../utils.js';

class EquipamentoPage extends BaseListPage {
    constructor() {
        super({
            listElementId: 'equipment-list',
            emptyStateId: 'empty-state',
            service: EquipamentoService,
            tableConfig: TABLE_COLUMNS.main,
            pageName: 'equipment',
            addPageUrl: ROUTES.EQUIPMENT_FORM,
            deleteMessageFn: (item) => `Deseja excluir o ${item.tipo} <strong>${item.modelo}</strong>?`,
            itemNameFn: (item) => item.modelo
        },
        {
            canAdd: true,
            canSelect: true,
            showSidebarTree: true
        });

        this.tabContent = document.getElementById('tab-content-area');
        this.splitContainer = document.querySelector('.split-container');
        this.tabs = [
            document.getElementById(TAB_IDS.impressoras),
            document.getElementById(TAB_IDS.erros),
            document.getElementById(TAB_IDS.opcoes)
        ];
        this.activeTab = 'impressoras';
    }

    async init() {
        await super.init();
        
        window.handleTabClick = (tabName) => {
            this.activeTab = tabName;
            switchTab(tabName, this.tabs, () => this.renderTabContent());
        };
        
        this.setupMobileBack();
        this.setupClickOutside();

        const urlParams = new URLSearchParams(window.location.search);
        const selectId = urlParams.get('select');
        
        if (selectId) {
            setTimeout(() => {
                this.selectItemById(selectId);
                const row = document.querySelector(`.user-row[data-id="${selectId}"]`);
                if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    }

    // --- CORREÇÃO DO BUG DE EDIÇÃO (IDS DUPLICADOS) ---
    handleEdit(item) {
        // Envia o TIPO junto com o ID para diferenciar PC de Impressora
        NavigationService.navigate(this.addPageUrl, { id: item.id, type: item.tipo });
    }
    // --------------------------------------------------

    setupClickOutside() {
        const topSection = document.querySelector('.top-list-section');
        if (topSection) {
            topSection.addEventListener('click', (e) => {
                if (window.innerWidth <= 900 && this.state.selectedItem) {
                    e.stopPropagation();
                    e.preventDefault();
                    this.handleResetSelection();
                }
            }, true);
        }
    }

    setupMobileBack() {
        const tabsHeader = document.querySelector('.tabs-header');
        if (tabsHeader && !document.querySelector('.mobile-back-btn')) {
            const backBtn = DOMUtils.create('button', {
                className: 'mobile-back-btn',
                title: 'Fechar detalhes',
                onclick: (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleResetSelection();
                }
            }, '<i class="fas fa-chevron-down"></i>');
            tabsHeader.insertBefore(backBtn, tabsHeader.firstChild);
        }
    }

    handleItemSelect(rowElement, item) {
        super.handleItemSelect(rowElement, item);

        if (this.state.selectedItem) {
            this.updateTabsState(item);
            if(this.splitContainer) this.splitContainer.classList.add('show-detail');
        } else {
            this.resetBottomPanel();
            if(this.splitContainer) this.splitContainer.classList.remove('show-detail');
        }
    }

    handleResetSelection() {
        super.handleResetSelection();
        this.resetBottomPanel();
        if(this.splitContainer) this.splitContainer.classList.remove('show-detail');
    }

    updateTabsState(item) {
        this.tabs.forEach(b => b.disabled = false);
        
        if (item.tipo === 'computador') {
            const tabOpcoes = document.getElementById(TAB_IDS.opcoes);
            if(tabOpcoes) tabOpcoes.disabled = true;
            window.handleTabClick('impressoras');
        } else {
            const tabImpressoras = document.getElementById(TAB_IDS.impressoras);
            if(tabImpressoras) tabImpressoras.disabled = true;
            window.handleTabClick('opcoes');
        }
    }

    resetBottomPanel() {
        if(this.tabContent) {
            this.tabContent.innerHTML = '';
            const msg = DOMUtils.create('div', { 
                style: { color:'#888', textAlign:'center', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' } 
            }, 'Selecione um item.');
            this.tabContent.appendChild(msg);
        }
        resetTabs(this.tabs);
        if(this.tabs[0]) this.tabs[0].classList.add('active');
    }

    renderTabContent() {
        this.tabContent.innerHTML = '';
        this.tabContent.classList.remove('centered', 'padded');
        const item = this.state.selectedItem;
        if (!item) return;

        if (this.activeTab === 'impressoras') this.renderPrintersTab(item);
        else if (this.activeTab === 'erros') this.renderErrorsTab(item);
        else if (this.activeTab === 'opcoes') this.renderOptionsTab();
    }

    async renderPrintersTab(item) {
        const printers = await this.service.getPrintersByParentId(item.id);
        
        if (this.state.selectedItem?.id !== item.id || this.activeTab !== 'impressoras') return;

        if (printers.length > 0) {
            const headerRow = DOMUtils.create('div', { className: 'inner-table-header' }, [
                DOMUtils.create('div', { className: 'th-col w-xs' }, '#'),
                DOMUtils.create('div', { className: 'th-col w-md' }, 'Nº Serie'),
                DOMUtils.create('div', { className: 'th-col w-flex' }, 'Modelo'),
                DOMUtils.create('div', { className: 'th-col w-flex' }, 'Usuário'),
                DOMUtils.create('div', { className: 'th-col w-sm' }, 'Status'),
                DOMUtils.create('div', { className: 'th-col w-sm' }, 'Setor'),
                DOMUtils.create('div', { className: 'th-col w-sm' }, 'Contador'),
                DOMUtils.create('div', { className: 'th-col w-sm' }, 'Ton.'),
                DOMUtils.create('div', { className: 'th-col w-flex' }, 'Error'),
            ]);
            const listContainer = DOMUtils.create('div', { className: 'inner-table-content', id: 'inner-list' });
            const wrapper = DOMUtils.create('div', { className: 'inner-table-container animate-fade' }, [headerRow, listContainer]);
            
            this.tabContent.innerHTML = '';
            this.tabContent.appendChild(wrapper);
            
            renderGenericTable(listContainer, printers, TABLE_COLUMNS.inner, (row, printerItem) => {
                this.selectItemById(printerItem.id, 'impressora');
            });
        } else {
            this.tabContent.classList.add('centered', 'padded');
            this.tabContent.innerHTML = ''; 
            this.tabContent.appendChild(DOMUtils.create('div', { style: { textAlign:'center', color:'#999' } }, [
                DOMUtils.create('i', { className: 'fas fa-print', style: { fontSize:'24px', display:'block', marginBottom:'10px', opacity:'0.5' } }),
                'Nenhuma impressora associada.'
            ]));
        }
    }

    async renderErrorsTab(item) {
        this.tabContent.innerHTML = ''; 
        this.tabContent.classList.remove('centered', 'padded'); 
        
        const history = await this.service.getErrorHistory(item.id);

        if (history && history.length > 0) {
            const list = DOMUtils.create('div', { className: 'error-history-list', style: { padding: '20px' } });

            history.forEach(log => {
                const color = log.severidade === 'Crítico' ? '#d32f2f' : '#fbc02d';
                const bg = log.severidade === 'Crítico' ? '#ffebee' : '#fffde7';
                const icon = log.severidade === 'Crítico' ? 'fa-times-circle' : 'fa-exclamation-triangle';

                const card = DOMUtils.create('div', { 
                    className: 'error-card animate-fade',
                    style: { 
                        borderLeft: `4px solid ${color}`,
                        background: bg,
                        padding: '12px',
                        marginBottom: '10px',
                        borderRadius: '4px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }
                });

                card.innerHTML = `
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <strong style="color:${color}; font-size:14px;">
                            <i class="fas ${icon}"></i> ${log.titulo}
                        </strong>
                        <span style="font-size:11px; color:#666;">${new Date(log.data_hora).toLocaleString('pt-BR')}</span>
                    </div>
                    <div style="font-size:13px; color:#444; margin-bottom:5px;">${log.descricao}</div>
                    <div style="display:flex; gap:10px; font-size:11px; color:#777;">
                        <span>Cód: <strong>${log.codigo_erro}</strong></span>
                        <span>Status: <strong>${log.resolvido ? 'Resolvido' : 'Ativo'}</strong></span>
                    </div>
                `;
                list.appendChild(card);
            });
            this.tabContent.appendChild(list);
        } else {
            this.tabContent.classList.add('centered', 'padded');
            this.tabContent.appendChild(DOMUtils.create('div', { className: 'animate-fade', style: { textAlign: 'center' } }, [
                DOMUtils.create('i', { className: 'fas fa-check-circle', style: { fontSize: '40px', color: 'var(--status-success)', marginBottom: '15px' } }),
                DOMUtils.create('div', { style: { color: 'var(--status-success)', fontSize: '16px', fontWeight: 'bold' } }, 'Sistema Saudável'),
                DOMUtils.create('div', { style: { color: '#888', fontSize: '13px', marginTop: '5px' } }, 'Nenhum registro de falha encontrado.')
            ]));
        }
    }

    renderOptionsTab() {
        this.tabContent.classList.add('centered', 'padded');
        const btnTinta = DOMUtils.create('button', { className: 'option-btn' }, '<i class="fas fa-tint"></i> Redefinir Tinta');
        const btnJatos = DOMUtils.create('button', { className: 'option-btn' }, '<i class="fas fa-list-ul"></i> Verificar Jatos');
        const btnReset = DOMUtils.create('button', { className: 'option-btn' }, '<i class="fas fa-eraser"></i> Reset Almofada');
        this.tabContent.appendChild(DOMUtils.create('div', { className: 'options-stack animate-fade' }, [btnTinta, btnJatos, btnReset]));
    }

    selectItemById(id, type = null) {
        let targetItem;
        
        if (type) {
            targetItem = this.state.data.find(e => String(e.id) === String(id) && e.tipo === type);
        } else {
            targetItem = this.state.data.find(e => String(e.id) === String(id));
        }

        if (targetItem) {
            const rowElement = this.elements.list.querySelector(`.user-row[data-id="${id}"]`); 
            
            if (rowElement) super.handleItemSelect(rowElement, targetItem);
            
            this.state.selectedItem = targetItem;
            this.updateTabsState(targetItem);
            this.renderTabContent();
            
            if(this.splitContainer) this.splitContainer.classList.add('show-detail');
        }
    }
}

new EquipamentoPage().init();