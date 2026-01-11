/**
 * Controlador de Noticias RSS
 */
const fetchNoticiasRSS = async () => {
    try {
        const RSS_URL = "https://news.google.com/rss/topics/CAAqJggBCiSJQVRbQkFBUWdvS0ZRb1IzaU5oY1NjQ0FBUW9DaEJqY0d3b0FBUAE?hl=es-419&gl=MX&ceid=MX:es-419";
        
        console.log("🌐 [Noticias] Fetching RSS de:", RSS_URL);
        const response = await fetch(RSS_URL);
        
        if (!response.ok) {
            console.error(`❌ [Noticias] Error en la petición HTTP: ${response.status}`);
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const text = await response.text();
        // console.log("📄 [Noticias] XML Recibido (longitud):", text.length); // Descomentar si quieres ver el raw

        const items = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
        
        let match;
        while ((match = itemRegex.exec(text)) !== null) {
            const itemContent = match[1];
            const titleMatch = /<title><!\[CDATA\[(.*?)\]\]><\/title>/i.exec(itemContent) || /<title>(.*?)<\/title>/i.exec(itemContent);
            
            if (titleMatch) {
                let titulo = titleMatch[1].split(' - ')[0]; 
                items.push(titulo);
            }
            if (items.length >= 10) break;
        }

        console.log(`✅ [Noticias] ${items.length} noticias extraídas.`);
        return items;

    } catch (error) {
        console.error("⚠️ [Noticias] Fallo al obtener RSS:", error.message);
        return [
            "Bienvenidos a nuestro Hotel",
            "Consulte nuestros eventos del día",
            "Disfrute su estancia",
            "Visite nuestro restaurante"
        ];
    }
};

module.exports = { fetchNoticiasRSS };