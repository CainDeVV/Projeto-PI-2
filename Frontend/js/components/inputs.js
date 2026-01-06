/* js/components/inputs.js */

// 1. MÁSCARAS
export const masks = {
    cpf(v) { return v.replace(/\D/g,'').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})/,'$1-$2').replace(/(-\d{2})\d+?$/,'$1'); },
    serial(v) { return v.toUpperCase().replace(/[^A-Z0-9-]/g, ''); }
};

export function setupInputMasks() {
    document.querySelectorAll('[data-mask]').forEach(input => {
        const type = input.dataset.mask;
        if(masks[type]) {
            input.addEventListener('input', (e) => {
                e.target.value = masks[type](e.target.value);
            });
        }
    });
}

// 2. VALIDATORS (Regras de Negócio)
export const Validators = {
    required: (value) => !!value && value.trim().length > 0,
    minLength: (value, min) => value.length >= min,
    email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    
    cpf: (cpf) => {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
        let soma = 0, resto;
        for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(9, 10))) return false;
        soma = 0;
        for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(10, 11))) return false;
        return true;
    }
};

// 3. INPUT MANAGER (NOVO - Reduz código repetido de UI)
export class InputManager {
    
    /**
     * Define erro visual no campo
     * @param {HTMLElement|string} inputOrId - O elemento input ou seu ID
     * @param {string} message - Mensagem de erro
     */
    static setError(inputOrId, message) {
        const input = typeof inputOrId === 'string' ? document.getElementById(inputOrId) : inputOrId;
        if (!input) return;

        // Pinta a borda
        input.style.borderColor = "var(--status-error)";

        // Tenta achar o span de erro associado
        // Convenção 1: ID específico "erro-{idDoInput}"
        let errorSpan = document.getElementById(`erro-${input.id}`);
        
        // Convenção 2: Span irmão dentro do mesmo grupo
        if (!errorSpan && input.parentElement) {
            errorSpan = input.parentElement.querySelector('.erro-msg, span[id^="erro-"]');
        }

        // Se não achar, procura no pai do pai (caso tenha wrappers de ícone)
        if (!errorSpan && input.parentElement.parentElement) {
            errorSpan = input.parentElement.parentElement.querySelector(`#erro-${input.id}`);
        }

        if (errorSpan) {
            errorSpan.innerText = message;
            errorSpan.style.display = 'block';
            errorSpan.style.color = "var(--status-error)";
        }
    }

    /**
     * Limpa erro visual
     */
    static clearError(inputOrId) {
        const input = typeof inputOrId === 'string' ? document.getElementById(inputOrId) : inputOrId;
        if (!input) return;

        input.style.borderColor = ""; // Volta ao original (CSS trata)
        
        let errorSpan = document.getElementById(`erro-${input.id}`);
        if (!errorSpan && input.parentElement) {
            errorSpan = input.parentElement.querySelector('.erro-msg, span[id^="erro-"]');
        }
        if (!errorSpan && input.parentElement.parentElement) {
            errorSpan = input.parentElement.parentElement.querySelector(`#erro-${input.id}`);
        }

        if (errorSpan) errorSpan.innerText = "";
    }

    /**
     * Limpa todos os erros de um formulário
     */
    static clearAllErrors(formElement) {
        const inputs = formElement.querySelectorAll('input, select, textarea');
        inputs.forEach(input => this.clearError(input));
    }
}