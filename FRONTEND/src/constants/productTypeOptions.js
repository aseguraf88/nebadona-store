export const normalizeCategoryKey = (value = '') =>
    value
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '')
        .toLowerCase()

// Definimos arrays reutilizables si hay sinónimos
const calcetasTipos = [
    'Invisibles',
    'Tobilleros',
    'Cortos',
    'Media Caña',
    'Altos',
    'Largos',
    'Extra Largos',
]
const bolsosTipos = ['Tote Bag', 'Cruzado', 'De Mano', 'De Hombro']

export const PRODUCT_TYPES_BY_CATEGORY = {
    // Calcetines
    calcetas: calcetasTipos,
    calcetines: calcetasTipos,

    // Ropa superior
    poleras: ['Manga Corta', 'Manga Larga', 'Musculosa', 'Oversize'],
    polerones: ['Con Capucha', 'Cuello Redondo', 'Canguro', 'Con Cierre'],
    camisas: ['Con Estampado', 'Lisa', 'A Cuadros', 'Denim'],

    // Accesorios de cabeza
    gorros: ['Jockey', 'Beanie', 'Piluso', 'Visera'],

    // Bolsos y equipaje
    mochilas: ['Urbana', 'Deportiva', 'Escolar', 'Para Notebook'],
    bolsos: bolsosTipos,
    carteras: bolsosTipos,

    // Joyería y varios
    aros: ['Argollas', 'Tachuelas (Pegados)', 'Colgantes', 'A Presión'],
    llaveros: ['Acrílico', 'Metálico', 'Goma (PVC)', 'Peluche'],

    // Por si acaso...
    tazones: ['Cerámica Clásica', 'Mágico', 'Enlozado'],

    zapatos: ['Deportivos', 'Casuales', 'Formales', 'Botas', 'Sandalias'],
}

export const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Única']

// Cambiamos el nombre de la función exportada para que tenga sentido
export const getProductTypesByCategory = (categoryName = '') =>
    PRODUCT_TYPES_BY_CATEGORY[normalizeCategoryKey(categoryName)] || []
