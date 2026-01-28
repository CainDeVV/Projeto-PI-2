/* js/services/equipamento.service.js */
import { BaseService } from '../core/BaseService.js';
import { APP_CONFIG } from '../config/constants.js'; 

class EquipamentoServiceClass extends BaseService {
    constructor() {
        super('equipments', 'Equipamento'); 
        this.apiPc = `${APP_CONFIG.API_BASE_URL}/computadores`;
        this.apiImp = `${APP_CONFIG.API_BASE_URL}/impressoras`;
    }

    // --- LEITURA (GET) ---
    async getAll() {
        if (!APP_CONFIG.USE_MOCK_DATA) {
            try {
                const [pcs, imps] = await Promise.all([
                    this.fetchJson(this.apiPc),
                    this.fetchJson(this.apiImp)
                ]);
                const pcsTyped = pcs.map(p => this._normalize(p, 'computador'));
                const impsTyped = imps.map(i => this._normalize(i, 'impressora'));
                return [...pcsTyped, ...impsTyped];
            } catch (error) {
                console.error("Erro busca:", error);
                return [];
            }
        }
        return []; 
    }

    async getById(id) {
        if (!APP_CONFIG.USE_MOCK_DATA) {
            try {
                // Tenta buscar como PC
                const pc = await this.fetchJson(`${this.apiPc}/${id}`);
                return this._normalize(pc, 'computador');
            } catch (e) {
                try {
                    // Se falhar, tenta buscar como Impressora
                    const imp = await this.fetchJson(`${this.apiImp}/${id}`);
                    return this._normalize(imp, 'impressora');
                } catch (e2) {
                    return null;
                }
            }
        }
        return null;
    }

    // --- SALVAR (ROTEADOR) ---
    async save(data) {
        if (data.id) {
            return this.update(data.id, data);
        } else {
            return this.add(data);
        }
    }

    // --- CRIAR (POST) ---
    async add(data) {
        if (!APP_CONFIG.USE_MOCK_DATA) {
            const url = data.tipo === 'impressora' ? this.apiImp : this.apiPc;
            
            // LIMPEZA FINAL
            const payload = this._cleanPayload(data);

            const result = await this.fetchJson(url, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            // LOG DA AÇÃO
            this._logAction('CREATE', `Criou ${data.tipo}: ${data.modelo}`);
            
            return result;
        }
        return {};
    }

    // --- ATUALIZAR (PUT) ---
    async update(id, data) {
        if (!APP_CONFIG.USE_MOCK_DATA) {
            const url = data.tipo === 'impressora' ? `${this.apiImp}/${id}` : `${this.apiPc}/${id}`;
            
            // LIMPEZA FINAL
            const payload = this._cleanPayload(data);
            payload.id = parseInt(id, 10);

            const result = await this.fetchJson(url, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });

            // LOG DA AÇÃO
            this._logAction('UPDATE', `Editou ${data.tipo}: ${data.modelo}`);

            return result;
        }
        return {};
    }

    // --- EXCLUIR (DELETE) ---
    async delete(id) {
        if (!APP_CONFIG.USE_MOCK_DATA) {
            let endpoint = `${this.apiPc}/${id}`;
            let tipoApagado = 'Computador';
            
            let response = await fetch(endpoint, { method: 'DELETE', headers: this.getHeaders() });

            if (response.status === 404) {
                endpoint = `${this.apiImp}/${id}`;
                tipoApagado = 'Impressora';
                response = await fetch(endpoint, { method: 'DELETE', headers: this.getHeaders() });
            }

            if (!response.ok) {
                const errorText = await response.text(); 
                throw new Error(errorText || 'Erro ao excluir.');
            }

            // LOG DA AÇÃO
            this._logAction('DELETE', `Excluiu ${tipoApagado} ID ${id}`);

            return true;
        }
        return true;
    }

    // --- FUNÇÃO DE LIMPEZA (JSON FRONT -> BACK) ---
    _cleanPayload(data) {
        const clean = { ...data };
        delete clean.tipo; 
        if (clean.id) clean.id = parseInt(clean.id, 10);
        
        // Se vier campo 'serie' (do form), converte para 'numeroSerie' (pro Java)
        if (clean.serie) {
            clean.numeroSerie = clean.serie;
            delete clean.serie;
        }
        
        if (clean.setor && (typeof clean.setor === 'string' || typeof clean.setor === 'number')) {
            clean.setor = { id: parseInt(clean.setor, 10) };
        } else if (clean.setor && clean.setor.id) {
            clean.setor = { id: parseInt(clean.setor.id, 10) };
        }

        if (clean.usuario === "" || clean.usuario === "0" || clean.usuario === 0) {
            clean.usuario = null;
        } else if (clean.usuario && (typeof clean.usuario === 'string' || typeof clean.usuario === 'number')) {
            clean.usuario = { id: parseInt(clean.usuario, 10) };
        } else if (clean.usuario && clean.usuario.id) {
            clean.usuario = { id: parseInt(clean.usuario.id, 10) };
        } else {
            clean.usuario = null;
        }

        return clean;
    }

    // --- MÉTODOS EXTRAS ---
    async getPrintersByParentId(computadorId) {
        if (!APP_CONFIG.USE_MOCK_DATA) {
            try {
                const imps = await this.fetchJson(`${this.apiImp}?computadorId=${computadorId}`);
                return imps.map(i => this._normalize(i, 'impressora'));
            } catch (error) { return []; }
        }
        return [];
    }

    async getErrorHistory(equipId) {
        try {
            const res = await fetch(`${APP_CONFIG.API_BASE_URL}/log_erros`, { headers: this.getHeaders() });
            if (!res.ok) return [];
            
            const allErrors = await res.json();
            
            return allErrors.filter(err => 
                (err.computador && String(err.computador.id) === String(equipId)) || 
                (err.impressora && String(err.impressora.id) === String(equipId))
            ).sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
            
        } catch (e) { return []; }
    }

    async checkDependencies(id) {
        return { allowed: true }; 
    }

    // --- UTILITÁRIOS (LOG) ---
    _logAction(action, details) {
        try {
            const user = JSON.parse(localStorage.getItem('sys_user') || '{}');
            const logData = {
                usuario: { id: user.id || 1 }, 
                acao: action,
                recurso: 'Equipamento', 
                detalhes: details,
                dataHora: new Date().toISOString(),
                usuarioNome: user.nome || 'Sistema'
            };
            
            fetch(`${APP_CONFIG.API_BASE_URL}/logs`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(logData)
            }).catch(e => console.warn('Falha ao gravar log (Network):', e));
        } catch (e) {
            console.warn('Erro ao preparar log (JS):', e);
        }
    }

    // --- CORREÇÃO DO MAPEAMENTO (JAVA -> TABLE) ---
    _normalize(item, tipo) {
        // Garante leitura segura dos objetos
        const nomeUsuario = (item.usuario && item.usuario.nome) ? item.usuario.nome : '-';
        const nomeSetor = (item.setor && item.setor.nome) ? (item.setor.nome) : '-';

        return {
            ...item,
            id: item.id,
            tipo: tipo,
            
            // 1. CORREÇÃO: Mapeia 'numeroSerie' (do Java) para 'serie' (que a tabela espera)
            serie: item.numeroSerie || item.serie || '-',
            
            // 2. CORREÇÃO: Mapeia o objeto usuário para string
            usuario: nomeUsuario,
            setor: nomeSetor,
            
            // Dados Visuais
            modelo: item.modelo,
            sala: item.sala || '-',
            
            // IDs para edição
            id_setor: item.setor ? item.setor.id : null,
            id_usuario: item.usuario ? item.usuario.id : null
        };
    }

    async fetchJson(url, options = {}) {
        const res = await fetch(url, {
            ...options,
            headers: { ...this.getHeaders(), ...options.headers }
        });
        if (!res.ok) {
            if (res.status === 404) throw new Error('Not Found');
            const text = await res.text();
            throw new Error(text || `Erro API: ${res.status}`);
        }
        return res.json();
    }

    getHeaders() {
        const token = localStorage.getItem('sys_token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }
}

export const EquipamentoService = new EquipamentoServiceClass();