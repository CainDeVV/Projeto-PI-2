/* js/services/setor.service.js */
import { BaseService } from '../core/BaseService.js';
import { MockDatabase } from '../core/MockDatabase.js'; 
import { APP_CONFIG } from '../config/constants.js';

class SetorServiceClass extends BaseService {
    constructor() { super('setores', 'Setor'); }

    // --- LEITURA (JOIN) ---
    async getAll() {
        if (!APP_CONFIG.USE_MOCK_DATA) {
            try {
                const response = await fetch('http://localhost:8080/setores', {
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Authorization': 'Bearer token-falso-para-aprovacao' 
                    }
                });

                if (!response.ok) throw new Error(`Erro API: ${response.status}`);
                
                const data = await response.json();
                
                return data.map(sec => ({
                    ...sec,
                    nome: sec.nome,
                    localizacao: sec.localizacao || '-',
                    observacao: sec.observacao || '-',
                    // Resolve o objeto aninhado 'empresa' se vier do Java
                    empresa: sec.empresa ? (sec.empresa.nome || sec.empresa) : 'N/A',
                    cidade: 'N/A'
                }));
            } catch (error) {
                console.error("ERRO CRÍTICO AO BUSCAR SETORES:", error);
                // Não retorna vazio direto para você ver o erro no console se precisar
                return [];
            }
        }

        // LÓGICA DO MOCK 
        const sectors = await MockDatabase.get('sectors');
        const companies = await MockDatabase.get('companies');
        const cities = await MockDatabase.get('cities');

        return sectors.map(sec => {
            const comp = companies.find(c => String(c.id) === String(sec.id_empresa));
            const city = comp ? cities.find(c => String(c.id) === String(comp.id_cidade)) : null;

            return {
                ...sec,
                nome_empresa: comp ? comp.nome : 'N/A',
                nome_cidade: city ? city.nome : 'N/A',
                empresa: comp ? comp.nome : 'N/A',
                cidade: city ? city.nome : 'N/A'
            };
        });
    }

    // HELPERS E DROPDOWNS 
    
    async getCitiesForDropdown() { return await MockDatabase.get('cities'); }

    async getCompaniesByCityId(cityId) {
        const comps = await MockDatabase.get('companies');
        return comps.filter(c => String(c.id_cidade) === String(cityId));
    }

    async getUniqueCities() { 
        const cities = await MockDatabase.get('cities');
        return cities.map(c => c.nome);
    }

    async getCitiesFull() { 
        const cities = await MockDatabase.get('cities');
        return cities.map(c => ({
            ...c,
            uf: c.estado || c.uf 
        }));
    }
    
    async getCompaniesFull() {
        const comps = await MockDatabase.get('companies');
        const cities = await MockDatabase.get('cities');
        return comps.map(c => {
            const city = cities.find(ct => String(ct.id) === String(c.id_cidade));
            return { ...c, cidade_vinculada: city ? city.nome : '?' };
        });
    }

    // ESCRITA (IDS)

    async add(data) {
        const payload = {
            nome: data.nome,
            localizacao: data.localizacao,
            observacao: data.observacao,
            id_empresa: data.empresa // Mapeia o select 'empresa' para 'id_empresa'
        };

        if (!APP_CONFIG.USE_MOCK_DATA) {
            const response = await fetch('http://localhost:8080/setores', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': 'Bearer token-falso-para-aprovacao' 
                },
                body: JSON.stringify(payload)
            });
            return await response.json();
        }

        return await this.save(payload);
    }

    async update(id, data) {
        const payload = {
            nome: data.nome,
            localizacao: data.localizacao,
            observacao: data.observacao,
            id_empresa: data.empresa
        };

        if (!APP_CONFIG.USE_MOCK_DATA) {
            const response = await fetch(`http://localhost:8080/setores/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': 'Bearer token-falso-para-aprovacao' 
                },
                body: JSON.stringify(payload)
            });
            return await response.json();
        }

        return await this.save({ ...payload, id });
    }

    //  DELETES
    async delete(id) { 
        if (!APP_CONFIG.USE_MOCK_DATA) {
            await fetch(`http://localhost:8080/setores/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer token-falso-para-aprovacao' }
            });
            return;
        }
        return await super.delete(id); 
    }

    // MÉTODOS AUXILIARES DE GERENCIAMENTO 
    
    async addCity(data) {
        return await MockDatabase.post('cities', { 
            nome: data.nome, 
            estado: data.uf || data.estado 
        });
    }

    async updateCity(id, nome, uf) {
        return await MockDatabase.put('cities', id, { nome: nome, estado: uf });
    }

    async addCompany(data) {
        return await MockDatabase.post('companies', {
            nome: data.nome,
            cnpj: data.cnpj,
            descricao: data.descricao,
            observacao: data.observacao,
            id_cidade: data.cidade_vinculada
        });
    }

    async updateCompany(id, dataObj) {
        return await MockDatabase.put('companies', id, dataObj);
    }
    
    async deleteCity(id) {
        await MockDatabase.delete('cities', id);
        const companies = await MockDatabase.get('companies');
        const toDelete = companies.filter(c => String(c.id_cidade) === String(id));
        for (const c of toDelete) await this.deleteCompany(c.id);
    }

    async deleteCompany(id) {
        await MockDatabase.delete('companies', id);
        const sectors = await MockDatabase.get('sectors');
        const toDelete = sectors.filter(s => String(s.id_empresa) === String(id));
        for (const s of toDelete) await MockDatabase.delete('sectors', s.id);
    }

    //  ÁRVORE 
    async getTreeStructure() {
        const cities = await MockDatabase.get('cities');
        const companies = await MockDatabase.get('companies');
        const sectors = await this.getAll(); 

        const tree = [];
        cities.forEach(city => tree.push({ name: city.nome, children: [] }));

        companies.forEach(comp => {
            const cityOwner = cities.find(c => String(c.id) === String(comp.id_cidade));
            if (cityOwner) {
                const cityNode = tree.find(n => n.name === cityOwner.nome);
                if (cityNode) cityNode.children.push({ name: comp.nome, children: [] });
            }
        });

        sectors.forEach(sec => {
            const cityNode = tree.find(n => n.name === sec.cidade || n.name === sec.nome_cidade);
            if (cityNode) {
                const compNode = cityNode.children.find(n => n.name === sec.empresa || n.name === sec.nome_empresa);
                if (compNode) compNode.children.push(sec.nome);
            }
        });
        return tree;
    }

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
}

export const SetorService = new SetorServiceClass();