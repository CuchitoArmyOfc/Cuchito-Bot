const { enviarMenu, enviarMenu2, enviarDev, enviarGrupos } = require('../comandos/menu')
const { coinflip, dado } = require('../comandos/juegos')
const { piedraPapelTijera, ochoBola, trivia, dadosDobles, ruletaRusa } = require('../comandos/juegos2')
const { ping, tiempo, sticker, toimg } = require('../comandos/utilidades')
const { pay, ruleta } = require('../comandos/economia2')
const { tagall, hidetag } = require('../comandos/grupo')
const { generarQR } = require('../comandos/qr')
const { videoSticker, descargarTikTok } = require('../comandos/multimedia')
const { imagenAPdf } = require('../comandos/pdf')
const { pdfAImagen, eliminarPaginaPdf, protegerPdf, textoAWord, resolverTarea, resumirTexto } = require('../comandos/pdf2')
const { verPartidos, predecirPartido } = require('../comandos/futbol')
const { beso, abrazo, nalgada, golpe, matar, bofetada } = require('../comandos/interaccion')

// Comandos que solo necesitan (sock, from, msg) — coincidencia exacta
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

// Comandos con prefijo (startsWith) que necesitan el texto completo
const COMANDOS_PREFIJO = [
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

// Comandos de interacción (todos usan la misma firma)
const COMANDOS_INTERACCION = {
    '.beso': beso,
    '.abrazo': abrazo,
    '.nalgada': nalgada,
    '.golpe': golpe,
    '.matar': matar,
    '.bofetada': bofetada,
    '.cachetada': bofetada
}

module.exports = { COMANDOS_SIMPLES, COMANDOS_PREFIJO, COMANDOS_INTERACCION, enviarMenu, piedraPapelTijera, ochoBola, ruletaRusa, coinflip, pay, ruleta, predecirPartido }