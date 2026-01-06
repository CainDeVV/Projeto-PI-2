/* js/config/os.config.js */
export const OS_TABLE_CONFIG = {
    gridClass: 'os-grid',
    // Adicionamos 'solicitante' e 'responsavel' na busca
    searchFields: ['equipamentoName', 'descricao', 'id', 'solicitante', 'responsavel'], 
    columns: [
        // 1. Status (Ícone)
        { key: 'status', label: '', widthClass: 'w-xs', render: (i) => {
            const color = i.status === 'Aberto' ? 'var(--status-error)' : 'var(--status-success)';
            const icon = i.status === 'Aberto' ? 'fa-clock' : 'fa-check-circle';
            return `<i class="fas ${icon}" style="color: ${color}; font-size: 16px;"></i>`;
        }},
        // 2. ID
        { key: 'id', label: '#', widthClass: 'w-xs' },
        // 3. Equipamento
        { key: 'equipamentoName', label: 'Equipamento', widthClass: 'w-flex' },
        // 4. Defeito
        { key: 'descricao', label: 'Defeito', widthClass: 'w-flex', style: 'white-space:nowrap; overflow:hidden; text-overflow:ellipsis;' },
        
        // 5. Solicitante (Quem pediu)
        { key: 'solicitante', label: 'Solicitante', widthClass: 'w-flex', style: 'font-weight: 500; color: var(--text-primary);' },
        
        // 6. Responsável (Técnico)
        { key: 'responsavel', label: 'Responsável', widthClass: 'w-flex', style: 'color: #666;' },
        
        // 7. Setor
        { key: 'setor', label: 'Setor', widthClass: 'w-sm' },

        // 8. Datas
        { key: 'dataAbertura', label: 'Abertura', widthClass: 'w-sm', type: 'date' },
        { key: 'dataFechamento', label: 'Fechamento', widthClass: 'w-sm', type: 'date' }
    ]
};