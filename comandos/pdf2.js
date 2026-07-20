const fs = require('fs')
const path = require('path')
const os = require('os')
const { PDFDocument } = require('pdf-lib')
const poppler = require('pdf-poppler')
const { Document, Packer, Paragraph } = require('docx')
const pdfParse = require('pdf-parse')
const qpdf = require('node-qpdf2')
const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const { GoogleGenAI } = require('@google/genai')

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY })

console.log('🔑 Clave Gemini detectada:', process.env.GEMINI_KEY?.slice(0, 15), '... longitud:', process.env.GEMINI_KEY?.length)

async function consultarGemini(prompt) {
    const resultado = await genAI.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt
    })
    return resultado.text
}

function generarArchivoTxt(nombreBase, contenido) {
    const nombreArchivo = `${nombreBase}_${Date.now()}.txt`
    const carpetaTemp = path.join(__dirname, '..', 'temp')
    const rutaArchivo = path.join(carpetaTemp, nombreArchivo)

    if (!fs.existsSync(carpetaTemp)) {
        fs.mkdirSync(carpetaTemp)
    }

    fs.writeFileSync(rutaArchivo, contenido, 'utf-8')
    return rutaArchivo
}

function reconstruirKey(msg) {
    return {
        remoteJid: msg.key.remoteJid,
        id: msg.message.extendedTextMessage.contextInfo.stanzaId,
        participant: msg.message.extendedTextMessage.contextInfo.participant,
        fromMe: false
    }
}

// ===== IMAGEN A PDF =====
async function imagenAPdf(sock, from, msg) {
    const citado = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const imagenMsg = msg.message?.imageMessage || citado?.imageMessage

    if (!imagenMsg) {
        return sock.sendMessage(from, {
            text: '❌ Envía una *imagen* con el texto .pdf, o responde a una imagen con .pdf'
        }, { quoted: msg })
    }

    try {
        const buffer = await downloadMediaMessage(
            citado ? { key: reconstruirKey(msg), message: citado } : msg,
            'buffer',
            {},
            { logger: undefined, reuploadRequest: sock.updateMediaMessage }
        )

        if (!buffer || buffer.length === 0) {
            return sock.sendMessage(from, { text: '❌ No pude descargar la imagen, intenta de nuevo' }, { quoted: msg })
        }

        const pdfDoc = await PDFDocument.create()

        const img = imagenMsg.mimetype?.includes('png')
            ? await pdfDoc.embedPng(buffer)
            : await pdfDoc.embedJpg(buffer)

        const page = pdfDoc.addPage([img.width, img.height])
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height })

        const pdfBytes = await pdfDoc.save()

        await sock.sendMessage(from, {
            document: Buffer.from(pdfBytes),
            mimetype: 'application/pdf',
            fileName: 'cuchito.pdf'
        }, { quoted: msg })
    } catch (e) {
        console.error('Error imagenAPdf:', e)
        await sock.sendMessage(from, { text: '❌ Error al convertir la imagen a PDF' }, { quoted: msg })
    }
}

// ===== PDF A IMAGEN =====
async function pdfAImagen(sock, from, msg) {
    const citado = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const docMsg = citado?.documentMessage

    if (!docMsg || !docMsg.fileName?.toLowerCase().endsWith('.pdf')) {
        return sock.sendMessage(from, { text: '❌ Responde a un *PDF* con .pdf2img' }, { quoted: msg })
    }

    try {
        const buffer = await downloadMediaMessage(
            { key: reconstruirKey(msg), message: citado },
            'buffer',
            {},
            { logger: undefined, reuploadRequest: sock.updateMediaMessage }
        )

        const tempPdf = path.join(os.tmpdir(), `cuchito_${Date.now()}.pdf`)
        fs.writeFileSync(tempPdf, buffer)

        const outDir = os.tmpdir()
        const outPrefix = `cuchito_img_${Date.now()}`

        const opts = {
            format: 'jpeg',
            out_dir: outDir,
            out_prefix: outPrefix,
            page: null
        }

        await poppler.convert(tempPdf, opts)

        const archivos = fs.readdirSync(outDir).filter(f => f.startsWith(outPrefix))

        if (archivos.length === 0) {
            return sock.sendMessage(from, { text: '❌ No pude convertir el PDF' }, { quoted: msg })
        }

        for (const archivo of archivos) {
            const rutaImg = path.join(outDir, archivo)
            await sock.sendMessage(from, { image: fs.readFileSync(rutaImg) }, { quoted: msg })
            fs.unlinkSync(rutaImg)
        }

        fs.unlinkSync(tempPdf)
    } catch (e) {
        console.error(e)
        await sock.sendMessage(from, { text: '❌ Error al convertir el PDF a imagen' }, { quoted: msg })
    }
}

// ===== ELIMINAR PÁGINAS DE UN PDF =====
async function eliminarPaginaPdf(sock, from, msg, texto) {
    const citado = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const docMsg = citado?.documentMessage

    if (!docMsg || !docMsg.fileName?.toLowerCase().endsWith('.pdf')) {
        return sock.sendMessage(from, { text: '❌ Responde a un *PDF* con .delpdf <número de página>\nEjemplo: .delpdf 2' }, { quoted: msg })
    }

    const numPagina = parseInt(texto.split(' ')[1])
    if (isNaN(numPagina) || numPagina < 1) {
        return sock.sendMessage(from, { text: '❌ Uso: .delpdf <número de página>\nEjemplo: .delpdf 2' }, { quoted: msg })
    }

    try {
        const buffer = await downloadMediaMessage(
            { key: reconstruirKey(msg), message: citado },
            'buffer',
            {},
            { logger: undefined, reuploadRequest: sock.updateMediaMessage }
        )

        const pdfDoc = await PDFDocument.load(buffer)
        const totalPaginas = pdfDoc.getPageCount()

        if (numPagina > totalPaginas) {
            return sock.sendMessage(from, { text: `❌ Ese PDF solo tiene ${totalPaginas} páginas` }, { quoted: msg })
        }

        pdfDoc.removePage(numPagina - 1)
        const nuevoPdfBytes = await pdfDoc.save()

        await sock.sendMessage(from, {
            document: Buffer.from(nuevoPdfBytes),
            mimetype: 'application/pdf',
            fileName: 'sin_pagina.pdf'
        }, { quoted: msg })
    } catch (e) {
        console.error(e)
        await sock.sendMessage(from, { text: '❌ Error al eliminar la página del PDF' }, { quoted: msg })
    }
}

// ===== PROTEGER PDF CON CONTRASEÑA =====
async function protegerPdf(sock, from, msg, texto) {
    const citado = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const docMsg = citado?.documentMessage

    if (!docMsg || !docMsg.fileName?.toLowerCase().endsWith('.pdf')) {
        return sock.sendMessage(from, { text: '❌ Responde a un *PDF* con .protectpdf <contraseña>' }, { quoted: msg })
    }

    const clave = texto.split(' ')[1]
    if (!clave) {
        return sock.sendMessage(from, { text: '❌ Uso: .protectpdf <contraseña>' }, { quoted: msg })
    }

    try {
        const buffer = await downloadMediaMessage(
            { key: reconstruirKey(msg), message: citado },
            'buffer',
            {},
            { logger: undefined, reuploadRequest: sock.updateMediaMessage }
        )

        const tempIn = path.join(os.tmpdir(), `cuchito_in_${Date.now()}.pdf`)
        const tempOut = path.join(os.tmpdir(), `cuchito_out_${Date.now()}.pdf`)
        fs.writeFileSync(tempIn, buffer)

        await qpdf.encrypt({
            input: tempIn,
            output: tempOut,
            password: clave,
            keyLength: 256
        })

        await sock.sendMessage(from, {
            document: fs.readFileSync(tempOut),
            mimetype: 'application/pdf',
            fileName: 'protegido.pdf'
        }, { quoted: msg })

        fs.unlinkSync(tempIn)
        fs.unlinkSync(tempOut)
    } catch (e) {
        console.error(e)
        await sock.sendMessage(from, { text: '❌ Error al proteger el PDF' }, { quoted: msg })
    }
}

// ===== TEXTO/PDF A WORD =====
async function textoAWord(sock, from, msg, texto) {
    const citado = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const docMsg = citado?.documentMessage

    let contenidoTexto = ''

    if (docMsg && docMsg.fileName?.toLowerCase().endsWith('.pdf')) {
        try {
            const buffer = await downloadMediaMessage(
                { key: reconstruirKey(msg), message: citado },
                'buffer',
                {},
                { logger: undefined, reuploadRequest: sock.updateMediaMessage }
            )
            const data = await pdfParse(buffer)
            contenidoTexto = data.text
        } catch (e) {
            console.error(e)
            return sock.sendMessage(from, { text: '❌ Error al leer el PDF' }, { quoted: msg })
        }
    } else {
        contenidoTexto = texto.replace('.textoword ', '').trim()
        if (!contenidoTexto) {
            return sock.sendMessage(from, { text: '❌ Uso: .textoword <tu texto>\nO responde a un PDF con .textoword' }, { quoted: msg })
        }
    }

    try {
        const parrafos = contenidoTexto.split('\n').map(linea => new Paragraph(linea))

        const doc = new Document({
            sections: [{ children: parrafos }]
        })

        const buffer = await Packer.toBuffer(doc)

        await sock.sendMessage(from, {
            document: buffer,
            mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            fileName: 'documento.docx'
        }, { quoted: msg })
    } catch (e) {
        console.error(e)
        await sock.sendMessage(from, { text: '❌ Error al crear el Word' }, { quoted: msg })
    }
}

// ===== RESOLVER TAREA (IA) =====
async function resolverTarea(sock, from, msg, texto) {
    const pregunta = texto.slice(7).trim()
    if (!pregunta) {
        return sock.sendMessage(from, { text: '❌ Uso: .tarea <tu pregunta o ejercicio>' }, { quoted: msg })
    }

    await sock.sendMessage(from, { text: '⏳ *Resolviendo tu tarea mi rey...*' }, { quoted: msg })

    try {
        const respuesta = await consultarGemini(pregunta)

        const rutaArchivo = generarArchivoTxt('tarea', respuesta)

        await sock.sendMessage(from, {
            document: fs.readFileSync(rutaArchivo),
            fileName: 'Tarea-CuchitoBot.txt',
            mimetype: 'text/plain',
            caption: `✅ *¡Aquí está tu tarea resuelta!* 📚\n\n💡 Si quieres un resumen más corto, responde a este archivo con *.resumen*`
        }, { quoted: msg })

        fs.unlinkSync(rutaArchivo)
    } catch (e) {
        console.error(e)
        await sock.sendMessage(from, { text: '❌ Error al resolver la tarea mi rey' }, { quoted: msg })
    }
}

// ===== RESUMEN (texto, mensaje citado o TXT/PDF citado) =====
async function resumirTexto(sock, from, msg, texto) {
    const citado = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    const documentoCitado = citado?.documentMessage

    let contenidoOriginal = ''

    if (documentoCitado && documentoCitado.mimetype === 'text/plain') {
        const buffer = await downloadMediaMessage(
            { key: reconstruirKey(msg), message: citado },
            'buffer',
            {},
            { logger: undefined, reuploadRequest: sock.updateMediaMessage }
        )
        contenidoOriginal = buffer.toString('utf-8')
    } else if (documentoCitado && documentoCitado.fileName?.toLowerCase().endsWith('.pdf')) {
        const buffer = await downloadMediaMessage(
            { key: reconstruirKey(msg), message: citado },
            'buffer',
            {},
            { logger: undefined, reuploadRequest: sock.updateMediaMessage }
        )
        const data = await pdfParse(buffer)
        contenidoOriginal = data.text
    } else {
        contenidoOriginal = texto.replace('.resumen', '').trim()
    }

    if (!contenidoOriginal) {
        return sock.sendMessage(from, {
            text: '❌ Responde a un archivo .txt o .pdf con *.resumen*, o usa: .resumen <texto largo>'
        }, { quoted: msg })
    }

    await sock.sendMessage(from, { text: '⏳ *Generando resumen mi rey...*' }, { quoted: msg })

    try {
        const resumen = await consultarGemini(`Resume esto de forma breve y clara:\n\n${contenidoOriginal}`)

        const rutaArchivo = generarArchivoTxt('resumen', resumen)

        await sock.sendMessage(from, {
            document: fs.readFileSync(rutaArchivo),
            fileName: 'Resumen-CuchitoBot.txt',
            mimetype: 'text/plain',
            caption: '✅ *¡Aquí está tu resumen!* 📝'
        }, { quoted: msg })

        fs.unlinkSync(rutaArchivo)
    } catch (e) {
        console.error(e)
        await sock.sendMessage(from, { text: '❌ Error al generar el resumen mi rey' }, { quoted: msg })
    }
}

module.exports = {
    imagenAPdf,
    pdfAImagen,
    eliminarPaginaPdf,
    protegerPdf,
    textoAWord,
    resolverTarea,
    resumirTexto
}