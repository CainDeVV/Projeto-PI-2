/* js/config/monitoramento.config.js */
export const MONITOR_TABLE_CONFIG = {
    // Essa classe ativa o Grid do seu CSS em cada linha
    gridClass: 'monitor-grid',
    
    searchFields: ['titulo', 'codigo_erro', 'equipamentoNome', 'equipamentoSala'],
    
    columns: [
        // 1. Severidade (Badge Colorido)
        { key: 'severidade', label: 'Severidade', widthClass: 'w-sm', render: (item) => {
            // Lógica para definir a cor baseada no texto (Case Insensitive)
            let cls = 'sev-info';
            const sev = (item.severidade || '').toLowerCase();
            
            if (sev.includes('crít') || sev.includes('crit')) cls = 'sev-critico';
            else if (sev.includes('alert') || sev.includes('warn')) cls = 'sev-alerta';
            
            // Retorna o HTML do badge
            return `<span class="sev-badge ${cls}">${item.severidade || 'Info'}</span>`;
        }},
        
        // 2. Data
        { key: 'data_hora', label: 'Data', widthClass: 'w-md', type: 'datetime' },
        
        // 3. Equipamento (Com negrito e cor de destaque)
        { key: 'equipamentoNome', label: 'Equipamento', widthClass: 'w-flex', render: (item) => {
            // Se não tiver nome, mostra 'Genérico'
            return `<span style="font-weight:bold; color:var(--brand-active);">${item.equipamentoNome || 'Genérico'}</span>`;
        }},
        
        // 4. Sala
        { key: 'equipamentoSala', label: 'Sala', widthClass: 'w-flex', render: (item) => item.equipamentoSala || '-' },
        
        // 5. Erro (Título + Código + Descrição)
        { key: 'titulo', label: 'Erro / Código', widthClass: 'w-flex', render: (item) => {
            return `
                <div>
                    <div class="error-title">
                        <span>${item.titulo}</span>
                        ${item.codigo_erro ? `<span class="error-code-tag">${item.codigo_erro}</span>` : ''}
                    </div>
                    <span class="error-desc" title="${item.descricao || ''}">
                        ${item.descricao || 'Sem detalhes disponíveis.'}
                    </span>
                </div>
            `;
        }},
        
        // 6. Ações (Botões)
        { key: 'actions', label: 'Ações', widthClass: 'w-sm', render: (item) => {
            // Cenário 1: Já tem O.S. criada -> Mostra botão de VER
            if (item.id_os_gerada) {
                return `
                    <div class="monitor-actions">
                        <button class="btn-monitor view" onclick="verOS('${item.id_os_gerada}', event)" title="Ver O.S. #${item.id_os_gerada}">
                            <i class="fas fa-file-alt"></i> <span style="margin-left:5px">#${item.id_os_gerada}</span>
                        </button>
                    </div>`;
            }
            
            // Cenário 2: Erro pendente -> Mostra RESOLVER e ABRIR CHAMADO
            return `
                <div class="monitor-actions">
                    <button class="btn-monitor solve" onclick="resolverErro('${item.id}', event)" title="Resolver (Sem O.S.)">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn-monitor os" onclick="gerarOS('${item.id}', event)" title="Abrir Chamado">
                        <i class="fas fa-tools"></i>
                    </button>
                </div>
            `;
        }}
    ]
};