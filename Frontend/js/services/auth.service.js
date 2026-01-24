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
            const response = await this.http.login({ cpf, senha: password });
            
            // O Backend retorna o JSON plano (token, nome, id, tipo) 
            // e não um objeto 'user' aninhado.
            if (response.token) {
                localStorage.setItem(this.tokenKey, response.token);

                const userObj = {
                    id: response.id,
                    nome: response.nome,
                    // Garante que pega o tipo independente se vier como 'tipo' ou 'tipoPerfil'
                    tipo: response.tipo || response.tipoPerfil 
                };

                localStorage.setItem(this.userKey, JSON.stringify(userObj));

                // Registrar Log (Opcional)
                try {
                    const { LogService } = await import('./log.service.js');
                    await LogService.add('LOGIN', 'Sistema', `Usuário ${userObj.nome} entrou.`);
                } catch (e) {
                    console.warn('Não foi possível registrar o log de login:', e);
                }
                
                // Redirecionamento
                const tipo = userObj.tipo.toLowerCase();
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