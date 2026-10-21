// Líneas del traspaso a la feria (paso 67c-1): mismos límites que el
// backend (schemas/fairSchema.js). Si cambian allá, cambian acá
export const MAX_TRANSFER_LINES = 100
export const MAX_TRANSFER_QUANTITY = 1000

// Una lista pegada desde una planilla: una línea por SKU y cantidad,
// separados por tabulación, coma, punto y coma o espacios. Las líneas en
// blanco se ignoran, y también una primera línea de encabezado que empiece
// con "SKU". Devuelve las filas con su número de línea y los errores de
// forma; los valores se validan después, en normalizeLines
export const parsePastedList = (text) => {
    const rows = []
    const errors = []
    text.split(/\r?\n/).forEach((raw, index) => {
        const lineNumber = index + 1
        const tokens = raw.trim().split(/[\t,;\s]+/).filter(Boolean)
        if (tokens.length === 0) return
        const isFirst = rows.length === 0 && errors.length === 0
        if (isFirst && /^sku$/i.test(tokens[0])) return
        if (tokens.length !== 2) {
            errors.push({
                lineNumber,
                message: `Línea ${lineNumber}: se esperaban un SKU y una cantidad.`,
            })
            return
        }
        rows.push({ lineNumber, sku: tokens[0], quantity: tokens[1] })
    })
    return { rows, errors }
}

// Valida las filas (escritas o pegadas) y suma los SKU repetidos, porque el
// backend los rechaza con 400. Una fila escrita sin SKU ni cantidad se
// ignora. "1.000" o "1,5" no son cantidades válidas: solo dígitos.
// Devuelve { lines, errors, merged }: lines es lo que se envía; merged, los
// SKU que se sumaron, para avisarlo
export const normalizeLines = (rows, labelOf) => {
    const errors = []
    const totals = new Map()
    const counts = new Map()
    for (const row of rows) {
        const sku = String(row.sku ?? '').trim().toUpperCase()
        const quantityText = String(row.quantity ?? '').trim()
        if (!sku && !quantityText) continue
        const label = labelOf(row)
        if (sku.length < 3 || sku.length > 50) {
            errors.push({
                lineNumber: row.lineNumber,
                message: `${label}: el SKU debe tener entre 3 y 50 caracteres.`,
            })
            continue
        }
        const quantity = Number(quantityText)
        if (
            !/^\d+$/.test(quantityText) ||
            quantity < 1 ||
            quantity > MAX_TRANSFER_QUANTITY
        ) {
            errors.push({
                lineNumber: row.lineNumber,
                message: `${label}: la cantidad debe ser un número entero entre 1 y ${MAX_TRANSFER_QUANTITY}.`,
            })
            continue
        }
        totals.set(sku, (totals.get(sku) ?? 0) + quantity)
        counts.set(sku, (counts.get(sku) ?? 0) + 1)
    }

    const merged = [...counts]
        .filter(([, count]) => count > 1)
        .map(([sku, count]) => ({ sku, count, quantity: totals.get(sku) }))
    for (const { sku, quantity } of merged) {
        if (quantity > MAX_TRANSFER_QUANTITY) {
            errors.push({
                lineNumber: Infinity,
                message: `${sku}: sus líneas suman ${quantity}, más que el máximo de ${MAX_TRANSFER_QUANTITY} por SKU.`,
            })
        }
    }

    const lines = [...totals].map(([sku, quantity]) => ({ sku, quantity }))
    if (lines.length > MAX_TRANSFER_LINES) {
        errors.push({
            lineNumber: Infinity,
            message: `Son ${lines.length} SKU distintos: el máximo por traspaso es ${MAX_TRANSFER_LINES}.`,
        })
    }
    return { lines, errors, merged }
}
