/* js/config/setores.config.js */
export const SECTORS_TABLE_CONFIG = {
    gridClass: 'sectors-grid', // Vamos definir esse grid no CSS
    searchFields: ['nome', 'empresa', 'cidade'],
    columns: [
        { key: 'nome', label: 'Nome do Setor', widthClass: 'w-flex', style: 'font-weight: bold;' },
        { key: 'empresa', label: 'Empresa / Local', widthClass: 'w-flex' },
        { key: 'cidade', label: 'Cidade', widthClass: 'w-sm' }
    ]
};