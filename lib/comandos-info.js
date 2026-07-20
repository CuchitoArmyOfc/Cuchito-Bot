const COMANDOS = {
    '.menu': { uso: '.menu', ejemplo: '.menu' },
    '.menu2': { uso: '.menu2', ejemplo: '.menu2' },
    '.dev': { uso: '.dev', ejemplo: '.dev' },
    '.grupos': { uso: '.grupos', ejemplo: '.grupos' },
    '#perfil': { uso: '#perfil', ejemplo: '#perfil' },
    '#register': { uso: '#register <edad> <nombre>', ejemplo: '#register 18 Cuchito' },
    '.ping': { uso: '.ping', ejemplo: '.ping' },
    '.tiempo': { uso: '.tiempo', ejemplo: '.tiempo' },
    '.qr': { uso: '.qr <texto>', ejemplo: '.qr Hola mundo' },
    '.pdf': { uso: '.pdf (responder imagen)', ejemplo: 'Responde una imagen con .pdf' },
    '.pdf2img': { uso: '.pdf2img (responder PDF)', ejemplo: 'Responde un PDF con .pdf2img' },
    '.delpdf': { uso: '.delpdf <número de página> (responder PDF)', ejemplo: '.delpdf 2' },
    '.protectpdf': { uso: '.protectpdf <contraseña> (responder PDF)', ejemplo: '.protectpdf 1234' },
    '.textoword': { uso: '.textoword <texto o responder PDF>', ejemplo: '.textoword Hola mundo' },
    '.tarea': { uso: '.tarea <tu pregunta>', ejemplo: '.tarea Cuánto es 5+5' },
    '.resumen': { uso: '.resumen <texto o responder mensaje/PDF>', ejemplo: '.resumen (citando un mensaje largo)' },
    '.partidos': { uso: '.partidos', ejemplo: '.partidos' },
    '.predecir': { uso: '.predecir <número>', ejemplo: '.predecir 1' },
    '.svideo': { uso: '.svideo (responder video)', ejemplo: 'Responde un video con .svideo' },
    '.tiktok': { uso: '.tiktok <link>', ejemplo: '.tiktok https://vm.tiktok.com/xxxxx' },
    '.coinflip': { uso: '.coinflip <cara/cruz>', ejemplo: '.coinflip cara' },
    '.dado': { uso: '.dado', ejemplo: '.dado' },
    '.ppt': { uso: '.ppt <piedra/papel/tijera>', ejemplo: '.ppt piedra' },
    '.8ball': { uso: '.8ball <tu pregunta>', ejemplo: '.8ball ¿Ganaré la lotería?' },
    '.trivia': { uso: '.trivia', ejemplo: '.trivia' },
    '.dados2': { uso: '.dados2', ejemplo: '.dados2' },
    '.rusa': { uso: '.rusa <cantidad de coins>', ejemplo: '.rusa 50' },
    '.pay': { uso: '.pay @usuario <cantidad>', ejemplo: '.pay @usuario 50' },
    '.ruleta': { uso: '.ruleta <cantidad>', ejemplo: '.ruleta 50' },
    '.sticker': { uso: '.sticker (responder imagen)', ejemplo: 'Responde una imagen con .sticker' },
    '.toimg': { uso: '.toimg (responder sticker)', ejemplo: 'Responde un sticker con .toimg' },
    '.beso': { uso: '.beso @usuario', ejemplo: '.beso @usuario' },
    '.abrazo': { uso: '.abrazo @usuario', ejemplo: '.abrazo @usuario' },
    '.nalgada': { uso: '.nalgada @usuario', ejemplo: '.nalgada @usuario' },
    '.golpe': { uso: '.golpe @usuario', ejemplo: '.golpe @usuario' },
    '.matar': { uso: '.matar @usuario', ejemplo: '.matar @usuario' },
    '.bofetada': { uso: '.bofetada @usuario', ejemplo: '.bofetada @usuario' },
    '.tagall': { uso: '.tagall <mensaje opcional>', ejemplo: '.tagall Reunión hoy' },
    '.hidetag': { uso: '.hidetag <mensaje>', ejemplo: '.hidetag Aviso importante' },
    '.play': { uso: '.play <nombre de la canción>', ejemplo: '.play Bad Bunny Titi Me Pregunto' },
    '.mp4': { uso: '.mp4 <nombre del video>', ejemplo: '.mp4 Trailer avengers' },
    '.ban': { uso: '.ban @usuario', ejemplo: '.ban @usuario' },
    '.unban': { uso: '.unban @usuario', ejemplo: '.unban @usuario' },
    '.deluser': { uso: '.deluser @usuario', ejemplo: '.deluser @usuario' }
}

function levenshtein(a, b) {
    const m = a.length, n = b.length
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
    for (let i = 0; i <= m; i++) dp[i][0] = i
    for (let j = 0; j <= n; j++) dp[0][j] = j
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1]
            else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
        }
    }
    return dp[m][n]
}

function sugerirComando(comandoEscrito) {
    const limpio = comandoEscrito.toLowerCase().trim()
    let mejor = null
    let menorDistancia = Infinity

    for (const cmd of Object.keys(COMANDOS)) {
        const distancia = levenshtein(limpio, cmd.toLowerCase())
        if (distancia < menorDistancia) {
            menorDistancia = distancia
            mejor = cmd
        }
    }

    const umbral = Math.max(2, Math.ceil(mejor?.length / 3))
    if (menorDistancia <= umbral) return { comando: mejor, info: COMANDOS[mejor] }
    return null
}

module.exports = { COMANDOS, sugerirComando }