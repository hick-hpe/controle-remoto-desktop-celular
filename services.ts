import QRCode from 'qrcode';


async function gerarQrCodeJson(
    url: string
): Promise<[string | null, any]> {

    try {
        // QRCode.toDataURL gera a string em Base64 pronta para o HTML
        const qrCodeBase64 = await QRCode.toDataURL(url, {
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        console.log('QR Code gerado com sucesso!');
        return [qrCodeBase64, null];

    } catch (err) {
        console.error('Erro ao gerar o QR Code:', err);
        return [null, err];
    }
}

export default gerarQrCodeJson;