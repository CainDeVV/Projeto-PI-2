export const LOG_TABLE_CONFIG = {
    gridClass: 'log-grid',
    searchFields: ['user', 'details', 'action'],
    columns: [
        { key: 'date', label: 'Data/Hora', widthClass: 'w-md', type: 'datetime' },
        { key: 'user', label: 'Usuário', widthClass: 'w-flex', style: 'font-weight: 500;' },
        { key: 'action', label: 'Ação', widthClass: 'w-sm', type: 'badge' },
        { key: 'resource', label: 'Recurso', widthClass: 'w-sm', style: 'color: #666;' },
        { key: 'details', label: 'Detalhes', widthClass: 'w-flex', style: 'color: #888; font-size: 13px;' }
    ]
};