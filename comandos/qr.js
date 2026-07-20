const QRCode = require('qrcode')

// ========== GENERAR QR ==========
async function generarQR(sock, from, texto) {
    try {
        if (!texto || texto.trim() === '') {
            return sock.sendMessage(from, {
                text: '❌ *Uso:* .qr <texto o link>\n\n📌 Ejemplo:\n.qr https://google.com'
            })
        }

        const qrBuffer = await QRCode.toBuffer(texto, {
            width: 500,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        })

        await sock.sendMessage(from, {
            image: qrBuffer,
            caption: `╭━〔 *📱 CÓDIGO QR* 〕━╮\n┃ ✅ QR generado\n┃ 📄 Contenido: ${texto}\n╰━━━━━━━━━━━━━╯\n\n_Escanéalo para ver el contenido_`
        })

    } catch (e) {
        console.log('⚠️ Error generando QR:', e.message)
        await sock.sendMessage(from, { text: '❌ Error al generar el QR' })
    }
}

module.exports = { generarQR }