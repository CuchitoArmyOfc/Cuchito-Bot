function coinflip(sock, from, id, eleccion, msg) {
    return new Promise(async (resolve) => {
        await sock.sendMessage(from, {
            text: '🪙 *Girando la moneda...*'
        }, { quoted: msg })

        setTimeout(async () => {
            const resultado = Math.random() < 0.5 ? 'cara' : 'cruz'
            const gano = resultado === eleccion.toLowerCase()

            await sock.sendMessage(from, {
                text: `🪙 *¡La moneda cayó en ${resultado.toUpperCase()}!*\n\n${gano ? '🎉 ¡Ganaste, mi rey!' : '❌ Perdiste, mi rey'}`
            }, { quoted: msg })

            resolve()
        }, 1500)
    })
}

function dado(sock, from, msg) {
    return new Promise(async (resolve) => {
        await sock.sendMessage(from, {
            text: '🎲 *Lanzando el dado...*'
        }, { quoted: msg })

        setTimeout(async () => {
            const numero = Math.floor(Math.random() * 6) + 1

            await sock.sendMessage(from, {
                text: `🎲 *¡Salió el número ${numero}!*`
            }, { quoted: msg })

            resolve()
        }, 1500)
    })
}

module.exports = { coinflip, dado }