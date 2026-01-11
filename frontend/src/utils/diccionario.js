// frontend/src/utils/diccionario.js

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
    fr: { // Ejemplo de lo fácil que es agregar otro idioma
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


export const getTexto = (idioma, clave) => {
    const lang = TEXTOS_TARIFAS[idioma] ? idioma : 'es';
    return TEXTOS_TARIFAS[lang][clave] || TEXTOS_TARIFAS['es'][clave] || clave;
};