/* js/services/auth.service.js */
import { ROUTES, NavigationService } from './navigation.service.js';
import { STORAGE_KEYS } from '../config/constants.js';
import { HttpClient } from '../core/HttpClient.js'; 

class AuthServiceClass {
    constructor() {
        this.http = new HttpClient('auth'); 
        this.tokenKey = STORAGE_KEYS.TOKEN;
        this.userKey = STORAGE_KEYS.USER;
    }

    async login(cpf, password) {
        try {
            // Chama a API (Real ou Mock)
            const response = await this.http.login({ cpf, password });
            
            if (response.token && response.user) {
                localStorage.setItem(this.tokenKey, response.token);
                localStorage.setItem(this.userKey, JSON.stringify(response.user));

                // --- CORREÇÃO: REGISTRAR LOG MANUALMENTE ---
                // Num backend real, o servidor faria isso. No Mock, fazemos aqui.
                // Usamos import dinâmico para evitar Travamento Cíclico (Auth <-> Log)
                try {
                    const { LogService } = await import('./log.service.js');
                    await LogService.add('LOGIN', 'Sistema', `Usuário ${response.user.nome} entrou.`);
                } catch (e) {
                    console.warn('Não foi possível registrar o log de login:', e);
                }
                
                // Redirecionamento
                const tipo = response.user.tipo.toLowerCase();
                if (tipo.includes('usuário') || tipo.includes('comum')) {
                    window.location.href = ROUTES.USER_PANEL;
                } else {
                    return true; 
                }
            }
        } catch (error) {
            console.error(error);
            throw new Error('CPF ou Senha inválidos.');
        }
    }

    getUser() {
        const data = localStorage.getItem(this.userKey);
        return data ? JSON.parse(data) : null;
    }

    isAuthenticated() {
        return !!localStorage.getItem(this.tokenKey);
    }
    
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        NavigationService.navigate(ROUTES.LOGIN);
    }
}

export const AuthService = new AuthServiceClass();