const axios = require('axios')

// ========== MANEJAR EVENTOS DE GRUPO (entrar/salir) ==========
async function manejarEventoGrupo(sock, update) {
    try {
        const { id, participants, action } = update

        let nombreGrupo = 'el grupo'
        try {
            const metadata = await sock.groupMetadata(id)
            nombreGrupo = metadata.subject
        } catch (e) {
            console.log('⚠️ No se pudo obtener nombre del grupo')
        }

        for (const p of participants) {
            let jid = ''
            if (typeof p === 'string') {
                jid = p
            } else if (p?.id) {
                jid = p.id
            } else {
                jid = String(p)
            }

            const numero = jid.split('@')[0]

            let foto = null
            try {
                const urlFoto = await sock.profilePictureUrl(jid, 'image')
                const res = await axios.get(urlFoto, { responseType: 'arraybuffer' })
                foto = Buffer.from(res.data)
            } catch (e) {
                // Sin foto
            }

            // ===== BIENVENIDA =====
            if (action === 'add') {
                const textoBienvenida = `╭━━━〔 *🦎 CUCHITO ARMY* 〕━━━╮
┃
┃ 🎉 *¡BIENVENIDO MI REY!* 🎉
┃
┃ 👋 Hola @${numero}
┃ 
┃ 🦎 Bienvenido al grupo
┃ *Cuchito Army Oficial* 🦎
┃
┃ 📜 Lee las reglas y respeta
┃    a todos los miembros
┃ 💬 Preséntate y diviértete
┃ 🎮 Usa *.menu* para ver
┃    los comandos del bot
┃
┃ 🔥 ¡Ya somos más en la
┃    Cuchito Army Oficial!
┃
╰━━━━━━━━━━━━━━━━━━━╯

_¡Esperamos que la pases bien mi rey! 🎊_`

                if (foto) {
                    await sock.sendMessage(id, { image: foto, caption: textoBienvenida, mentions: [jid] })
                } else {
                    await sock.sendMessage(id, { text: textoBienvenida, mentions: [jid] })
                }
            }

            // ===== DESPEDIDA =====
            if (action === 'remove') {
                const textoDespedida = `╭━━━〔 *🦎 CUCHITO ARMY* 〕━━━╮
┃
┃ 👋 *¡HASTA LUEGO MANITO!* 👋
┃
┃ 😂 @${numero} ya safo...
┃
┃ 🦎 *Safó un cuchito* 🦎
┃
╰━━━━━━━━━━━━━━━━━━━╯

_Ya era hora ya que se valla ese mongol... 😂_`

                if (foto) {
                    await sock.sendMessage(id, { image: foto, caption: textoDespedida, mentions: [jid] })
                } else {
                    await sock.sendMessage(id, { text: textoDespedida, mentions: [jid] })
                }
            }
        }

    } catch (e) {
        console.log('⚠️ Error en evento de grupo:', e.message)
    }
}

module.exports = { manejarEventoGrupo }