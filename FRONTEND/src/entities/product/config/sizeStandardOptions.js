/**
 * Estándares de talla (pensados para calcetines). Fuente única de verdad
 * para el acordeón "Tallas y Medidas" del admin, la Guía de Tallas y el
 * resumen en la ficha pública. El orden del array es el de visualización.
 * `gender` solo sirve para filtrar opciones en el admin (no va al backend);
 * null = aplica a unisex, hombre y mujer.
 * Los id deben coincidir con el enum de size_standard en el backend
 * (productSchema.js y ProductModel.js).
 */
export const SIZE_STANDARD_OPTIONS = [
    { id: 'bebe_0_6', label: 'Bebé (0 - 6 meses)', euRange: '15 - 17', gender: 'babies' },
    { id: 'bebe_6_12', label: 'Bebé (6 - 12 meses)', euRange: '18 - 20', gender: 'babies' },
    { id: 'bebe_12_24', label: 'Bebé (12 - 24 meses)', euRange: '21 - 23', gender: 'babies' },
    { id: 'nino_2_4', label: 'Niño/a (2 - 4 años)', euRange: '24 - 27', gender: 'kids' },
    { id: 'nino_5_7', label: 'Niño/a (5 - 7 años)', euRange: '28 - 31', gender: 'kids' },
    { id: 'nino_8_10', label: 'Niño/a (8 - 10 años)', euRange: '32 - 35', gender: 'kids' },
    { id: 'personalizado', label: 'Talla Única (rango personalizado)', euRange: null, gender: null },
    { id: 'internacional', label: 'Tabla Internacional EU/US de Tallas', euRange: null, gender: null },
]

export const getSizeStandardById = (id = '') =>
    SIZE_STANDARD_OPTIONS.find((option) => option.id === id) || null
