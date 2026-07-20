const puppeteer = require('puppeteer');

module.exports = {
    name: 'yape',
    category: 'utilidades',
    async execute(sock, from, msg, texto, id) {
        const reply = (contenido) => sock.sendMessage(from, contenido, { quoted: msg });

        let cuerpoComando = texto.trim();
        if (cuerpoComando.startsWith('.yape ')) {
            cuerpoComando = cuerpoComando.slice(6).trim();
        }
        
        const partes = cuerpoComando.split('|').map(p => p.trim());

        if (partes.length < 3 || !partes[0] || !partes[1] || !partes[2]) {
            return reply({ 
                text: '❌ *Formato incorrecto mi rey*\n\n📝 Usa así:\n*.yape monto | nombre | ultimos_3_digitos*\n\n📌 Ejemplo:\n.yape 20 | Colegio Ademico Lu Sin Eirl | 306' 
            });
        }

        const monto = partes[0];
        const cliente = partes[1];
        const ultimoCelular = partes[2];

        const nroOperacion = Math.floor(10000000 + Math.random() * 90000000).toString();
        const codigoSeguridad = Math.floor(100 + Math.random() * 900).toString();
        
        const opcionesFecha = { day: '2-digit', month: 'short', year: 'numeric' };
        const opcionesHora = { hour: '2-digit', minute: '2-digit', hour12: true };
        const fechaActual = new Date().toLocaleDateString('es-PE', opcionesFecha).replace('.', '');
        const horaActual = new Date().toLocaleTimeString('es-PE', opcionesHora).toLowerCase();

        await reply({ text: '⏳ *Generando el comprobante idéntico...* 🥵' });

        try {
            const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
                    body { background-color: #4d1571; display: flex; justify-content: center; align-items: center; width: 390px; height: 844px; overflow: hidden; padding: 24px 18px; }
                    .app-container { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; gap: 18px; position: relative; }
                    
                    /* Iconos superiores */
                    .top-icons { position: absolute; top: 35px; left: 12px; right: 12px; display: flex; justify-content: space-between; align-items: center; }
                    .check-icon { width: 48px; height: 48px; background-color: #00d6b4; border-radius: 50%; display: flex; justify-content: center; align-items: center; }
                    .close-icon { width: 48px; height: 48px; background-color: rgba(255, 255, 255, 0.15); border-radius: 50%; display: flex; justify-content: center; align-items: center; }
                    
                    /* Tarjeta de Voucher */
                    .voucher-card { background-color: #ffffff; border-radius: 24px; padding: 28px 22px; color: #231640; width: 100%; }
                    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
                    .yapeaste { font-size: 26px; font-weight: 800; color: #692c99; letter-spacing: -0.2px; }
                    .compartir { font-size: 13.5px; font-weight: 700; color: #01bfa5; text-transform: uppercase; display: flex; align-items: center; gap: 6px; letter-spacing: 0.4px; }
                    
                    /* Monto */
                    .amount-section { margin-bottom: 12px; display: flex; align-items: baseline; color: #231640; }
                    .currency { font-size: 30px; font-weight: 800; margin-right: 4px; }
                    .amount { font-size: 64px; font-weight: 800; line-height: 1; letter-spacing: -0.5px; }
                    
                    .destination-name { font-size: 21px; font-weight: 700; color: #231640; margin-bottom: 16px; line-height: 1.25; }
                    
                    /* Fecha y Hora con espaciado corregido */
                    .datetime-row { font-size: 15px; color: #605d6e; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; letter-spacing: 0.3px; }
                    .datetime-row svg { fill: none; stroke: #605d6e; stroke-width: 2.2; }
                    .datetime-separator { color: #dcdde2; margin: 0 4px; font-weight: 400; }
                    
                    .divider { border-top: 1px solid #f4f5f8; margin: 14px 0; }
                    
                    /* Código de seguridad */
                    .security-row { display: flex; justify-content: space-between; align-items: center; }
                    .security-left { display: flex; align-items: center; gap: 8px; }
                    .security-label { font-size: 11px; font-weight: 700; color: #8a8696; letter-spacing: 0.5px; }
                    .info-circle { width: 18px; height: 18px; border: 1.8px solid #01bfa5; border-radius: 50%; color: #01bfa5; display: flex; justify-content: center; align-items: center; font-size: 11px; font-weight: bold; font-family: sans-serif; }
                    
                    .boxes-container { display: flex; gap: 5px; }
                    .digit-box { background-color: #f1f3f8; color: #231640; font-size: 16px; font-weight: 800; width: 26px; height: 32px; border-radius: 6px; display: flex; justify-content: center; align-items: center; }
                    
                    /* Datos de la transacción */
                    .section-title { font-size: 11px; font-weight: 700; color: #8a8696; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 16px; margin-top: 4px; }
                    .data-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; font-size: 16px; }
                    .data-label { color: #5a5766; font-weight: 500; }
                    .data-value { color: #231640; font-weight: 700; }
                    
                    /* Contenedor inferior */
                    .more-section { background-color: #3a0956; border-radius: 24px; padding: 18px 16px; width: 100%; margin-bottom: 8px; }
                    .more-header { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
                    .more-title { color: #ffffff; font-size: 18px; font-weight: 700; letter-spacing: -0.2px; }
                    .badge-new { background-color: #ffcb05; color: #231640; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 9px; }
                    
                    /* Banner promocional */
                    .promo-banner { background-color: #ffffff; border-radius: 20px; overflow: hidden; display: flex; height: 136px; }
                    .promo-image-side { width: 58%; background-image: url('https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=400&auto=format&fit=crop'); background-size: cover; background-position: center; }
                    .promo-text-side { width: 42%; padding: 14px 12px; display: flex; flex-direction: column; justify-content: space-between; background: #ffffff; }
                    
                    .promo-header-info { display: flex; flex-direction: column; align-items: flex-start; }
                    .promo-badge-usd { width: 22px; height: 22px; background-color: #01bfa5; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: white; font-weight: bold; font-size: 12px; margin-bottom: 6px; }
                    .promo-headline { font-size: 14px; font-weight: 900; color: #000000; line-height: 1.1; text-transform: uppercase; }
                    .promo-subheadline { font-size: 12.5px; font-weight: 500; color: #000000; line-height: 1.15; margin-top: 2px; }
                    
                    .promo-button { background-color: #01bfa5; color: white; font-size: 11.5px; font-weight: 700; padding: 7px 0; border-radius: 8px; text-align: center; width: 100%; }
                </style>
            </head>
            <body>
                <div class="app-container">
                    <div class="top-icons">
                        <div class="check-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <div class="close-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </div>
                    </div>

                    <div class="voucher-card">
                        <div class="card-header">
                            <div class="yapeaste">¡Yapeaste!</div>
                            <div class="compartir">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                                Compartir
                            </div>
                        </div>

                        <div class="amount-section">
                            <span class="currency">S/</span><span class="amount">${monto}</span>
                        </div>

                        <div class="destination-name">${cliente}</div>

                        <div class="datetime-row">
                            <svg width="15" height="15" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            <span>${fechaActual}</span>
                            <span class="datetime-separator">|</span>
                            <svg width="15" height="15" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            <span>${horaActual}</span>
                        </div>

                        <div class="divider"></div>

                        <div class="security-row">
                            <div class="security-left">
                                <span class="security-label">CÓDIGO DE SEGURIDAD</span>
                                <div class="info-circle">i</div>
                            </div>
                            <div class="boxes-container">
                                ${codigoSeguridad.split('').map(d => `<div class="digit-box">${d}</div>`).join('')}
                            </div>
                        </div>

                        <div class="divider"></div>

                        <div class="section-title">Datos de la transacción</div>

                        <div class="data-row">
                            <span class="data-label">Nro. de celular</span>
                            <span class="data-value">*** *** ${ultimoCelular}</span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Destino</span>
                            <span class="data-value">Yape</span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Nro. de operación</span>
                            <span class="data-value">${nroOperacion}</span>
                        </div>
                    </div>

                    <div class="more-section">
                        <div class="more-header">
                            <span class="more-title">Más en Yape</span>
                            <span class="badge-new">Nuevo</span>
                        </div>
                        <div class="promo-banner">
                            <div class="promo-image-side"></div>
                            <div class="promo-text-side">
                                <div class="promo-header-info">
                                    <div class="promo-badge-usd">$</div>
                                    <div class="promo-headline">APROVECHA</div>
                                    <div class="promo-subheadline">el súper tipo de cambio</div>
                                </div>
                                <div class="promo-button">Ir a Dólares ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            `;

            const browser = await puppeteer.launch({ 
                headless: true, 
                args: ['--no-sandbox', '--disable-setuid-sandbox'] 
            });
            const page = await browser.newPage();
            await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
            await page.setContent(htmlContent);

            const imageBuffer = await page.screenshot({ type: 'png' });
            await browser.close();

            await sock.sendMessage(from, { 
                image: Buffer.from(imageBuffer),
                caption: '⚡ *Comprobante Yape Generado mi king*'
            }, { quoted: msg });

        } catch (err) {
            console.error('Error generando voucher:', err);
            return reply({ text: '❌ Ocurrió un error interno al crear la imagen.' });
        }
    }
};