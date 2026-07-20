require('dotenv').config()

console.log('GEMINI KEY:', process.env.GEMINI_API_KEY)

const { iniciarBot } = require('./lib/conexion')

// ===== PROTECCIÓN CONTRA ERRORES =====
process.on('uncaughtException', (err) => {
    console.log('⚠️ Error capturado (el bot sigue funcionando):', err.message)
})
process.on('unhandledRejection', (err) => {
    console.log('⚠️ Rechazo capturado (el bot sigue funcionando):', err?.message || err)
})

// Iniciar el bot
iniciarBot()