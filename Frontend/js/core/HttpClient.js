/* js/core/HttpClient.js */
import { APP_CONFIG, STORAGE_KEYS } from '../config/constants.js';
import { ROUTES, NavigationService } from '../services/navigation.service.js';
import { showToast } from '../components/toast.js';

export class HttpClient {
    constructor(endpoint) {
        this.endpoint = endpoint; 
        this.apiBase = APP_CONFIG.API_BASE_URL;
    }

    _getHeaders() {
        const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return headers;
    }

    async _handleResponse(response) {
        if (response.status === 204) return true;
        const textData = await response.text();
        let data;
        try { data = textData ? JSON.parse(textData) : {}; } catch (e) { data = { message: textData }; }

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem(STORAGE_KEYS.TOKEN);
                localStorage.removeItem(STORAGE_KEYS.USER);
                NavigationService.navigate(ROUTES.LOGIN);
                throw new Error('Sessão expirada.');
            }
            if (response.status === 403) {
                showToast('Acesso negado.', 'error');
                throw new Error('Acesso negado.');
            }
            throw new Error(data.message || data.error || `Erro HTTP ${response.status}`);
        }
        return data;
    }

    async login(credentials) {
        const response = await fetch(`${this.apiBase}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        return this._handleResponse(response);
    }

    async get(id = null) {
        const url = id ? `${this.apiBase}/${this.endpoint}/${id}` : `${this.apiBase}/${this.endpoint}`;
        return this._handleResponse(await fetch(url, { method: 'GET', headers: this._getHeaders() }));
    }

    async post(data) {
        return this._handleResponse(await fetch(`${this.apiBase}/${this.endpoint}`, {
            method: 'POST', headers: this._getHeaders(), body: JSON.stringify(data)
        }));
    }

    async put(id, data) {
        return this._handleResponse(await fetch(`${this.apiBase}/${this.endpoint}/${id}`, {
            method: 'PUT', headers: this._getHeaders(), body: JSON.stringify(data)
        }));
    }

    async delete(id) {
        const response = await fetch(`${this.apiBase}/${this.endpoint}/${id}`, {
            method: 'DELETE', headers: this._getHeaders()
        });
        if (response.ok) return true;
        await this._handleResponse(response);
        return false;
    }
}