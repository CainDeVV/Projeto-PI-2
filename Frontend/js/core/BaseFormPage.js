/* js/core/BaseFormPage.js */
import { HeaderComponent } from '../components/header.js';
import { SidebarComponent } from '../components/sidebar.js';
import { setupInputMasks, InputManager } from '../components/inputs.js';
import { SetorService } from '../services/setor.service.js'; // <--- CORREÇÃO
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

    async init() {
        this.header.render(() => NavigationService.navigate(this.redirectUrl), 'form');
        this.header.updateButtons('only-back');
        
        // Carrega Sidebar da API
        try {
            const treeData = await SetorService.getTreeStructure();
            this.sidebar.render(treeData, () => {}, false);
        } catch (e) {
            this.sidebar.render([], () => {}, false);
        }

        setupInputMasks();
        this.setupListeners();

        if (this.editId) {
            await this.loadData(this.editId);
        }
    }

    async loadData(id) {
        try {
            // Captura o 'type' da URL se ele existir (ex: ?id=1&type=impressora)
            const typeHint = NavigationService.getQueryParam('type');

            // Passamos o typeHint como segundo argumento para o Service
            const item = await this.service.getById(id, typeHint);
            
            if (item) {
                this.fillForm(item);
                this.updateUIForEdit();
            } else {
                showToast('Item não encontrado.', 'error');
                NavigationService.navigate(this.redirectUrl);
            }
        } catch (e) {
            console.error(e);
            showToast('Erro ao carregar dados.', 'error');
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
        if(this.btnSubmit) this.btnSubmit.innerHTML = 'SALVAR ALTERAÇÕES <i class="fas fa-check"></i>';
    }

    setupListeners() {
        if (this.form) this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.addExtraListeners();
    }

    async handleSubmit(e) {
        e.preventDefault();
        if (!this.validate()) return;

        const originalContent = this.btnSubmit ? this.btnSubmit.innerHTML : 'Salvar';
        if(this.btnSubmit) {
            this.btnSubmit.disabled = true;
            this.btnSubmit.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Salvando...';
        }

        try {
            const formData = new FormData(this.form);
            const dataObj = Object.fromEntries(formData.entries());
            if (this.editId) dataObj.id = this.editId;

            const extraData = this.getExtraData();
            Object.assign(dataObj, extraData);

            await this.service.save(dataObj);
            
            showToast(`${this.resourceName} salvo com sucesso!`, 'success');
            setTimeout(() => NavigationService.navigate(this.redirectUrl), 500);
            
        } catch (error) {
            console.error(error);
            showToast('Erro ao salvar: ' + (error.message || ''), 'error');
            if(this.btnSubmit) {
                this.btnSubmit.disabled = false;
                this.btnSubmit.innerHTML = originalContent;
            }
        }
    }

    validate() { return true; } 
    afterFillForm(data) {} 
    addExtraListeners() {} 
    getExtraData() { return {}; }
}