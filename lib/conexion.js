const { Client, LocalAuth } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')

const { manejarMensaje } = require('./handler')
const { manejarEventoGrupo } = require('../comandos/eventos')

async function iniciarBot() {
    const client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    })

    client.on('qr', (qr) => {
        console.log('📱 Escanea este QR:')
        qrcode.generate(qr, { small: true })
    })

    client.on('ready', () => {
        console.log('✅ Cuchito-Bot conectado!')
    })

    client.on('message', async (message) => {
        try {
            await manejarMensaje(client, message)
        } catch (e) {
            console.log('⚠️ Error en mensaje:', e.message)
        }
    })

    client.on('group_join', async (notification) => {
        try {
            await manejarEventoGrupo(client, { action: 'add', participants: notification.participants, id: notification.chatId })
        } catch (e) {
            console.log('⚠️ Error en evento de grupo:', e.message)
        }
    })

    client.on('disconnected', (reason) => {
        console.log('🔄 Reconectando...', reason)
        setTimeout(() => iniciarBot(), 3000)
    })

    await client.initialize()
}

module.exports = { iniciarBot }