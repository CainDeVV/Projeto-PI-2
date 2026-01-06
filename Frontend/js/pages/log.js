/* js/pages/log.js */
import { BaseListPage } from '../core/BaseListPage.js';
import { LogService } from '../services/log.service.js';
import { LOG_TABLE_CONFIG } from '../config/log.config.js';

class LogPage extends BaseListPage {
    constructor() {
        super(
            {
                listElementId: 'log-list',
                emptyStateId: 'empty-state',
                service: LogService,
                tableConfig: LOG_TABLE_CONFIG,
                pageName: 'logs',
                addPageUrl: null, 
                deleteMessageFn: null 
            },
            // OPÇÕES DECLARATIVAS (Isso conserta a sidebar)
            {
                canAdd: false,          // Esconde botão Add
                canSelect: false,       // Desativa seleção
                showSidebarTree: false  // Limpa a Sidebar corretamente
            }
        );
    }

    async init() {
        await super.init();

        // Garante layout full width via CSS
        document.body.classList.add('layout-full-width');

        // Garante botão de pesquisa
        const actionsContainer = document.getElementById('header-actions');
        if (actionsContainer && !document.getElementById('btn-search-trigger')) {
            actionsContainer.innerHTML = `
                <button id="btn-search-trigger" class="btn-action" title="Pesquisar"><i class="fas fa-search"></i></button>
            `;
            document.getElementById('btn-search-trigger').onclick = () => this.header.toggleSearchMode(true);
        }
    }

    async loadData() {
        try {
            // Usa o método específico de logs
            this.state.data = await this.service.getRecent();
            this.renderTable(this.state.data);
        } catch (error) {
            console.error('Erro logs:', error);
        }
    }
}

new LogPage().init();