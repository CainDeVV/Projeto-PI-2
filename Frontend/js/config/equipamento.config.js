export const TABLE_COLUMNS = {
    main: {
        gridClass: 'equip-grid',
        searchFields: ['serie', 'modelo', 'usuario'],
        columns: [
            { key: 'tipo', label: '', widthClass: 'w-xs', type: 'icon' },
            { key: 'id', label: '#', widthClass: 'w-xs' },
            { key: 'serie', label: 'Série', widthClass: 'w-md' },
            { key: 'modelo', label: 'Modelo', widthClass: 'w-flex' },
            { key: 'sala', label: 'Sala', widthClass: 'w-flex' },
            { key: 'usuario', label: 'Usuário', widthClass: 'w-flex' },
            { key: 'status', label: 'Status', widthClass: 'w-sm', type: 'status' },
            { key: 'setor', label: 'Setor', widthClass: 'w-sm' },
            { key: 'contador', label: 'Cont.', widthClass: 'w-sm' },
            { key: 'tonel', label: 'Ton.', widthClass: 'w-sm' },
            { key: 'error', label: 'Erro', widthClass: 'w-flex', type: 'error' }
        ]
    },
    inner: {
        isInner: true,
        gridClass: 'equip-grid',
        columns: [
            { key: 'tipo', label: '', widthClass: 'w-xs', type: 'icon' },
            { key: 'id', label: '#', widthClass: 'w-xs' },
            { key: 'serie', label: 'Série', widthClass: 'w-md' },
            { key: 'modelo', label: 'Modelo', widthClass: 'w-flex' },
            { key: 'sala', label: 'Sala', widthClass: 'w-flex' },
            { key: 'usuario', label: 'Usuário', widthClass: 'w-flex' },
            { key: 'status', label: 'Status', widthClass: 'w-sm', type: 'status' },
            { key: 'setor', label: 'Setor', widthClass: 'w-sm' },
            { key: 'contador', label: 'Cont.', widthClass: 'w-sm' },
            { key: 'tonel', label: 'Ton.', widthClass: 'w-sm' },
            { key: 'error', label: 'Erro', widthClass: 'w-flex', type: 'error' }
        ]
    }
};

export const TAB_IDS = { impressoras: 'tab-impressoras', erros: 'tab-erros', opcoes: 'tab-opcoes' };