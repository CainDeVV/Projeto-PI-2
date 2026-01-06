/* js/config/monitoramento.config.js */
export const MONITOR_TABLE_CONFIG = {
    gridClass: 'monitor-grid',
    searchFields: ['titulo', 'codigo_erro', 'equipamentoNome', 'equipamentoSala'],
    columns: [
        // 1. Severidade
        { key: 'severidade', label: 'Severidade', widthClass: 'w-sm', render: (item) => {
            const cls = item.severidade === 'Crítico' ? 'sev-critico' : (item.severidade === 'Alerta' ? 'sev-alerta' : 'sev-info');
            // Removemos o ícone de dentro do badge para ficar mais limpo, apenas texto
            return `<span class="sev-badge ${cls}">${item.severidade}</span>`;
        }},
        
        // 2. Data
        { key: 'data_hora', label: 'Data', widthClass: 'w-md', type: 'datetime' },
        
        // 3. Equipamento
        { key: 'equipamentoNome', label: 'Equipamento', widthClass: 'w-flex', style: 'font-weight:bold; color:var(--brand-active);' },
        
        // 4. Sala
        { key: 'equipamentoSala', label: 'Sala', widthClass: 'w-flex' },
        
        // 5. Erro (Com Código visualmente separado)
        { key: 'titulo', label: 'Erro / Código', widthClass: 'w-flex', render: (item) => {
            return `<div>
                <div class="error-title">
                    <span>${item.titulo}</span>
                    <span class="error-code-tag">${item.codigo_erro}</span>
                </div>
                <span class="error-desc" title="${item.descricao}">${item.descricao}</span>
            </div>`;
        }},
        
        // 6. Ações (Apenas Ícones)
        { key: 'actions', label: 'Ações', widthClass: 'w-sm', render: (item) => {
            if (item.id_os_gerada) {
                return `<div class="monitor-actions">
                    <button class="btn-monitor view" onclick="verOS('${item.id_os_gerada}', event)" title="Ver O.S. #${item.id_os_gerada}">
                        <i class="fas fa-file-alt"></i> <span style="margin-left:5px">#${item.id_os_gerada}</span>
                    </button>
                </div>`;
            }
            
            return `<div class="monitor-actions">
                <button class="btn-monitor solve" onclick="resolverErro('${item.id}', event)" title="Resolver Rapidamente">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn-monitor os" onclick="gerarOS('${item.id}', event)" title="Gerar Ordem de Serviço">
                    <i class="fas fa-tools"></i>
                </button>
            </div>`;
        }}
    ]
};