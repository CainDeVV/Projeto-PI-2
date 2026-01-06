export const APP_CONFIG = {
    API_BASE_URL: 'http://localhost:8000/api', 
    USE_MOCK_DATA: true, 
    // 1. Coloque a URL do Backend
    // 2. True usa o MockService, false usa o Backend
};

export const STORAGE_KEYS = {
    TOKEN: 'sys_token',
    USER: 'sys_user',
    DB_USERS: 'app_users',
    DB_EQUIPMENTS: 'app_equipments',
    DB_LOGS: 'app_logs',
    DB_OS: 'app_os',
    DB_LOG_ERROS: 'app_log_erros'
};

export const ROUTES = {
    LOGIN: 'index.html',
    HOME: 'dashboard.html',
    DASHBOARD: 'dashboard.html',
    USER_PANEL: 'user_panel.html',
    USERS_LIST: 'usuarios.html',
    USERS_FORM: 'cadastro_usuario.html',
    EQUIPMENT_LIST: 'equipamento.html',
    EQUIPMENT_FORM: 'cadastro_equipamento.html',
    LOGS_LIST: 'log.html',
    OS_LIST: 'os.html',
    OS_FORM: 'cadastro_os.html',
    SECTORS_LIST: 'setores.html',
    SECTORS_FORM: 'cadastro_setor.html',
    MONITORING: 'monitoramento.html'
};

export const MESSAGES = {
    LOGIN_SUCCESS: 'Login realizado com sucesso!',
    LOGIN_FAIL: 'Falha na autenticação.',
    REQUIRED_PASSWORD: 'Preencha a senha!',
    SAVE_SUCCESS: 'Salvo com sucesso!',
    DELETE_SUCCESS: 'Item excluído com sucesso!',
    ERROR_GENERIC: 'Ocorreu um erro inesperado.',
    DELETE_CONFIRM: (name) => `Tem certeza que deseja excluir <strong>${name}</strong>?`
};