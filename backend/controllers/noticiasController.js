const fetchNoticiasRSS = async () => {
    try {
        const RSS_URL = "https://www.reforma.com/rss/negocios.xml";
        
        const response = await fetch(RSS_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 ...',
                'Accept': 'application/xml, text/xml, */*'
            }
        });

        const text = await response.text();
        const items = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
        
        let match;
        while ((match = itemRegex.exec(text)) !== null) {
            const itemContent = match[1];
            
            // Extraer Título
            const tMatch = /<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i.exec(itemContent) || /<title>([\s\S]*?)<\/title>/i.exec(itemContent);
            // Extraer Descripción
            const dMatch = /<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i.exec(itemContent) || /<description>([\s\S]*?)<\/description>/i.exec(itemContent);

            if (tMatch) {
                // Función para limpiar acentos y entidades HTML
                const limpiar = (str) => {
                    if (!str) return "";
                    return str
                        .replace(/&quot;/g, '"')
                        .replace(/&amp;/g, '&')
                        .replace(/&nbsp;/g, ' ')
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
        return items;
    } catch (error) {
        console.error("Error Reforma:", error);
        return [{ titulo: "Error de conexión", descripcion: "No se pudieron cargar las noticias de Reforma." }];
    }
};