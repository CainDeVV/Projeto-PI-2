import { InputManager, Validators, setupInputMasks } from '../components/inputs.js';
import { AuthService } from '../services/auth.service.js';
import { showToast } from '../components/toast.js';
import { ROUTES, NavigationService } from '../services/navigation.service.js';

// Inicializa máscaras (CPF)
setupInputMasks();

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const cpfInput = document.getElementById('cpf');
    const passInput = document.getElementById('password');
    const toggleBtn = document.getElementById('togglePassword');
    const btnSubmit = form.querySelector('button[type="submit"]');

    // 1. Toggle de Senha (Olhinho)
    if (toggleBtn) {
        toggleBtn.onclick = () => {
            const isPass = passInput.type === 'password';
            passInput.type = isPass ? 'text' : 'password';
            toggleBtn.className = isPass ? 'fas fa-eye-slash icone-do-olho' : 'fas fa-eye icone-do-olho';
        };
    }

    // 2. Limpeza automática de erros (via InputManager)
    form.addEventListener('input', (e) => InputManager.clearError(e.target));

    // 3. Submit Limpo
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        // Limpa erros anteriores
        InputManager.clearAllErrors(form);
        let isValid = true;

        // Validação CPF
        if (!Validators.required(cpfInput.value)) {
            InputManager.setError(cpfInput, 'Digite seu CPF.');
            isValid = false;
        } else if (!Validators.cpf(cpfInput.value)) {
            InputManager.setError(cpfInput, 'CPF inválido.');
            isValid = false;
        }

        // Validação Senha
        if (!Validators.required(passInput.value)) {
            InputManager.setError(passInput, 'Digite sua senha.');
            isValid = false;
        }

        if (!isValid) return;

        // Feedback Visual
        const originalText = btnSubmit.innerText;
        btnSubmit.disabled = true;
        btnSubmit.innerText = 'Entrando...';

        try {
            await AuthService.login(cpfInput.value, passInput.value);
            showToast('Login realizado!', 'success');
            
            // Pequeno delay para o usuário ler o toast
            setTimeout(() => NavigationService.navigate(ROUTES.HOME), 500);
            
        } catch (error) {
            showToast(error.message || 'Falha ao entrar.', 'error');
            btnSubmit.disabled = false;
            btnSubmit.innerText = originalText;
        }
    };
});