/**
 * Gerencia a troca de abas
 * @param {string} tabName - Nome da aba a ativar
 * @param {Array} tabButtons - Lista de elementos DOM dos botões
 * @param {Function} renderCallback - Função que desenha o conteúdo
 */
export function switchTab(tabName, tabButtons, renderCallback) {
    // Remove classe ativa de todos
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Adiciona ao selecionado (assumindo que o ID do botão é 'tab-NOME')
    const activeBtn = document.getElementById(`tab-${tabName}`);
    if(activeBtn) activeBtn.classList.add('active');

    // Chama o renderizador da página para desenhar o conteúdo
    renderCallback(tabName);
}

/**
 * Reseta o estado visual das abas para o padrão
 */
export function resetTabs(tabButtons) {
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.disabled = false;
    });
    // Ativa a primeira por padrão
    if(tabButtons.length > 0) tabButtons[0].classList.add('active');
}