const { esAdminGrupo } = require('../routes/admins')
const database = require('./database')
const { agregarXP } = require('./niveles')
const { buscarCancion, buscarVideo } = require('../routes/musica')
const { sugerirComando } = require('./comandos-info')
const { work, crime, balance, daily, robar } = require('../routes/economia')
const {
    COMANDOS_SIMPLES,
    COMANDOS_PREFIJO,
    COMANDOS_INTERACCION,
    enviarMenu,
    piedraPapelTijera,
    ochoBola,
    ruletaRusa,
    coinflip,
    pay,
    ruleta,
    predecirPartido
} = require('./comandos')

const NOMBRE_BOT = 'Cuchito'
const OWNER_IDS = [
    '639553329390@s.whatsapp.net',
    '14904308306037@lid'
]

function extraerTexto(msg) {
    return msg.message?.conversation
        || msg.message?.extendedTextMessage?.text
        || msg.message?.imageMessage?.caption
        || msg.message?.videoMessage?.caption
        || msg.message?.documentMessage?.caption
        || ''
}

async function reaccionar(sock, msg) {
    try {
        await sock.sendMessage(msg.key.remoteJid, { react: { text: '🦎', key: msg.key } })
    } catch (e) {
        console.log('Error al reaccionar:', e.message)
    }
}

async function manejarRegistro(reply, id, texto) {
    const args = texto.split(' ')
    const edad = args[1]
    const nombre = args.slice(2).join(' ')

    if (!edad || !nombre) {
        return reply({
            text: `❌ *Formato incorrecto*\n\n📝 Usa así:\n*#register <edad> <nombre>*\n\n📌 Ejemplo:\n#register 18 ${NOMBRE_BOT}`
        })
    }

    if (isNaN(edad)) {
        return reply({ text: '❌ La edad debe ser un número\nEjemplo: #register 18 Keko Fujimori' })
    }

    const res = database.registrarUsuario(id, edad, nombre)
    if (!res.ok) return reply({ text: res.msg })

    return reply({
        text: `✅ *¡Registro exitoso en Cuchito-Bot!* 🦎\n\n╭━━━━━━━━━━━━━━━╮\n┃ 👤 Nombre: ${res.nombre}\n┃ 🎂 Edad: ${res.edad}\n┃ ⭐ Nivel: 1\n┃ 💰 Coins: 100\n╰━━━━━━━━━━━━━━━╯\n\n🎉 ¡Ya puedes usar todos los comandos!\nEscribe *.menu* para empezar.`
    })
}

const ACCIONES_ADMIN = {
    '.ban ': {
        fn: database.banearUsuario,
        ok: '🚫 Usuario baneado correctamente\nYa no podrá usar el bot',
        uso: '.ban @usuario (menciona a la persona)'
    },
    '.unban ': {
        fn: database.desbanearUsuario,
        ok: '✅ Usuario desbaneado correctamente\nYa puede volver a usar el bot',
        uso: '.unban @usuario (menciona a la persona)'
    },
    '.deluser ': {
        fn: database.eliminarUsuario,
        ok: '🗑️ Usuario eliminado de la base de datos\nDeberá registrarse de nuevo para usar el bot',
        uso: '.deluser @usuario (menciona a la persona)'
    }
}

async function manejarAccionAdmin(sock, from, id, msg, reply, prefijo) {
    const admin = await esAdminGrupo(sock, from, id)
    if (!admin) return reply({ text: '❌ Solo un *administrador del grupo* puede usar este comando' })

    const mencionado = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
    const accion = ACCIONES_ADMIN[prefijo]

    if (!mencionado) return reply({ text: `❌ Uso: ${accion.uso}` })

    const res = accion.fn(mencionado)
    if (!res.ok) return reply({ text: res.msg })

    return reply({ text: accion.ok })
}

async function manejarPlay(sock, from, reply, texto) {
    const query = texto.slice(6).trim()
    if (!query) return reply({ text: '❌ Uso: .play <nombre de la canción mi rey>' })

    await reply({ text: `⏳ *Buscando:* ${query}\n\nEspera un momento mi king🥵...` })

    const cancion = await buscarCancion(query)
    if (!cancion.ok) return reply({ text: '❌ No encontré esa canción mi rey 😞' })

    try {
        if (cancion.miniaturaBuffer) {
            await sock.sendMessage(from, {
                image: cancion.miniaturaBuffer,
                caption: `╭━〔 *🎵 CUCHITO MUSIC* 〕━╮\n┃ 🎶 *Título:* ${cancion.titulo}\n┃ 👤 *Autor:* ${cancion.autor}\n┃ ⏱️ *Duración:* ${cancion.duracion || 'N/A'}\n┃ 👁️ *Vistas:* ${cancion.vistas || 'N/A'}\n╰━━━━━━━━━━━━━╯\n\n⏬ _Descargando audio..._`
            })
        }
    } catch (e) {
        console.log('⚠️ Error enviando portada:', e.message)
    }

    try {
        if (!cancion.audioBuffer) return reply({ text: '❌ No pude descargar el audio de esa canción mi rey' })
        await sock.sendMessage(from, {
            audio: cancion.audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${cancion.titulo}.mp3`
        })
    } catch (e) {
        console.log('⚠️ Error enviando audio:', e.message)
        await reply({ text: '❌ No pude enviar el audio mi rey' })
    }
}

async function manejarVideo(sock, from, reply, texto) {
    const query = texto.startsWith('.mp4 ') ? texto.slice(5).trim() : texto.slice(7).trim()
    if (!query) return reply({ text: '❌ Uso: .mp4 <nombre del video papi>' })

    await reply({ text: `⏳ *Buscando video:* ${query}\n\nEspera un momento mi king...` })

    const video = await buscarVideo(query)
    if (!video.ok) return reply({ text: '❌ No encontré ese video mi king😞' })
    if (video.segundos > 600) return reply({ text: '❌ El video es muy largo mi king kong (máximo 10 minutos)' })

    try {
        if (video.miniaturaBuffer) {
            await sock.sendMessage(from, {
                image: video.miniaturaBuffer,
                caption: `╭━〔 *🎬 CUCHITO VIDEO* 〕━╮\n┃ 🎥 *Título:* ${video.titulo}\n┃ 👤 *Autor:* ${video.autor}\n┃ ⏱️ *Duración:* ${video.duracion || 'N/A'}\n┃ 👁️ *Vistas:* ${video.vistas || 'N/A'}\n╰━━━━━━━━━━━━━╯\n\n⏬ _Descargando video..._`
            })
        }
    } catch (e) {
        console.log('⚠️ Error enviando portada:', e.message)
    }

    try {
        if (!video.videoBuffer) return reply({ text: '❌ No pude descargar el video mi rey' })
        await sock.sendMessage(from, {
            video: video.videoBuffer,
            caption: `🎬 *${video.titulo}*\n\n_Cuchito-Bot 🦎_`,
            mimetype: 'video/mp4'
        })
    } catch (e) {
        console.log('⚠️ Error enviando video:', e.message)
        await reply({ text: '❌ No pude enviar el video mi rey (tal vez es muy pesado)' })
    }
}

async function manejarMensaje(sock, msg) {
    if (!msg.message) return

    const texto = extraerTexto(msg)
    const from = msg.key.remoteJid
    const id = msg.key.participant || msg.key.remoteJid
    const reply = (contenido) => sock.sendMessage(from, contenido, { quoted: msg })

    if (!texto) return

    if (texto === '.offbot' || texto === '.onbot') {
        console.log('ID real:', id)
        console.log('OWNER_IDS:', OWNER_IDS)
    }

    const esComando = texto.startsWith('.') || texto.startsWith('#')
    if (esComando) await reaccionar(sock, msg)

    const ES_OWNER = OWNER_IDS.includes(id)

    if (texto === '.offbot') {
        if (!ES_OWNER) return reply({ text: '❌ Solo el creador del bot puede usar este comando' })
        database.apagarBot()
        return reply({ text: '🛑 Bot desactivado para todos los usuarios.' })
    }

    if (texto === '.onbot') {
        if (!ES_OWNER) return reply({ text: '❌ Solo el creador del bot puede usar este comando' })
        database.encenderBot()
        return reply({ text: '✅ Bot activado' })
    }

    if (esComando && database.estaBotApagado() && !ES_OWNER) {
        return reply({
            text: '🛠️ Bot no disponible.\nContacta con +639553329390 mi king🦎.'
        })
    }

    if (texto.startsWith('#register')) return manejarRegistro(reply, id, texto)

    if (esComando && database.estaBaneado(id)) {
        return reply({
            text: `╭━━〔 *🚫 CUCHITO-BOT* 〕━━╮\n┃ Has sido *baneado* del bot\n┃ y no puedes usar comandos\n┃\n┃ Si crees que es un error,\n┃ contacta al desarrollador\n╰━━━━━━━━━━━━━━━━━━╯`
        })
    }

    for (const prefijo of Object.keys(ACCIONES_ADMIN)) {
        if (texto.startsWith(prefijo)) return manejarAccionAdmin(sock, from, id, msg, reply, prefijo)
    }

    if (texto === '.dev' || texto === '.grupos') {
        return COMANDOS_SIMPLES[texto](sock, from, msg)
    }

    if (esComando && !database.estaRegistrado(id)) {
        return reply({
            text: `╭━━〔 *🦎 CUCHITO-BOT* 〕━━╮\n┃ ⚠️ *¡Necesitas registrarte!*\n┃\n┃ Para usar el bot primero\n┃ debes registrarte 📝\n┃\n┃ ✏️ *Escribe:*\n┃ #register <edad> <nombre>\n┃\n┃ 📌 *Ejemplo:*\n┃ #register 18 ${NOMBRE_BOT}\n┃\n╰━━━━━━━━━━━━━━━━━━╯\n\n_¡Solo toma 5 segundos mi rey! 🎉_`
        })
    }

    if (esComando) {
        const lvl = agregarXP(id, 10)
        if (lvl?.subioNivel) {
            await reply({ text: `🎉 *¡SUBISTE DE NIVEL MI REY!*\n⭐ Ahora eres nivel *${lvl.nivel}*\n💰 +50 coins de bonus!` })
        }
    }

    if (texto === '.menu') return enviarMenu(sock, from, database.getUsuario(id), msg)

    if (texto === '#perfil') {
        const u = database.getUsuario(id)
        const caption = `╭━〔 *👤 TU PERFIL MI REY* 〕━╮\n┃ Nombre: ${u.nombre}\n┃ Edad: ${u.edad}\n┃ ⭐ Nivel: ${u.nivel}\n┃ 📊 XP: ${u.xp}\n┃ 💰 Coins: ${u.coins}\n┃ 🎯 Comandos: ${u.comandos}\n╰━━━━━━━━━━━━╯`
        try {
            const fotoUrl = await sock.profilePictureUrl(id, 'image')
            return reply({ image: { url: fotoUrl }, caption })
        } catch (e) {
            return reply({ text: caption })
        }
    }

    if (COMANDOS_SIMPLES[texto]) {
        return COMANDOS_SIMPLES[texto](sock, from, msg)
    }

    for (const { prefijo, fn } of COMANDOS_PREFIJO) {
        if (texto.startsWith(prefijo)) return fn(sock, from, msg, texto, id)
    }

    for (const cmd of Object.keys(COMANDOS_INTERACCION)) {
        if (texto.startsWith(cmd)) return COMANDOS_INTERACCION[cmd](sock, from, msg, id)
    }

    if (texto.startsWith('.predecir ')) {
        const num = parseInt(texto.split(' ')[1])
        if (isNaN(num)) return reply({ text: '❌ Uso: .predecir <número>' })
        return predecirPartido(sock, from, num, msg)
    }

    if (texto.startsWith('.coinflip')) {
        const eleccion = texto.split(' ')[1]
        if (!['cara', 'cruz'].includes(eleccion?.toLowerCase())) {
            return sock.sendMessage(from, { text: '❌ Uso: .coinflip cara/cruz' }, { quoted: msg })
        }
        return coinflip(sock, from, id, eleccion, msg)
    }

    if (texto.startsWith('.ppt ')) {
        const eleccion = texto.split(' ')[1]?.toLowerCase()
        if (!['piedra', 'papel', 'tijera'].includes(eleccion)) {
            return reply({ text: '❌ Uso: .ppt <piedra/papel/tijera>' })
        }
        return piedraPapelTijera(sock, from, eleccion, msg)
    }

    if (texto.startsWith('.8ball ')) {
        const pregunta = texto.slice(7).trim()
        if (!pregunta) return reply({ text: '❌ Uso: .8ball <tu pregunta mi rey>' })
        return ochoBola(sock, from, pregunta, msg)
    }

    if (texto.startsWith('.rusa ')) return ruletaRusa(sock, from, id, texto.split(' ')[1], msg)

    if (texto.startsWith('.work')) return work(sock, from, id, msg)
    if (texto.startsWith('.crime')) return crime(sock, from, id, msg)
    if (texto === '.balance' || texto === '.coins') return balance(sock, from, id, msg)
    if (texto.startsWith('.daily')) return daily(sock, from, id, msg)

    if (texto.startsWith('.robar')) {
        const contextInfo = msg.message?.extendedTextMessage?.contextInfo
        const mencionado = contextInfo?.mentionedJid?.[0]
        const citado = contextInfo?.participant
        return robar(sock, from, id, mencionado, citado, msg)
    }

    if (texto.startsWith('.play ')) return manejarPlay(sock, from, reply, texto)
    if (texto.startsWith('.mp4 ') || texto.startsWith('.video ')) return manejarVideo(sock, from, reply, texto)

    if (esComando) {
        const primeraPalabra = texto.split(' ')[0]
        const sugerencia = sugerirComando(primeraPalabra)
        if (sugerencia) {
            return sock.sendMessage(from, {
                text: `❌ *Comando no reconocido:* ${primeraPalabra}\n\n¿Quisiste decir *${sugerencia.comando}*?\n\n📌 *Uso correcto:*\n${sugerencia.info.uso}\n\n💡 *Ejemplo:*\n${sugerencia.info.ejemplo}`
            }, { quoted: msg })
        }
    }
}

module.exports = { manejarMensaje }