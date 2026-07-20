const yts = require('yt-search')
const axios = require('axios')
const { exec } = require('child_process')
const ffmpegPath = require('ffmpeg-static')
const fs = require('fs')
const path = require('path')
const os = require('os')

const cookiesPath = path.join(__dirname, '..', 'cookies.txt')

function getCookiesArg() {
    return fs.existsSync(cookiesPath) ? `--cookies "${cookiesPath}"` : ''
}

// ========== BUSCAR CANCIÓN (audio) ==========
async function buscarCancion(query) {
    try {
        const { videos } = await yts(query)
        if (!videos.length) return { ok: false }

        const video = videos[0]

        let miniaturaBuffer = null
        try {
            const res = await axios.get(video.thumbnail, { responseType: 'arraybuffer' })
            miniaturaBuffer = Buffer.from(res.data)
        } catch (e) {
            console.log('⚠️ No se pudo descargar la miniatura:', e.message)
        }

        let audioBuffer = null
        try {
            audioBuffer = await descargarAudio(video.url)
        } catch (e) {
            console.log('⚠️ Error descargando audio:', e.message)
        }

        return {
            ok: true,
            titulo: video.title,
            autor: video.author.name,
            duracion: video.timestamp,
            vistas: video.views,
            url: video.url,
            miniatura: video.thumbnail,
            miniaturaBuffer,
            audioBuffer
        }
    } catch (e) {
        console.error('Error música:', e.message)
        return { ok: false }
    }
}

function descargarAudio(url) {
    return new Promise((resolve, reject) => {
        const tempFile = path.join(os.tmpdir(), `audio_${Date.now()}.mp3`)
        console.log('🔄 Descargando audio con yt-dlp...')

        const cookiesArg = getCookiesArg()
        const comando = `py -m yt_dlp --remote-components ejs:github ${cookiesArg} -x --audio-format mp3 --audio-quality 0 --ffmpeg-location "${ffmpegPath}" -o "${tempFile}" "${url}"`

        exec(comando, { maxBuffer: 1024 * 1024 * 100 }, (error, stdout, stderr) => {
            if (error) {
                console.log('❌ Error yt-dlp:', error.message)
                return reject(error)
            }

            let archivoFinal = tempFile
            if (!fs.existsSync(archivoFinal)) {
                const dir = os.tmpdir()
                const base = path.basename(tempFile, '.mp3')
                const archivos = fs.readdirSync(dir).filter(f => f.startsWith(base))
                if (archivos.length > 0) {
                    archivoFinal = path.join(dir, archivos[0])
                }
            }

            if (!fs.existsSync(archivoFinal)) {
                return reject(new Error('No se generó el archivo de audio'))
            }

            console.log('✅ Audio descargado, leyendo...')
            const buffer = fs.readFileSync(archivoFinal)
            try { fs.unlinkSync(archivoFinal) } catch (e) {}
            resolve(buffer)
        })
    })
}

// ========== BUSCAR VIDEO (MP4) ==========
async function buscarVideo(query) {
    try {
        const { videos } = await yts(query)
        if (!videos.length) return { ok: false }

        const video = videos[0]

        let miniaturaBuffer = null
        try {
            const res = await axios.get(video.thumbnail, { responseType: 'arraybuffer' })
            miniaturaBuffer = Buffer.from(res.data)
        } catch (e) {
            console.log('⚠️ No se pudo descargar la miniatura:', e.message)
        }

        let videoBuffer = null
        try {
            videoBuffer = await descargarVideoMp4(video.url)
        } catch (e) {
            console.log('⚠️ Error descargando video:', e.message)
        }

        return {
            ok: true,
            titulo: video.title,
            autor: video.author.name,
            duracion: video.timestamp,
            segundos: video.seconds,
            vistas: video.views,
            url: video.url,
            miniatura: video.thumbnail,
            miniaturaBuffer,
            videoBuffer
        }
    } catch (e) {
        console.error('Error video:', e.message)
        return { ok: false }
    }
}

function descargarVideoMp4(url) {
    return new Promise((resolve, reject) => {
        const tempFile = path.join(os.tmpdir(), `video_${Date.now()}.mp4`)
        console.log('🔄 Descargando video con yt-dlp...')

        const cookiesArg = getCookiesArg()
        const comando = `py -m yt_dlp --remote-components ejs:github ${cookiesArg} -f "best[height<=480][ext=mp4]/best[ext=mp4]/best" --ffmpeg-location "${ffmpegPath}" -o "${tempFile}" "${url}"`

        exec(comando, { maxBuffer: 1024 * 1024 * 200 }, (error, stdout, stderr) => {
            if (error) {
                console.log('❌ Error yt-dlp video:', error.message)
                return reject(error)
            }

            let archivoFinal = tempFile
            if (!fs.existsSync(archivoFinal)) {
                const dir = os.tmpdir()
                const base = path.basename(tempFile, '.mp4')
                const archivos = fs.readdirSync(dir).filter(f => f.startsWith(base))
                if (archivos.length > 0) {
                    archivoFinal = path.join(dir, archivos[0])
                }
            }

            if (!fs.existsSync(archivoFinal)) {
                return reject(new Error('No se generó el archivo de video'))
            }

            console.log('✅ Video descargado, leyendo...')
            const buffer = fs.readFileSync(archivoFinal)
            try { fs.unlinkSync(archivoFinal) } catch (e) {}
            resolve(buffer)
        })
    })
}

module.exports = { buscarCancion, buscarVideo }