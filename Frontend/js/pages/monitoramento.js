/* js/pages/monitoramento.js */
import { BaseListPage } from '../core/BaseListPage.js';
import { ErrorLogService } from '../services/error_log.service.js';
import { MONITOR_TABLE_CONFIG } from '../config/monitoramento.config.js';
import { NavigationService, ROUTES } from '../services/navigation.service.js';
import { showConfirmModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';

class MonitoramentoPage extends BaseListPage {
    constructor() {
        super(
            {
                listElementId: 'monitor-list',
                emptyStateId: 'empty-state',
                service: ErrorLogService, 
                tableConfig: MONITOR_TABLE_CONFIG,
                pageName: 'monitoramento',
                addPageUrl: null, 
                deleteMessageFn: null
            },
            { canAdd: false, canSelect: false, showSidebarTree: false }
        );
    }

    async init() {
        document.body.classList.add('layout-full-width');
        
        await super.init(); 

        // 1. Instrui o Header a criar o botão com ID 'btn-refresh'
        this.header.updateButtons('monitoramento');

        // --- EXPOR FUNÇÕES GLOBAIS ---
        window.gerarOS = (id, e) => this.handleGerarOS(id, e);
        window.resolverErro = (id, e) => this.handleResolver(id, e);
        window.verOS = (osId, e) => this.handleVerOS(osId, e);

        // 2. CORREÇÃO AQUI: O ID deve ser 'btn-refresh' (igual ao header.js)
        const btnRefresh = document.getElementById('btn-refresh'); 
        
        if (btnRefresh) {
            btnRefresh.onclick = () => {
                this.loadData(); 
                showToast('Dados atualizados.', 'info');
            };
        }
    }

    // Sobrescrita do loadData para usar o filtro de erros ativos
    async loadData() {
        try {
            this.state.data = await this.service.getActiveErrors();
            this.renderTable(this.state.data);
        } catch (error) {
            console.error("Erro ao carregar monitoramento:", error);
            showToast("Erro ao carregar dados.", "error");
        } 
    }

    // --- AÇÕES ---

    handleGerarOS(errorId, event) {
        if(event) event.stopPropagation();
        NavigationService.navigate(ROUTES.OS_FORM, { fromError: errorId });
    }

    handleVerOS(osId, event) {
        if(event) event.stopPropagation();
        NavigationService.navigate(ROUTES.OS_LIST, { select: osId });
    }

    handleResolver(errorId, event) {
        if(event) event.stopPropagation();

        showConfirmModal(
            'Resolver Incidente',
            'Confirma que este problema foi resolvido sem necessidade de abrir um chamado?',
            async () => {
                try {
                    const success = await this.service.resolveError(errorId);
                    
                    if (success) {
                        showToast('Erro marcado como resolvido!', 'success');
                        this.loadData(); 
                    } else {
                        showToast('Não foi possível resolver o erro.', 'error');
                    }
                } catch (error) {
                    console.error(error);
                    showToast('Erro de comunicação com o servidor.', 'error');
                }
            }
        );
    }

    handleItemSelect(rowElement, item) {
        if (item.id_equipamento_alvo || item.equipamentoId) {
            const equipId = item.id_equipamento_alvo || item.equipamentoId;
            NavigationService.navigate(ROUTES.EQUIPMENT_LIST, { select: equipId });
        }
    }
}

new MonitoramentoPage().init();