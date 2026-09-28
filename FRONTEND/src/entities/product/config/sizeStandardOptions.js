/**
 * Estándares de talla (pensados para calcetines). Fuente única de verdad
 * para el acordeón "Tallas y Medidas" del admin, la Guía de Tallas y el
 * resumen en la ficha pública. El orden del array es el de visualización.
 * `gender` solo sirve para filtrar opciones en el admin (no va al backend);
 * null = aplica a unisex, hombre y mujer.
 * `variantSize` es la talla fija que el estándar impone a todas las
 * variantes (null = Talla libre). Mayúsculas y sin espacios: se guarda tal
 * cual, la ve el cliente y forma parte del SKU.
 * Los id deben coincidir con el enum de size_standard en el backend
 * (productSchema.js y ProductModel.js).
 */
export const SIZE_STANDARD_OPTIONS = [
    { id: 'bebe_0_6', label: 'Bebé (0 - 6 meses)', euRange: '15 - 17', gender: 'babies', variantSize: '0-6M' },
    { id: 'bebe_6_12', label: 'Bebé (6 - 12 meses)', euRange: '18 - 20', gender: 'babies', variantSize: '6-12M' },
    { id: 'bebe_12_24', label: 'Bebé (12 - 24 meses)', euRange: '21 - 23', gender: 'babies', variantSize: '12-24M' },
    { id: 'nino_2_4', label: 'Niño/a (2 - 4 años)', euRange: '24 - 27', gender: 'kids', variantSize: '2-4A' },
    { id: 'nino_5_7', label: 'Niño/a (5 - 7 años)', euRange: '28 - 31', gender: 'kids', variantSize: '5-7A' },
    { id: 'nino_8_10', label: 'Niño/a (8 - 10 años)', euRange: '32 - 35', gender: 'kids', variantSize: '8-10A' },
    { id: 'personalizado', label: 'Talla Única (rango personalizado)', euRange: null, gender: null, variantSize: 'UNICA' },
    { id: 'internacional', label: 'Tabla Internacional EU/US de Tallas', euRange: null, gender: null, variantSize: null },
]

export const getSizeStandardById = (id = '') =>
    SIZE_STANDARD_OPTIONS.find((option) => option.id === id) || null

// Grupo de tallas de un Género: qué estándares se ofrecen y cuándo hay que
// resetear al cambiar de Género. Cualquier otro valor (unisex, men, women,
// o vacío) cae en 'adult'.
export const getGenderSizeGroup = (gender) =>
    gender === 'babies' || gender === 'kids' ? gender : 'adult'

// Estándares visibles para un Género (en las opciones, gender: null = adulto)
export const getSizeStandardsForGender = (gender) => {
    const group = getGenderSizeGroup(gender)
    return SIZE_STANDARD_OPTIONS.filter(
        (option) => (option.gender ?? 'adult') === group,
    )
}

// Talla fija que impone un Estándar ({ code, label }), o null si la Talla
// de las variantes queda libre (internacional, sin estándar)
export const getLockedVariantSize = (standardId) => {
    const option = getSizeStandardById(standardId)
    if (!option?.variantSize) return null
    return { code: option.variantSize, label: option.label }
}
