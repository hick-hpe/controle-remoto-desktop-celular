import express from "express";
import session from 'express-session';
import path from "path";
import router from "./routes";
import { createServer } from 'http';
import { Server } from 'socket.io';

import { salvarSocket } from "./services.socket";

const app = express();
const server = createServer(app);
const io = new Server(server);

const sessionMiddleware = session({
    secret: 'seu_segredo_aqui',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Deixe true se estiver usando HTTPS
        maxAge: 1000 * 60 * 60 * 24 // Tempo de vida do cookie (Ex: 1 dia)
    }
})

app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);

app.use(express.static(path.join(__dirname, '..', 'views')));
app.use(express.static('public'));
app.use(express.json())
app.use('/', router);

const PORT = 3000;


io.on('connection', (socket) => {
    console.log(`Usuário conectado: ${socket.id}`);

    const req = socket.request as any;
    const sessionId = req.session?.id;

    const userAgent = socket.handshake.headers['user-agent'] || '';

    // Expressão regular para identificar dispositivos móveis
    const ehCelular = /Mobile|Android|iP(hone|od|ad)|IEMobile|BlackBerry|Kindle/i.test(userAgent);

    const tipoDispositivo = ehCelular ? 'Celular/Tablet' : 'Computador (Desktop)';

    console.log(`Usuário conectado (${socket.id}) via: ${tipoDispositivo}`);

    console.log(`Session ID: ${sessionId}`);

    if (sessionId) {
        const socketObj = {
            socket: socket,
            "dispositivo": tipoDispositivo
        };
        salvarSocket(sessionId, socketObj);
    }

    // ao acessar o link do qr code
    socket.on('qrcode_lido_pelo_celular', (data) => {
        console.log('Dados recebidos via Socket:', data);
        socket.send('celular_conectado', data);
    });

    // Evento quando o usuário desconecta
    socket.on('disconnect', () => {
        console.log(`Usuário desconectou: ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`Server rodando em http://localhost:${PORT}`);
});

