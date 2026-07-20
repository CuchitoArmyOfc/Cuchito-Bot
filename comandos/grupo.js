// ========== TAGALL (menciona a todos, solo admins) ==========
async function tagall(sock, from, msg, texto, id) {
    if (!from.endsWith('@g.us')) {
        return sock.sendMessage(from, { text: '❌ Solo funciona en *grupos*' })
    }

    try {
        const grupo = await sock.groupMetadata(from)

        // Verificar si quien lo usa es admin
        const usuario = grupo.participants.find(p => p.id === id)
        const esAdmin = usuario?.admin === 'admin' || usuario?.admin === 'superadmin'

        if (!esAdmin) {
            return sock.sendMessage(from, { text: '❌ Solo los *administradores* pueden usar este comando' })
        }

        const participantes = grupo.participants
        const mensaje = texto.slice(7).trim() || 'Atención a todos!'

        let texto_final = `╭━〔 *📢 CUCHITO-BOT* 〕━╮\n┃ ${mensaje}\n╰━━━━━━━━━━━━╯\n\n`
        const menciones = []

        for (let p of participantes) {
            texto_final += `👤 @${p.id.split('@')[0]}\n`
            menciones.push(p.id)
        }

        await sock.sendMessage(from, {
            text: texto_final,
            mentions: menciones
        })

    } catch (e) {
        console.error(e)
        await sock.sendMessage(from, { text: '❌ Error al mencionar' })
    }
}

// ========== HIDETAG (menciona a todos SIN mostrar los @) ==========
async function hidetag(sock, from, texto) {
    if (!from.endsWith('@g.us')) {
        return sock.sendMessage(from, { text: '❌ Solo funciona en *grupos*' })
    }

    try {
        const grupo = await sock.groupMetadata(from)
        const menciones = grupo.participants.map(p => p.id)

        const mensaje = texto.slice(8).trim() || '📢 Atención al grupo'

        await sock.sendMessage(from, {
            text: mensaje,
            mentions: menciones
        })

    } catch (e) {
        console.error(e)
        await sock.sendMessage(from, { text: '❌ Error al enviar el mensaje' })
    }
}

// ⭐⭐⭐ ESTO ERA LO QUE FALTABA ⭐⭐⭐
module.exports = { tagall, hidetag }