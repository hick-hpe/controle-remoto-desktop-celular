const imgElem = document.querySelector('#meu-qr-code');
const frm = document.querySelector('form');

const socket = io();

socket.on('connect', () => {
    console.log('Conectado ao servidor via Socket.io! ID:', socket.id);
});


frm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = frm.nome.value;

    try {
        const response = await fetch("/enviar-nome", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome })
        });

        if (!response.ok) {
            throw new Error("Erro: requisição falhou");
        }

        const data = await response.json();

        if (!data.sucesso) {
            throw new Error("Erro ao gerar QR Code");
        }

        const qrCode = data.imagem;

        imgElem.src = qrCode;

    } catch (err) {
        console.error(err);
    };

});

// Dentro da inicialização do seu socket (ex: dentro do DOMContentLoaded)
socket.on('qrcode_lido_pelo_celular', (data) => {
    console.log("O celular escaneou o código!");

    // 1. Encontra o elemento da mensagem no HTML
    const statusDiv = document.getElementById('status-conexao');
    const qrCodeImg = document.getElementById('meu-qr-code');

    // 2. Mostra a mensagem de sucesso na tela
    statusDiv.style.display = 'block';

    // 3. Opcional: Adiciona um efeito visual (ex: deixar o QR Code meio transparente)
    qrCodeImg.style.opacity = '0.3';
});
