/* js/utils.js - Corrigido para Renderizar Ícones Corretamente */

// 1. Formatadores Puros (Texto)
export const Formatters = {
    date: (val) => val ? new Date(val).toLocaleDateString('pt-BR') : '-',
    dateTime: (val) => val ? new Date(val).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-',
    cpf: (v) => v ? v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '-'
};

// 2. Fábrica de Elementos DOM
export class DOMUtils {
    static create(tag, attrs = {}, content = null) {
        const el = document.createElement(tag);
        
        // Atributos e Eventos
        Object.entries(attrs).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            
            if (key.startsWith('on') && typeof value === 'function') {
                el.addEventListener(key.substring(2).toLowerCase(), value);
            } else if (key === 'className') {
                el.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(el.style, value);
            } else if (key === 'dataset' && typeof value === 'object') {
                Object.assign(el.dataset, value);
            } else {
                el.setAttribute(key, value);
            }
        });

        // Conteúdo (A CORREÇÃO ESTÁ AQUI)
        if (content !== null && content !== undefined) {
            if (Array.isArray(content)) {
                content.forEach(child => {
                    if (child instanceof Node) {
                        el.appendChild(child);
                    } else if (child !== null && child !== undefined) {
                        // Se for string/HTML em array, insere como HTML
                        el.insertAdjacentHTML('beforeend', String(child));
                    }
                });
            } else if (content instanceof Node) {
                el.appendChild(content);
            } else {
                // Se for string simples, usa innerHTML para renderizar as tags <i>
                el.innerHTML = String(content);
            }
        }
        
        return el;
    }
}

// 3. Renderizadores Visuais Inteligentes
export const SmartRenderers = {
    // Texto Simples
    text: (val) => val || '-',
    
    // Datas
    date: (val) => Formatters.date(val),
    datetime: (val) => Formatters.dateTime(val),
    
    // Ícone de Tipo (Computador, Impressora, Usuário)
    icon: (val) => {
        const map = {
            'computador': 'fa-laptop', 'impressora': 'fa-print',
            'administrador': 'fa-user-shield', 'técnico': 'fa-user-cog', 
            'comum': 'fa-user', 'usuário comum': 'fa-user'
        };
        const iconClass = map[(val || '').toLowerCase()] || 'fa-question';
        // Retorna string HTML para o DOMUtils processar via innerHTML
        return `<i class="fas ${iconClass}" title="${val}" style="color: #555;"></i>`;
    },

    // Status Colorido
    status: (val) => {
        if (!val) return '-';
        const lower = val.toLowerCase();
        let color = 'var(--text-primary)';
        if (['online', 'ativo', 'concluído', 'fechado'].includes(lower)) color = 'var(--status-success)';
        if (['offline', 'inativo', 'aberto', 'pendente'].includes(lower)) color = 'var(--status-error)';
        return `<span style="color: ${color}; font-weight: bold;">${val}</span>`;
    },

    // Badges (Etiquetas de Log)
    badge: (val) => {
        if (!val) return '-';
        const map = {
            'CREATE': 'create', 'UPDATE': 'update', 'DELETE': 'delete', 'LOGIN': 'login',
            'ADMINISTRADOR': 'login', 'TÉCNICO': 'update', 'USUÁRIO COMUM': 'bg-disabled'
        };
        const cls = map[val.toUpperCase()] || 'login';
        return `<span class="badge ${cls}">${val}</span>`;
    },

    // Erro (Ícone + Texto Vermelho)
    error: (val) => {
        if (!val) return '';
        return `<div style="display:flex; align-items:center; gap:6px; color:var(--status-error);">
                    <i class="fas fa-exclamation-circle"></i> <span style="font-weight:500; font-size:12px;">${val}</span>
                </div>`;
    }
};

// Funções utilitárias de UI
export function showEmptyState(container, listId, icon = 'fa-box-open', message = 'Nada encontrado') {
    container.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text-muted);"><i class="fas ${icon}" style="font-size:40px; margin-bottom:15px; opacity:0.3;"></i><p>${message}</p></div>`;
    container.classList.remove('hidden');
    if(document.getElementById(listId)) document.getElementById(listId).classList.add('hidden');
}

export function hideEmptyState(container, listId) {
    container.classList.add('hidden');
    container.innerHTML = '';
    if(document.getElementById(listId)) document.getElementById(listId).classList.remove('hidden');
}

export function debounce(func, wait) {
    let timeout;
    return function(...args) { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), wait); };
}