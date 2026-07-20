const { leerDB, guardarDB } = require('./database')

function xpNecesaria(nivel) {
    return nivel * 100
}

function agregarXP(id, cantidad = 10) {
    const db = leerDB()
    const user = db.usuarios[id]
    if (!user) return null

    user.xp += cantidad
    user.comandos += 1
    user.coins += 5

    let subioNivel = false
    while (user.xp >= xpNecesaria(user.nivel)) {
        user.xp -= xpNecesaria(user.nivel)
        user.nivel += 1
        user.coins += 50
        subioNivel = true
    }

    guardarDB(db)
    return { subioNivel, nivel: user.nivel, xp: user.xp, xpMax: xpNecesaria(user.nivel) }
}

module.exports = { agregarXP, xpNecesaria }