// ========== COINFLIP (cara o cruz) ==========
async function coinflip(sock, from, id, eleccion, msg) {
    try {
        await sock.sendMessage(from, {
            text: '🪙 *Girando la moneda...*'
        }, { quoted: msg })

        setTimeout(async () => {
            try {
                const resultado = Math.random() < 0.5 ? 'cara' : 'cruz'
                const gano = eleccion.toLowerCase() === resultado

                const emoji = resultado === 'cara' ? '🪙' : '⚡'
                let texto = `╭━〔 *🪙 COINFLIP* 〕━╮\n`
                texto += `┃ 🎯 Elegiste: *${eleccion}*\n`
                texto += `┃ ${emoji} Salió: *${resultado}*\n`
                texto += `┃\n`

                if (gano) {
                    texto += `┃ ✅ *¡GANASTE!* 🎉\n`
                } else {
                    texto += `┃ ❌ *Perdiste* 😢\n`
                }

                texto += `╰━━━━━━━━━━━━━╯`

                await sock.sendMessage(from, { text: texto }, { quoted: msg })
            } catch (e) {
                console.log('⚠️ Error en coinflip:', e.message)
                await sock.sendMessage(from, { text: '❌ Error en el juego' }, { quoted: msg })
            }
        }, 1500)
    } catch (e) {
        console.log('⚠️ Error en coinflip:', e.message)
        await sock.sendMessage(from, { text: '❌ Error en el juego' }, { quoted: msg })
    }
}

// ========== DADO (tira un dado del 1 al 6) ==========
async function dado(sock, from, msg) {
    try {
        await sock.sendMessage(from, {
            text: '🎲 *Lanzando el dado...*'
        }, { quoted: msg })

        setTimeout(async () => {
            try {
                const numero = Math.floor(Math.random() * 6) + 1
                const emojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

                let texto = `╭━〔 *🎲 DADO* 〕━╮\n`
                texto += `┃ ${emojis[numero - 1]} Salió el número: *${numero}*\n`
                texto += `╰━━━━━━━━━━━╯`

                await sock.sendMessage(from, { text: texto }, { quoted: msg })
            } catch (e) {
                console.log('⚠️ Error en dado:', e.message)
                await sock.sendMessage(from, { text: '❌ Error al tirar el dado' }, { quoted: msg })
            }
        }, 1500)
    } catch (e) {
        console.log('⚠️ Error en dado:', e.message)
        await sock.sendMessage(from, { text: '❌ Error al tirar el dado' }, { quoted: msg })
    }
}

module.exports = { coinflip, dado }