/* js/pages/cadastro_equipamento.js */
import { BaseFormPage } from '../core/BaseFormPage.js';
import { EquipamentoService } from '../services/equipamento.service.js';
import { UsuariosService } from '../services/usuarios.service.js'; 
import { SetorService } from '../services/setor.service.js';
import { setupInputMasks, InputManager } from '../components/inputs.js';
import { DOMUtils } from '../utils.js';

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
        this.listas = { setores: [], usuarios: [] };
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
            const [setores, usuarios] = await Promise.all([
                SetorService.getAll(),
                UsuariosService.getAll()
            ]);
            this.listas.setores = setores;
            this.listas.usuarios = usuarios;
        } catch (e) {
            console.error(e);
        }
    }

    // --- RENDERIZAÇÃO LIMPA ---
    renderFields() {
        if (!this.dynamicContainer) return;
        
        const type = this.typeSelect ? this.typeSelect.value : 'computador';
        this.dynamicContainer.innerHTML = ''; 

        // Opções de Setor e Usuário
        const opcoesSetor = this.listas.setores.map(s => {
            const empresa = s.nome_empresa || s.empresa || '?';
            const cidade = s.nome_cidade || s.cidade || '?';
            return { 
                value: s.id, 
                label: `${s.nome} - ${empresa} (${cidade})` 
            };
        });

        const opcoesUsuario = this.listas.usuarios.map(u => ({
            value: u.id, 
            label: `${u.nome} (CPF: ${u.cpf})`
        }));

        // Criação dos Campos Comuns
        const fieldUsuario = this.createSelectField('Usuário Responsável', 'usuario', opcoesUsuario, '-- Sem vínculo (Livre) --', true);
        const fieldSetor = this.createSelectField('Setor', 'setor', opcoesSetor, '-- Selecione o Setor --');
        
        // --- CAMPO SALA (Antigo Nome/Identificação) ---
        const fieldSala = this.createTextField('Sala / Localização', 'sala', 'Ex: Sala 104, Recepção');

        const fields = [];
        
        if (type === 'computador') {
            fields.push(this.createTextField('Nº Série', 'serie', 'Ex: NPX-000', 'serial'));
            fields.push(this.createTextField('Modelo', 'modelo', 'Ex: Dell Optiplex 3050'));
            
            // Adiciona Sala
            fields.push(fieldSala);
            
            fields.push(fieldUsuario); 
            fields.push(fieldSetor);
        } else {
            // IMPRESSORA
            fields.push(this.createTextField('Nº Série', 'serie', 'Ex: HP-999', 'serial'));
            fields.push(this.createTextField('Modelo', 'modelo', 'Ex: HP Laserjet Pro'));
            
            // Adiciona Sala
            fields.push(fieldSala);
            
            fields.push(fieldUsuario); 
            fields.push(fieldSetor);
        }

        fields.forEach(field => this.dynamicContainer.appendChild(field));
        setupInputMasks();
    }

    // --- CAPTURA DE DADOS ---
    getExtraData() {
        const setorInput = this.dynamicContainer.querySelector('[name="setor"]');
        const usuarioInput = this.dynamicContainer.querySelector('[name="usuario"]');
        const salaInput = this.dynamicContainer.querySelector('[name="sala"]');
        
        let usuarioValor = '';
        let usuarioId = null;

        if (usuarioInput && usuarioInput.selectedIndex > 0) {
            usuarioId = usuarioInput.value;
            usuarioValor = usuarioInput.options[usuarioInput.selectedIndex].text;
            if(usuarioValor.includes(' (CPF:')) usuarioValor = usuarioValor.split(' (CPF:')[0];
        }

        return {
            tipo: this.typeSelect ? this.typeSelect.value : null,
            id_setor: setorInput ? setorInput.value : null,
            id_usuario: usuarioId,
            usuario: usuarioValor,
            
            // Salva apenas Sala
            sala: salaInput ? salaInput.value : ''
        };
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

    // --- PREENCHIMENTO NA EDIÇÃO ---
    afterFillForm(data) {
        if (this.typeSelect) {
            this.typeSelect.value = data.tipo;
            this.typeSelect.disabled = true; 
            this.typeSelect.style.backgroundColor = "var(--bg-surface)"; 
            this.typeSelect.style.opacity = "0.7";
        }
        
        this.renderFields();
        
        const inputs = this.dynamicContainer.querySelectorAll('input, select');
        
        inputs.forEach(input => {
            if (input.name === 'setor') {
                if (data.id_setor) {
                    input.value = data.id_setor;
                    if (!input.value && data.id_setor) {
                        const opt = document.createElement('option');
                        opt.value = data.id_setor;
                        opt.text = `Setor ID ${data.id_setor} (Arquivado)`;
                        opt.selected = true;
                        input.add(opt);
                    }
                }
            } 
            else if (input.name === 'usuario') {
                if (data.id_usuario) {
                    input.value = data.id_usuario;
                } else if (data.usuario) {
                    let found = false;
                    for (let i = 0; i < input.options.length; i++) {
                        if (input.options[i].text.includes(data.usuario)) {
                            input.selectedIndex = i;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        const opt = document.createElement('option');
                        opt.value = '';
                        opt.text = `${data.usuario} (Legado)`;
                        opt.selected = true;
                        input.add(opt);
                    }
                }
            }
            // Preenche SALA e outros campos
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

    createTextField(label, name, placeholder, mask = null) {
        const labelEl = DOMUtils.create('label', {}, label);
        const inputEl = DOMUtils.create('input', {
            type: 'text', name: name, className: 'custom-input', 
            placeholder: placeholder, required: 'true',
            style: { width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid var(--border-input)', backgroundColor: 'var(--bg-input)', fontSize: '16px', color: 'var(--text-primary)' }
        });
        if (mask) inputEl.dataset.mask = mask;
        const errorSpan = DOMUtils.create('span', { className: 'erro-msg', id: `erro-${name}` });
        return DOMUtils.create('div', { className: 'form-group animate-fade' }, [labelEl, inputEl, errorSpan]);
    }
}

new CadastroEquipamentoPage().init();