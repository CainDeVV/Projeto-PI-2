/* js/pages/os.js */
import { BaseListPage } from '../core/BaseListPage.js';
import { OsService } from '../services/os.service.js';
import { SetorService } from '../services/setor.service.js';
import { OS_TABLE_CONFIG } from '../config/os.config.js';
import { ROUTES } from '../services/navigation.service.js';
import { DOMUtils } from '../utils.js';
import { showToast } from '../components/toast.js';
// 1. NOVO IMPORT
import { AuthService } from '../services/auth.service.js';

class OsPage extends BaseListPage {
    constructor() {
        super(
            {
                listElementId: 'os-list',
                emptyStateId: 'empty-state',
                service: OsService,
                tableConfig: OS_TABLE_CONFIG,
                pageName: 'os',
                addPageUrl: ROUTES.OS_FORM,
                deleteMessageFn: (item) => `Excluir O.S. <strong>#${item.id}</strong>?`
            },
            {
                canAdd: true,
                canSelect: true,
                showSidebarTree: false 
            }
        );
        this.detailContainer = document.getElementById('os-detail-content');
        this.splitContainer = document.querySelector('.split-container');
        this.setoresCache = []; 
        
        // 2. PEGAR USUÁRIO LOGADO
        this.currentUser = AuthService.getUser();
    }

    async init() {
        await super.init();
        document.body.classList.add('layout-full-width');
        
        this.loadSectors();

        if (this.splitContainer) {
            const backdrop = DOMUtils.create('div', {
                className: 'os-mobile-backdrop',
                onclick: (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleResetSelection(); 
                }
            });
            this.splitContainer.appendChild(backdrop);
        }
    }

    // --- 3. SOBRESCREVENDO AÇÕES PARA ADICIONAR SEGURANÇA ---

    handleEdit(item) {
        // Verifica se tem permissão antes de deixar editar
        if (this.checkOSPermission(item, 'editar')) {
            super.handleEdit(item);
        }
    }

    handleDelete(item) {
        // Verifica se tem permissão antes de deixar excluir
        if (this.checkOSPermission(item, 'excluir')) {
            super.handleDelete(item);
        }
    }

    // --- 4. LÓGICA DE PERMISSÃO ---
    checkOSPermission(osItem, action) {
        if (!this.currentUser) {
            this.currentUser = AuthService.getUser(); // Tenta recarregar
            if (!this.currentUser) return false;
        }

        const myRole = (this.currentUser.tipo || '').toLowerCase();
        const myName = this.currentUser.nome;

        // A. ADMIN e TÉCNICO: Podem tudo
        if (myRole.includes('admin') || myRole.includes('técnico') || myRole.includes('tecnico')) {
            return true;
        }

        // B. USUÁRIO COMUM: Só pode se for o dono da O.S.
        if (osItem.solicitante === myName) {
            return true;
        }

        // C. NEGADO
        showToast(`Acesso Negado: Você só pode ${action} suas próprias Ordens de Serviço.`, 'error');
        return false;
    }

    // --- MÉTODOS ORIGINAIS DO SEU ARQUIVO (MANTIDOS IGUAIS) ---

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

    handleItemSelect(rowElement, item) {
        super.handleItemSelect(rowElement, item);
        if (this.state.selectedItem) {
            this.header.updateButtons('osSelected');
            setTimeout(() => this.bindStatusButton(item), 0);
            this.renderDetails(item);
            if(this.splitContainer) this.splitContainer.classList.add('show-detail');
        } else {
            this.handleResetSelection();
        }
    }

    handleResetSelection() {
        super.handleResetSelection();
        this.resetDetails();
        if(this.splitContainer) {
            this.splitContainer.classList.remove('show-detail');
        }
    }

    bindStatusButton(item) {
        const btn = document.getElementById('btn-status');
        if (!btn) return;

        const isClosed = item.status === 'Fechado';
        
        btn.title = isClosed ? 'Reabrir O.S.' : 'Concluir O.S.';
        btn.innerHTML = isClosed ? '<i class="fas fa-box-open"></i>' : '<i class="fas fa-check"></i>';
        btn.style.color = isClosed ? 'var(--brand-active)' : 'var(--status-success)';
        
        btn.onclick = async () => {
            // Verifica permissão também para mudar status (opcional, mas recomendado)
            if (!this.checkOSPermission(item, 'alterar status')) return;

            await this.service.toggleStatus(item.id);
            showToast(isClosed ? 'O.S. Reaberta!' : 'O.S. Concluída!', 'success');
            
            this.state.data = await this.service.getAll();
            const newItem = this.state.data.find(i => i.id === item.id);
            this.renderTable(this.state.data);
            
            if(newItem) {
                this.state.selectedItem = newItem;
                this.renderDetails(newItem);
                const newRow = this.elements.list.querySelector(`.user-row[data-id="${newItem.id}"]`);
                if(newRow) newRow.classList.add('selected');
                this.bindStatusButton(newItem);
            }
        };
        
        this.bindContextButtons(item);
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
                    <label>Sala / Localização</label>
                    <div style="font-weight: 500; color: #333;">${item.equipamentoSala}</div>
                </div>
                
                <div class="detail-item detail-full">
                    <label>Setor (Empresa - Cidade)</label>
                    <div>${sectorDisplay}</div>
                </div>
                
                <div class="detail-item">
                    <label>Solicitante</label>
                    <div style="font-weight:bold;">${item.solicitante}</div>
                </div>
                <div class="detail-item">
                    <label>Técnico Responsável</label>
                    <div>${item.responsavel}</div>
                </div>

                <div class="detail-item detail-full">
                    <label>Descrição do Defeito</label>
                    <div style="min-height: 40px;">${item.descricao}</div>
                </div>
                
                <div class="detail-item">
                    <label>Data Abertura</label>
                    <div>${new Date(item.dataAbertura).toLocaleString('pt-BR')}</div>
                </div>
                
                ${item.dataFechamento ? `
                <div class="detail-item detail-full">
                    <label>Solução / Fechamento</label>
                    <div style="border-color: var(--status-success); color: var(--status-success); background-color: #f0fff4;">
                        ${item.solucao}<br>
                        <small style="color:#666; margin-top:5px; display:block;">
                            <i class="fas fa-check"></i> Em: ${new Date(item.dataFechamento).toLocaleString('pt-BR')}
                        </small>
                    </div>
                </div>
                ` : ''}
                
                <div style="height: 50px; width: 100%;"></div>
            </div>
        `;
        this.detailContainer.innerHTML = content;
    }

    resetDetails() {
        this.detailContainer.innerHTML = '<div style="color:#888;">Selecione uma O.S. para ver os detalhes.</div>';
        this.detailContainer.classList.add('centered', 'padded');
    }
}

new OsPage().init();