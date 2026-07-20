const { Sticker } = require('wa-sticker-formatter')
const { downloadMediaMessage } = require('@whiskeysockets/baileys')

// .sticker - imagen o video/gif a sticker (directo o citando)
async function sticker(sock, from, msg) {
    const citado = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage

    const imagenMsg = msg.message?.imageMessage || citado?.imageMessage
    const videoMsg = msg.message?.videoMessage || citado?.videoMessage

    if (!imagenMsg && !videoMsg) {
        return sock.sendMessage(from, {
            text: '❌ Envía una *imagen* o *video corto* con el comando *.sticker* como pie de foto, o responde a una imagen/video con *.sticker*'
        })
    }

    try {
        const mensajeFuente = citado
            ? { message: citado, key: msg.key }
            : msg

        const buffer = await downloadMediaMessage(mensajeFuente, 'buffer', {})

        const stk = new Sticker(buffer, {
            pack: 'Cuchito-Bot',
            author: 'El Calacas',
            type: 'full',
            quality: 50
        })

        await sock.sendMessage(from, await stk.toMessage())
    } catch (e) {
        console.error(e)
        await sock.sendMessage(from, { text: '❌ Error al crear el sticker. Verifica que el archivo no sea muy pesado (máx. ~10-15 seg para videos)' })
    }
}

// .toimg - sticker a imagen
async function toimg(sock, from, msg) {
    const citado = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const stickerMsg = citado?.stickerMessage || msg.message?.stickerMessage

    if (!stickerMsg) {
        return sock.sendMessage(from, { text: '❌ Responde a un *sticker* con .toimg' })
    }

    try {
        const mensajeFuente = citado
            ? { message: citado, key: msg.key }
            : msg

        const buffer = await downloadMediaMessage(mensajeFuente, 'buffer', {})

        await sock.sendMessage(from, {
            image: buffer,
            caption: '🖼️ Aquí está tu imagen | Cuchito-Bot'
        })
    } catch (e) {
        console.error(e)
        await sock.sendMessage(from, { text: '❌ Error al convertir el sticker' })
    }
}

module.exports = { sticker, toimg }