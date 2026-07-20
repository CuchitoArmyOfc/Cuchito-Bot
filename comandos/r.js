const { downloadContentFromMessage } = require('@whiskeysockets/baileys')
const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')
const os = require('os')

// ========== IMAGEN A PDF ==========
async function imagenAPdf(sock, from, msg) {
    try {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
        const imgMsg = msg.message?.imageMessage || quoted?.imageMessage

        if (!imgMsg) {
            return sock.sendMessage(from, {
                text: '❌ *Responde a una imagen* con el comando .pdf'
            })
        }

        await sock.sendMessage(from, { text: '⏳ *Convirtiendo imagen a PDF...*' })

        const stream = await downloadContentFromMessage(imgMsg, 'image')
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        const imgPath = path.join(os.tmpdir(), `img_${Date.now()}.jpg`)
        const pdfPath = path.join(os.tmpdir(), `pdf_${Date.now()}.pdf`)
        fs.writeFileSync(imgPath, buffer)

        await new Promise((resolve, reject) => {
            const doc = new PDFDocument({ autoFirstPage: false })
            const writeStream = fs.createWriteStream(pdfPath)
            doc.pipe(writeStream)

            const img = doc.openImage(imgPath)
            doc.addPage({ size: [img.width, img.height] })
            doc.image(img, 0, 0)

            doc.end()
            writeStream.on('finish', resolve)
            writeStream.on('error', reject)
        })

        const pdfBuffer = fs.readFileSync(pdfPath)
        await sock.sendMessage(from, {
            document: pdfBuffer,
            mimetype: 'application/pdf',
            fileName: 'CuchitoBot.pdf'
        })

        try { fs.unlinkSync(imgPath) } catch (e) {}
        try { fs.unlinkSync(pdfPath) } catch (e) {}

    } catch (e) {
        console.log('⚠️ Error en imagenAPdf:', e.message)
        await sock.sendMessage(from, { text: '❌ Error al convertir la imagen a PDF' })
    }
}

module.exports = { imagenAPdf }