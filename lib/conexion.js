const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const qrcode = require('qrcode-terminal')

const { manejarMensaje } = require('./handler')
const { manejarEventoGrupo } = require('../comandos/eventos')

async function iniciarBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth')
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
        browser: ['Cuchito-Bot', 'Chrome', '1.0.0'],
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 30000
    })

    sock.ev.on('creds.update', saveCreds)

    // ===== CONEXIÓN =====
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update
        if (qr) qrcode.generate(qr, { small: true })
        if (connection === 'open') console.log('✅ Cuchito-Bot conectado!')
        if (connection === 'close') {
            const razon = new Boom(lastDisconnect?.error)?.output?.statusCode
            const reconnect = razon !== DisconnectReason.loggedOut
            if (reconnect) {
                console.log('🔄 Reconectando en 3 segundos...')
                setTimeout(() => iniciarBot(), 3000)
            } else {
                console.log('❌ Sesión cerrada. Borra la carpeta "auth" y escanea el QR de nuevo.')
            }
        }
    })

    // ===== MENSAJES =====
    sock.ev.on('messages.upsert', async ({ messages }) => {
        try {
            await manejarMensaje(sock, messages[0])
        } catch (e) {
            console.log('⚠️ Error en mensaje:', e.message)
        }
    })

    // ===== EVENTOS DE GRUPO =====
    sock.ev.on('group-participants.update', async (update) => {
        try {
            await manejarEventoGrupo(sock, update)
        } catch (e) {
            console.log('⚠️ Error en evento de grupo:', e.message)
        }
    })
}

module.exports = { iniciarBot }