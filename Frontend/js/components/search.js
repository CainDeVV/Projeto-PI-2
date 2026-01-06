import { debounce } from '../utils.js';

/**
 * Configura o listener de busca com Debounce (Performance)
 */
export function setupGenericSearch(inputId, dataGetter, fieldsToSearch, renderCallback) {
    const searchInput = document.getElementById(inputId);
    if (!searchInput) return;

    // Função de filtragem real
    const performSearch = (term) => {
        const currentData = dataGetter();
        
        if (!term) {
            renderCallback(currentData); // Se vazio, mostra tudo
            return;
        }

        const lowerTerm = term.toLowerCase();
        
        const filtered = currentData.filter(item => {
            return fieldsToSearch.some(field => {
                const val = item[field];
                return val && val.toString().toLowerCase().includes(lowerTerm);
            });
        });

        renderCallback(filtered);
    };

    // Cria versão "atrasada" da função (espera 300ms parar de digitar)
    const debouncedSearch = debounce((e) => {
        performSearch(e.target.value);
    }, 300);

    // Usa keyup ou input
    searchInput.addEventListener('input', debouncedSearch);
}