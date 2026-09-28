const mapSocket = {};


function salvarSocket(sessionId, dadosSocket) {
    // Se a sessão já existia, mantém os dados antigos e mescla com os novos
    mapSocket[sessionId] = {
        ...mapSocket[sessionId],
        ...dadosSocket
    };
}


function getSocketFromSession(sessionId) {
    return mapSocket[sessionId] || null;
}


function getSocketFromConexao(idConexao) {
    // Encontra o sessionId que possui o idConexao correspondente
    const sessionId = Object.keys(mapSocket).find(
        (sessionKey) => mapSocket[sessionKey].idConexao === idConexao
    );

    // Retorna o objeto completo daquela sessão (ou null se não achar)
    return sessionId ? mapSocket[sessionId] : null;
}

function atualizarIdConexaoSocket(sessionId, novoIdConexao) {
    // 1. Verifica se a sessão realmente existe no mapa para não quebrar o código
    if (mapSocket[sessionId]) {
        // 2. Atualiza diretamente o valor da propriedade idConexao
        mapSocket[sessionId].idConexao = novoIdConexao;
        
        console.log(`[Mapa] idConexao atualizado para ${novoIdConexao} na sessão ${sessionId}`);
    } else {
        console.warn(`[Mapa] Tentativa de atualizar idConexao, mas a sessão ${sessionId} não foi encontrada.`);
    }
}


export { salvarSocket, getSocketFromSession, getSocketFromConexao, atualizarIdConexaoSocket };
