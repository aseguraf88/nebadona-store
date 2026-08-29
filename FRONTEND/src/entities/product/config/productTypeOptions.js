// util/categoryOptions.js (o el nombre que tenga tu archivo)

export const normalizeCategoryKey = (value = '') =>
    value
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '')
        .toLowerCase()

// Definimos arrays reutilizables
const calcetasTipos = [
    'Invisibles',
    'Tobilleros',
    'Cortos',
    'Media Caña',
    'Altos',
    'Largos',
    'Extra Largos',
]

const polerasTipos = ['Manga Corta', 'Manga Larga', 'Musculosa', 'Oversize']
const poleronesTipos = [
    'Con Capucha',
    'Cuello Redondo',
    'Canguro',
    'Con Cierre',
]
const mochilasTipos = ['Urbana', 'Deportiva', 'Escolar', 'Para Notebook']
const bolsosTipos = ['Tote Bag', 'Cruzado', 'De Mano', 'De Hombro']
const carterasTipos = ['De Cuero', 'De Tela', 'De Mano', 'Con Cierre']
const tarjeterosTipos = [
    'De Cuero',
    'De Tela',
    'De Mano',
    'De Goma',
    'Con Cierre',
]
const gorrosTipos = ['Jockey', 'Beanie', 'Piluso', 'Visera']
const zapatosTipos = [
    'Deportivos',
    'Casuales',
    'Formales',
    'Botas',
    'Sandalias',
]

export const PRODUCT_TYPES_BY_CATEGORY = {
    // Calcetines
    calceta: calcetasTipos,
    calcetas: calcetasTipos,
    calcetin: calcetasTipos,
    calcetines: calcetasTipos,

    // Ropa superior
    polera: polerasTipos,
    poleras: polerasTipos,
    poleron: poleronesTipos,
    polerones: poleronesTipos,
    camisa: ['Con Estampado', 'Lisa', 'A Cuadros', 'Denim'],
    camisas: ['Con Estampado', 'Lisa', 'A Cuadros', 'Denim'],

    // Accesorios de cabeza
    gorro: gorrosTipos,
    gorros: gorrosTipos,

    // Bolsos y equipaje
    mochila: mochilasTipos,
    mochilas: mochilasTipos,
    bolso: bolsosTipos,
    bolsos: bolsosTipos,
    cartera: carterasTipos,
    carteras: carterasTipos,
    billetera: carterasTipos, // Usa los mismos tipos que carteras
    billeteras: carterasTipos,

    // 🔥 Tu nuevo producto
    tarjetero: tarjeterosTipos,
    tarjeteros: tarjeterosTipos,

    monedero: ['De Cuero', 'De Tela', 'De Mano', 'Con Cierre'],
    monederos: ['De Cuero', 'De Tela', 'De Mano', 'Con Cierre'],

    // Joyería y varios
    aro: ['Argollas', 'Tachuelas (Pegados)', 'Colgantes', 'A Presión'],
    aros: ['Argollas', 'Tachuelas (Pegados)', 'Colgantes', 'A Presión'],
    llavero: ['Acrílico', 'Metálico', 'Goma (PVC)', 'Peluche'],
    llaveros: ['Acrílico', 'Metálico', 'Goma (PVC)', 'Peluche'],
    tazon: ['Cerámica Clásica', 'Mágico', 'Enlozado'],
    tazones: ['Cerámica Clásica', 'Mágico', 'Enlozado'],

    zapato: zapatosTipos,
    zapatos: zapatosTipos,
}

export const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'STD']

// Exportación limpia y segura
export const getProductTypesByCategory = (categoryName = '') => {
    const normalizedKey = normalizeCategoryKey(categoryName)
    return PRODUCT_TYPES_BY_CATEGORY[normalizedKey] || []
}
