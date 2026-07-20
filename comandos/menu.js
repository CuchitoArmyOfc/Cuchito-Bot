const fs = require('fs')
const path = require('path')
const { DEV } = require('../lib/desarrollador')

const MENU_IMG = path.join(__dirname, '..', 'menu.jpg')
const MENU2_IMG = path.join(__dirname, '..', 'menu2.jpg')

async function enviarMenu(sock, from, usuario, msg) {
const texto = `
╭━━━〔 *🤖 CUCHITO-BOT* 〕━━━╮
┃ 👤 Usuario: ${usuario?.nombre || 'Invitado'}
┃ ⭐ Nivel: ${usuario?.nivel || 0}
┃ 💰 Coins: ${usuario?.coins || 0}
╰━━━━━━━━━━━━━━━━━━━╯

╭━〔 *📝 REGÍSTRATE MI REY* 〕━╮
┃ #register 18 Cuchito
┃ #perfil
╰━━━━━━━━━━━━━━━━╯

╭━〔 *🎮 MENÚ 2 CUCHITO* 〕━╮
┃ .menu2 (más comandos mi king)
╰━━━━━━━━━━━━━━━━╯

╭━〔 *🎵 MÚSICA CUCHITO* 〕━╮
┃ .play bad bunny
╰━━━━━━━━━━━━━╯

╭━〔 *📥 VIDEO CUCHITO* 〕━╮
┃ .tiktok https://link
┃ .mp4 nombre del video
╰━━━━━━━━━━━━━╯

╭━〔 *⚽ FÚTBOL CUCHITO* 〕━╮
┃ .partidos (ver partidos)
┃ .predecir 2
╰━━━━━━━━━━━━━╯

╭━〔 *📄 HERRAMIENTAS CUCHITO* 〕━╮
┃ .pdf (responde una imagen)
┃ .qr hola mundo
╰━━━━━━━━━━━━━╯

╭━〔 *🎮 JUEGOS CUCHITO* 〕━╮
┃ .coinflip cara
┃ .dado (lanza un dado)
┃ .ruleta 50
╰━━━━━━━━━━━━━╯

╭━〔 *💞 INTERACCIÓN DE CUCHITOS* 〕━╮
┃ .beso @usuario
┃ .abrazo @usuario
┃ .nalgada @usuario
┃ .golpe @usuario
┃ .bofetada @usuario
┃ .matar @usuario
╰━━━━━━━━━━━━━╯

╭━〔 *💰 ECONOMÍA CUCHITO* 〕━╮
┃ .pay @usuario 100
┃ .robar @usuario (roba coins)
╰━━━━━━━━━━━━━╯

╭━〔 *🛠️ UTILIDAD CUCHITO* 〕━╮
┃ .sticker (responde imagen)
┃ .svideo (responde video)
┃ .toimg (responde sticker)
┃ .ping
┃ .tiempo
╰━━━━━━━━━━━━━╯

╭━〔 *👥 GRUPO* 〕━╮
┃ .tagall (menciona a todos)
┃ .hidetag (menciona oculto)
╰━━━━━━━━━━━━━╯

╭━〔 *🌐 COMUNIDAD CUCHITO ARMY* 〕━╮
┃ .grupos
╰━━━━━━━━━━━━━╯

╭━〔 *👨‍💻 INFO* 〕━╮
┃ .dev
╰━━━━━━━━━━━━╯
`.trim()

try {
await sock.sendMessage(from, {
image: fs.readFileSync(MENU_IMG),
caption: texto
}, { quoted: msg })
console.log('✅ MENÚ CON IMAGEN ENVIADO')
} catch (e) {
console.log('❌ Error con imagen, enviando solo texto:', e.message)
await sock.sendMessage(from, { text: texto }, { quoted: msg })
}
}

async function enviarMenu2(sock, from, msg) {
const texto = `
╭━━━〔 *🤖 CUCHITO-BOT MENÚ 2* 〕━━━╮
┃ 📋 Más comandos y funciones extra
╰━━━━━━━━━━━━━━━━━━━╯

╭━〔 *🎮 JUEGOS EXTRA CUCHITO* 〕━╮
┃ .ppt (piedra, pepel o tijera)
┃ .8ball (pregunta texto)
┃ .trivia (pregunta aleatoria)
┃ .dados2 (lanza 2 dados)
┃ .rusa (cantidad de coins)
╰━━━━━━━━━━━━━━━━━━╯

╭━〔 *📄 PDF CUCHITO* 〕━╮
┃ .pdf (imagen a PDF)
┃ .pdf2img (responde un PDF)
┃ .delpdf (numero de pagina)
┃ .protectpdf 1234
┃ .textoword hola mundo
╰━━━━━━━━━━━━━━━━━━╯

╭━〔 *📚 ESTUDIO CUCHITO* 〕━╮
┃ .tarea (texto)
┃ .resumen (responde rspta de tarea)
╰━━━━━━━━━━━━━━━━━━╯

╭━〔 *👑 SOLO ADMINS MI REY* 〕━╮
┃ .ban @usuario
┃ .unban @usuario
┃ .deluser @usuario
┃ .offbot (apaga el bot)
┃ .onbot (activa el bot)
╰━━━━━━━━━━━━━━━━━━╯

_Solo disponible para usuarios registrados mi rey_ 🦎
`.trim()

try {
await sock.sendMessage(from, {
image: fs.readFileSync(MENU2_IMG),
caption: texto
}, { quoted: msg })
console.log('✅ MENÚ2 CON IMAGEN ENVIADO')
} catch (e) {
console.log('❌ Error con imagen, enviando solo texto:', e.message)
await sock.sendMessage(from, { text: texto }, { quoted: msg })
}
}

async function enviarDev(sock, from, msg) {
await sock.sendMessage(from, {
text: `╭━━〔 *👨‍💻 DESARROLLADOR* 〕━━╮
┃ 🤖 *Cuchito-Bot*
┃ Creado por: *${DEV.nombre}*
┃
┃ 🔗 *Mi Perfil (Telegram):*
┃ ${DEV.perfilTelegram}
┃
┃ 📢 *Mi Canal:*
┃ ${DEV.canal}
┃
╰━━━━━━━━━━━━━━━━━━━╯

_Usa *.grupos* para unirte a la comunidad mi rey 🎉_`
}, { quoted: msg })
}

async function enviarGrupos(sock, from, msg) {
await sock.sendMessage(from, {
text: `╭━━〔 *🌐 GRUPOS OFICIALES* 〕━━╮
┃ 🤖 *Cuchito-Bot Community*
┃
┃ 💬 *Grupo de Telegram:*
┃ ${DEV.grupoTelegram}
┃
┃ 🟢 *Grupo de WhatsApp:*
┃ ${DEV.grupoWhatsapp}
┃
╰━━━━━━━━━━━━━━━━━━━╯

_¡Únete y comparte con la comunidad mi rey! 🎉_`
}, { quoted: msg })
}

module.exports = { enviarMenu, enviarMenu2, enviarDev, enviarGrupos }