const { getUsuario } = require('../lib/database')

async function piedraPapelTijera(sock, from, eleccionUsuario, msg) {
  const opciones = ['piedra', 'papel', 'tijera']
  const eleccionBot = opciones[Math.floor(Math.random() * opciones.length)]

  let resultado
  if (eleccionUsuario === eleccionBot) {
    resultado = '🤝 ¡Empate!'
  } else if (
    (eleccionUsuario === 'piedra' && eleccionBot === 'tijera') ||
    (eleccionUsuario === 'papel' && eleccionBot === 'piedra') ||
    (eleccionUsuario === 'tijera' && eleccionBot === 'papel')
  ) {
    resultado = '🎉 ¡Ganaste!'
  } else {
    resultado = '😢 Perdiste'
  }

  await sock.sendMessage(from, {
    text: `✊✋✌️ *PIEDRA, PAPEL O TIJERA*\n\nTú: ${eleccionUsuario}\nBot: ${eleccionBot}\n\n${resultado}`
  }, { quoted: msg })
}

async function ochoBola(sock, from, pregunta, msg) {
  const respuestas = [
    'Sí, definitivamente 🎯',
    'No cuentes con eso ❌',
    'Es posible 🤔',
    'Totalmente sí ✅',
    'Mejor no te digo ahora 🙊',
    'Pregunta después 🕐',
    'Muy dudoso 😬',
    'Sin duda alguna 💯'
  ]
  const respuesta = respuestas[Math.floor(Math.random() * respuestas.length)]

  await sock.sendMessage(from, {
    text: `🔮 *BOLA 8 MÁGICA*\n\n❓ Pregunta: ${pregunta}\n\n💬 Respuesta: ${respuesta}`
  }, { quoted: msg })
}

async function trivia(sock, from, msg) {
  const preguntas = [
    { q: '¿Cuál es el planeta más grande del sistema solar?', r: 'Júpiter' },
    { q: '¿En qué año llegó el hombre a la Luna?', r: '1969' },
    { q: '¿Cuál es el animal terrestre más rápido?', r: 'Guepardo' },
    { q: '¿Cuántos huesos tiene el cuerpo humano adulto?', r: '206' }
  ]
  const elegida = preguntas[Math.floor(Math.random() * preguntas.length)]

  await sock.sendMessage(from, {
    text: `🧠 *TRIVIA*\n\n❓ ${elegida.q}\n\n💡 (Respuesta: ${elegida.r})`
  }, { quoted: msg })
}

async function dadosDobles(sock, from, msg) {
  const d1 = Math.floor(Math.random() * 6) + 1
  const d2 = Math.floor(Math.random() * 6) + 1
  const total = d1 + d2

  await sock.sendMessage(from, {
    text: `🎲🎲 *DADOS DOBLES*\n\n🎲 Dado 1: ${d1}\n🎲 Dado 2: ${d2}\n\n➕ Total: ${total}`
  }, { quoted: msg })
}

async function ruletaRusa(sock, from, id, cantidad, msg) {
  const usuario = getUsuario(id)
  const apuesta = parseInt(cantidad)

  if (isNaN(apuesta) || apuesta <= 0) {
    return sock.sendMessage(from, { text: '❌ Uso: .rusa <cantidad de coins>' }, { quoted: msg })
  }

  if (usuario.coins < apuesta) {
    return sock.sendMessage(from, { text: '❌ No tienes suficientes coins para esa apuesta' }, { quoted: msg })
  }

  const disparo = Math.floor(Math.random() * 6) + 1
  const gano = disparo !== 1

  if (gano) {
    usuario.coins += apuesta
    await sock.sendMessage(from, {
      text: `🔫 *RULETA RUSA*\n\n🎉 ¡Sobreviviste!\n💰 Ganaste ${apuesta} coins`
    }, { quoted: msg })
  } else {
    usuario.coins -= apuesta
    await sock.sendMessage(from, {
      text: `🔫 *RULETA RUSA*\n\n💀 ¡BANG! Perdiste\n💸 Perdiste ${apuesta} coins`
    }, { quoted: msg })
  }
}

module.exports = {
  piedraPapelTijera,
  ochoBola,
  trivia,
  dadosDobles,
  ruletaRusa
}