/* js/services/equipamento.service.js */
import { BaseService } from '../core/BaseService.js';
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
    }

    async update(id, data) {
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
    }

    async delete(id) {
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
    }
}

export const EquipamentoService = new EquipamentoServiceClass();