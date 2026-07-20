const { leerDB, guardarDB } = require('../lib/database')

// .pay @usuario <cantidad> - Transferir coins
async function pay(sock, from, msg, id, texto) {
    // Obtener a quién le mencionó
    const mencionado = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]

    if (!mencionado) {
        return sock.sendMessage(from, { text: '❌ Uso: .pay @usuario <cantidad>\nEjemplo: .pay @juan 100' }, { quoted: msg })
    }

    // Sacar la cantidad del texto
    const cantidad = parseInt(texto.split(' ').find(n => !isNaN(n) && n !== ''))

    if (!cantidad || cantidad <= 0) {
        return sock.sendMessage(from, { text: '❌ Pon una cantidad válida\nEjemplo: .pay @juan 100' }, { quoted: msg })
    }

    const db = leerDB()

    // Verificar que el que envía tenga cuenta y dinero
    if (!db.usuarios[id]) {
        return sock.sendMessage(from, { text: '❌ No estás registrado' }, { quoted: msg })
    }
    if (db.usuarios[id].coins < cantidad) {
        return sock.sendMessage(from, { text: `❌ No tienes suficientes coins\nTienes: ${db.usuarios[id].coins}` }, { quoted: msg })
    }

    // Verificar que el que recibe esté registrado
    if (!db.usuarios[mencionado]?.registrado) {
        return sock.sendMessage(from, { text: '❌ Ese usuario no está registrado' }, { quoted: msg })
    }

    // Transferir
    db.usuarios[id].coins -= cantidad
    db.usuarios[mencionado].coins += cantidad
    guardarDB(db)

    await sock.sendMessage(from, {
        text: `✅ *Transferencia exitosa!*\n💸 Enviaste *${cantidad}* coins\n👤 A: @${mencionado.split('@')[0]}`,
        mentions: [mencionado]
    }, { quoted: msg })
}

// .ruleta <cantidad> - Apostar
async function ruleta(sock, from, id, texto, msg) {
    const apuesta = parseInt(texto.split(' ')[1])

    if (!apuesta || apuesta <= 0) {
        return sock.sendMessage(from, { text: '❌ Uso: .ruleta <cantidad>\nEjemplo: .ruleta 100' }, { quoted: msg })
    }

    const db = leerDB()
    const user = db.usuarios[id]

    if (user.coins < apuesta) {
        return sock.sendMessage(from, { text: `❌ No tienes suficientes coins\nTienes: ${user.coins}` }, { quoted: msg })
    }

    await sock.sendMessage(from, { text: '🎲 Girando la ruleta...' }, { quoted: msg })

    // Suspenso
    await new Promise(r => setTimeout(r, 1500))

    const numero = Math.floor(Math.random() * 100) + 1

    let mensaje
    if (numero <= 45) {
        // Pierde (45%)
        user.coins -= apuesta
        mensaje = `🎲 Salió: *${numero}*\n❌ ¡Perdiste! -${apuesta} coins`
    } else if (numero <= 90) {
        // Gana x2 (45%)
        user.coins += apuesta
        mensaje = `🎲 Salió: *${numero}*\n✅ ¡Ganaste! +${apuesta} coins 💰`
    } else {
        // JACKPOT x5 (10%)
        const premio = apuesta * 5
        user.coins += premio
        mensaje = `🎲 Salió: *${numero}*\n🎰 ¡¡JACKPOT!! +${premio} coins 🤑`
    }

    guardarDB(db)
    await sock.sendMessage(from, { text: mensaje }, { quoted: msg })
}

module.exports = { pay, ruleta }