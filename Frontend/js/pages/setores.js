/* js/pages/setores.js */
import { BaseListPage } from '../core/BaseListPage.js';
import { SetorService } from '../services/setor.service.js';
import { SECTORS_TABLE_CONFIG } from '../config/setores.config.js';
import { ROUTES } from '../services/navigation.service.js';
import { showToast } from '../components/toast.js';
import { showConfirmModal } from '../components/modal.js';

class SetoresPage extends BaseListPage {
    constructor() {
        super({
            listElementId: 'sectors-list',
            emptyStateId: 'empty-state',
            service: SetorService,
            tableConfig: { ...SECTORS_TABLE_CONFIG, rowClass: 'user-row sectors-grid' },
            pageName: 'sectors',
            addPageUrl: ROUTES.SECTORS_FORM,
            deleteMessageFn: (item) => `Excluir o setor <strong>${item.nome}</strong>?`
        });

        this.modals = {
            cities: document.getElementById('modal-manage-cities'),
            companies: document.getElementById('modal-manage-companies'),
            listCities: document.getElementById('list-cities-container'),
            listCompanies: document.getElementById('list-companies-container'),
            
            // Cidade
            formCity: document.getElementById('edit-city-form'),
            inpCityId: document.getElementById('edit-city-id'),
            inpCityName: document.getElementById('edit-city-name'),
            inpCityUf: document.getElementById('edit-city-uf'),
            btnSaveCity: document.getElementById('btn-save-city-edit'),
            btnCancelCity: document.getElementById('btn-cancel-city-edit'),

            // Empresa
            formCompany: document.getElementById('edit-company-form'),
            inpCompId: document.getElementById('edit-company-id'),
            inpCompName: document.getElementById('edit-company-name'),
            inpCompCnpj: document.getElementById('edit-company-cnpj'),
            inpCompDesc: document.getElementById('edit-company-desc'),
            inpCompObs: document.getElementById('edit-company-obs'),
            
            // CAMPO OCULTO IMPORTANTE PARA MANTER O VÍNCULO
            currentCompanyCityId: null, 
            
            btnSaveCompany: document.getElementById('btn-save-company-edit'),
            btnCancelCompany: document.getElementById('btn-cancel-company-edit')
        };
    }

    async init() {
        await super.init();
        setTimeout(() => this.bindManagerEvents(), 100);
    }

    bindManagerEvents() {
        const btnCities = document.getElementById('sidebar-btn-cities');
        const btnCompanies = document.getElementById('sidebar-btn-companies');

        if (btnCities) btnCities.onclick = () => this.openCityManager();
        if (btnCompanies) btnCompanies.onclick = () => this.openCompanyManager();

        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.onclick = (e) => {
                const modalId = e.target.getAttribute('data-close');
                document.getElementById(modalId).classList.remove('active');
            };
        });

        // --- SALVAR EDIÇÃO CIDADE ---
        if(this.modals.btnSaveCity) {
            this.modals.btnSaveCity.onclick = async () => {
                const id = this.modals.inpCityId.value;
                const name = this.modals.inpCityName.value;
                const uf = this.modals.inpCityUf.value;
                if(!name || !uf) return showToast('Preencha os campos', 'error');

                await SetorService.updateCity(id, name, uf);
                showToast('Cidade atualizada!', 'success');
                this.modals.formCity.classList.add('hidden');
                this.openCityManager(); 
                this.handleResetSystem(); 
            };
        }

        // --- SALVAR EDIÇÃO EMPRESA (CORRIGIDO) ---
        if(this.modals.btnSaveCompany) {
            this.modals.btnSaveCompany.onclick = async () => {
                const id = this.modals.inpCompId.value;
                
                const dataToUpdate = {
                    nome: this.modals.inpCompName.value,
                    cnpj: this.modals.inpCompCnpj.value,
                    descricao: this.modals.inpCompDesc.value,
                    observacao: this.modals.inpCompObs.value,
                    // CORREÇÃO: Envia o ID da cidade que estava salva
                    cidade_vinculada: this.modals.currentCompanyCityId 
                };

                if(!dataToUpdate.nome || !dataToUpdate.cnpj) return showToast('Preencha Nome e CNPJ', 'error');
                if(!dataToUpdate.cidade_vinculada) return showToast('Erro de vínculo com cidade. Recarregue.', 'error');

                await SetorService.updateCompany(id, dataToUpdate);
                
                showToast('Empresa atualizada!', 'success');
                this.modals.formCompany.classList.add('hidden');
                this.openCompanyManager(); 
                this.handleResetSystem();
            };
        }

        if (this.modals.btnCancelCompany) {
            this.modals.btnCancelCompany.onclick = () => {
                this.modals.formCompany.classList.add('hidden');
            };
        }

        if (this.modals.btnCancelCity) {
            this.modals.btnCancelCity.onclick = () => {
                this.modals.formCity.classList.add('hidden');
            };
        }
    }

    async openCityManager() {
        this.modals.cities.classList.add('active');
        this.modals.listCities.innerHTML = 'Carregando...';
        
        try {
            const cities = await SetorService.getCitiesFull();
            this.modals.listCities.innerHTML = '';

            cities.forEach(city => {
                const item = document.createElement('div');
                item.className = 'modal-item';
                item.innerHTML = `
                    <div>
                        <strong>${city.nome}</strong>
                        <small>Estado: ${city.uf || '-'}</small>
                    </div>
                    <div class="modal-item-actions">
                        <button class="btn-icon-sm edit" type="button"><i class="fas fa-pen"></i></button>
                        <button class="btn-icon-sm delete" type="button"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                
                item.querySelector('.edit').onclick = () => {
                    this.modals.formCity.classList.remove('hidden');
                    this.modals.inpCityId.value = city.id;
                    this.modals.inpCityName.value = city.nome;
                    this.modals.inpCityUf.value = city.uf;
                };

                item.querySelector('.delete').onclick = () => {
                    showConfirmModal(
                        'Excluir Cidade', 
                        `Tem certeza que deseja apagar <strong>${city.nome}</strong>?<br><br><small style="color:red">Isso apagará TODAS as empresas e setores vinculados!</small>`, 
                        async () => {
                            await SetorService.deleteCity(city.id);
                            showToast('Cidade excluída!', 'success');
                            this.openCityManager();
                            this.handleResetSystem();
                        }
                    );
                };
                
                this.modals.listCities.appendChild(item);
            });
        } catch (error) { console.error(error); }
    }

    async openCompanyManager() {
        this.modals.companies.classList.add('active');
        this.modals.listCompanies.innerHTML = 'Carregando...';
        
        try {
            const companies = await SetorService.getCompaniesFull();
            this.modals.listCompanies.innerHTML = '';

            companies.forEach(comp => {
                const item = document.createElement('div');
                item.className = 'modal-item';
                item.innerHTML = `
                    <div>
                        <strong>${comp.nome}</strong>
                        <small>Vinculada a: ${comp.cidade_vinculada}</small>
                    </div>
                    <div class="modal-item-actions">
                        <button class="btn-icon-sm edit" type="button"><i class="fas fa-pen"></i></button>
                        <button class="btn-icon-sm delete" type="button"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                
                item.querySelector('.edit').onclick = () => {
                    this.modals.formCompany.classList.remove('hidden');
                    
                    this.modals.inpCompId.value = comp.id;
                    this.modals.inpCompName.value = comp.nome;
                    this.modals.inpCompCnpj.value = comp.cnpj;
                    this.modals.inpCompDesc.value = comp.descricao || '';
                    this.modals.inpCompObs.value = comp.observacao || '';
                    
                    // CORREÇÃO: Salva o ID da cidade atual para enviar no update
                    this.modals.currentCompanyCityId = comp.id_cidade_vinculada;
                    
                    this.modals.inpCompName.focus();
                };

                item.querySelector('.delete').onclick = () => {
                    showConfirmModal(
                        'Excluir Empresa', 
                        `Tem certeza que deseja apagar <strong>${comp.nome}</strong>?<br><br><small style="color:red">Os setores vinculados serão apagados!</small>`, 
                        async () => {
                            await SetorService.deleteCompany(comp.id);
                            showToast('Empresa excluída!', 'success');
                            this.openCompanyManager();
                            this.handleResetSystem();
                        }
                    );
                };
                
                this.modals.listCompanies.appendChild(item);
            });
        } catch (error) { console.error(error); }
    }
}

new SetoresPage().init();