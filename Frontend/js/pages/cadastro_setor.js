/* js/pages/cadastro_setor.js */
import { BaseFormPage } from '../core/BaseFormPage.js';
import { SetorService } from '../services/setor.service.js';
import { showToast } from '../components/toast.js';
import { NavigationService, ROUTES } from '../services/navigation.service.js';
import { SidebarComponent } from '../components/sidebar.js'; // Importação necessária

class CadastroSetorPage extends BaseFormPage {
    constructor() {
        super({
            formId: 'sector-form', 
            service: SetorService,
            redirectUrl: 'setores.html',
            resourceName: 'Setor'
        });
        
        // Elementos do Formulário Principal
        this.citySelect = document.getElementById('city-select');
        this.companySelect = document.getElementById('company-select');
        this.btnAddCity = document.getElementById('btn-add-city');
        this.btnAddCompany = document.getElementById('btn-add-company');
        
        // Elementos do Modal de Cidade
        this.modalCity = document.getElementById('modal-city');
        this.formCity = document.getElementById('form-city-modal');
        this.inpCityName = document.getElementById('modal-city-name');
        this.inpCityUF = document.getElementById('modal-city-uf');

        // Elementos do Modal de Empresa
        this.modalCompany = document.getElementById('modal-company');
        this.formCompany = document.getElementById('form-company-modal');
        this.inpCompCityReadonly = document.getElementById('modal-company-city-readonly');
        this.inpCompName = document.getElementById('modal-company-name');
        this.inpCompCNPJ = document.getElementById('modal-company-cnpj');
        this.inpCompDesc = document.getElementById('modal-company-desc');
        this.inpCompObs = document.getElementById('modal-company-obs');

        this.currentId = null;
    }

    async init() {
        new SidebarComponent('tree-menu-container').render(await SetorService.getTreeStructure());
        
        // Carrega Cidades usando IDs
        await this.loadCities();
        
        // Bind inicial do select de cidade
        if(this.citySelect) {
            this.citySelect.addEventListener('change', (e) => {
                this.loadCompanies(e.target.value); // Passa o ID
                if(this.btnAddCompany) {
                    this.btnAddCompany.disabled = !e.target.value;
                }
            });
        }

        this.bindModalEvents();
        
        // Inicializa super mas sobrescrevemos o submit depois
        await super.init();
        this.replaceSubmitHandler();

        const urlParams = new URLSearchParams(window.location.search);
        this.currentId = urlParams.get('id');
        if (this.currentId) {
            await this.forceLoadData(this.currentId);
        }
    }

    async loadCities() {
        // Pega lista de cidades (objeto com id e nome)
        const cities = await SetorService.getCitiesForDropdown();
        this.citySelect.innerHTML = '<option value="">Selecione uma cidade...</option>';
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city.id; // VALUE AGORA É ID
            option.textContent = city.nome;
            this.citySelect.appendChild(option);
        });
    }

    async loadCompanies(cityId, autoSelectValue = null) {
        this.companySelect.innerHTML = '<option value="">Carregando...</option>';
        this.companySelect.disabled = true;
        
        if(this.btnAddCompany) this.btnAddCompany.disabled = !cityId;

        if (!cityId) {
            this.companySelect.innerHTML = '<option value="">Selecione a cidade primeiro...</option>';
            return;
        }

        try {
            // Busca empresas pelo ID DA CIDADE
            const companies = await SetorService.getCompaniesByCityId(cityId);
            this.companySelect.innerHTML = '<option value="">Selecione uma empresa...</option>';
            
            companies.forEach(company => {
                const option = document.createElement('option');
                option.value = company.id; // VALUE AGORA É ID
                option.textContent = company.nome;
                this.companySelect.appendChild(option);
            });
            this.companySelect.disabled = false;

            if (autoSelectValue) {
                this.companySelect.value = autoSelectValue;
            }
        } catch (error) { console.error(error); }
    }

    bindModalEvents() {
        // --- 1. MODAL CIDADE ---
        if (this.btnAddCity) {
            this.btnAddCity.onclick = (e) => {
                e.preventDefault(); // Evita submit do form principal
                this.formCity.reset();
                this.modalCity.classList.add('active');
                setTimeout(() => this.inpCityName.focus(), 100);
            };
        }

        if (this.formCity) {
            this.formCity.onsubmit = async (e) => {
                e.preventDefault();
                const nome = this.inpCityName.value.trim();
                const uf = this.inpCityUF.value.trim().toUpperCase();

                if (!nome || !uf) return showToast('Preencha Nome e UF.', 'warning');

                try {
                    await SetorService.addCity({ nome, uf });
                    showToast('Cidade cadastrada!', 'success');
                    
                    this.modalCity.classList.remove('active');
                    await this.loadCities();
                    
                    // UX: Tenta selecionar a recém criada pelo nome
                    const cities = await SetorService.getCitiesForDropdown();
                    const created = cities.find(c => c.nome === nome);
                    if(created) {
                        this.citySelect.value = created.id;
                        this.citySelect.dispatchEvent(new Event('change'));
                    }
                } catch (err) {
                    console.error(err);
                    showToast('Erro ao salvar cidade.', 'error');
                }
            };
        }

        // --- 2. MODAL EMPRESA ---
        if (this.btnAddCompany) {
            this.btnAddCompany.onclick = (e) => {
                e.preventDefault();
                const currentCityId = this.citySelect.value;
                if (!currentCityId) return showToast('Selecione uma cidade antes.', 'warning');

                this.formCompany.reset();
                this.inpCompCityReadonly.value = this.citySelect.options[this.citySelect.selectedIndex].text;
                this.modalCompany.classList.add('active');
            };
        }

        if (this.formCompany) {
            this.formCompany.onsubmit = async (e) => {
                e.preventDefault();
                const cityId = this.citySelect.value; // ID
                const nome = this.inpCompName.value.trim();
                
                try {
                    await SetorService.addCompany({
                        nome: nome,
                        cnpj: this.inpCompCNPJ.value.trim(),
                        descricao: this.inpCompDesc.value,
                        observacao: this.inpCompObs.value,
                        cidade_vinculada: cityId // Envia ID
                    });
                    
                    showToast('Empresa salva!', 'success');
                    this.modalCompany.classList.remove('active');
                    await this.loadCompanies(cityId); 
                    
                    // UX: Tenta selecionar a empresa recém criada
                    const companies = await SetorService.getCompaniesByCityId(cityId);
                    const created = companies.find(c => c.nome === nome);
                    if(created) {
                        this.companySelect.value = created.id;
                    }
                } catch (err) {
                    console.error(err);
                    showToast('Erro ao salvar empresa.', 'error');
                }
            };
        }

        // --- FECHAR MODAIS ---
        document.querySelectorAll('.modal-close, .modal-overlay .btn-cancel').forEach(btn => {
            btn.onclick = (e) => {
                const modal = e.target.closest('.modal-overlay');
                if (modal) modal.classList.remove('active');
            };
        });
    }

    replaceSubmitHandler() {
        const form = document.getElementById('sector-form');
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        // Re-mapeia as referências pois o clone removeu as antigas
        this.citySelect = document.getElementById('city-select');
        this.companySelect = document.getElementById('company-select');
        this.btnAddCity = document.getElementById('btn-add-city');
        this.btnAddCompany = document.getElementById('btn-add-company');

        // Re-bind change
        this.citySelect.addEventListener('change', (e) => {
            this.loadCompanies(e.target.value);
            if(this.btnAddCompany) this.btnAddCompany.disabled = !e.target.value;
        });
        
        // Re-bind dos modais (importante!)
        this.bindModalEvents();

        newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const empresaVal = this.companySelect.value;
            const empresaId = empresaVal ? parseInt(empresaVal) : null;

            const formData = {
                nome: document.getElementById('nome').value.trim(),
                localizacao: document.getElementById('localizacao').value.trim(),
                observacao: document.getElementById('observacao').value.trim(),
                empresa: empresaId 
            };

            if (!formData.nome || !formData.empresa) {
                return showToast('Preencha os campos obrigatórios (*)', 'error');
            }

            try {
                if (this.currentId) {
                    await this.service.update(this.currentId, formData);
                    showToast('Setor atualizado!', 'success');
                } else {
                    await this.service.add(formData);
                    showToast('Setor criado!', 'success');
                }
                setTimeout(() => NavigationService.navigate(ROUTES.SECTORS_LIST), 500);
            } catch (error) { 
                console.error(error);
                showToast('Erro ao salvar.', 'error'); 
            }
        });
    }

    async forceLoadData(id) {
        try {
            const data = await this.service.getById(id);
            if (!data) return;

            document.getElementById('nome').value = data.nome || '';
            document.getElementById('localizacao').value = data.localizacao || '';
            document.getElementById('observacao').value = data.observacao || '';

            // Detecta o ID da empresa (se vier direto ou aninhado)
            // Se o backend manda objeto completo: data.empresa.id
            // Se o backend manda normalizado (não é o caso do getById padrão): data.id_empresa
            const empresaId = (data.empresa && data.empresa.id) ? data.empresa.id : data.id_empresa;

            if (empresaId) {
                // Buscamos todas as empresas para descobrir a cidade
                const allCompanies = await SetorService.getCompaniesFull();
                const myCompany = allCompanies.find(c => String(c.id) === String(empresaId));

                if (myCompany) {
                    // Seleciona Cidade (ID)
                    this.citySelect.value = myCompany.id_cidade_vinculada;
                    // Carrega Empresas daquela cidade e seleciona a empresa certa
                    await this.loadCompanies(myCompany.id_cidade_vinculada, myCompany.id);
                }
            }
            
            const title = document.querySelector('.form-header-title h2');
            if(title) title.innerText = 'Alterar Setor';
        } catch (error) { console.error(error); }
    }
}

new CadastroSetorPage().init();