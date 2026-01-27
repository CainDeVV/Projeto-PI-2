/* js/pages/cadastro_os.js */
import { BaseFormPage } from '../core/BaseFormPage.js';
import { OsService } from '../services/os.service.js';
import { EquipamentoService } from '../services/equipamento.service.js';
import { UsuariosService } from '../services/usuarios.service.js';
import { SetorService } from '../services/setor.service.js';
import { ErrorLogService } from '../services/error_log.service.js'; 
import { AuthService } from '../services/auth.service.js';
import { NavigationService } from '../services/navigation.service.js';
import { showToast } from '../components/toast.js';

class CadastroOsPage extends BaseFormPage {
    constructor() {
        super({
            formId: 'cadastro-os-form',
            service: OsService,
            redirectUrl: 'os.html',
            resourceName: 'Ordem de Serviço'
        });

        // Referências aos elementos do DOM
        this.equipSelect = document.getElementById('equipamento');
        this.solicitanteSelect = document.getElementById('solicitante');
        this.tecnicoSelect = document.getElementById('tecnico');
        this.setorSelect = document.getElementById('setor');
        this.descInput = document.getElementById('descricao');

        this.allEquipments = [];
        this.currentUser = AuthService.getUser();
    }

    async init() {
        const isCommon = this.currentUser && (this.currentUser.tipo.includes('Comum') || this.currentUser.tipo.includes('Usuário'));
        
        if (isCommon) {
            this.redirectUrl = 'user_panel.html';
            document.body.classList.add('layout-full-width');
        }

        // 1. Carrega as listas (Setores, Usuários, Equipamentos)
        await this.loadDependencies();

        // 2. Configura evento de troca de setor
        if (this.setorSelect) {
            this.setorSelect.addEventListener('change', (e) => {
                this.filterEquipmentsBySector(e.target.value);
            });
        }

        // 3. Inicializa a lógica base (Isso vai chamar o afterFillForm se for edição)
        await super.init();

        // --- 5. NOVO: VERIFICA SE VEIO DE UM ERRO DO MONITORAMENTO ---
        const urlParams = new URLSearchParams(window.location.search);
        const errorId = urlParams.get('fromError');
        
        if (errorId && !this.editId) { 
            await this.loadFromError(errorId);
        }
        
        // 4. Lógica específica para Usuário Comum
        if (isCommon) {
            if(this.header) {
                this.header.render(() => NavigationService.navigate(this.redirectUrl), 'history');
                this.header.updateButtons('only-back');
            }
            if(this.sidebar) this.sidebar.render(null, () => {}, false);
            
            this.lockSolicitanteField();
            
            if(this.tecnicoSelect) {
                const formGroup = this.tecnicoSelect.closest('.form-group');
                if(formGroup) formGroup.style.display = 'none';
            }

            if (!this.editId && this.currentUser.id_setor) {
                this.setorSelect.value = this.currentUser.id_setor;
                this.filterEquipmentsBySector(this.currentUser.id_setor);
            }
        }
    }

    async loadDependencies() {
        const [allEquips, setores, users] = await Promise.all([
            EquipamentoService.getAll(),
            SetorService.getAll(),
            UsuariosService.getAll()
        ]);
        this.allEquipments = allEquips;

        // Preenche Setores
        if(this.setorSelect) {
            this.setorSelect.innerHTML = '<option value="">Selecione...</option>';
            setores.sort((a,b) => a.nome.localeCompare(b.nome)).forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.id; 
                
                const empresa = s.empresa || 'Empresa N/A';
                const cidade = s.cidade || 'Cidade N/A';
                
                opt.text = `${s.nome} - ${empresa} (${cidade})`;
                
                this.setorSelect.add(opt);
            });
        }

        // Preenche Solicitantes
        if(this.solicitanteSelect) {
            this.solicitanteSelect.innerHTML = '<option value="">Selecione...</option>';
            users.forEach(u => {
                const opt = document.createElement('option');
                opt.value = u.id; 
                opt.text = u.nome;
                this.solicitanteSelect.add(opt);
            });
        }

        // Preenche Técnicos
        if(this.tecnicoSelect) {
            const defaultOpt = this.tecnicoSelect.firstElementChild ? this.tecnicoSelect.firstElementChild.cloneNode(true) : null;
            this.tecnicoSelect.innerHTML = '';
            if(defaultOpt) this.tecnicoSelect.appendChild(defaultOpt);
            
            users.forEach(u => {
                const opt = document.createElement('option');
                opt.value = u.id; 
                opt.text = u.nome;
                this.tecnicoSelect.add(opt);
            });
        }
    }

    filterEquipmentsBySector(sectorId, selectedId = null) {
        this.equipSelect.innerHTML = '<option value="">Selecione...</option>';
        this.equipSelect.disabled = true;
        if (!sectorId) return;

        const filtered = this.allEquipments.filter(eq => String(eq.id_setor) === String(sectorId));

        if (filtered.length > 0) {
            this.equipSelect.disabled = false;
            filtered.forEach(eq => {
                const opt = document.createElement('option');
                opt.value = eq.id;
                const salaInfo = eq.sala ? ` - ${eq.sala}` : '';
                opt.text = `${eq.tipo.toUpperCase()} - ${eq.modelo}${salaInfo}`;
                opt.dataset.type = eq.tipo;
                this.equipSelect.add(opt);
            });
        } else {
            this.equipSelect.innerHTML = '<option value="">Nenhum equipamento neste setor</option>';
        }
        
        if (selectedId) this.equipSelect.value = selectedId;
    }

    lockSolicitanteField() {
        if (!this.solicitanteSelect) return;
        this.solicitanteSelect.value = this.currentUser.id;
        this.solicitanteSelect.style.pointerEvents = "none";
        this.solicitanteSelect.style.background = "#eee";
        this.solicitanteSelect.classList.add('readonly-field');
    }

    getExtraData() {
        const extra = {};
        
        if (this.solicitanteSelect) extra.id_usuario_solicitante = this.solicitanteSelect.value;
        if (this.tecnicoSelect && this.tecnicoSelect.value) {
            extra.id_usuario_responsavel = this.tecnicoSelect.value;
        }

        const selectedId = this.equipSelect.value;
        if (selectedId && this.equipSelect.selectedIndex >= 0) {
            const selectedOption = this.equipSelect.options[this.equipSelect.selectedIndex];
            const type = selectedOption.dataset.type; 
            
            if (type === 'computador') {
                extra.id_computador = selectedId;
                extra.id_impressora = null;
            } else {
                extra.id_impressora = selectedId;
                extra.id_computador = null;
            }
        }
        
        extra.id_setor = this.setorSelect.value;

        if (!this.editId) {
            extra.data_abertura = new Date().toISOString();
            extra.status = 'Aberto';
        }

        return extra;
    }

    afterFillForm(data) {
        if(this.descInput) {
            this.descInput.value = data.descricao || data.descricaoProblema || '';
        }
        
        if(this.setorSelect) {
            this.setorSelect.value = data.id_setor;
            
            if(String(this.setorSelect.value) !== String(data.id_setor)) {
                const opt = document.createElement('option');
                opt.value = data.id_setor;
                opt.text = `Setor ID ${data.id_setor} (Arquivado)`;
                this.setorSelect.add(opt);
                this.setorSelect.value = data.id_setor;
            }
        }

        const equipId = data.id_computador || data.id_impressora;
        this.filterEquipmentsBySector(data.id_setor, equipId);
        
        if(this.solicitanteSelect && data.id_usuario_solicitante) {
            this.solicitanteSelect.value = data.id_usuario_solicitante;
        }
        
        if(this.tecnicoSelect && data.id_usuario_responsavel) {
            this.tecnicoSelect.value = data.id_usuario_responsavel;
        }

        const title = document.querySelector('.form-header-title h2');
        if(title) title.innerText = 'Editar Ordem de Serviço';
    }

    async loadFromError(errorId) {
        try {
            const errorItem = await ErrorLogService.getById(errorId);

            if (errorItem) {
                console.log("Carregando dados do erro:", errorItem);

                // Preenche descrição
                if (this.descInput) {
                    this.descInput.value = `[AUTO] Monitoramento: ${errorItem.titulo}\nCód: ${errorItem.codigoErro}\nDetalhes: ${errorItem.descricao}`;
                }

                // CORREÇÃO AQUI:
                // O Java retorna objetos aninhados (computador.id) ou idEquipamentoAlvo
                let equipId = errorItem.idEquipamentoAlvo;
                
                // Se idEquipamentoAlvo for nulo, tenta pegar dos objetos aninhados
                if (!equipId) {
                    if (errorItem.computador) equipId = errorItem.computador.id;
                    else if (errorItem.impressora) equipId = errorItem.impressora.id;
                }

                // Procura na lista local de equipamentos
                const equip = this.allEquipments.find(e => String(e.id) === String(equipId));
                
                if (equip) {
                    // Seleciona Setor
                    if (this.setorSelect) {
                        this.setorSelect.value = equip.id_setor;
                        
                        // Atualiza lista de equipamentos e seleciona o alvo
                        this.filterEquipmentsBySector(equip.id_setor, equip.id); 
                    }
                }
                
                showToast('Dados do erro importados. Complete o chamado.', 'info');
            }
        } catch (e) {
            console.error("Erro ao carregar dados do erro:", e);
            showToast('Erro ao carregar dados do monitoramento.', 'error');
        }
    }
}

new CadastroOsPage().init();