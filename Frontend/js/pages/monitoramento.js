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
            { canAdd: false, canSelect: true, showSidebarTree: false }
        );
    }

    async init() {
        document.body.classList.add('layout-full-width');
        await super.init(); // Renderiza Header e Sidebar

        // --- EXPOR FUNÇÕES GLOBAIS ---
        window.gerarOS = (id, e) => this.handleGerarOS(id, e);
        window.resolverErro = (id, e) => this.handleResolver(id, e);
        window.verOS = (osId, e) => this.handleVerOS(osId, e);
    }

    // Sobrescrita do loadData para usar o método específico getActiveErrors
    async loadData() {
        this.state.data = await this.service.getActiveErrors();
        this.renderTable(this.state.data);
    }

    // --- AÇÕES ---

    handleGerarOS(errorId, event) {
        if(event) event.stopPropagation();
        // Navega para cadastro de OS enviando o ID do erro na URL
        NavigationService.navigate(ROUTES.OS_FORM, { fromError: errorId });
    }

    handleVerOS(osId, event) {
        if(event) event.stopPropagation();
        // Vai para a lista de OS e seleciona a OS específica
        NavigationService.navigate(ROUTES.OS_LIST, { select: osId });
    }

    handleResolver(errorId, event) {
        if(event) event.stopPropagation();

        showConfirmModal(
            'Resolver Erro',
            'Confirma que este problema foi resolvido sem necessidade de abrir um chamado?',
            async () => {
                try {
                    // --- CORREÇÃO: Usa o Service, não o LocalStorage direto ---
                    const success = await this.service.resolveError(errorId);
                    
                    if (success || success === undefined) { // undefined se a API retornar void
                        showToast('Erro marcado como resolvido!', 'success');
                        this.loadData(); // Recarrega a tabela
                    } else {
                        showToast('Não foi possível resolver o erro.', 'error');
                    }
                } catch (error) {
                    console.error(error);
                    showToast('Erro ao processar solicitação.', 'error');
                }
            }
        );
    }

    // Clique na linha (apenas navega se não clicou nos botões)
    handleItemSelect(rowElement, item) {
        if (item.id_equipamento_alvo) {
            NavigationService.navigate(ROUTES.EQUIPMENT_LIST, { select: item.id_equipamento_alvo });
        }
    }
}

new MonitoramentoPage().init();