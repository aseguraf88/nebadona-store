/**
 * Estándares de talla (pensados para calcetines, disponibles para
 * cualquier categoría). Fuente única de verdad para el selector del
 * admin, la Guía de Tallas y el resumen en la ficha pública.
 * El orden del array es el orden de visualización (de menor a mayor).
 * Los id deben coincidir con el enum de size_standard en el backend
 * (productSchema.js y ProductModel.js).
 */
export const SIZE_STANDARD_OPTIONS = [
    { id: 'bebe', label: 'Bebé', euRange: '15 - 23', footLengthCm: '9.0 - 14.5', note: null },
    { id: 'nino', label: 'Niño/a', euRange: '24 - 35', footLengthCm: '15.0 - 22.0', note: null },
    { id: 'mujer', label: 'Mujer', euRange: '35 - 40', footLengthCm: '22.5 - 25.5', note: null },
    { id: 'hombre', label: 'Hombre', euRange: '39 - 44', footLengthCm: '25.0 - 28.5', note: null },
    { id: 'unisex', label: 'Unisex', euRange: '38 - 43', footLengthCm: '24.0 - 27.5', note: null },
    {
        id: 'unisex_amplio',
        label: 'Unisex amplio',
        euRange: '37 - 45',
        footLengthCm: '23.5 - 29.0',
        note: 'Cubre un rango amplio; el calce ideal es entre las tallas 40 y 42',
    },
    { id: 'plus', label: 'Talla Plus', euRange: '45 - 49', footLengthCm: '29.0 - 31.5', note: null },
]

export const getSizeStandardById = (id = '') =>
    SIZE_STANDARD_OPTIONS.find((option) => option.id === id) || null
