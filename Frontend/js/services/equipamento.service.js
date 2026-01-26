/* js/services/equipamento.service.js */
import { BaseService } from '../core/BaseService.js';
import { APP_CONFIG } from '../config/constants.js'; 

class EquipamentoServiceClass extends BaseService {
    constructor() {
        super('equipments', 'Equipamento'); 
        this.apiPc = 'http://localhost:8080/computadores';
        this.apiImp = 'http://localhost:8080/impressoras';
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
                const pc = await this.fetchJson(`${this.apiPc}/${id}`);
                return this._normalize(pc, 'computador');
            } catch (e) {
                try {
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
            
            // LIMPEZA FINAL: Garante que o JSON está perfeito para o Java
            const payload = this._cleanPayload(data);

            console.log(">>> Enviando POST para:", url, payload);

            return this.fetchJson(url, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        }
        return {};
    }

    // --- ATUALIZAR (PUT) ---
    async update(id, data) {
        if (!APP_CONFIG.USE_MOCK_DATA) {
            const url = data.tipo === 'impressora' ? `${this.apiImp}/${id}` : `${this.apiPc}/${id}`;
            
            // LIMPEZA FINAL: Garante que o JSON está perfeito para o Java
            const payload = this._cleanPayload(data);
            
            // Garante ID numérico no corpo
            payload.id = parseInt(id, 10);

            console.log(">>> Enviando PUT para:", url, payload);

            return this.fetchJson(url, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
        }
        return {};
    }

    // --- EXCLUIR (DELETE) ---
    async delete(id) {
        if (!APP_CONFIG.USE_MOCK_DATA) {
            let endpoint = `${this.apiPc}/${id}`;
            let response = await fetch(endpoint, { method: 'DELETE', headers: this.getHeaders() });

            if (response.status === 404) {
                endpoint = `${this.apiImp}/${id}`;
                response = await fetch(endpoint, { method: 'DELETE', headers: this.getHeaders() });
            }

            if (!response.ok) {
                const errorText = await response.text(); 
                throw new Error(errorText || 'Erro ao excluir.');
            }
            return true;
        }
        return true;
    }

    // --- FUNÇÃO DE LIMPEZA (O SEGREDO PARA CORRIGIR O ERRO 400) ---
    _cleanPayload(data) {
        const clean = { ...data };
        
        // 1. Remove campo 'tipo' (O Java não tem esse campo)
        delete clean.tipo; 
        
        // 2. Converte ID principal para inteiro
        if (clean.id) clean.id = parseInt(clean.id, 10);
        
        // 3. CORREÇÃO DO SETOR:
        // Se 'setor' for uma string/número (veio do form como "1"), converte para objeto { id: 1 }
        if (clean.setor && (typeof clean.setor === 'string' || typeof clean.setor === 'number')) {
            clean.setor = { id: parseInt(clean.setor, 10) };
        }
        // Se 'setor' já for objeto mas tiver campos extras, reduz para { id: X }
        else if (clean.setor && clean.setor.id) {
            clean.setor = { id: parseInt(clean.setor.id, 10) };
        }

        // 4. CORREÇÃO DO USUÁRIO:
        // Se 'usuario' for string vazia ou "0", remove o campo (null)
        if (clean.usuario === "" || clean.usuario === "0" || clean.usuario === 0) {
            clean.usuario = null;
        }
        // Se for string/número válido (ex: "2"), converte para objeto { id: 2 }
        else if (clean.usuario && (typeof clean.usuario === 'string' || typeof clean.usuario === 'number')) {
            clean.usuario = { id: parseInt(clean.usuario, 10) };
        }
        // Se já for objeto, reduz para { id: X }
        else if (clean.usuario && clean.usuario.id) {
            clean.usuario = { id: parseInt(clean.usuario.id, 10) };
        } else {
            // Se for objeto vazio ou inválido, manda null
            clean.usuario = null;
        }

        return clean;
    }

    async getPrintersByParentId(computadorId) {
        if (!APP_CONFIG.USE_MOCK_DATA) {
            try {
                const imps = await this.fetchJson(`${this.apiImp}?computadorId=${computadorId}`);
                return imps.map(i => this._normalize(i, 'impressora'));
            } catch (error) { return []; }
        }
        return [];
    }

    async getErrorHistory(id) { return []; }

    _normalize(item, tipo) {
        return {
            ...item,
            tipo: tipo,
            setor: item.setor ? (item.setor.nome || 'Setor ' + item.setor.id) : '-',
            usuario: item.usuario ? item.usuario.nome : '-',
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