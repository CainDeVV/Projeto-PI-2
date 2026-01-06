/* js/components/tables.js */
import { DOMUtils, SmartRenderers } from '../utils.js';

export class TableComponent {
    constructor(container) { this.container = container; }

    render(data, config, rowClickCallback) {
        this.container.innerHTML = '';
        if (!data || !data.length) return false;

        const fragment = document.createDocumentFragment();
        const rowClass = config.isInner ? 'inner-table-row' : 'user-row';

        data.forEach(item => {
            const cells = config.columns.map(col => {
                const val = item[col.key];
                
                // USA A LÓGICA INTELIGENTE DO UTILS.JS
                // Se tiver 'type' no config (ex: 'datetime'), usa o SmartRenderers
                let content = col.render ? col.render(item) : (SmartRenderers[col.type || 'text'](val));

                // Resolve estilo
                const style = typeof col.style === 'function' ? col.style(item) : col.style;
                
                const cell = DOMUtils.create('div', { 
                    className: `th-col ${col.widthClass || 'w-flex'}`, 
                    style: style,
                    'data-label': col.label 
                });
                
                // innerHTML permite ícones e badges
                cell.innerHTML = content;
                return cell;
            });

            const row = DOMUtils.create('div', {
                className: `${rowClass} ${config.gridClass || ''} animate-fade`,
                'data-id': item.id,
                onclick: () => rowClickCallback && rowClickCallback(row, item)
            }, cells);

            fragment.appendChild(row);
        });

        this.container.appendChild(fragment);
        return true;
    }
}

export function renderGenericTable(container, data, config, cb) {
    return new TableComponent(container).render(data, config, cb);
}