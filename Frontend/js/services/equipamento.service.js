/* js/services/equipamento.service.js */
import { BaseService } from '../core/BaseService.js';
import { MockDatabase } from '../core/MockDatabase.js';
import { APP_CONFIG } from '../config/constants.js'; 

class EquipamentoServiceClass extends BaseService {
    constructor() {
        super('equipments', 'Equipamento'); 
    }

    // LEITURA 
    async getAll() {
        // --- SE FOR API REAL ---
        if (!APP_CONFIG.USE_MOCK_DATA) {
            try {
                console.log(">>> TENTANDO BUSCAR EQUIPAMENTOS NA API (VIA FETCH)...");

                // Configuração manual para garantir que o token vá corretamente
                const headers = { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer token-falso-para-aprovacao'
                };

                // 1. Busca Computadores e Impressoras (USANDO FETCH DIRETO para evitar erro de undefined)
                const [pcRes, impRes] = await Promise.all([
                    fetch('http://localhost:8080/computadores', { headers }),
                    fetch('http://localhost:8080/impressoras', { headers })
                ]);

                // Verifica se deu erro na requisição
                if (!pcRes.ok) throw new Error(`Erro ao buscar PCs: ${pcRes.status}`);
                if (!impRes.ok) throw new Error(`Erro ao buscar Impressoras: ${impRes.status}`);

                // Converte a resposta para JSON
                const computadores = await pcRes.json();
                const impressoras = await impRes.json();

                console.log(">>> SUCESSO! PCs:", computadores.length, "Imps:", impressoras.length);

                // 2. Normaliza PCs
                const pcs = computadores.map(pc => ({
                    ...pc,
                    tipo: 'computador',
                    setor: pc.setor ? (pc.setor.nome || pc.setor) : '-',
                    usuario: pc.usuario ? (pc.usuario.nome || pc.usuario) : '-',
                    status: pc.status || 'Offline',
                    modelo: pc.modelo,
                    numeroSerie: pc.numeroSerie || pc.numero_serie
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
                    numeroSerie: imp.numeroSerie || imp.numero_serie
                }));

                return [...pcs, ...imps].sort((a, b) => {
                    if (a.tipo === b.tipo) return 0;
                    return a.tipo === 'computador' ? -1 : 1;
                });

            } catch (error) {
                console.error("❌ ERRO FATAL NO EQUIPAMENTO SERVICE:", error);
                
                if (error.message && error.message.includes('fetch')) {
                     alert(`Erro de Conexão: O Backend está rodando na porta 8080?`);
                } else {
                     alert(`Erro ao carregar equipamentos: ${error.message}`);
                }
                
                return [];
            }
        }

        // LÓGICA DO MOCK 
        const equips = await MockDatabase.get('equipments');
        const sectors = await MockDatabase.get('sectors');
        const users = await MockDatabase.get('users');

        const hydratedData = equips.map(eq => {
            const sec = sectors.find(s => String(s.id) === String(eq.id_setor));
            
            let userName = eq.usuario || '-'; 
            if (eq.id_usuario) {
                const u = users.find(user => String(user.id) === String(eq.id_usuario));
                if (u) userName = u.nome;
            }

            return {
                ...eq,
                setor: sec ? sec.nome : 'N/A',
                usuario: userName,
                id_setor: eq.id_setor,
                id_usuario: eq.id_usuario
            };
        });

        return hydratedData.sort((a, b) => {
            if (a.tipo === b.tipo) return 0;
            return a.tipo === 'computador' ? -1 : 1;
        });
    }

    // ESCRITA 
    async add(data) {
        if (!APP_CONFIG.USE_MOCK_DATA) {
            const endpoint = data.tipo === 'computador' ? 'computadores' : 'impressoras';
            
            const response = await fetch(`http://localhost:8080/${endpoint}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer token-falso-para-aprovacao'
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        }
        return await this.save(data); 
    }

    async update(id, data) {
        if (!APP_CONFIG.USE_MOCK_DATA) {
            const endpoint = data.tipo === 'computador' ? `computadores/${id}` : `impressoras/${id}`;
            
            const response = await fetch(`http://localhost:8080/${endpoint}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer token-falso-para-aprovacao'
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        }
        return await this.save({ ...data, id });
    }

    async delete(id) {
        if (!APP_CONFIG.USE_MOCK_DATA) {
            const headers = { 'Authorization': 'Bearer token-falso-para-aprovacao' };
            try {
                // Tenta apagar como computador
                const res = await fetch(`http://localhost:8080/computadores/${id}`, { method: 'DELETE', headers });
                if (!res.ok) throw new Error('Not PC');
            } catch (e) {
                // Se falhar, tenta como impressora
                await fetch(`http://localhost:8080/impressoras/${id}`, { method: 'DELETE', headers });
            }
            return;
        }
        return await super.delete(id);
    }

    // FILTROS (MANTIDOS IGUAIS)
    async getBySector(sectorName) {
        const data = await this.getAll();
        return data.filter(e => e.setor === sectorName);
    }

    async getPrintersByParentId(parentId) {
        const data = await this.getAll();
        return data.filter(e => e.tipo === 'impressora' && String(e.connectedTo) === String(parentId));
    }

    // HISTÓRICO DE ERROS 
    async getErrorHistory(equipId) {
        if (!APP_CONFIG.USE_MOCK_DATA) {
            return []; 
        }

        const allErrors = await MockDatabase.get('log_erros');
        
        return allErrors.filter(err => 
            String(err.id_computador) === String(equipId) || 
            String(err.id_impressora) === String(equipId)
        ).sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora));
    }

    // VERIFICAÇÕES DE INTEGRIDADE
    async checkDependencies(id) {
        const childPrinters = await this.getPrintersByParentId(id);
        
        if (childPrinters.length > 0) {
            return {
                allowed: false,
                message: `Possui ${childPrinters.length} impressora(s) conectada(s).`
            };
        }

        const { OsService } = await import('./os.service.js');
        const allOs = await OsService.getAll();
        
        const hasOpenOs = allOs.some(os => 
            (String(os.id_computador) === String(id) || String(os.id_impressora) === String(id)) 
            && os.status === 'Aberto'
        );

        if (hasOpenOs) {
            return {
                allowed: false,
                message: 'Existe O.S. ABERTA para este equipamento.'
            };
        }

        return { allowed: true };
    }
}

export const EquipamentoService = new EquipamentoServiceClass();