const fs = require('fs')
const path = require('path')

const dbPath = path.join(__dirname, 'db.json')

function leerDB() {
    if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, JSON.stringify({
            usuarios: {},
            botApagado: false
        }, null, 2))
    }

    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'))

    if (!db.usuarios) db.usuarios = {}
    if (typeof db.botApagado !== 'boolean') db.botApagado = false

    return db
}

function guardarDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
}

function registrarUsuario(id, edad, nombre) {
    const db = leerDB()
    if (db.usuarios[id]?.registrado) return { ok: false, msg: 'Ya estás registrado ❌' }

    db.usuarios[id] = {
        registrado: true,
        nombre,
        edad: parseInt(edad),
        xp: 0,
        nivel: 1,
        coins: 100,
        comandos: 0,
        baneado: false
    }

    guardarDB(db)
    return { ok: true, nombre, edad }
}

function getUsuario(id) {
    const db = leerDB()
    return db.usuarios[id] || null
}

function estaRegistrado(id) {
    const u = getUsuario(id)
    return u?.registrado === true
}

function banearUsuario(id) {
    const db = leerDB()
    if (!db.usuarios[id]) return { ok: false, msg: '❌ Ese usuario no está registrado' }

    db.usuarios[id].baneado = true
    guardarDB(db)
    return { ok: true }
}

function desbanearUsuario(id) {
    const db = leerDB()
    if (!db.usuarios[id]) return { ok: false, msg: '❌ Ese usuario no está registrado' }

    db.usuarios[id].baneado = false
    guardarDB(db)
    return { ok: true }
}

function estaBaneado(id) {
    const u = getUsuario(id)
    return u?.baneado === true
}

function eliminarUsuario(id) {
    const db = leerDB()
    if (!db.usuarios[id]) return { ok: false, msg: '❌ Ese usuario no está registrado' }

    delete db.usuarios[id]
    guardarDB(db)
    return { ok: true }
}

function apagarBot() {
    const db = leerDB()
    db.botApagado = true
    guardarDB(db)
    return { ok: true, msg: '🛑 Bot apagado para todos los usuarios' }
}

function encenderBot() {
    const db = leerDB()
    db.botApagado = false
    guardarDB(db)
    return { ok: true, msg: '✅ Bot activado nuevamente' }
}

function estaBotApagado() {
    const db = leerDB()
    return db.botApagado === true
}

module.exports = {
    leerDB,
    guardarDB,
    registrarUsuario,
    getUsuario,
    estaRegistrado,
    banearUsuario,
    desbanearUsuario,
    estaBaneado,
    eliminarUsuario,
    apagarBot,
    encenderBot,
    estaBotApagado
}