async function esAdminGrupo(sock, from, id) {
    try {
        if (!from.endsWith('@g.us')) return false

        const metadata = await sock.groupMetadata(from)
        const participante = metadata.participants.find(p => p.id === id)

        return participante?.admin === 'admin' || participante?.admin === 'superadmin'
    } catch (e) {
        console.log('⚠️ Error verificando admin de grupo:', e.message)
        return false
    }
}

module.exports = { esAdminGrupo }