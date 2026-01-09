import useSWR from 'swr';

// Función para pedir datos
const fetcher = (url) => fetch(url).then((res) => {
    if (!res.ok) throw new Error('Error cargando datos');
    return res.json();
});

export const usePantalla = (idPantalla) => {
    // Definimos la URL de la API.
    // Si existe la variable de entorno la usa, si no, usa localhost:3100
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3100';

    const { data, error, isLoading } = useSWR(
        idPantalla ? `${apiUrl}/api/pantalla/${idPantalla}` : null,
        fetcher,
        {
            refreshInterval: 60000, // Revisa cambios cada 60 segundos
            revalidateOnFocus: false, 
            shouldRetryOnError: true, 
        }
    );

    return {
        info: data,     
        isLoading,
        isError: error
    };
};