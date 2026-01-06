/* js/components/modal.js */
import { DOMUtils } from '../utils.js';

class ModalComponent {
    constructor() {
        this.modalId = 'app-generic-modal';
        this.overlay = null;
        this.titleEl = null;
        this.textEl = null;
        this.inputEl = null; // Novo campo de input
        this.cancelBtn = null;
        this.confirmBtn = null;
        this.onConfirm = null;
        
        this._build();
    }

    _build() {
        if (document.getElementById(this.modalId)) return;

        // Criação dos Elementos
        this.titleEl = DOMUtils.create('div', { className: 'modal-title' });
        this.textEl = DOMUtils.create('div', { className: 'modal-text' });
        
        // Input (escondido por padrão)
        this.inputEl = DOMUtils.create('input', { 
            type: 'text', 
            className: 'custom-input modal-input',
            style: 'display:none; margin-bottom: 20px;' 
        });

        this.cancelBtn = DOMUtils.create('button', { className: 'btn-modal btn-cancel' }, 'Cancelar');
        this.confirmBtn = DOMUtils.create('button', { className: 'btn-modal btn-confirm' }, 'Confirmar');

        const actions = DOMUtils.create('div', { className: 'modal-actions' }, [
            this.cancelBtn, 
            this.confirmBtn
        ]);

        const box = DOMUtils.create('div', { className: 'modal-box' }, [
            this.titleEl, 
            this.textEl, 
            this.inputEl,
            actions
        ]);

        this.overlay = DOMUtils.create('div', { 
            id: this.modalId, 
            className: 'modal-overlay' 
        }, box);

        document.body.appendChild(this.overlay);

        // Eventos
        this.cancelBtn.onclick = () => this.close();
        
        this.confirmBtn.onclick = () => {
            const value = this.inputEl.value.trim();
            this.close();
            if (this.onConfirm) this.onConfirm(value);
        };

        // Confirmar com Enter no input
        this.inputEl.onkeyup = (e) => {
            if (e.key === 'Enter') this.confirmBtn.click();
        };
    }

    // Modal de Confirmação Simples (Sim/Não)
    openConfirm(title, message, onConfirm) {
        this._reset();
        this.titleEl.innerHTML = title;
        this.textEl.innerHTML = message;
        this.inputEl.style.display = 'none';
        this.onConfirm = onConfirm;
        this.show();
    }

    // Modal de Input (Prompt)
    openInput(title, placeholder, onConfirm) {
        this._reset();
        this.titleEl.innerText = title;
        this.textEl.innerHTML = ''; // Sem texto descritivo, apenas o título
        
        this.inputEl.style.display = 'block';
        this.inputEl.placeholder = placeholder || '';
        this.inputEl.value = '';
        
        this.onConfirm = onConfirm;
        this.show();
        
        // Foca no input assim que abrir
        setTimeout(() => this.inputEl.focus(), 100);
    }

    _reset() {
        this.onConfirm = null;
    }

    show() {
        this.overlay.classList.add('active');
    }

    close() {
        this.overlay.classList.remove('active');
    }
}

const modalInstance = new ModalComponent();

// Exporta as funções facilitadoras
export function showConfirmModal(title, message, onConfirm) {
    modalInstance.openConfirm(title, message, onConfirm);
}

export function showInputModal(title, placeholder, onConfirm) {
    modalInstance.openInput(title, placeholder, onConfirm);
}