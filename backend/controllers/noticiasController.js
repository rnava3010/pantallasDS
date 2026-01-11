/**
 * Controlador de Noticias RSS - Edición Reforma Negocios
 */
const fetchNoticiasRSS = async () => {
    try {
        // ✅ URL de Reforma Negocios
        const RSS_URL = "https://www.reforma.com/rss/negocios.xml";
        
        console.log("🌐 [Noticias] Conectando a Reforma Negocios...");
        
        const response = await fetch(RSS_URL, {
            headers: {
                // Reforma requiere un User-Agent real para permitir la descarga
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/xml, text/xml, */*'
            }
        });

        if (!response.ok) {
            throw new Error(`Reforma rechazó la conexión (Status: ${response.status})`);
        }

        const text = await response.text();
        
        const items = [];
        // Regex para capturar los bloques <item>
        const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
        
        let match;
        while ((match = itemRegex.exec(text)) !== null) {
            const itemContent = match[1];
            
            // Reforma suele usar CDATA o texto plano en el título
            const titleMatch = /<title><!\[CDATA\[(.*?)\]\]><\/title>/i.exec(itemContent) || /<title>(.*?)<\/title>/i.exec(itemContent);
            
            if (titleMatch) {
                let titulo = titleMatch[1].trim();
                
                // Limpieza de caracteres extra si existieran
                titulo = titulo.replace(/&quot;/g, '"').replace(/&amp;/g, '&');

                if (titulo) {
                    items.push(titulo);
                }
            }
            if (items.length >= 15) break; 
        }

        console.log(`✅ [Noticias] Reforma: ${items.length} titulares obtenidos.`);
        return items;

    } catch (error) {
        console.error("⚠️ [Noticias] Fallo al obtener RSS de Reforma:", error.message);
        
        // Fallback de seguridad (Se mostrará si el sitio de Reforma está caído)
        return [
            "Actualizando indicadores económicos...",
            "Consulte las noticias más relevantes de negocios en un momento",
            "Buscando información financiera actualizada",
            "Tipo de cambio y mercados: Siga la información en vivo"
        ];
    }
};

module.exports = { fetchNoticiasRSS };