const { enviarMenu, enviarMenu2, enviarDev, enviarGrupos } = require('../comandos/menu')
const { coinflip, dado } = require('../routes/juegos')
const { piedraPapelTijera, ochoBola, trivia, dadosDobles, ruletaRusa } = require('../comandos/juegos2')
const { ping, tiempo, sticker, toimg } = require('../routes/utilidades')
const { pay, ruleta } = require('../comandos/economia2')
const { tagall, hidetag } = require('../routes/grupo')
const { generarQR } = require('../comandos/qr')
const { videoSticker, descargarTikTok } = require('../routes/multimedia')
const { imagenAPdf, pdfAImagen, eliminarPaginaPdf, protegerPdf, textoAWord, resolverTarea, resumirTexto } = require('../comandos/pdf2')
const { verPartidos, predecirPartido } = require('../comandos/futbol')
const { beso, abrazo, nalgada, golpe, matar, bofetada } = require('../routes/interaccion')

// IMPORTACIÓN DEL COMANDO YAPE
const yapeCmd = require('../comandos/yape')

const COMANDOS_SIMPLES = {
    '.dev': enviarDev,
    '.grupos': enviarGrupos,
    '.menu2': enviarMenu2,
    '.ping': ping,
    '.tiempo': tiempo,
    '.pdf': imagenAPdf,
    '.pdf2img': pdfAImagen,
    '.partidos': verPartidos,
    '.svideo': videoSticker,
    '.svid': videoSticker,
    '.dado': dado,
    '.trivia': trivia,
    '.dados2': dadosDobles,
    '.sticker': sticker,
    '.toimg': toimg
}

const COMANDOS_PREFIJO = [
    // Registrado con espacio para que tu handler separe el prefijo del texto que escribes
    { prefijo: '.yape ', fn: (sock, from, msg, texto, id) => yapeCmd.execute(sock, from, msg, texto, id) },
    { prefijo: '.qr ', fn: (sock, from, msg, texto) => generarQR(sock, from, texto.slice(4).trim(), msg) },
    { prefijo: '.delpdf ', fn: eliminarPaginaPdf },
    { prefijo: '.protectpdf ', fn: protegerPdf },
    { prefijo: '.textoword', fn: textoAWord },
    { prefijo: '.tarea ', fn: resolverTarea },
    { prefijo: '.resumen', fn: resumirTexto },
    { prefijo: '.tiktok ', fn: (sock, from, msg, texto) => descargarTikTok(sock, from, texto, msg) },
    { prefijo: '.tt ', fn: (sock, from, msg, texto) => descargarTikTok(sock, from, texto, msg) },
    { prefijo: '.tagall', fn: (sock, from, msg, texto, id) => tagall(sock, from, msg, texto, id) },
    { prefijo: '.hidetag', fn: (sock, from, msg, texto) => hidetag(sock, from, texto, msg) }
]

const COMANDOS_INTERACCION = {
    '.beso': beso,
    '.abrazo': abrazo,
    '.nalgada': nalgada,
    '.golpe': golpe,
    '.matar': matar,
    '.bofetada': bofetada,
    '.cachetada': bofetada
}

module.exports = {
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
}