/* js/pages/sector_form.js */
import { HeaderComponent } from '../components/header.js';
import { SidebarComponent } from '../components/sidebar.js';
import { SetorService } from '../services/setor.service.js';
import { showToast } from '../components/toast.js';
import { NavigationService, ROUTES } from '../services/navigation.service.js';

class SectorFormPage {
    constructor() {
        this.formSector = document.getElementById('sector-form');
        this.formCityModal = document.getElementById('form-city-modal');
        this.formCompanyModal = document.getElementById('form-company-modal');
        
        this.elements = {
            citySelect: document.getElementById('city-select'),
            btnOpenCity: document.getElementById('btn-open-city-modal'),
            
            companySelect: document.getElementById('company-select'),
            btnOpenCompany: document.getElementById('btn-open-company-modal'),
            
            // Modal Cidade
            modalCityName: document.getElementById('modal-city-name'),
            modalCityUf: document.getElementById('modal-city-uf'),
            
            // Modal Empresa
            modalCompanyCityReadonly: document.getElementById('modal-company-city-readonly'),
            modalCompanyName: document.getElementById('modal-company-name'),
            modalCompanyCnpj: document.getElementById('modal-company-cnpj'),
            modalCompanyDesc: document.getElementById('modal-company-desc'),
            modalCompanyObs: document.getElementById('modal-company-obs'),

            // Setor
            sectorInput: document.getElementById('nome'),
            sectorAddress: document.getElementById('localizacao'),
            sectorObs: document.getElementById('observacao')
        };
    }

    async init() {
        new HeaderComponent('app-header').render(null, 'sector-form');
        new SidebarComponent('app-sidebar').render(await SetorService.getTreeStructure());

        await this.loadCities();
        this.bindEvents();
    }

    async loadCities() {
        const cities = await SetorService.getUniqueCities();
        this.populateSelect(this.elements.citySelect, cities, 'Selecione uma cidade...');
    }

    async loadCompanies(cityName) {
        if (!cityName) {
            this.populateSelect(this.elements.companySelect, [], 'Selecione a cidade primeiro...');
            this.toggleCompanyDisable(true);
            return;
        }

        const companies = await SetorService.getCompaniesByCity(cityName);
        
        if (companies.length > 0) {
            this.populateSelect(this.elements.companySelect, companies, 'Selecione uma empresa...');
            this.toggleCompanyDisable(false);
        } else {
            this.populateSelect(this.elements.companySelect, [], 'Nenhuma empresa cadastrada');
            // Mantemos habilitado para permitir adicionar nova empresa
            this.toggleCompanyDisable(false);
        }
    }

    populateSelect(selectElement, items, defaultText) {
        const currentValue = selectElement.value;
        selectElement.innerHTML = `<option value="">${defaultText}</option>`;
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            selectElement.appendChild(option);
        });
        if (items.includes(currentValue)) {
            selectElement.value = currentValue;
        }
    }

    toggleCompanyDisable(disable) {
        this.elements.companySelect.disabled = disable;
        this.elements.btnOpenCompany.disabled = disable;
        if(disable) this.elements.btnOpenCompany.classList.add('disabled');
        else this.elements.btnOpenCompany.classList.remove('disabled');
    }

    toggleModal(modalId, show) {
        const modal = document.getElementById(modalId);
        if (show) modal.classList.add('active');
        else modal.classList.remove('active');
    }

    bindEvents() {
        this.elements.citySelect.addEventListener('change', (e) => {
            this.loadCompanies(e.target.value);
        });

        this.elements.btnOpenCity.addEventListener('click', () => {
            this.formCityModal.reset();
            this.toggleModal('modal-city', true);
        });

        this.elements.btnOpenCompany.addEventListener('click', () => {
            this.formCompanyModal.reset();
            this.elements.modalCompanyCityReadonly.value = this.elements.citySelect.value;
            this.toggleModal('modal-company', true);
        });

        document.querySelectorAll('[data-close]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.target.getAttribute('data-close');
                this.toggleModal(modalId, false);
            });
        });

        // --- SUBMITS COM PERSISTÊNCIA REAL ---

        // A. SALVAR CIDADE
        this.formCityModal.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = this.elements.modalCityName.value.trim();
            const uf = this.elements.modalCityUf.value.trim().toUpperCase();

            if (uf.length !== 2) return showToast('UF inválida', 'error');

            try {
                // PERSISTÊNCIA: Salva no MockDatabase via Service
                await SetorService.addCity({ 
                    nome: name, 
                    uf: uf 
                });
                
                showToast(`Cidade ${name} cadastrada!`, 'success');
                this.toggleModal('modal-city', false);
                
                await this.loadCities();
                this.elements.citySelect.value = name;
                // Dispara change para preparar o campo de empresa
                this.elements.citySelect.dispatchEvent(new Event('change'));

            } catch (error) {
                console.error(error);
                showToast('Erro ao salvar cidade', 'error');
            }
        });

        // B. SALVAR EMPRESA
        this.formCompanyModal.addEventListener('submit', async (e) => {
            e.preventDefault();
            const cityName = this.elements.citySelect.value;
            
            const companyData = {
                nome: this.elements.modalCompanyName.value.trim(),
                cnpj: this.elements.modalCompanyCnpj.value.trim(),
                descricao: this.elements.modalCompanyDesc.value.trim(),
                observacao: this.elements.modalCompanyObs.value.trim(),
                cidade_vinculada: cityName // Importante para o filtro
            };

            try {
                // PERSISTÊNCIA
                await SetorService.addCompany(companyData);

                showToast(`Empresa ${companyData.nome} salva!`, 'success');
                this.toggleModal('modal-company', false);

                await this.loadCompanies(cityName);
                this.elements.companySelect.value = companyData.nome;

            } catch (error) {
                console.error(error);
                showToast('Erro ao salvar empresa', 'error');
            }
        });

        // C. SALVAR SETOR
        this.formSector.addEventListener('submit', async (e) => {
            e.preventDefault();

            const cidade = this.elements.citySelect.value;
            const empresa = this.elements.companySelect.value;
            const setorNome = this.elements.sectorInput.value.trim();

            if (!cidade || !empresa || !setorNome) {
                return showToast('Preencha os campos obrigatórios', 'error');
            }

            try {
                const newSector = {
                    nome: setorNome,
                    localizacao: this.elements.sectorAddress.value.trim(),
                    observacao: this.elements.sectorObs.value.trim(),
                    cidade: cidade,
                    empresa: empresa
                };

                await SetorService.add(newSector);
                showToast('Setor cadastrado com sucesso!', 'success');
                setTimeout(() => NavigationService.navigate(ROUTES.SECTORS_LIST), 1000);
            } catch (error) {
                console.error(error);
                showToast('Erro ao salvar setor.', 'error');
            }
        });
    }
}

new SectorFormPage().init();