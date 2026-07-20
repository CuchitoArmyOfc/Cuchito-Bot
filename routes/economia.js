const { leerDB, guardarDB } = require('../lib/database')

async function work(sock, from, id, msg) {
    const trabajos = ['🍕 repartidor', '👨‍💻 programador', '🚗 taxista', '👨‍🍳 cocinero', '🎨 artista']
    const trabajo = trabajos[Math.floor(Math.random() * trabajos.length)]
    const ganancia = Math.floor(Math.random() * 300) + 100

    const db = leerDB()
    if (!db.usuarios[id]) {
        return sock.sendMessage(from, { text: '❌ No estás registrado en la base de datos' }, { quoted: msg })
    }

    db.usuarios[id].coins += ganancia
    guardarDB(db)

    await sock.sendMessage(from, {
        text: `💼 Trabajaste como ${trabajo}\n💰 Ganaste *${ganancia}* coins mi rey!`
    }, { quoted: msg })
}

async function crime(sock, from, id, msg) {
    const gano = Math.random() > 0.5
    const db = leerDB()

    if (!db.usuarios[id]) {
        return sock.sendMessage(from, { text: '❌ No estás registrado en la base de datos' }, { quoted: msg })
    }

    if (gano) {
        const g = Math.floor(Math.random() * 500) + 200
        db.usuarios[id].coins += g
        guardarDB(db)

        await sock.sendMessage(from, {
            text: `🦹 ¡Crimen exitoso!\n💰 Ganaste *${g}* coins mi king!`
        }, { quoted: msg })
    } else {
        const p = Math.floor(Math.random() * 200) + 50
        db.usuarios[id].coins = Math.max(0, db.usuarios[id].coins - p)
        guardarDB(db)

        await sock.sendMessage(from, {
            text: `🚔 ¡Te atraparon!\n💸 Perdiste *${p}* coins`
        }, { quoted: msg })
    }
}

async function balance(sock, from, id, msg) {
    const db = leerDB()
    const u = db.usuarios[id]

    if (!u) {
        return sock.sendMessage(from, { text: '❌ No estás registrado en la base de datos' }, { quoted: msg })
    }

    await sock.sendMessage(from, {
        text: `💰 *Tu billetera:*\n${u.coins} coins mi king`
    }, { quoted: msg })
}

async function daily(sock, from, id, msg) {
    const db = leerDB()
    const u = db.usuarios[id]

    if (!u) {
        return sock.sendMessage(from, { text: '❌ No estás registrado en la base de datos' }, { quoted: msg })
    }

    const ahora = Date.now()
    const unDia = 24 * 60 * 60 * 1000

    if (u.ultimoDaily && ahora - u.ultimoDaily < unDia) {
        const horas = Math.ceil((unDia - (ahora - u.ultimoDaily)) / (60 * 60 * 1000))
        return sock.sendMessage(from, {
            text: `⏰ Ya reclamaste hoy!\nVuelve en *${horas}h*`
        }, { quoted: msg })
    }

    u.coins += 500
    u.ultimoDaily = ahora
    guardarDB(db)

    await sock.sendMessage(from, {
        text: `🎁 *Recompensa diaria!*\n💰 +500 coins mi king!`
    }, { quoted: msg })
}

async function robar(sock, from, id, mencionado, citado, msg) {
    const objetivoId = mencionado || citado

    if (!objetivoId) {
        return sock.sendMessage(from, {
            text: '❌ Usa .robar @usuario o responde el mensaje de la persona y escribe .robar'
        }, { quoted: msg })
    }

    const db = leerDB()
    if (!db.robosCooldown) db.robosCooldown = {}

    const ladron = db.usuarios[id]
    const objetivo = db.usuarios[objetivoId]

    if (!ladron) {
        return sock.sendMessage(from, {
            text: '❌ No estás registrado en la base de datos'
        }, { quoted: msg })
    }

    if (!objetivo) {
        return sock.sendMessage(from, {
            text: '❌ Ese usuario no está registrado en la base de datos'
        }, { quoted: msg })
    }

    if (id === objetivoId) {
        return sock.sendMessage(from, {
            text: '❌ No te puedes robar a ti mismo mi rey'
        }, { quoted: msg })
    }

    const ahora = Date.now()
    const cooldown = 30 * 60 * 1000
    const ultimoRobo = db.robosCooldown[id] || 0
    const restante = cooldown - (ahora - ultimoRobo)

    if (restante > 0) {
        const min = Math.floor(restante / 60000)
        const seg = Math.floor((restante % 60000) / 1000)

        return sock.sendMessage(from, {
            text: `⏳ Ya intentaste robar hace poco\nVuelve a intentarlo en *${min}m ${seg}s*`
        }, { quoted: msg })
    }

    if ((objetivo.coins || 0) < 50) {
        return sock.sendMessage(from, {
            text: '❌ Ese usuario tiene muy pocas coins para robarle'
        }, { quoted: msg })
    }

    db.robosCooldown[id] = ahora

    const exito = Math.random() < 0.5

    if (exito) {
        const maxRobable = Math.min(objetivo.coins, 300)
        const cantidad = Math.floor(Math.random() * maxRobable) + 1

        objetivo.coins -= cantidad
        ladron.coins += cantidad
        guardarDB(db)

        return sock.sendMessage(from, {
            text: `🦹 *ROBO EXITOSO*\n\n💰 Le robaste *${cantidad}* coins al usuario\n💵 Ahora tienes *${ladron.coins}* coins mi rey`
        }, { quoted: msg })
    } else {
        const multa = Math.min(ladron.coins, Math.floor(Math.random() * 150) + 50)
        ladron.coins = Math.max(0, ladron.coins - multa)
        guardarDB(db)

        return sock.sendMessage(from, {
            text: `🚨 *ROBO FALLIDO*\n\n👮 Te atraparon intentando robar\n💸 Pagaste una multa de *${multa}* coins\n💵 Ahora tienes *${ladron.coins}* coins mi king`
        }, { quoted: msg })
    }
}

module.exports = { work, crime, balance, daily, robar }