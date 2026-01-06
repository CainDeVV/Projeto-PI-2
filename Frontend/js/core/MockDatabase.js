/* js/core/MockDatabase.js */
import { usersData, equipmentsData, treeStructure } from '../database.js'; 
import { STORAGE_KEYS } from '../config/constants.js';

class MockDatabaseClass {
    constructor() {
        this.resources = {
            'cities': { key: 'app_cities', seed: [] },
            'companies': { key: 'app_companies', seed: [] },
            'sectors': { key: 'app_sectors', seed: [] },
            'users': { key: STORAGE_KEYS.DB_USERS, seed: [] },
            'equipments': { key: STORAGE_KEYS.DB_EQUIPMENTS, seed: [] },
            'os': { key: STORAGE_KEYS.DB_OS, seed: [] }, 
            'logs': { key: STORAGE_KEYS.DB_LOGS, seed: [] },
            
            // --- NOVA TABELA ---
            'log_erros': { key: 'app_log_erros', seed: [] }
        };

        this._initialize();
    }

    _initialize() {
        Object.values(this.resources).forEach(res => {
            if (!localStorage.getItem(res.key)) {
                localStorage.setItem(res.key, JSON.stringify([]));
            }
        });

        if (this._getCollection('cities').length === 0) {
            this._performRelationalSeed();
        }
    }

    _performRelationalSeed() {
        console.log('[MockDB] Gerando dados relacionais compatíveis com SQL...');
        
        const cities = []; const companies = []; const sectors = [];
        let cityIdCounter = 1; let compIdCounter = 1; let sectIdCounter = 1;

        // 1. Geografia
        if (treeStructure && Array.isArray(treeStructure)) {
            treeStructure.forEach(cityNode => {
                const cityId = (cityIdCounter++).toString();
                cities.push({ id: cityId, nome: cityNode.name, estado: 'CE' });
                if (cityNode.children) {
                    cityNode.children.forEach(compNode => {
                        const compId = (compIdCounter++).toString();
                        companies.push({ id: compId, nome: compNode.name, cnpj: '00.000.000/0001-91', id_cidade: cityId });
                        if (Array.isArray(compNode.children)) {
                            compNode.children.forEach((sectName, idx) => {
                                sectors.push({ id: (sectIdCounter++).toString(), nome: sectName, localizacao: `Sala ${100 + idx}`, id_empresa: compId });
                            });
                        }
                    });
                }
            });
        }
        this._save('cities', cities);
        this._save('companies', companies);
        this._save('sectors', sectors);

        // 2. Usuários
        const newUsers = usersData.map(u => {
            const sectorFound = sectors.find(s => s.nome === u.setor);
            return {
                id: u.id, nome: u.nome, cpf: u.cpf, senha: u.senha, tipo: u.tipo, 
                id_setor: sectorFound ? sectorFound.id : null
            };
        });
        this._save('users', newUsers);

        // 3. Equipamentos
        const newEquips = equipmentsData.map(eq => {
            const sectorFound = sectors.find(s => s.nome === eq.setor);
            const userFound = newUsers.find(u => u.nome === eq.usuario);
            const randomSala = `Sala ${Math.floor(Math.random() * 50) + 100}`;

            return {
                id: eq.id,
                tipo: eq.tipo, 
                modelo: eq.modelo,
                serie: eq.serie,
                sala: randomSala,
                status: eq.status,
                contador: eq.contador,
                tonel: eq.tonel,
                
                // O campo 'error' simples ainda existe no objeto visual, 
                // mas agora teremos a tabela log_erros para o histórico real
                error: eq.error, 
                
                id_setor: sectorFound ? sectorFound.id : null,
                id_usuario: userFound ? userFound.id : null,
                usuario: eq.usuario 
            };
        });
        this._save('equipments', newEquips);

        // 4. Gera O.S.
        this._seedOS(newEquips, newUsers);
        
        // 5. Gera LOG_ERROS (Novo)
        this._seedLogErrors(newEquips);
    }

    _seedOS(equips, users) {
        if (!equips || !users) return;
        const defeitos = ["Não liga", "Tela azul", "Impressão falhando", "Sem rede", "Lentidão"];
        const osList = [];
        for (let i = 1; i <= 20; i++) {
            const equip = equips[Math.floor(Math.random() * equips.length)];
            const solicitante = users[Math.floor(Math.random() * users.length)];
            const tecnico = users.find(u => u.tipo.includes('Técnico')) || users[0];
            const isOpen = Math.random() > 0.4;

            osList.push({
                id: i.toString(),
                descricao_problema: defeitos[Math.floor(Math.random() * defeitos.length)],
                status: isOpen ? 'Aberto' : 'Fechado',
                data_abertura: new Date().toISOString(),
                data_fechamento: isOpen ? null : new Date().toISOString(),
                solucao: isOpen ? '' : 'Resolvido.',
                id_usuario_solicitante: solicitante.id,
                id_usuario_responsavel: isOpen ? null : tecnico.id,
                id_computador: equip.tipo === 'computador' ? equip.id : null,
                id_impressora: equip.tipo === 'impressora' ? equip.id : null,
                id_setor: equip.id_setor 
            });
        }
        this._save('os', osList);
    }

    // --- NOVA FUNÇÃO DE SEED PARA LOG_ERRO ---
    _seedLogErrors(equips) {
        const errorLogs = [];
        let errorId = 1;

        // Gera erros para 30% dos equipamentos
        equips.forEach(eq => {
            if (Math.random() > 0.7) {
                const isCritico = Math.random() > 0.8;
                const entry = {
                    id: (errorId++).toString(),
                    titulo: isCritico ? "Falha de Hardware" : "Alerta de Insumo",
                    descricao: isCritico ? "Disco rígido não detectado na inicialização" : "Nível de toner baixo ( < 10% )",
                    codigo_erro: isCritico ? "HD_FAIL_001" : "TONER_LOW",
                    severidade: isCritico ? "Crítico" : "Alerta",
                    data_hora: new Date().toISOString(),
                    resolvido: false, // Erro ativo
                    
                    id_computador: eq.tipo === 'computador' ? eq.id : null,
                    id_impressora: eq.tipo === 'impressora' ? eq.id : null,
                    id_os_gerada: null
                };
                errorLogs.push(entry);
            }
        });
        
        this._save('log_erros', errorLogs);
    }

    // --- MÉTODOS CRUD GENÉRICOS ---
    async get(resource) { await this._delay(); return this._getCollection(resource); }
    async getById(resource, id) { await this._delay(); return this._getCollection(resource).find(i => String(i.id) === String(id)); }
    
    async post(resource, data) {
        await this._delay();
        const collection = this._getCollection(resource);
        const newItem = { ...data, id: (Date.now() + Math.floor(Math.random()*1000)).toString() };
        collection.push(newItem);
        this._save(resource, collection);
        return newItem;
    }

    async put(resource, id, data) {
        await this._delay();
        const collection = this._getCollection(resource);
        const index = collection.findIndex(i => String(i.id) === String(id));
        if (index === -1) throw new Error('404 Not Found');
        collection[index] = { ...collection[index], ...data };
        this._save(resource, collection);
        return collection[index];
    }

    async delete(resource, id) {
        await this._delay();
        const collection = this._getCollection(resource);
        const index = collection.findIndex(i => String(i.id) === String(id));
        if (index === -1) return false;
        collection.splice(index, 1);
        this._save(resource, collection);
        return true;
    }

    async login(creds) {
        await this._delay();
        const users = this._getCollection('users');
        const user = users.find(u => u.cpf === creds.cpf && u.senha === creds.password);
        if (user) {
            const sectors = this._getCollection('sectors');
            const sec = sectors.find(s => String(s.id) === String(user.id_setor));
            return { token: 'jwt', user: { ...user, setor: sec ? sec.nome : '' } };
        }
        throw new Error('Credenciais inválidas');
    }

    _getCollection(key) {
        // Mapeamento atualizado
        const map = { 
            'cities': 'app_cities', 
            'companies': 'app_companies', 
            'sectors': 'app_sectors', 
            'users': STORAGE_KEYS.DB_USERS, 
            'equipments': STORAGE_KEYS.DB_EQUIPMENTS, 
            'os': STORAGE_KEYS.DB_OS, 
            'logs': STORAGE_KEYS.DB_LOGS,
            'log_erros': 'app_log_erros' // Mapeamento novo
        };
        return JSON.parse(localStorage.getItem(map[key] || key) || '[]');
    }

    _save(key, data) {
        const map = { 
            'cities': 'app_cities', 
            'companies': 'app_companies', 
            'sectors': 'app_sectors', 
            'users': STORAGE_KEYS.DB_USERS, 
            'equipments': STORAGE_KEYS.DB_EQUIPMENTS, 
            'os': STORAGE_KEYS.DB_OS, 
            'logs': STORAGE_KEYS.DB_LOGS,
            'log_erros': 'app_log_erros'
        };
        localStorage.setItem(map[key] || key, JSON.stringify(data));
    }

    _generateRandomCNPJ() { return '00.000.000/0001-91'; }
    _delay() { return new Promise(r => setTimeout(r, 50)); }
}

export const MockDatabase = new MockDatabaseClass();