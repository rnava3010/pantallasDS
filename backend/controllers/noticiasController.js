const iconv = require('iconv-lite');

const fetchNoticiasRSS = async () => {
    try {
        const RSS_URL = "https://www.reforma.com/rss/negocios.xml";
        
        console.log("?? [Noticias] Conectando a Reforma Negocios (Fix Acentos)...");
        
        const response = await fetch(RSS_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) throw new Error(`Status: ${response.status}`);

        const buffer = await response.arrayBuffer();
        let text = iconv.decode(Buffer.from(buffer), 'iso-8859-1');

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
                        .replace(/<!\[CDATA\[/g, '')
                        .replace(/\]\]>/g, '')
                        .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
                        .replace(/&iacute;/g, 'i').replace(/&aacute;/g, 'a').replace(/&eacute;/g, 'e')
                        .replace(/&oacute;/g, 'o').replace(/&uacute;/g, 'u').replace(/&ntilde;/g, 'n')
                        .trim();
                };

                items.push({
                    titulo: limpiar(tMatch[1]),
                    descripcion: limpiar(dMatch ? dMatch[1] : "")
                });
            }
            if (items.length >= 15) break; 
        }

        console.log(`? [Noticias] Reforma decodificado: ${items.length} titulares.`);
        return items;

    } catch (error) {
        console.error("?? [Noticias] Error:", error.message);
        return [{ titulo: "Noticias en actualizacion", descripcion: "Estamos recuperando la informacion financiera." }];
    }
};

module.exports = { fetchNoticiasRSS };