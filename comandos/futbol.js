const axios = require('axios')

const API_KEY = '2e3832fb9fe4450380c40485318dc9cf'
const headers = { 'X-Auth-Token': API_KEY }

function poisson(k, lambda) {
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k)
}
function factorial(n) {
    let r = 1
    for (let i = 2; i <= n; i++) r *= i
    return r
}

async function statsEquipo(teamId) {
    try {
        const url = `https://api.football-data.org/v4/teams/${teamId}/matches?status=FINISHED&limit=10`
        const r = await axios.get(url, { headers })
        const matches = r.data.matches || []

        let gm = 0, gr = 0, n = 0
        for (const m of matches) {
            if (m.score.fullTime.home === null) continue
            if (m.homeTeam.id === teamId) {
                gm += m.score.fullTime.home
                gr += m.score.fullTime.away
            } else {
                gm += m.score.fullTime.away
                gr += m.score.fullTime.home
            }
            n++
        }
        if (n === 0) return null
        return { gm: gm / n, gr: gr / n }
    } catch (e) {
        console.log('⚠️ Error stats:', e.message)
        return null
    }
}

async function verPartidos(sock, from) {
    try {
        await sock.sendMessage(from, { text: '⏳ *Buscando partidos...*' })

        const url = 'https://api.football-data.org/v4/matches'
        const r = await axios.get(url, { headers })
        const partidos = r.data.matches || []

        if (!partidos.length) {
            return sock.sendMessage(from, { text: '❌ No hay partidos disponibles hoy' })
        }

        let texto = `╭━〔 *⚽ PARTIDOS DE HOY* 〕━╮\n\n`
        partidos.slice(0, 15).forEach((p, i) => {
            const local = p.homeTeam.name
            const visit = p.awayTeam.name
            const comp = p.competition.name
            texto += `*${i}.* ${local} 🆚 ${visit}\n   🏆 ${comp}\n\n`
        })
        texto += `╰━━━━━━━━━━━━━━━╯\n\n📊 Usa: *.predecir <número>*\nEjemplo: .predecir 0`

        global.partidosCache = partidos

        await sock.sendMessage(from, { text: texto })
    } catch (e) {
        console.log('⚠️ Error partidos:', e.message)
        await sock.sendMessage(from, { text: '❌ Error al obtener partidos (revisa la API KEY o el límite)' })
    }
}

async function predecirPartido(sock, from, numero) {
    try {
        const partidos = global.partidosCache
        if (!partidos || !partidos[numero]) {
            return sock.sendMessage(from, { text: '❌ Primero usa *.partidos* y luego elige un número válido' })
        }

        await sock.sendMessage(from, { text: '🔮 *Analizando el partido...*' })

        const p = partidos[numero]
        const nombreL = p.homeTeam.name
        const nombreV = p.awayTeam.name

        const sl = await statsEquipo(p.homeTeam.id)
        const sv = await statsEquipo(p.awayTeam.id)

        if (!sl || !sv) {
            return sock.sendMessage(from, { text: '❌ No hay suficientes datos de estos equipos' })
        }

        const geLocal = sl.gm * (sv.gr / 1.3) * 1.1
        const geVisit = sv.gm * (sl.gr / 1.3)

        const maxGoles = 6
        const probL = []
        const probV = []
        for (let i = 0; i <= maxGoles; i++) {
            probL.push(poisson(i, geLocal))
            probV.push(poisson(i, geVisit))
        }

        let pLocal = 0, pEmpate = 0, pVisit = 0
        let mejorProb = 0, mejorL = 0, mejorV = 0

        for (let i = 0; i <= maxGoles; i++) {
            for (let j = 0; j <= maxGoles; j++) {
                const prob = probL[i] * probV[j]
                if (i > j) pLocal += prob
                else if (i === j) pEmpate += prob
                else pVisit += prob

                if (prob > mejorProb) {
                    mejorProb = prob
                    mejorL = i
                    mejorV = j
                }
            }
        }

        const texto = `╭━〔 *🔮 PREDICCIÓN CUCHITO* 〕━╮
┃
┃ ⚽ *${nombreL}*
┃      🆚
┃ ⚽ *${nombreV}*
┃
┃ 📊 *Goles esperados:*
┃ ${geLocal.toFixed(2)} - ${geVisit.toFixed(2)}
┃
┃ 🏠 Gana ${nombreL}: *${(pLocal * 100).toFixed(1)}%*
┃ 🤝 Empate: *${(pEmpate * 100).toFixed(1)}%*
┃ ✈️ Gana ${nombreV}: *${(pVisit * 100).toFixed(1)}%*
┃
┃ 🎯 *Marcador probable:*
┃ ${mejorL} - ${mejorV} (${(mejorProb * 100).toFixed(1)}%)
┃
╰━━━━━━━━━━━━━━━╯

_⚠️ Solo es una predicción estadística_`

        await sock.sendMessage(from, { text: texto })

    } catch (e) {
        console.log('⚠️ Error predecir:', e.message)
        await sock.sendMessage(from, { text: '❌ Error al predecir el partido' })
    }
}

module.exports = { verPartidos, predecirPartido }