const iconv = require('iconv-lite');

/**
 * Controlador de Noticias RSS - Edici車n Reforma Negocios con Correcci車n de Acentos
 */
const fetchNoticiasRSS = async () => {
    try {
        const RSS_URL = "https://www.reforma.com/rss/negocios.xml";
        
        console.log("?? [Noticias] Conectando a Reforma Negocios...");
        
        const response = await fetch(RSS_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) throw new Error(`Status: ${response.status}`);

        // ? PASO CLAVE: Recibir como ArrayBuffer para manejar la codificaci車n manualmente
        const buffer = await response.arrayBuffer();
        
        // Decodificamos el buffer de Reforma (que suele ser win1252 o iso-8859-1) a UTF-8
        let text = iconv.decode(Buffer.from(buffer), 'iso-8859-1');

        // Si Reforma llegara a cambiar a UTF-8, esto asegura que no lo rompamos
        if (text.includes('')) {
            text = iconv.decode(Buffer.from(buffer), 'utf-8');
        }

        const items = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
        
        let match;
        while ((match = itemRegex.exec(text)) !== null) {
            const itemContent = match[1];
            
            const tMatch = /<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i.exec(itemContent) || /<title>([\s\S]*?)<\/title>/i.exec(itemContent);
            const dMatch = /<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i.exec(itemContent) || /<description>([\s\S]*?)<\/description>/i.exec(itemContent);

            if (tMatch) {
                const limpiar = (str) => {
                    if (!str) return "";
                    return str
                        .replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '')
                        .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
                        // Decodificar entidades HTML comunes que a veces vienen mezcladas
                        .replace(/&#225;/g, '芍').replace(/&#233;/g, '谷').replace(/&#237;/g, '赤').replace(/&#243;/g, '車').replace(/&#250;/g, '迆')
                        .replace(/&#241;/g, '?').replace(/&#209;/g, '?')
                        .trim();
                };

                items.push({
                    titulo: limpiar(tMatch[1]),
                    descripcion: limpiar(dMatch ? dMatch[1] : "")
                });
            }
            if (items.length >= 15) break; 
        }

        console.log(`? [Noticias] Reforma decodificado correctamente: ${items.length} titulares.`);
        return items;

    } catch (error) {
        console.error("?? [Noticias] Error:", error.message);
        return [{ titulo: "Error de conexi車n", descripcion: "No se pudieron cargar las noticias." }];
    }
};

module.exports = { fetchNoticiasRSS };