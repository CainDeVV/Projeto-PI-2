/* js/services/navigation.service.js */
import { ROUTES } from '../config/constants.js';

export { ROUTES };

export const NavigationService = {
    navigate(url, params = null) {
        if (!params) {
            window.location.href = url;
            return;
        }
        const queryString = new URLSearchParams(params).toString();
        window.location.href = `${url}?${queryString}`;
    },

    reload() {
        window.location.reload();
    },

    getQueryParam(key) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(key);
    },

    // --- CORREÇÃO DEFINITIVA ---
    isCurrentPage(route) {
        if (!route) return false;
        
        // Pega apenas o nome do arquivo da URL atual (ex: "usuarios.html")
        const currentFile = window.location.pathname.split('/').pop();
        
        // Pega apenas o nome do arquivo da rota desejada
        // (Isso previne que "/pages/os.html" seja confundido se a rota for só "os.html")
        const routeFile = route.split('/').pop();

        // Comparação exata
        return currentFile === routeFile;
    }
};