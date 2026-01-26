/* js/core/HttpClient.js */
import { APP_CONFIG, STORAGE_KEYS } from '../config/constants.js';
import { ROUTES, NavigationService } from '../services/navigation.service.js';
import { showToast } from '../components/toast.js';

export class HttpClient {
    constructor(endpoint) {
        this.endpoint = endpoint; 
        this.apiBase = APP_CONFIG.API_BASE_URL;
    }

    // --- 1. GERENCIADOR DE CABEÇALHOS (HEADERS) ---
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
    async _handleResponse(response) {
        if (response.status === 204) return true;

        const textData = await response.text();
        let data;

        try {
            data = textData ? JSON.parse(textData) : {};
        } catch (e) {
            data = { message: textData };
        }

        if (!response.ok) {
            // ERRO 401: Token expirado
            if (response.status === 401) {
                console.warn('Sessão expirada.');
                localStorage.removeItem(STORAGE_KEYS.TOKEN);
                localStorage.removeItem(STORAGE_KEYS.USER);
                NavigationService.navigate(ROUTES.LOGIN);
                throw new Error('Sessão expirada. Faça login novamente.');
            }

            // ERRO 403: Acesso Negado
            if (response.status === 403) {
                showToast('Acesso negado.', 'error');
                throw new Error('Acesso negado.');
            }

            const errorMessage = data.message || data.error || textData || `Erro HTTP ${response.status}`;
            throw new Error(errorMessage);
        }

        return data;
    }

    // --- LOGIN ---
    async login(credentials) {
        try {
            const response = await fetch(`${this.apiBase}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            return this._handleResponse(response);
        } catch (error) {
            throw error;
        }
    }

    // --- MÉTODOS CRUD GENÉRICOS ---

    async get(id = null) {
        const url = id ? `${this.apiBase}/${this.endpoint}/${id}` : `${this.apiBase}/${this.endpoint}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: this._getHeaders()
        });

        return this._handleResponse(response);
    }

    async post(data) {
        const response = await fetch(`${this.apiBase}/${this.endpoint}`, {
            method: 'POST',
            headers: this._getHeaders(),
            body: JSON.stringify(data)
        });

        return this._handleResponse(response);
    }

    async put(id, data) {
        const response = await fetch(`${this.apiBase}/${this.endpoint}/${id}`, {
            method: 'PUT',
            headers: this._getHeaders(),
            body: JSON.stringify(data)
        });

        return this._handleResponse(response);
    }

    async delete(id) {
        const response = await fetch(`${this.apiBase}/${this.endpoint}/${id}`, {
            method: 'DELETE',
            headers: this._getHeaders()
        });

        if (response.ok) return true;
        
        await this._handleResponse(response);
        return false;
    }
}