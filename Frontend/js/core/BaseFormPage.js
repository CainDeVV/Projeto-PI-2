/* js/core/BaseFormPage.js */
import { HeaderComponent } from '../components/header.js';
import { SidebarComponent } from '../components/sidebar.js';
import { setupInputMasks, InputManager } from '../components/inputs.js'; // Adicionei InputManager aqui se faltar
import { treeStructure } from '../database.js';
import { showToast } from '../components/toast.js';
import { NavigationService } from '../services/navigation.service.js';

export class BaseFormPage {
    constructor({ formId, service, redirectUrl, resourceName = 'Item' }) {
        this.form = document.getElementById(formId);
        this.service = service;
        this.redirectUrl = redirectUrl;
        this.resourceName = resourceName;
        
        this.titlePage = document.querySelector('.form-header-title h2');
        this.btnSubmit = document.querySelector('.btn-submit'); 
        
        this.editId = NavigationService.getQueryParam('id');

        this.header = new HeaderComponent('app-header');
        this.sidebar = new SidebarComponent('tree-menu-container');
    }

    init() {
        this.header.render(() => NavigationService.navigate(this.redirectUrl), 'form');
        this.header.updateButtons('only-back');
        this.sidebar.render(treeStructure, () => {}, false);

        setupInputMasks();
        this.setupListeners();

        if (this.editId) {
            this.loadData(this.editId);
        }
    }

    async loadData(id) {
        const item = await this.service.getById(id);
        if (item) {
            this.fillForm(item);
            this.updateUIForEdit();
        } else {
            showToast('Item não encontrado.', 'error');
            NavigationService.navigate(this.redirectUrl);
        }
    }

    fillForm(data) {
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.name && data[input.name] !== undefined) {
                input.value = data[input.name];
            }
        });
        this.afterFillForm(data);
    }

    updateUIForEdit() {
        if(this.titlePage) this.titlePage.innerText = `Alterar ${this.resourceName}`;
        if(this.btnSubmit) {
            this.btnSubmit.innerHTML = 'SALVAR ALTERAÇÕES <i class="fas fa-check"></i>';
        }
    }

    setupListeners() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
        this.addExtraListeners();
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        // 1. Validação (Hook opcional dos filhos)
        if (!this.validate()) return;

        // 2. Feedback Visual
        const originalContent = this.btnSubmit ? this.btnSubmit.innerHTML : 'Salvar';
        if(this.btnSubmit) {
            this.btnSubmit.disabled = true;
            this.btnSubmit.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Salvando...';
        }

        try {
            const formData = new FormData(this.form);
            const dataObj = Object.fromEntries(formData.entries());

            if (this.editId) {
                dataObj.id = this.editId;
            }

            // --- OTIMIZAÇÃO AQUI (HOOK) ---
            // Pega dados extras definidos no filho e mistura com os dados do form
            const extraData = this.getExtraData();
            Object.assign(dataObj, extraData);

            await this.service.save(dataObj);
            
            const action = this.editId ? 'atualizado' : 'cadastrado';
            showToast(`${this.resourceName} ${action} com sucesso!`, 'success');
            
            NavigationService.navigate(this.redirectUrl);
            
        } catch (error) {
            console.error(error);
            showToast('Erro ao salvar dados.', 'error');
            
            if(this.btnSubmit) {
                this.btnSubmit.disabled = false;
                this.btnSubmit.innerHTML = originalContent;
            }
        }
    }

    // --- HOOKS (Métodos vazios que os filhos podem sobrescrever) ---
    
    validate() { return true; } 
    
    afterFillForm(data) {} 
    
    addExtraListeners() {} 
    
    // Novo Hook: Retorna objeto com dados extras para salvar
    getExtraData() { return {}; }
}