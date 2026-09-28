import express from "express";
import { Request, Response } from "express";
import path from "path";
import gerarQrCodeJson from "./services.ts"
import getUrlBase from "./utils.ts";
import { atualizarIdConexaoSocket, getSocketFromConexao, getSocketFromSession } from "./services.socket.ts";

const router = express.Router();

// exibir pagina inicial
router.get('/', (req: Request, res: Response) => {

    req.session.dispositivo = 'Computador';

    res.sendFile(path.join(process.cwd(), 'views', 'index.html'));
});

// enviar nome
router.post('/enviar-nome', async (req: Request, res: Response) => {
    const nome = req.body.nome;

    if (!nome || nome.length < 3) {
        return res.json({
            "type": "danger",
            "message": "O nome deve ter pelo menos 3 caracteres!"
        });
    }

    try {

        const idConexao = crypto.randomUUID();

        const url = getUrlBase(req) + `/connect/${idConexao}`;

        const [qrCodeBase64, erro] = await gerarQrCodeJson(url);

        console.log(`URL gerada: ${url}`);

        if (erro || !qrCodeBase64) {
            return res.status(400).json({
                sucesso: false,
                erro: erro?.message || 'Erro desconhecido'
            });
        }

        const sessionId = req.session.id;
        atualizarIdConexaoSocket(sessionId, idConexao);

        return res.json({
            sucesso: true,
            imagem: qrCodeBase64
        });

    } catch (err: any) {
        console.error('Erro crítico no router do QR Code:', err);
        return res.status(500).json({
            sucesso: false,
            erro: err?.message || 'Erro interno do servidor'
        });
    }

});

// escanear qr code
router.get('/connect/:idConexao', (req: Request, res: Response) => {
    const idConexao = req.params.idConexao;

    // 1. Identifica se quem está acessando é um celular
    const userAgent = req.headers['user-agent'] || '';
    const ehCelular = /Mobile|Android|iP(hone|od|ad)|IEMobile|BlackBerry|Kindle/i.test(userAgent);

    // 2. Se for celular, criamos a sessão manualmente neste exato momento
    if (ehCelular) {
        console.log(`[Connect] Dispositivo celular detectado. Inicializando sessão...`);
        
        // Atribuir qualquer dado força o express-session a gerar o ID e criar o Cookie connect.sid
        req.session.dispositivo = 'Celular'; 
    } else {
        console.log(`[Connect] Acesso negado/ignorado para criação de sessão (Não é celular).`);
        return res.status(403).send('<h1>Acesso permitido apenas para dispositivos móveis.</h1>');
    }

    // 3. Após forçar a criação acima, pegamos o ID gerado da sessão do celular
    const sessionIdCelular = req.session.id;

    // 4. Busca o PC de origem que gerou o QR Code
    const socketObjPc = getSocketFromConexao(idConexao);
    console.log('PC de Origem encontrado:', socketObjPc);

    if (!socketObjPc) {
        return res.status(404).send('<h1>Erro: QR Code inválido ou expirou!</h1>');
    }

    // Como o celular acabou de criar a sessão HTTP e ainda não abriu o WebSocket dele,
    // usamos o ID da sessão recém-criada para identificá-lo
    const pcOrigem = socketObjPc.socket.id;
    
    // TESTE: mensagem de sucesso
    const msg = `
        <h1>QR Code Escaneado com Sucesso!<h1>
        <p>Acesso feito via Celular.</p>
        <p>PC origem (Socket ID): ${pcOrigem}</p>
        <p>Sessão do Celular Criada: ${sessionIdCelular}</p>
    `;

    // Avisa o computador via WebSocket que o celular escaneou com sucesso
    socketObjPc.socket.emit('qrcode_lido_pelo_celular', {
        sessionIdCelular: sessionIdCelular
    });
    
    return res.send(msg);
});


export default router;
