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
                pageName: 'Monitoramento',
                addPageUrl: null, 
                deleteMessageFn: null
            },
            // canSelect: false -> Desativa checkboxes (não configuramos coluna pra isso)
            { canAdd: false, canSelect: false, showSidebarTree: false }
        );
    }

    async init() {
        // Aplica classe para layout tela cheia (se o CSS suportar)
        document.body.classList.add('layout-full-width');
        
        await super.init(); // Renderiza o básico

        // --- EXPOR FUNÇÕES GLOBAIS ---
        // Necessário para os botões onclick="gerarOS(...)" funcionarem dentro do HTML injetado
        window.gerarOS = (id, e) => this.handleGerarOS(id, e);
        window.resolverErro = (id, e) => this.handleResolver(id, e);
        window.verOS = (osId, e) => this.handleVerOS(osId, e);
    }

    // Sobrescrita do loadData para usar o filtro de erros ativos e Loading
    async loadData() {
        this.showLoading(true); // Mostra "Carregando..."
        try {
            this.state.data = await this.service.getActiveErrors();
            this.renderTable(this.state.data);
        } catch (error) {
            console.error("Erro ao carregar monitoramento:", error);
            showToast("Erro ao carregar dados.", "error");
        } finally {
            this.showLoading(false); // Esconde "Carregando..."
        }
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
            'Resolver Incidente',
            'Confirma que este problema foi resolvido sem necessidade de abrir um chamado?',
            async () => {
                try {
                    const success = await this.service.resolveError(errorId);
                    
                    if (success) {
                        showToast('Erro marcado como resolvido!', 'success');
                        this.loadData(); // Recarrega a tabela para sumir com o item
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

    // Clique na linha (Opcional: Leva para o equipamento)
    handleItemSelect(rowElement, item) {
        // Só navega se tiver equipamento alvo vinculado ao erro
        if (item.id_equipamento_alvo || item.equipamentoId) {
            const equipId = item.id_equipamento_alvo || item.equipamentoId;
            NavigationService.navigate(ROUTES.EQUIPMENT_LIST, { select: equipId });
        }
    }
}

new MonitoramentoPage().init();