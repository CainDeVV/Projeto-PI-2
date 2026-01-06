/* js/pages/dashboard.js */
import { HeaderComponent } from '../components/header.js';
import { SidebarComponent } from '../components/sidebar.js';
import { EquipamentoService } from '../services/equipamento.service.js';
import { ErrorLogService } from '../services/error_log.service.js';
import { SetorService } from '../services/setor.service.js';
import { NavigationService, ROUTES } from '../services/navigation.service.js';
import { DOMUtils } from '../utils.js';

class DashboardPage {
    constructor() {
        this.header = new HeaderComponent('app-header');
        this.sidebar = new SidebarComponent('tree-menu-container');
    }

    async init() {
        document.body.classList.add('layout-full-width');
        this.header.render(null, 'dashboard');
        this.header.updateButtons('dashboard');
        this.sidebar.render(await SetorService.getTreeStructure());
        await this.loadDashboardData();
    }

    async loadDashboardData() {
        try {
            const [equips, errors, sectors] = await Promise.all([
                EquipamentoService.getAll(),
                ErrorLogService.getActiveErrors(),
                SetorService.getAll()
            ]);
            this.renderKPIs(equips, errors);
            this.renderPrinterList(equips);
            this.renderCityStats(equips, sectors);
            this.renderErrorList(errors);
        } catch (e) {
            console.error("Erro ao carregar dashboard:", e);
        }
    }

    renderKPIs(equips, errors) {
        const pcs = equips.filter(e => e.tipo === 'computador').length;
        const printers = equips.filter(e => e.tipo === 'impressora').length;
        const activeErrors = errors.length;

        document.getElementById('total-pcs').innerText = pcs;
        document.getElementById('total-printers').innerText = printers;
        document.getElementById('total-errors').innerText = activeErrors;
    }

    renderPrinterList(equips) {
        const container = document.getElementById('printer-list');
        container.innerHTML = '';

        const topPrinters = equips
            .filter(e => e.tipo === 'impressora')
            .map(e => {
                const count = parseInt((e.contador || '0').replace(/\D/g, '')) || 0;
                return { ...e, rawCount: count };
            })
            .sort((a, b) => b.rawCount - a.rawCount)
            .slice(0, 5);

        if (topPrinters.length === 0) {
            container.innerHTML = '<div style="color:#999; text-align:center; padding:10px;">Sem dados de impressão</div>';
            return;
        }

        const maxVal = topPrinters[0].rawCount || 1;

        topPrinters.forEach((p, index) => {
            const percent = Math.round((p.rawCount / maxVal) * 100);
            const row = DOMUtils.create('div', { 
                className: 'list-row',
                onclick: () => NavigationService.navigate(ROUTES.EQUIPMENT_LIST, { select: p.id })
            });

            row.innerHTML = `
                <span class="row-id">#${index + 1}</span>
                <span class="row-name" title="${p.modelo}">${p.modelo}</span>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${percent}%"></div>
                </div>
                <span class="row-value">${p.contador}</span>
            `;
            container.appendChild(row);
        });
    }

    renderCityStats(equips, sectors) {
        const container = document.getElementById('city-list');
        container.innerHTML = '';

        const cityStats = {};

        equips.forEach(eq => {
            const setorObj = sectors.find(s => s.nome === eq.setor);
            const cityName = setorObj ? setorObj.nome_cidade : 'Indefinido';
            if (!cityStats[cityName]) cityStats[cityName] = { pcs: 0, printers: 0 };
            if (eq.tipo === 'computador') cityStats[cityName].pcs++;
            else cityStats[cityName].printers++;
        });

        Object.entries(cityStats).forEach(([city, stats]) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight:500;">${city}</td>
                <td class="text-center">${stats.pcs}</td>
                <td class="text-center">${stats.printers}</td>
            `;
            container.appendChild(tr);
        });
    }

    renderErrorList(errors) {
        const container = document.getElementById('error-list');
        container.innerHTML = '';

        const recentErrors = errors.slice(0, 5);

        if (recentErrors.length === 0) {
            container.innerHTML = '<div style="color:#999; text-align:center; padding:10px;">Nenhum erro ativo!</div>';
            return;
        }

        recentErrors.forEach(err => {
            // --- CORREÇÃO DAS CORES ---
            // 'status-red' (Crítico), 'status-yellow' (Alerta), 'status-info' (Outros)
            let statusClass = 'status-info'; // Azul padrão
            if (err.severidade === 'Crítico') statusClass = 'status-red';
            if (err.severidade === 'Alerta') statusClass = 'status-yellow';

            const icon = err.severidade === 'Crítico' ? 'fa-times-circle' : 'fa-exclamation-triangle';

            const item = DOMUtils.create('div', {
                className: `error-item ${statusClass}`, // Aplica a classe correta
                onclick: () => NavigationService.navigate(ROUTES.MONITORING)
            });

            item.innerHTML = `
                <div class="error-icon-circle">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="error-text">
                    <h4>${err.titulo}</h4>
                    <p>${err.equipamentoNome} (${err.descricao})</p>
                </div>
            `;
            container.appendChild(item);
        });
    }
}

new DashboardPage().init();