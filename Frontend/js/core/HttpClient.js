/* js/core/HttpClient.js */
import { APP_CONFIG, STORAGE_KEYS } from '../config/constants.js';
import { MockDatabase } from './MockDatabase.js';
import { ROUTES, NavigationService } from '../services/navigation.service.js';
import { showToast } from '../components/toast.js';

export class HttpClient {
    constructor(endpoint) {
        this.endpoint = endpoint; 
        this.useMock = APP_CONFIG.USE_MOCK_DATA;
        this.apiBase = APP_CONFIG.API_BASE_URL;
    }

    // --- 1. GERENCIADOR DE CABEÇALHOS (HEADERS) ---
    // Prepara o cabeçalho padrão com JSON e o Token de Autenticação
    _getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        // Pega o token salvo e anexa automaticamente
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }

    // --- 2. TRATAMENTO CENTRALIZADO DE RESPOSTAS ---
    // Verifica se deu erro HTTP (4xx, 5xx) e toma atitudes globais
    async _handleResponse(response) {
        // Se a resposta for 204 No Content (comum em delete/put), não tem JSON
        if (response.status === 204) return true;

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            // ERRO 401: Token expirado ou inválido
            if (response.status === 401) {
                console.warn('Sessão expirada. Redirecionando...');
                localStorage.removeItem(STORAGE_KEYS.TOKEN);
                localStorage.removeItem(STORAGE_KEYS.USER);
                NavigationService.navigate(ROUTES.LOGIN);
                throw new Error('Sessão expirada. Faça login novamente.');
            }

            // ERRO 403: Sem permissão
            if (response.status === 403) {
                showToast('Você não tem permissão para realizar esta ação.', 'error');
                throw new Error('Acesso negado.');
            }

            // Outros erros (400, 500)
            // Tenta pegar a mensagem de erro que o backend mandou
            const errorMessage = data.message || data.error || `Erro HTTP ${response.status}`;
            throw new Error(errorMessage);
        }

        return data;
    }

    // --- LOGIN ---
    async login(credentials) {
        if (this.useMock) return MockDatabase.login(credentials);
        
        try {
            const response = await fetch(`${this.apiBase}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            return this._handleResponse(response);
        } catch (error) {
            // Repassa o erro para o AuthService tratar (exibir toast)
            throw error;
        }
    }

    // --- MÉTODOS CRUD (Agora usando headers e handler) ---

    async get(id = null) {
        if (this.useMock) {
            if (id) return MockDatabase.getById(this.endpoint, id);
            return MockDatabase.get(this.endpoint);
        }
        
        const url = id ? `${this.apiBase}/${this.endpoint}/${id}` : `${this.apiBase}/${this.endpoint}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: this._getHeaders() // Injeta o Token
        });

        return this._handleResponse(response);
    }

    async post(data) {
        if (this.useMock) return MockDatabase.post(this.endpoint, data);
        
        const response = await fetch(`${this.apiBase}/${this.endpoint}`, {
            method: 'POST',
            headers: this._getHeaders(), // Injeta o Token
            body: JSON.stringify(data)
        });

        return this._handleResponse(response);
    }

    async put(id, data) {
        if (this.useMock) return MockDatabase.put(this.endpoint, id, data);

        const response = await fetch(`${this.apiBase}/${this.endpoint}/${id}`, {
            method: 'PUT',
            headers: this._getHeaders(), // Injeta o Token
            body: JSON.stringify(data)
        });

        return this._handleResponse(response);
    }

    async delete(id) {
        if (this.useMock) return MockDatabase.delete(this.endpoint, id);

        const response = await fetch(`${this.apiBase}/${this.endpoint}/${id}`, {
            method: 'DELETE',
            headers: this._getHeaders() // Injeta o Token
        });

        // Delete geralmente retorna 200 ou 204. Se ok, retorna true.
        if (response.ok) return true;
        
        // Se falhar, o _handleResponse vai lançar o erro
        await this._handleResponse(response);
        return false;
    }
}