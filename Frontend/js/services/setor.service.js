/* js/services/setor.service.js */
import { BaseService } from '../core/BaseService.js';
import { APP_CONFIG } from '../config/constants.js';

class SetorServiceClass extends BaseService {
    constructor() { super('setores', 'Setor'); }

    // --- 1. LEITURA PRINCIPAL (API) ---
    async getAll() {
        try {
            const response = await this.http.get(); 
            return response.map(sec => ({
                ...sec,
                nome: sec.nome,
                localizacao: sec.localizacao || '-',
                observacao: sec.observacao || '-',
                empresa: sec.empresa ? sec.empresa.nome : 'N/A',
                cidade: (sec.empresa && sec.empresa.cidade) ? sec.empresa.cidade.nome : 'N/A',
                id_empresa: sec.empresa ? sec.empresa.id : null
            }));
        } catch (error) {
            console.error("Erro ao buscar setores:", error);
            return [];
        }
    }

    // --- 2. ÁRVORE (SIDEBAR) ---
    async getTreeStructure() {
        const setores = await this.getAll();
        const treeMap = {};

        setores.forEach(sec => {
            const cidade = sec.cidade || 'Indefinido';
            const empresa = sec.empresa || 'Indefinido';

            if (!treeMap[cidade]) treeMap[cidade] = {};
            if (!treeMap[cidade][empresa]) treeMap[cidade][empresa] = [];
            treeMap[cidade][empresa].push(sec.nome);
        });

        return Object.keys(treeMap).map(cidadeName => ({
            name: cidadeName,
            children: Object.keys(treeMap[cidadeName]).map(empresaName => ({
                name: empresaName,
                children: treeMap[cidadeName][empresaName]
            }))
        }));
    }

    // --- 3. LÓGICA DE NAVEGAÇÃO ---
    async getSectorsUnder(nodeName) {
        const tree = await this.getTreeStructure();
        const traverse = (nodes) => {
            for (const node of nodes) {
                if (typeof node === 'string') {
                    if (node === nodeName) return [node];
                } else {
                    if (node.name === nodeName) return this._collectAllLeaves(node);
                    if (node.children) {
                        const result = traverse(node.children);
                        if (result.length > 0) return result;
                    }
                }
            }
            return [];
        };
        return traverse(tree);
    }
    
    _collectAllLeaves(node) {
        let leaves = [];
        if (node.children) {
            node.children.forEach(child => {
                if (typeof child === 'string') leaves.push(child);
                else leaves = leaves.concat(this._collectAllLeaves(child));
            });
        }
        return leaves;
    }

    // --- 4. DROPDOWNS E CADASTROS AUXILIARES ---

    async getCitiesForDropdown() {
        try {
            const res = await fetch(`${APP_CONFIG.API_BASE_URL}/cidades`);
            return await res.json();
        } catch (e) { return []; }
    }

    async getCitiesFull() {
        const cities = await this.getCitiesForDropdown();
        return cities.map(c => ({ ...c, uf: c.estado })); 
    }

    async getCompaniesByCityId(cityId) {
        try {
            const res = await fetch(`${APP_CONFIG.API_BASE_URL}/empresas`);
            const todas = await res.json();
            return todas.filter(c => c.cidade && String(c.cidade.id) === String(cityId));
        } catch (e) { return []; }
    }

    async getCompaniesFull() {
        try {
            const res = await fetch(`${APP_CONFIG.API_BASE_URL}/empresas`);
            const data = await res.json();
            return data.map(c => ({
                ...c, 
                cidade_vinculada: c.cidade ? c.cidade.nome : '-',
                id_cidade_vinculada: c.cidade ? c.cidade.id : null
            }));
        } catch (e) { return []; }
    }

    async getUniqueCities() { 
        const cities = await this.getCitiesForDropdown();
        return cities.map(c => c.nome);
    }

    // --- 5. ESCRITA (COM LOGS) ---

    async addCity(data) {
        const payload = { 
            id: data.id, 
            nome: data.nome, 
            estado: data.uf || data.estado 
        };
        
        if(!payload.id) delete payload.id;

        const res = await fetch(`${APP_CONFIG.API_BASE_URL}/cidades`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if(!res.ok) throw new Error('Erro ao salvar cidade');
        
        // LOG
        this._logAction(data.id ? 'UPDATE' : 'CREATE', `${data.id ? 'Editou' : 'Criou'} Cidade: ${data.nome}`);
        
        return await res.json();
    }

    async updateCity(id, nome, uf) {
        return await this.addCity({ id, nome, uf }); 
    }

    async deleteCity(id) { 
        await fetch(`${APP_CONFIG.API_BASE_URL}/cidades/${id}`, { method: 'DELETE' }); 
        this._logAction('DELETE', `Excluiu Cidade ID ${id}`);
    }

    async addCompany(data) {
        const payload = {
            id: data.id,
            nome: data.nome,
            cnpj: data.cnpj,
            descricao: data.descricao,
            observacao: data.observacao,
            cidade: { id: data.cidade_vinculada } 
        };
        
        if(!payload.id) delete payload.id;

        const res = await fetch(`${APP_CONFIG.API_BASE_URL}/empresas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if(!res.ok) throw new Error('Erro ao salvar empresa');

        // LOG
        this._logAction(data.id ? 'UPDATE' : 'CREATE', `${data.id ? 'Editou' : 'Criou'} Empresa: ${data.nome}`);

        return await res.json();
    }
    
    async updateCompany(id, data) {
        // Implementação da Edição
        return await this.addCompany({ ...data, id: id });
    }

    async deleteCompany(id) { 
        await fetch(`${APP_CONFIG.API_BASE_URL}/empresas/${id}`, { method: 'DELETE' }); 
        this._logAction('DELETE', `Excluiu Empresa ID ${id}`);
    }
    
    // CRUD Setor (Logs automáticos via BaseService)
    async add(data) {
        return await this.save({ 
            nome: data.nome, 
            localizacao: data.localizacao, 
            observacao: data.observacao, 
            id_empresa: data.empresa 
        });
    }

    async update(id, data) {
        return await this.save({ 
            id: id,
            nome: data.nome, 
            localizacao: data.localizacao, 
            observacao: data.observacao, 
            id_empresa: data.empresa 
        });
    }
}

export const SetorService = new SetorServiceClass();