/* js/pages/cadastro_os.js */
import { BaseFormPage } from '../core/BaseFormPage.js';
import { OsService } from '../services/os.service.js';
import { EquipamentoService } from '../services/equipamento.service.js';
import { UsuariosService } from '../services/usuarios.service.js';
import { SetorService } from '../services/setor.service.js';
import { ErrorLogService } from '../services/error_log.service.js'; // Import novo essencial
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
        // (Só executa se NÃO estiver editando uma O.S. existente)
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
            
            // Esconde campo técnico para usuários comuns
            if(this.tecnicoSelect) {
                const formGroup = this.tecnicoSelect.closest('.form-group');
                if(formGroup) formGroup.style.display = 'none';
            }

            // Se for cadastro novo, auto-seleciona setor do usuário logado
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
                opt.text = `${s.nome} (${s.nome_empresa || '-'})`;
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
            // Salva a opção "Aguardando" se existir
            const defaultOpt = this.tecnicoSelect.firstElementChild ? this.tecnicoSelect.firstElementChild.cloneNode(true) : null;
            this.tecnicoSelect.innerHTML = '';
            if(defaultOpt) this.tecnicoSelect.appendChild(defaultOpt);
            
            users.forEach(u => {
                // Adiciona apenas técnicos e admins na lista de responsáveis (opcional, aqui lista todos)
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
                // Exibe: TIPO - MODELO (SALA)
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
        
        // Mapeia os selects do HTML para as colunas do Banco
        if (this.solicitanteSelect) extra.id_usuario_solicitante = this.solicitanteSelect.value;
        if (this.tecnicoSelect && this.tecnicoSelect.value) {
            extra.id_usuario_responsavel = this.tecnicoSelect.value;
        }

        // Lógica do Equipamento (Computador vs Impressora)
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

    // --- CHAMADO AUTOMATICAMENTE PELA CLASSE MÃE NA EDIÇÃO ---
    afterFillForm(data) {
        // Preenche Descrição
        if(this.descInput) this.descInput.value = data.descricao_problema || '';
        
        // 1. Preenche Setor e Dispara Filtro
        if(this.setorSelect) {
            this.setorSelect.value = data.id_setor;
            
            // Fallback se o setor foi arquivado (não existe na lista atual)
            if(String(this.setorSelect.value) !== String(data.id_setor)) {
                const opt = document.createElement('option');
                opt.value = data.id_setor;
                opt.text = `Setor ID ${data.id_setor} (Arquivado)`;
                this.setorSelect.add(opt);
                this.setorSelect.value = data.id_setor;
            }
        }

        // 2. Filtra Equipamentos com base no Setor carregado e seleciona o correto
        const equipId = data.id_computador || data.id_impressora;
        this.filterEquipmentsBySector(data.id_setor, equipId);
        
        // 3. Seleciona Solicitante
        if(this.solicitanteSelect && data.id_usuario_solicitante) {
            this.solicitanteSelect.value = data.id_usuario_solicitante;
        }
        
        // 4. Seleciona Técnico
        if(this.tecnicoSelect && data.id_usuario_responsavel) {
            this.tecnicoSelect.value = data.id_usuario_responsavel;
        }

        const title = document.querySelector('.form-header-title h2');
        if(title) title.innerText = 'Editar Ordem de Serviço';
    }

    // --- NOVO MÉTODO: CARREGA DADOS DO MONITORAMENTO ---
    async loadFromError(errorId) {
        try {
            // Busca via Service (Backend Ready)
            const errorItem = await ErrorLogService.getById(errorId);

            if (errorItem) {
                console.log("Carregando dados do erro:", errorItem);

                // A. Preenche Descrição
                if (this.descInput) {
                    this.descInput.value = `[AUTO] Monitoramento: ${errorItem.titulo}\nCód: ${errorItem.codigo_erro}\nDetalhes: ${errorItem.descricao}`;
                }

                // B. Tenta selecionar o Equipamento e Setor
                const equipId = errorItem.id_computador || errorItem.id_impressora;
                
                // Procura o equipamento na lista completa carregada
                const equip = this.allEquipments.find(e => String(e.id) === String(equipId));
                
                if (equip) {
                    // 1. Seleciona o Setor do Equipamento
                    if (this.setorSelect) {
                        this.setorSelect.value = equip.id_setor;
                        // Dispara o filtro para carregar o dropdown de equipamentos deste setor
                        this.filterEquipmentsBySector(equip.id_setor, equip.id); 
                    }
                }
                
                showToast('Dados do erro importados. Complete o chamado.', 'info');
                
                // Nota: O backend real deverá tratar o vínculo do erro com a nova O.S. no momento do POST.
            }
        } catch (e) {
            console.error("Erro ao carregar dados do erro:", e);
            showToast('Erro ao carregar dados do monitoramento.', 'error');
        }
    }
}

new CadastroOsPage().init();