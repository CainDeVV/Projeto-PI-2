/* js/pages/cadastro_usuario.js */
import { BaseFormPage } from '../core/BaseFormPage.js';
import { UsuariosService } from '../services/usuarios.service.js';
import { SetorService } from '../services/setor.service.js';
import { InputManager, Validators } from '../components/inputs.js';
import { AuthService } from '../services/auth.service.js';
import { NavigationService } from '../services/navigation.service.js';

class CadastroUsuarioPage extends BaseFormPage {
    constructor() {
        super({
            formId: 'cadastro-usuario-form',
            service: UsuariosService,
            redirectUrl: 'usuarios.html',
            resourceName: 'Usuário'
        });
        this.cpfInput = document.getElementById('cpf');
        this.senhaInput = document.getElementById('senha');
        this.tipoSelect = document.getElementById('tipo');
        this.setorSelect = document.getElementById('setor'); 
        this.currentUser = AuthService.getUser();
    }

    async init() {
        // 1. Carrega lista de setores (Agora com IDs)
        await this.carregarSetores();
        
        // 2. Carrega dados do usuário (Preenche o form)
        await super.init();
        
        // 3. Filtros de segurança
        this.applyPermissionFilters();
        if (this.editId) await this.silentSecurityCheck();
    }

    async carregarSetores() {
        const setores = await SetorService.getAll();
        
        this.setorSelect.innerHTML = '<option value="" selected disabled>Selecione o setor...</option>';
        setores.forEach(s => {
            const opt = document.createElement('option');
            // --- MUDANÇA: O valor agora é o ID, não o nome ---
            opt.value = s.id; 
            // Exibição: Nome (Empresa)
            opt.text = `${s.nome} (${s.nome_empresa || s.empresa || '-'})`;
            this.setorSelect.add(opt);
        });
    }

    // --- PREPARAÇÃO DO PAYLOAD PARA O BANCO ---
    getExtraData() {
        return {
            // Garante que estamos enviando o campo id_setor para o banco
            id_setor: this.setorSelect.value
        };
    }

    afterFillForm(data) {
        // --- TIPO ---
        if (data.tipo && this.tipoSelect) {
            this.tipoSelect.value = data.tipo;
            if (this.tipoSelect.value !== data.tipo) {
                const opt = document.createElement('option');
                opt.text = data.tipo;
                opt.value = data.tipo;
                this.tipoSelect.add(opt);
                this.tipoSelect.value = data.tipo;
            }
        }
        
        // --- CORREÇÃO SETOR (USANDO ID) ---
        // Verifica se existe o ID do setor no objeto carregado
        if (data.id_setor && this.setorSelect) {
            this.setorSelect.value = data.id_setor;
            
            // Se não pegou (setor deletado ou ID não encontrado na lista atual)
            // Cria uma opção visual para não deixar o campo vazio
            if (String(this.setorSelect.value) !== String(data.id_setor)) {
                const opt = document.createElement('option');
                opt.text = `Setor ID ${data.id_setor} (Arquivado/Removido)`;
                opt.value = data.id_setor;
                this.setorSelect.add(opt);
                this.setorSelect.value = data.id_setor;
            }
        }
        
        this.senhaInput.required = false;
        this.senhaInput.placeholder = "Deixe em branco para manter a atual";
    }

    // --- CÓDIGOS ORIGINAIS MANTIDOS ---
    async silentSecurityCheck() {
        if (!this.currentUser || !this.editId) return;
        const targetUser = await this.service.getById(this.editId);
        if (!targetUser) return;
        const myRole = (this.currentUser.tipo || '').toLowerCase();
        const targetRole = (targetUser.tipo || '').toLowerCase();
        if (myRole.includes('técnico') && !targetRole.includes('usuário') && !targetRole.includes('comum')) {
            NavigationService.navigate('usuarios.html');
        }
    }

    applyPermissionFilters() {
        if (!this.currentUser || !this.tipoSelect) return;
        const myRole = (this.currentUser.tipo || '').toLowerCase();
        if (myRole.includes('técnico')) {
            Array.from(this.tipoSelect.options).forEach(opt => {
                if (!opt.value.toLowerCase().includes('usuário') && !opt.value.toLowerCase().includes('comum')) {
                    opt.remove();
                }
            });
        }
    }

    addExtraListeners() {
        const toggleBtn = document.getElementById('togglePassword');
        if(toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.senhaInput.type = this.senhaInput.type === 'password' ? 'text' : 'password';
                toggleBtn.classList.toggle('fa-eye');
                toggleBtn.classList.toggle('fa-eye-slash');
            });
        }
        this.form.addEventListener('input', (e) => InputManager.clearError(e.target));
    }

    validate() {
        let isValid = true;
        InputManager.clearAllErrors(this.form);
        if (!Validators.required(this.cpfInput.value)) {
            InputManager.setError(this.cpfInput, "CPF obrigatório.");
            isValid = false;
        } else if (!Validators.cpf(this.cpfInput.value)) {
            InputManager.setError(this.cpfInput, "CPF inválido.");
            isValid = false;
        }
        if (!this.editId && !Validators.required(this.senhaInput.value)) {
            InputManager.setError(this.senhaInput, "Senha obrigatória.");
            isValid = false;
        } 
        if (!Validators.required(this.tipoSelect.value)) {
            InputManager.setError(this.tipoSelect, "Selecione um tipo.");
            isValid = false;
        }
        if (!Validators.required(this.setorSelect.value)) {
            InputManager.setError(this.setorSelect, "Selecione um setor.");
            isValid = false;
        }
        return isValid;
    }
}

new CadastroUsuarioPage().init();