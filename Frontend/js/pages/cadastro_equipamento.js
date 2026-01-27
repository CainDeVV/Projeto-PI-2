/* js/pages/cadastro_equipamento.js */
import { BaseFormPage } from '../core/BaseFormPage.js';
import { EquipamentoService } from '../services/equipamento.service.js';
import { UsuariosService } from '../services/usuarios.service.js'; 
import { SetorService } from '../services/setor.service.js';
import { setupInputMasks, InputManager } from '../components/inputs.js';
import { DOMUtils } from '../utils.js';
import { showToast } from '../components/toast.js';
import { NavigationService } from '../services/navigation.service.js';

class CadastroEquipamentoPage extends BaseFormPage {
    constructor() {
        super({
            formId: 'cadastro-form',
            service: EquipamentoService,
            redirectUrl: 'equipamento.html',
            resourceName: 'Equipamento'
        });
        
        this.typeSelect = document.getElementById('equip-type-select');
        this.dynamicContainer = document.getElementById('dynamic-fields');
        this.listas = { setores: [], usuarios: [], computadores: [] };
    }

    async init() {
        await this.carregarDadosListas();

        if (this.typeSelect) {
            this.typeSelect.addEventListener('change', () => this.renderFields());
        }
        
        this.renderFields();
        await super.init();
    }

    async carregarDadosListas() {
        try {
            const [setores, usuarios, equipamentos] = await Promise.all([
                SetorService.getAll(),
                UsuariosService.getAll(),
                EquipamentoService.getAll()
            ]);
            
            this.listas.setores = setores;
            this.listas.usuarios = usuarios;
            this.listas.computadores = equipamentos.filter(e => e.tipo === 'computador');
        } catch (e) {
            console.error(e);
        }
    }

    async loadData(id) {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const typeHint = urlParams.get('type');
            const item = await this.service.getById(id, typeHint);

            if (item) {
                this.fillForm(item);
                this.updateUIForEdit();
                
                // Se for impressora e tiver setor, filtra os PCs imediatamente após carregar
                if (typeHint === 'impressora' && item.id_setor) {
                    this.atualizarListaComputadoresPorSetor(item.id_setor, item.id_computador);
                }
            } else {
                showToast('Item não encontrado.', 'error');
                NavigationService.navigate(this.redirectUrl);
            }
        } catch (e) {
            console.error(e);
            showToast('Erro ao carregar dados.', 'error');
        }
    }

    // --- NOVA FUNÇÃO: FILTRA PCS POR SETOR ---
    atualizarListaComputadoresPorSetor(setorId, selectedPcId = null) {
        const pcSelect = this.dynamicContainer.querySelector('[name="computador"]');
        if (!pcSelect) return;

        pcSelect.innerHTML = '<option value="">-- Sem vínculo (Rede/Wifi) --</option>';
        
        if (!setorId) {
            pcSelect.disabled = true;
            return;
        }

        const pcsDoSetor = this.listas.computadores.filter(pc => String(pc.id_setor) === String(setorId));

        if (pcsDoSetor.length > 0) {
            pcSelect.disabled = false;
            pcsDoSetor.forEach(pc => {
                const opt = document.createElement('option');
                opt.value = pc.id;
                opt.text = `${pc.nome || 'PC'} (${pc.serie}) - ${pc.sala}`;
                if (String(pc.id) === String(selectedPcId)) opt.selected = true;
                pcSelect.add(opt);
            });
        } else {
            pcSelect.disabled = true;
            const opt = document.createElement('option');
            opt.text = "Nenhum PC disponível neste setor";
            opt.disabled = true;
            pcSelect.add(opt);
        }
    }

    renderFields() {
        if (!this.dynamicContainer) return;
        
        const type = this.typeSelect ? this.typeSelect.value : 'computador';
        this.dynamicContainer.innerHTML = ''; 

        const opcoesSetor = this.listas.setores.map(s => {
            const empresa = s.nome_empresa || s.empresa || '?';
            const cidade = s.nome_cidade || s.cidade || '?';
            return { value: s.id, label: `${s.nome} - ${empresa} (${cidade})` };
        });

        const opcoesUsuario = this.listas.usuarios.map(u => ({
            value: u.id, label: `${u.nome} (CPF: ${u.cpf})`
        }));
        
        const fieldUsuario = this.createSelectField('Usuário Responsável', 'usuario', opcoesUsuario, '-- Sem vínculo (Livre) --', true);
        const fieldSetor = this.createSelectField('Setor', 'setor', opcoesSetor, '-- Selecione o Setor --');
        const fieldSala = this.createTextField('Sala / Localização', 'sala', 'Ex: Sala 104, Recepção');

        const fields = [];
        
        if (type === 'computador') {
            fields.push(this.createTextField('Nome do PC', 'nome', 'Ex: PC-01 (Opcional)', null, true));
            fields.push(this.createTextField('Nº Série', 'numeroSerie', 'Ex: NPX-000', 'serial'));
            fields.push(this.createTextField('Modelo', 'modelo', 'Ex: Dell Optiplex 3050'));
            fields.push(fieldSala);
            fields.push(fieldUsuario); 
            fields.push(fieldSetor);
        } else {
            fields.push(this.createTextField('Nº Série', 'numeroSerie', 'Ex: HP-999', 'serial'));
            fields.push(this.createTextField('Modelo', 'modelo', 'Ex: HP Laserjet Pro'));
            fields.push(fieldSala);
            fields.push(fieldUsuario); 
            fields.push(fieldSetor);

            // Campo de computador começa vazio/desabilitado até escolher o setor
            const fieldPC = this.createSelectField('Conectado ao PC (Opcional)', 'computador', [], '-- Selecione o Setor primeiro --', true);
            fields.push(fieldPC);
        }

        fields.forEach(field => this.dynamicContainer.appendChild(field));

        // --- ADICIONA O LISTENER DE FILTRO NO SETOR ---
        const sectorEl = this.dynamicContainer.querySelector('[name="setor"]');
        if (sectorEl && type === 'impressora') {
            sectorEl.addEventListener('change', (e) => this.atualizarListaComputadoresPorSetor(e.target.value));
        }

        setupInputMasks();
    }

    getExtraData() {
        const setorInput = this.dynamicContainer.querySelector('[name="setor"]');
        const usuarioInput = this.dynamicContainer.querySelector('[name="usuario"]');
        const pcInput = this.dynamicContainer.querySelector('[name="computador"]');
        
        const dados = {
            tipo: this.typeSelect ? this.typeSelect.value : 'computador'
        };

        if (setorInput && setorInput.value) dados.setor = { id: parseInt(setorInput.value, 10) };
        if (usuarioInput && usuarioInput.value) dados.usuario = { id: parseInt(usuarioInput.value, 10) };
        if (pcInput && pcInput.value) dados.computador = { id: parseInt(pcInput.value, 10) };
        else dados.computador = null;

        return dados;
    }

    validate() {
        const inputs = this.dynamicContainer.querySelectorAll('input[required], select[required]');
        let isValid = true;
        inputs.forEach(input => {
            if (!input.value.trim()) {
                InputManager.setError(input, 'Campo obrigatório.');
                isValid = false;
            }
        });
        return isValid;
    }

    afterFillForm(data) {
        if (this.typeSelect) {
            if (data.tipo) {
                this.typeSelect.value = data.tipo;
            }
            this.typeSelect.disabled = true; 
            this.typeSelect.style.backgroundColor = "var(--bg-surface)"; 
            this.typeSelect.style.opacity = "0.7";
        }
        
        this.renderFields();
        
        const inputs = this.dynamicContainer.querySelectorAll('input, select');
        
        inputs.forEach(input => {
            if (input.name === 'setor') {
                const setorId = data.id_setor || (typeof data.setor === 'object' ? data.setor.id : null);
                if (setorId) {
                    input.value = setorId;
                }
            } 
            else if (input.name === 'usuario') {
                const userId = data.id_usuario || (typeof data.usuario === 'object' ? data.usuario.id : null);
                if (userId) input.value = userId;
            }
            else if (input.name === 'computador') {
                // O preenchimento do PC na edição é feito no loadData via atualizarListaComputadoresPorSetor
            }
            else if (data[input.name]) {
                input.value = data[input.name];
            }
        });
    }

    createSelectField(label, name, options, placeholder, isOptional = false) {
        const labelEl = DOMUtils.create('label', {}, label);
        if(isOptional) labelEl.appendChild(DOMUtils.create('small', { style: {color: '#888', marginLeft: '5px'} }, '(Opcional)'));

        const selectProps = { name: name, className: 'custom-select' };
        if (!isOptional) selectProps.required = 'true';

        const selectEl = DOMUtils.create('select', selectProps);
        selectEl.appendChild(DOMUtils.create('option', { value: '' }, placeholder));

        options.forEach(opt => {
            selectEl.appendChild(DOMUtils.create('option', { value: opt.value }, opt.label));
        });

        const iconEl = DOMUtils.create('i', { className: 'fas fa-chevron-down select-icon' });
        const wrapperEl = DOMUtils.create('div', { className: 'custom-select-wrapper' }, [selectEl, iconEl]);
        const errorSpan = DOMUtils.create('span', { className: 'erro-msg', id: `erro-${name}` });

        return DOMUtils.create('div', { className: 'form-group animate-fade' }, [ labelEl, wrapperEl, errorSpan ]);
    }

    createTextField(label, name, placeholder, mask = null, isOptional = false) {
        const labelEl = DOMUtils.create('label', {}, label);
        if(isOptional) labelEl.appendChild(DOMUtils.create('small', { style: {color: '#888', marginLeft: '5px'} }, '(Opcional)'));

        const inputProps = {
            type: 'text', name: name, className: 'custom-input', 
            placeholder: placeholder,
            style: { width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid var(--border-input)', backgroundColor: 'var(--bg-input)', fontSize: '16px', color: 'var(--text-primary)' }
        };
        if (!isOptional) inputProps.required = 'true';

        const inputEl = DOMUtils.create('input', inputProps);
        if (mask) inputEl.dataset.mask = mask;
        const errorSpan = DOMUtils.create('span', { className: 'erro-msg', id: `erro-${name}` });
        return DOMUtils.create('div', { className: 'form-group animate-fade' }, [labelEl, inputEl, errorSpan]);
    }
}

new CadastroEquipamentoPage().init();