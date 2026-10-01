// Arma el mensaje de error de validación en español, con el nombre del
// campo. Los mensajes por defecto de Zod vienen en inglés y con términos
// técnicos ("expected string to have >=3 characters"), así que se arman
// según el tipo de error (issue.code). Los de code 'custom' (refine y
// superRefine) ya están escritos en español y se dejan tal cual.

const FIELD_LABELS = {
    username: 'Nombre de usuario',
    email: 'Correo electrónico',
    password: 'Contraseña',
    name: 'Nombre',
    handle: 'Handle',
    description: 'Descripción',
    product_category: 'Categoría',
    sock_type: 'Tipo de calceta',
    gender: 'Género',
    material: 'Material',
    fit_type: 'Tipo de calce',
    specifications: 'Especificaciones',
    decoration_technique: 'Técnica de decoración',
    size_standard: 'Estándar de talla',
    size_range_min: 'Rango mínimo',
    size_range_max: 'Rango máximo',
    franchise_name: 'Franquicia',
    character_name: 'Personaje',
    design_theme: 'Tema',
    price: 'Precio',
    compareAtPrice: 'Precio de comparación',
    cost_price: 'Costo',
    imageUrl: 'Imagen principal',
    imageUrls: 'Imágenes',
    tags: 'Etiquetas',
    variants: 'Variantes',
    sku: 'SKU',
    size: 'Talla',
    baseColor: 'Color base',
    designColors: 'Colores del diseño',
    stock: 'Stock',
    attributes: 'Atributos',
    status: 'Estado',
}

const TYPE_NAMES = {
    string: 'texto',
    number: 'un número',
    int: 'un número entero',
    boolean: 'verdadero o falso',
    array: 'una lista',
    object: 'un objeto',
}

// ['variants', 0, 'stock'] → 'Variantes #1 › Stock'
const fieldLabel = (path) =>
    path
        .reduce((parts, part) => {
            if (typeof part === 'number') parts[parts.length - 1] += ` #${part + 1}`
            else parts.push(FIELD_LABELS[part] || part)
            return parts
        }, [])
        .join(' › ')

// Valor enviado en esa ruta: distingue "falta el campo" de "tipo incorrecto"
const valueAt = (input, path) => path.reduce((value, part) => value?.[part], input)

const describe = (issue, value) => {
    const n = issue.minimum ?? issue.maximum
    const strict = issue.inclusive === false
    switch (issue.code) {
        case 'invalid_type':
            return value == null
                ? 'es obligatorio'
                : `debe ser ${TYPE_NAMES[issue.expected] || 'de otro tipo'}`
        case 'too_small':
            if (issue.origin === 'string')
                return n <= 1 ? 'es obligatorio' : `debe tener al menos ${n} caracteres`
            if (issue.origin === 'number')
                return `debe ser mayor ${strict ? 'que' : 'o igual a'} ${n}`
            if (issue.origin === 'array')
                return `debe tener al menos ${n} ${n === 1 ? 'elemento' : 'elementos'}`
            return 'es demasiado corto'
        case 'too_big':
            if (issue.origin === 'string') return `debe tener como máximo ${n} caracteres`
            if (issue.origin === 'number')
                return `debe ser menor ${strict ? 'que' : 'o igual a'} ${n}`
            if (issue.origin === 'array') return `puede tener como máximo ${n} elementos`
            return 'es demasiado largo'
        case 'invalid_format':
            return issue.format === 'email'
                ? 'no tiene un formato de correo válido'
                : 'tiene un formato inválido'
        case 'invalid_value':
            return 'tiene un valor no permitido'
        default:
            return 'es inválido'
    }
}

const issueMessage = (issue, input) => {
    if (issue.code === 'custom') return issue.message
    const text = describe(issue, valueAt(input, issue.path))
    return issue.path.length > 0
        ? `${fieldLabel(issue.path)}: ${text}.`
        : `Datos inválidos: ${text}.`
}

// { message: primer error (el que muestra el toast), errors: todos }
export const formatZodError = (error, input) => {
    const errors = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issueMessage(issue, input),
    }))
    return { message: errors[0]?.message || 'Datos inválidos.', errors }
}
