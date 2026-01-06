/* js/pages/user_panel.js */
import { BaseListPage } from '../core/BaseListPage.js';
import { OsService } from '../services/os.service.js';
import { SetorService } from '../services/setor.service.js'; 
import { OS_TABLE_CONFIG } from '../config/os.config.js';
import { AuthService } from '../services/auth.service.js';
import { ROUTES } from '../services/navigation.service.js';

class UserPanelPage extends BaseListPage {
    constructor() {
        super(
            {
                listElementId: 'os-list',
                emptyStateId: 'empty-state',
                service: OsService,
                tableConfig: OS_TABLE_CONFIG,
                pageName: 'history', 
                addPageUrl: ROUTES.OS_FORM, 
                deleteMessageFn: null 
            },
            {
                canAdd: true, 
                canSelect: true,
                showSidebarTree: false 
            }
        );
        this.detailContainer = document.getElementById('os-detail-content');
        this.currentUser = AuthService.getUser();
        this.setoresCache = [];
    }

    async init() {
        await super.init();
        document.body.classList.add('layout-full-width');
        
        this.loadSectors();
        
        const splitContainer = document.querySelector('.split-container');
        if (splitContainer) {
            splitContainer.classList.add('history-view');
        }
        
        // --- CORREÇÃO: REMOVIDA A LIMPEZA FORÇADA DO HEADER ---
        // (O BaseListPage.js já cuida de colocar os botões certos, inclusive o +)
    }

    async loadSectors() {
        this.setoresCache = await SetorService.getAll();
    }

    getFormattedSector(sectorName) {
        if (!sectorName) return '-';
        const sector = this.setoresCache.find(s => s.nome === sectorName);
        if (sector) {
            return `<strong>${sector.nome}</strong> <br> <small style="color:#666;">${sector.empresa} - ${sector.cidade}</small>`;
        }
        return sectorName;
    }

    async loadData() {
        if (!this.currentUser) return;
        this.state.data = await this.service.getByUser(this.currentUser.nome);
        this.state.data.sort((a, b) => new Date(b.dataAbertura) - new Date(a.dataAbertura));
        this.renderTable(this.state.data);
    }

    handleItemSelect(rowElement, item) {
        super.handleItemSelect(rowElement, item);
        if (this.state.selectedItem) {
            this.header.updateButtons('only-back'); 
            this.renderDetails(item);
        } else {
            this.resetDetails();
        }
    }

    renderDetails(item) {
        this.detailContainer.innerHTML = '';
        this.detailContainer.classList.remove('centered', 'padded');
        const statusColor = item.status === 'Aberto' ? 'var(--status-error)' : 'var(--status-success)';
        const sectorDisplay = this.getFormattedSector(item.setor);

        const content = `
            <div class="detail-grid animate-fade">
                <div class="detail-full" style="margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; display:flex; justify-content:space-between; align-items:center;">
                    <div style="font-size: 18px; font-weight: bold; color: var(--brand-primary);">
                        O.S. #${item.id}
                    </div>
                    <span class="status-badge" style="background-color: ${statusColor}">${item.status}</span>
                </div>

                <div class="detail-item">
                    <label>Equipamento</label>
                    <div>${item.equipamentoName}</div>
                </div>
                <div class="detail-item">
                    <label>Sala</label>
                    <div>${item.equipamentoSala}</div>
                </div>
                
                <div class="detail-item detail-full">
                    <label>Setor</label>
                    <div>${sectorDisplay}</div>
                </div>
                
                <div class="detail-item detail-full">
                    <label>Descrição</label>
                    <div>${item.descricao}</div>
                </div>

                <div class="detail-item">
                    <label>Abertura</label>
                    <div>${new Date(item.dataAbertura).toLocaleString('pt-BR')}</div>
                </div>
                
                ${item.dataFechamento ? `
                <div class="detail-item detail-full">
                    <label>Solução Técnica</label>
                    <div style="border-color: var(--status-success); color: var(--status-success); background-color: #f0fff4;">
                        ${item.solucao}<br>
                        <small style="color:#666; margin-top:5px; display:block;">Encerrado em: ${new Date(item.dataFechamento).toLocaleString('pt-BR')}</small>
                    </div>
                </div>` : ''}
                
                <div style="height: 50px; width: 100%;"></div>
            </div>
        `;
        this.detailContainer.innerHTML = content;
    }

    resetDetails() {
        this.detailContainer.innerHTML = '<div style="color:#888;">Selecione um chamado para ver o andamento.</div>';
        this.detailContainer.classList.add('centered', 'padded');
    }
}

new UserPanelPage().init();