export const USERS_TABLE_CONFIG = {
    gridClass: 'users-grid',
    searchFields: ['nome', 'cpf'],
    columns: [
        { key: 'id', label: '#', widthClass: 'w-xs' },
        { key: 'nome', label: 'Nome', widthClass: 'w-flex' },
        { key: 'cpf', label: 'CPF', widthClass: 'w-flex' },
        { key: 'tipo', label: 'Tipo', widthClass: 'w-sm', type: 'badge' }, // Badge fica bonito aqui
        { key: 'setor', label: 'Setor', widthClass: 'w-flex' }
    ]
};