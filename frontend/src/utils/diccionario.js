// frontend/src/utils/diccionario.js

export const TEXTOS_GENERAL = {
    es: { bienvenidos: "Bienvenidos" },
    en: { bienvenidos: "Welcome" },
    fr: { bienvenidos: "Bienvenue" }
};

export const TEXTOS_TARIFAS = {
    es: {
        titulo: "TARIFAS",
        titulo_largo: "TARIFAS VIGENTES",
        header_hab: "Habitación / Detalles",
        header_tarifa: "Tarifa",
        clima: "Clima Actual",
        cambio: "TIPO DE CAMBIO HOY",
        reg: "Reg:",
        precio_regular: "Precio Regular:",
        bienvenidos: "Bienvenidos"
    },
    en: {
        titulo: "RATES",
        titulo_largo: "CURRENT RATES",
        header_hab: "Room / Details",
        header_tarifa: "Rate",
        clima: "Current Weather",
        cambio: "EXCHANGE RATE TODAY",
        reg: "Reg:",
        precio_regular: "Regular Price:",
        bienvenidos: "Welcome"
    },
    fr: { 
        titulo: "TARIFS",
        titulo_largo: "TARIFS ACTUELS",
        header_hab: "Chambre / Détails",
        header_tarifa: "Tarif",
        clima: "Météo Actuelle",
        cambio: "TAUX DE CHANGE",
        reg: "Rég:",
        precio_regular: "Prix Régulier:",
        bienvenidos: "Bienvenue"
    }
};

export const TEXTOS_SALONES = {
    es: {
        titulo: "AGENDA DE EVENTOS",
        salon: "SALÓN",
        evento: "EVENTO",
        hora: "HORA",
        no_eventos: "No hay eventos programados por el momento."
    },
    en: {
        titulo: "EVENTS AGENDA",
        salon: "ROOM",
        evento: "EVENT",
        hora: "TIME",
        no_eventos: "No scheduled events at the moment."
    },
    fr: {
        titulo: "AGENDA DES ÉVÉNEMENTS",
        salon: "SALLE",
        evento: "ÉVÉNEMENT",
        hora: "HEURE",
        no_eventos: "Aucun événement prévu pour le moment."
    }
};

// --- NUEVO: TEXTOS PARA DIRECTORIOS ---
export const TEXTOS_DIRECTORIO = {
    es: {
        titulo: "DIRECTORIO DE EVENTOS",
        lugar: "LUGAR / SERVICIO",
        ubicacion: "UBICACIÓN",
        horario: "HORARIO",
        nivel: "Nivel"
    },
    en: {
        titulo: "EVENT DIRECTORY",
        lugar: "PLACE / SERVICE",
        ubicacion: "LOCATION",
        horario: "HOURS",
        nivel: "Level"
    },
    fr: {
        titulo: "RÉPERTOIRE DES EVENTOS",
        lugar: "LIEU / SERVICE",
        ubicacion: "EMPLACEMENT",
        horario: "HORAIRES",
        nivel: "Niveau"
    }
};

/**
 * Helper para obtener texto seguro.
 */
export const getTexto = (seccion, idioma, clave) => {
    const diccionario = seccion === 'TARIFAS' ? TEXTOS_TARIFAS : 
                        seccion === 'SALONES' ? TEXTOS_SALONES : 
                        seccion === 'DIRECTORIO' ? TEXTOS_DIRECTORIO : TEXTOS_GENERAL;
    
    const lang = diccionario[idioma] ? idioma : 'es';
    return diccionario[lang][clave] || clave;
};