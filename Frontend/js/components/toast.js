import { DOMUtils } from '../utils.js';

class ToastService {
    constructor() {
        this.containerId = 'toast-container';
        this.container = null;
    }

    _getContainer() {
        if (!this.container) {
            this.container = document.getElementById(this.containerId);
            if (!this.container) {
                this.container = DOMUtils.create('div', { id: this.containerId });
                document.body.appendChild(this.container);
            }
        }
        return this.container;
    }

    show(message, type = 'info') {
        const container = this._getContainer();

        // Define Ícone baseado no tipo
        let iconClass = 'fa-info-circle';
        if (type === 'success') iconClass = 'fa-check-circle';
        if (type === 'error') iconClass = 'fa-exclamation-circle';

        // Cria o Toast com DOMUtils
        const icon = DOMUtils.create('i', { className: `fas ${iconClass}` });
        const text = DOMUtils.create('span', {}, message);
        
        const toast = DOMUtils.create('div', { 
            className: `toast ${type}` 
        }, [icon, text]);

        // Adiciona ao container
        container.appendChild(toast);

        // Animação de Entrada (Força reflow)
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Timer para remover
        setTimeout(() => {
            toast.classList.remove('show');
            toast.classList.add('hide');
            
            // Remove do DOM após a animação CSS terminar
            toast.addEventListener('animationend', () => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            });
        }, 3000);
    }
}

// Instância Singleton
const toastInstance = new ToastService();

// Wrapper para compatibilidade
export function showToast(message, type) {
    toastInstance.show(message, type);
}