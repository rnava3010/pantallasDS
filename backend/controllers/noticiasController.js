/**
 * Controlador de Noticias RSS
 * Se encarga de obtener y parsear noticias externas para usarlas en Directorios, Tarifas, etc.
 */
const fetchNoticiasRSS = async () => {
    try {
        // Fuente: Google News México (Ciencia y Tecnología)
        // Puedes cambiar esto por cualquier URL de RSS (ej: El Universal, Reforma, CNN, etc.)
        const RSS_URL = "https://news.google.com/rss/topics/CAAqJggBCiSJQVRbQkFBUWdvS0ZRb1IzaU5oY1NjQ0FBUW9DaEJqY0d3b0FBUAE?hl=es-419&gl=MX&ceid=MX:es-419";
        
        const response = await fetch(RSS_URL);
        const text = await response.text();
        
        const items = [];
        // Regex para extraer items
        const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
        
        let match;
        while ((match = itemRegex.exec(text)) !== null) {
            const itemContent = match[1];
            // Regex para extraer título (soporta CDATA)
            const titleMatch = /<title><!\[CDATA\[(.*?)\]\]><\/title>/i.exec(itemContent) || /<title>(.*?)<\/title>/i.exec(itemContent);
            
            if (titleMatch) {
                // Limpiamos el título (quitamos la fuente al final si Google la pone)
                let titulo = titleMatch[1].split(' - ')[0]; 
                items.push(titulo);
            }
            if (items.length >= 10) break; // Máximo 10 noticias
        }
        return items;

    } catch (error) {
        console.error("⚠️ Error obteniendo RSS:", error.message);
        // Textos de respaldo por si falla el internet o el RSS
        return [
            "Bienvenidos a nuestro Hotel",
            "Consulte nuestros eventos del día",
            "Disfrute su estancia",
            "Visite nuestro restaurante"
        ];
    }
};

module.exports = { fetchNoticiasRSS };