/* js/services/equipamento.service.js */
import { BaseService } from '../core/BaseService.js';
<<<<<<< HEAD
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
=======
import { APP_CONFIG } from '../config/constants.js';

class EquipamentoServiceClass extends BaseService {
    constructor() {
        super('equipments', 'Equipamento'); // Placeholder, endpoints reais definidos abaixo
    }

    // --- LEITURA UNIFICADA ---
    async getAll() {
        try {
            // Constrói headers manualmente para o fetch
            const headers = { 
                'Content-Type': 'application/json',
                // Reutiliza o método de obter token do HttpClient
                ...this.http._getHeaders() 
            };

            // Busca os dois tipos em paralelo
            const [pcRes, impRes] = await Promise.all([
                fetch(`${APP_CONFIG.API_BASE_URL}/computadores`, { headers }),
                fetch(`${APP_CONFIG.API_BASE_URL}/impressoras`, { headers })
            ]);

            if (!pcRes.ok) throw new Error(`Erro ao buscar PCs: ${pcRes.status}`);
            if (!impRes.ok) throw new Error(`Erro ao buscar Impressoras: ${impRes.status}`);

            const computadores = await pcRes.json();
            const impressoras = await impRes.json();

            // 2. Normaliza PCs
            const pcs = computadores.map(pc => ({
                ...pc,
                tipo: 'computador',
                setor: pc.setor ? (pc.setor.nome || pc.setor) : '-',
                usuario: pc.usuario ? (pc.usuario.nome || pc.usuario) : '-',
                status: pc.status || 'Offline',
                modelo: pc.modelo,
                numeroSerie: pc.numeroSerie || pc.numero_serie,
                id_setor: pc.setor ? pc.setor.id : null
            }));

            // 3. Normaliza Impressoras
            const imps = impressoras.map(imp => ({
                ...imp,
                tipo: 'impressora',
                setor: imp.setor ? (imp.setor.nome || imp.setor) : '-',
                usuario: '-',
                tonel: imp.tonel || '0%',
                contador: imp.contador || '0',
                status: imp.status || 'Offline',
                modelo: imp.modelo,
                numeroSerie: imp.numeroSerie || imp.numero_serie,
                id_setor: imp.setor ? imp.setor.id : null
            }));

            return [...pcs, ...imps].sort((a, b) => {
                if (a.tipo === b.tipo) return 0;
                return a.tipo === 'computador' ? -1 : 1;
            });

        } catch (error) {
            console.error("ERRO FATAL NO EQUIPAMENTO SERVICE:", error);
            return [];
        }
    }

    // --- ESCRITA DIRECIONADA ---
    async add(data) {
        const endpoint = data.tipo === 'computador' ? 'computadores' : 'impressoras';
        const url = `${APP_CONFIG.API_BASE_URL}/${endpoint}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: this.http._getHeaders(),
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || "Erro ao salvar equipamento");
        }
        
        // Log manual já que não usamos o save do BaseService
        this._logAction('CREATE', `Criou ${data.tipo}: ${data.modelo}`);
        
        return await response.json();
>>>>>>> origin/feature/setores-crud
    }

    // --- ATUALIZAR (PUT) ---
    async update(id, data) {
<<<<<<< HEAD
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
=======
        const endpoint = data.tipo === 'computador' ? `computadores/${id}` : `impressoras/${id}`;
        const url = `${APP_CONFIG.API_BASE_URL}/${endpoint}`;

        const response = await fetch(url, {
            method: 'PUT',
            headers: this.http._getHeaders(),
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error("Erro ao atualizar equipamento");
        
        this._logAction('UPDATE', `Editou ${data.tipo}: ${data.modelo}`);
        return await response.json();
>>>>>>> origin/feature/setores-crud
    }

    // --- EXCLUIR (DELETE) ---
    async delete(id) {
<<<<<<< HEAD
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
=======
        const headers = this.http._getHeaders();
        let tipoApagado = 'Equipamento';

        try {
            // Tenta apagar como computador
            const res = await fetch(`${APP_CONFIG.API_BASE_URL}/computadores/${id}`, { method: 'DELETE', headers });
            if (res.ok) {
                tipoApagado = 'Computador';
            } else {
                throw new Error('Not PC');
            }
        } catch (e) {
            // Se falhar, tenta como impressora
            const resImp = await fetch(`${APP_CONFIG.API_BASE_URL}/impressoras/${id}`, { method: 'DELETE', headers });
            if (resImp.ok) tipoApagado = 'Impressora';
            else return false;
        }
        
        this._logAction('DELETE', `Excluiu ${tipoApagado} ID ${id}`);
        return true;
    }

    // --- OUTROS ---
    async getBySector(sectorName) {
        const data = await this.getAll();
        return data.filter(e => e.setor === sectorName);
    }

    async getPrintersByParentId(parentId) {
        const data = await this.getAll();
        return data.filter(e => e.tipo === 'impressora' && String(e.connectedTo) === String(parentId));
    }

    async getErrorHistory(equipId) {
        try {
            // Chama o LogErroController (que busca tudo) e filtramos no cliente
            // Idealmente teríamos um endpoint backend /log_erros/equipamento/{id}
            const res = await fetch(`${APP_CONFIG.API_BASE_URL}/log_erros`, { headers: this.http._getHeaders() });
            const allErrors = await res.json();
            
            return allErrors.filter(err => 
                (err.computador && String(err.computador.id) === String(equipId)) || 
                (err.impressora && String(err.impressora.id) === String(equipId))
            ).sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
            
        } catch (e) { return []; }
    }

    async checkDependencies(id) {
        const { OsService } = await import('./os.service.js');
        const allOs = await OsService.getAll();
        
        const hasOpenOs = allOs.some(os => 
            ((os.computador && String(os.computador.id) === String(id)) || 
             (os.impressora && String(os.impressora.id) === String(id))) && 
            os.status === 'Aberto'
        );

        if (hasOpenOs) {
            return { allowed: false, message: 'Existe O.S. ABERTA para este equipamento.' };
        }
        return { allowed: true };
>>>>>>> origin/feature/setores-crud
    }
}

export const EquipamentoService = new EquipamentoServiceClass();