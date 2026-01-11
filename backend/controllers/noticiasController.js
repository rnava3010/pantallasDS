/**
 * Controlador de Noticias RSS - Edición Reforma Negocios
 */
const fetchNoticiasRSS = async () => {
    try {
        const RSS_URL = "https://www.reforma.com/rss/negocios.xml";
        
        console.log("🌐 [Noticias] Conectando a Reforma Negocios...");
        
        const response = await fetch(RSS_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/xml, text/xml, */*'
            }
        });

        if (!response.ok) {
            throw new Error(`Reforma rechazó la conexión (Status: ${response.status})`);
        }

        const text = await response.text();
        const items = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
        
        let match;
        while ((match = itemRegex.exec(text)) !== null) {
            const itemContent = match[1];
            
            // Extraer Título y Descripción con soporte para CDATA
            const tMatch = /<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i.exec(itemContent) || /<title>([\s\S]*?)<\/title>/i.exec(itemContent);
            const dMatch = /<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i.exec(itemContent) || /<description>([\s\S]*?)<\/description>/i.exec(itemContent);

            if (tMatch) {
                const limpiar = (str) => {
                    if (!str) return "";
                    return str
                        .replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '')
                        .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
                        .replace(/&aacute;/g, 'á').replace(/&eacute;/g, 'é').replace(/&iacute;/g, 'í').replace(/&oacute;/g, 'ó').replace(/&uacute;/g, 'ú')
                        .replace(/&Aacute;/g, 'Á').replace(/&Eacute;/g, 'É').replace(/&Iacute;/g, 'Í').replace(/&Oacute;/g, 'Ó').replace(/&Uacute;/g, 'Ú')
                        .replace(/&ntilde;/g, 'ñ').replace(/&Ntilde;/g, 'Ñ')
                        .trim();
                };

                items.push({
                    titulo: limpiar(tMatch[1]),
                    descripcion: dMatch ? limpiar(dMatch[1]) : ""
                });
            }
            if (items.length >= 15) break; 
        }

        console.log(`✅ [Noticias] Reforma: ${items.length} titulares obtenidos.`);
        return items;

    } catch (error) {
        console.error("⚠️ [Noticias] Fallo al obtener RSS de Reforma:", error.message);
        return [
            { titulo: "Noticias en actualización", descripcion: "Consulte los indicadores económicos en un momento." },
            { titulo: "Servicio Reforma Negocios", descripcion: "Siga la información financiera más relevante aquí." }
        ];
    }
};

// ✅ ESTO ES LO MÁS IMPORTANTE PARA EL ERROR "is not a function"
module.exports = { fetchNoticiasRSS };