const { downloadContentFromMessage } = require('@whiskeysockets/baileys')
const ffmpeg = require('fluent-ffmpeg')
const ffmpegPath = require('ffmpeg-static')
const fs = require('fs')
const path = require('path')
const os = require('os')
const axios = require('axios')

ffmpeg.setFfmpegPath(ffmpegPath)

// ========== VIDEO A STICKER ANIMADO ==========
async function videoSticker(sock, from, msg) {
    try {
        // Buscar el video (puede estar en el mensaje o en la respuesta)
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
        const videoMsg = msg.message?.videoMessage || quoted?.videoMessage

        if (!videoMsg) {
            return sock.sendMessage(from, {
                text: '❌ *Responde a un video* o envía un video con el comando .svideo\n\n⚠️ El video debe durar máximo 10 segundos'
            })
        }

        await sock.sendMessage(from, { text: '⏳ *Convirtiendo video a sticker...*' })

        // Descargar el video
        const stream = await downloadContentFromMessage(videoMsg, 'video')
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        // Archivos temporales
        const inputPath = path.join(os.tmpdir(), `input_${Date.now()}.mp4`)
        const outputPath = path.join(os.tmpdir(), `output_${Date.now()}.webp`)
        fs.writeFileSync(inputPath, buffer)

        // Convertir a webp animado (sticker)
        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .outputOptions([
                    '-vcodec', 'libwebp',
                    '-vf', "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:'(320-iw)/2':'(320-ih)/2':color=white@0.0",
                    '-loop', '0',
                    '-ss', '0',
                    '-t', '10',
                    '-preset', 'default',
                    '-an',
                    '-vsync', '0'
                ])
                .toFormat('webp')
                .save(outputPath)
                .on('end', resolve)
                .on('error', reject)
        })

        // Enviar el sticker
        const stickerBuffer = fs.readFileSync(outputPath)
        await sock.sendMessage(from, { sticker: stickerBuffer })

        // Limpiar temporales
        try { fs.unlinkSync(inputPath) } catch (e) {}
        try { fs.unlinkSync(outputPath) } catch (e) {}

    } catch (e) {
        console.log('⚠️ Error en videoSticker:', e.message)
        await sock.sendMessage(from, { text: '❌ Error al convertir el video. Asegúrate que dure máximo 10 segundos' })
    }
}

// ========== DESCARGAR VIDEO DE TIKTOK ==========
async function descargarTikTok(sock, from, texto) {
    try {
        const url = texto.split(' ')[1]

        if (!url || !url.includes('tiktok')) {
            return sock.sendMessage(from, {
                text: '❌ *Uso:* .tiktok <link>\n\n📌 Ejemplo:\n.tiktok https://vm.tiktok.com/xxxxx'
            })
        }

        await sock.sendMessage(from, { text: '⏳ *Descargando video de TikTok...*' })

        // Probar varias APIs de TikTok
        let videoUrl = null

        const apis = [
            async () => {
                const r = await axios.get(`https://tikwm.com/api/?url=${encodeURIComponent(url)}`, { timeout: 30000 })
                return r.data?.data?.play
            },
            async () => {
                const r = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`, { timeout: 30000 })
                return r.data?.video?.noWatermark || r.data?.video?.watermark
            }
        ]

        for (let i = 0; i < apis.length; i++) {
            try {
                console.log(`🔄 Probando API TikTok ${i + 1}...`)
                videoUrl = await apis[i]()
                if (videoUrl) {
                    console.log(`✅ API TikTok ${i + 1} funcionó!`)
                    break
                }
            } catch (e) {
                console.log(`❌ API TikTok ${i + 1} falló:`, e.message)
            }
        }

        if (!videoUrl) {
            return sock.sendMessage(from, { text: '❌ No pude descargar ese video de TikTok' })
        }

        // Descargar el video
        const videoRes = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 60000 })
        const videoBuffer = Buffer.from(videoRes.data)

        // Enviar el video
        await sock.sendMessage(from, {
            video: videoBuffer,
            caption: '╭━〔 *🎵 TIKTOK* 〕━╮\n┃ ✅ Descargado sin marca de agua\n╰━━━━━━━━━━━━━╯\n\n_Cuchito-Bot 🦎_'
        })

    } catch (e) {
        console.log('⚠️ Error en TikTok:', e.message)
        await sock.sendMessage(from, { text: '❌ Error al descargar el video de TikTok' })
    }
}

module.exports = { videoSticker, descargarTikTok }