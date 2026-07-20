// ========== COMANDOS DE INTERACCIÓN ==========

// Función para obtener el usuario mencionado
function obtenerMencionado(msg) {
    const mencionados = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
    const respondido = msg.message?.extendedTextMessage?.contextInfo?.participant
    if (mencionados.length > 0) return mencionados[0]
    if (respondido) return respondido
    return null
}

// ===== BESO =====
async function beso(sock, from, msg, id) {
    const objetivo = obtenerMencionado(msg)

    if (!objetivo) {
        return sock.sendMessage(from, {
            text: '❌ Menciona a alguien\nEjemplo: .beso @usuario'
        }, { quoted: msg })
    }

    const yo = id.split('@')[0]
    const tu = objetivo.split('@')[0]

    await sock.sendMessage(from, {
        text: `💋 @${yo} le dio un beso a @${tu} 😘\n\n_¡Qué lindos! 🥰_`,
        mentions: [id, objetivo]
    }, { quoted: msg })
}

// ===== ABRAZO =====
async function abrazo(sock, from, msg, id) {
    const objetivo = obtenerMencionado(msg)
    if (!objetivo) {
        return sock.sendMessage(from, {
            text: '❌ Menciona a alguien\nEjemplo: .abrazo @usuario'
        }, { quoted: msg })
    }
    const yo = id.split('@')[0]
    const tu = objetivo.split('@')[0]

    await sock.sendMessage(from, {
        text: `🤗 @${yo} le dio un abrazo a @${tu} 💕\n\n_¡Qué cursis tmre! 😓_`,
        mentions: [id, objetivo]
    }, { quoted: msg })
}

// ===== NALGADA =====
async function nalgada(sock, from, msg, id) {
    const objetivo = obtenerMencionado(msg)
    if (!objetivo) {
        return sock.sendMessage(from, {
            text: '❌ Menciona a alguien\nEjemplo: .nalgada @usuario'
        }, { quoted: msg })
    }
    const yo = id.split('@')[0]
    const tu = objetivo.split('@')[0]

    await sock.sendMessage(from, {
        text: `👏🍑 @${yo} le dio una nalgada a @${tu} 😳\n\n_¡Que riko csmr! 🥵_`,
        mentions: [id, objetivo]
    }, { quoted: msg })
}

// ===== GOLPE =====
async function golpe(sock, from, msg, id) {
    const objetivo = obtenerMencionado(msg)
    if (!objetivo) {
        return sock.sendMessage(from, {
            text: '❌ Menciona a alguien\nEjemplo: .golpe @usuario'
        }, { quoted: msg })
    }
    const yo = id.split('@')[0]
    const tu = objetivo.split('@')[0]

    await sock.sendMessage(from, {
        text: `👊 @${yo} le dio un golpe a @${tu} 😵\n\n_¡Jajaja por baboso! 😂_`,
        mentions: [id, objetivo]
    }, { quoted: msg })
}

// ===== MATAR (broma) =====
async function matar(sock, from, msg, id) {
    const objetivo = obtenerMencionado(msg)
    if (!objetivo) {
        return sock.sendMessage(from, {
            text: '❌ Menciona a alguien\nEjemplo: .matar @usuario'
        }, { quoted: msg })
    }
    const yo = id.split('@')[0]
    const tu = objetivo.split('@')[0]

    await sock.sendMessage(from, {
        text: `🔫 @${yo} eliminó a @${tu} ⚰️\n\n_F en el chat 🪦_`,
        mentions: [id, objetivo]
    }, { quoted: msg })
}

// ===== BOFETADA =====
async function bofetada(sock, from, msg, id) {
    const objetivo = obtenerMencionado(msg)
    if (!objetivo) {
        return sock.sendMessage(from, {
            text: '❌ Menciona a alguien\nEjemplo: .bofetada @usuario'
        }, { quoted: msg })
    }
    const yo = id.split('@')[0]
    const tu = objetivo.split('@')[0]

    await sock.sendMessage(from, {
        text: `🖐️ @${yo} le dio una cachetada a @${tu} 😤\n\n_¡Metele otra mano! 😏_`,
        mentions: [id, objetivo]
    }, { quoted: msg })
}

module.exports = { beso, abrazo, nalgada, golpe, matar, bofetada }