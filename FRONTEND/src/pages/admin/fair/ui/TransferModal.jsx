import { useEffect, useMemo, useRef, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { createTransfer } from '../../../../entities/fair'
import { useProduct } from '../../../../entities/product'
import {
    MAX_TRANSFER_LINES,
    MAX_TRANSFER_QUANTITY,
    normalizeLines,
    parsePastedList,
} from '../lib/transferLines'

const emptyRow = () => ({ id: crypto.randomUUID(), sku: '', quantity: '' })

const NETWORK_ERROR =
    'No se pudo conectar con el servidor. Puedes reintentar: el traspaso no se aplica dos veces. Si vas a cambiar las líneas, revisa antes el historial.'

const byLine = (a, b) => a.lineNumber - b.lineNumber

// Traspaso de la web a la feria (paso 67c-1). Las líneas se escriben o se
// pegan desde una planilla; no se envía nada hasta que todas sean válidas.
// El backend aplica todo o nada y responde los 400 y 409 con su mensaje,
// que se muestra tal cual
const TransferModal = ({ fair, onClose, onDone }) => {
    const { adminProducts } = useProduct()
    const [tab, setTab] = useState('rows') // 'rows' (escribir) o 'paste' (pegar lista)
    const [rows, setRows] = useState(() => [emptyRow()])
    const [pasted, setPasted] = useState('')
    const [sending, setSending] = useState(false)
    const sendingRef = useRef(false) // evita el doble clic antes del render
    const [error, setError] = useState(null)

    // Variantes del catálogo del dashboard por SKU: sugerencias del campo
    // SKU y el stock web de referencia (el que decide es el backend)
    const catalog = useMemo(() => {
        const map = new Map()
        for (const product of adminProducts) {
            for (const variant of product.variants ?? []) {
                map.set(variant.sku, {
                    name: product.name,
                    detail: [variant.size, variant.baseColor]
                        .filter(Boolean)
                        .join(', '),
                    stock: variant.stock ?? 0,
                })
            }
        }
        return map
    }, [adminProducts])

    const pastedParse = useMemo(() => parsePastedList(pasted), [pasted])
    const result = useMemo(() => {
        if (tab === 'paste') {
            const normalized = normalizeLines(
                pastedParse.rows,
                (row) => `Línea ${row.lineNumber}`,
            )
            return {
                ...normalized,
                errors: [...pastedParse.errors, ...normalized.errors].sort(byLine),
            }
        }
        return normalizeLines(
            rows.map((row, index) => ({ ...row, lineNumber: index + 1 })),
            (row) => `Fila ${row.lineNumber}`,
        )
    }, [tab, rows, pastedParse])

    // Un requestId por conjunto de líneas: se mantiene en los reintentos
    // (el backend no aplica dos veces el mismo) y cambia si cambian las
    // líneas. Al abrir el modal nace uno nuevo
    const linesKey = JSON.stringify(result.lines)
    const [requestId, setRequestId] = useState(() => crypto.randomUUID())
    const lastLinesKey = useRef(linesKey)
    useEffect(() => {
        if (lastLinesKey.current !== linesKey) {
            lastLinesKey.current = linesKey
            setRequestId(crypto.randomUUID())
        }
    }, [linesKey])

    const canSend =
        result.lines.length > 0 && result.errors.length === 0 && !sending

    const updateRow = (id, field, value) =>
        setRows((prev) =>
            prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
        )
    const removeRow = (id) =>
        setRows((prev) =>
            prev.length === 1 ? [emptyRow()] : prev.filter((row) => row.id !== id),
        )

    const handleSubmit = async () => {
        if (sendingRef.current || !canSend) return
        sendingRef.current = true
        setSending(true)
        setError(null)
        try {
            const data = await createTransfer(fair._id, {
                requestId,
                lines: result.lines,
            })
            onDone(data)
        } catch (err) {
            // Con status, el mensaje del backend tal cual; sin status, red
            setError(err.status ? err.message : NETWORK_ERROR)
        } finally {
            sendingRef.current = false
            setSending(false)
        }
    }

    // Referencia de una línea: el producto y su stock web, o un aviso si el
    // SKU no está en el catálogo cargado
    const lineHint = (sku, quantity) => {
        const found = catalog.get(sku)
        if (!found) {
            return (
                <span className="text-warning">No está en el catálogo cargado</span>
            )
        }
        return (
            <span className={quantity > found.stock ? 'text-error' : ''}>
                {found.name}
                {found.detail ? ` (${found.detail})` : ''} · web {found.stock}
            </span>
        )
    }

    return (
        <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-3xl">
                <h3 className="text-lg font-bold">Traspasar a la feria</h3>
                <p className="py-2 text-sm text-base-content/70">
                    Baja el stock de la web y lo suma a la feria «{fair.name}».
                    Se aplica todo o nada. Máximo {MAX_TRANSFER_LINES} SKU y{' '}
                    {MAX_TRANSFER_QUANTITY} unidades por SKU.
                </p>

                <div role="tablist" className="tabs tabs-boxed mb-4 inline-flex">
                    <button
                        type="button"
                        role="tab"
                        className={`tab ${tab === 'rows' ? 'tab-active font-bold' : ''}`}
                        onClick={() => setTab('rows')}
                        disabled={sending}
                    >
                        Escribir
                    </button>
                    <button
                        type="button"
                        role="tab"
                        className={`tab ${tab === 'paste' ? 'tab-active font-bold' : ''}`}
                        onClick={() => setTab('paste')}
                        disabled={sending}
                    >
                        Pegar lista
                    </button>
                </div>

                {tab === 'rows' ? (
                    <div className="flex flex-col gap-2">
                        <datalist id="fair-sku-options">
                            {[...catalog].map(([sku, found]) => (
                                <option key={sku} value={sku}>
                                    {found.name}
                                    {found.detail ? ` (${found.detail})` : ''} · web{' '}
                                    {found.stock}
                                </option>
                            ))}
                        </datalist>
                        {rows.map((row, index) => {
                            const sku = row.sku.trim().toUpperCase()
                            return (
                                <div key={row.id} className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 text-right text-xs text-base-content/50">
                                            {index + 1}
                                        </span>
                                        <input
                                            className="input input-sm input-bordered min-w-0 flex-1 font-mono uppercase"
                                            list="fair-sku-options"
                                            placeholder="SKU"
                                            aria-label={`SKU de la fila ${index + 1}`}
                                            value={row.sku}
                                            onChange={(e) =>
                                                updateRow(row.id, 'sku', e.target.value)
                                            }
                                            disabled={sending}
                                        />
                                        <input
                                            className="input input-sm input-bordered w-24"
                                            type="number"
                                            inputMode="numeric"
                                            min="1"
                                            max={MAX_TRANSFER_QUANTITY}
                                            placeholder="Cant."
                                            aria-label={`Cantidad de la fila ${index + 1}`}
                                            value={row.quantity}
                                            onChange={(e) =>
                                                updateRow(row.id, 'quantity', e.target.value)
                                            }
                                            disabled={sending}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-sm btn-square"
                                            aria-label={`Quitar la fila ${index + 1}`}
                                            onClick={() => removeRow(row.id)}
                                            disabled={sending}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    {sku.length >= 3 && (
                                        <p className="pl-8 text-xs text-base-content/60">
                                            {lineHint(sku, Number(row.quantity))}
                                        </p>
                                    )}
                                </div>
                            )
                        })}
                        <button
                            type="button"
                            className="btn btn-ghost btn-sm w-fit"
                            onClick={() => setRows((prev) => [...prev, emptyRow()])}
                            disabled={sending || rows.length >= MAX_TRANSFER_LINES}
                        >
                            <Plus className="h-4 w-4" /> Agregar fila
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <textarea
                            className="textarea textarea-bordered h-40 font-mono text-sm"
                            placeholder={'SKU-1\t3\nSKU-2\t10'}
                            aria-label="Lista pegada: una línea por SKU y cantidad"
                            value={pasted}
                            onChange={(e) => setPasted(e.target.value)}
                            disabled={sending}
                        />
                        <p className="text-xs text-base-content/60">
                            Una línea por SKU y cantidad, separados por tabulación,
                            coma, punto y coma o espacios (lo que sale al copiar dos
                            columnas de una planilla).
                        </p>
                        {result.lines.length > 0 && (
                            <div className="overflow-x-auto rounded-lg border border-base-content/10">
                                <table className="table table-sm">
                                    <tbody>
                                        {result.lines.map((line) => (
                                            <tr key={line.sku} className="border-base-content/10">
                                                <td className="font-mono">{line.sku}</td>
                                                <td className="text-right">{line.quantity}</td>
                                                <td className="text-xs">
                                                    {lineHint(line.sku, line.quantity)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {result.merged.length > 0 && (
                    <div className="alert alert-info mt-4 text-sm">
                        <span>
                            Se sumaron SKU repetidos:{' '}
                            {result.merged
                                .map(
                                    ({ sku, count, quantity }) =>
                                        `${sku} (${count} líneas, ${quantity} unidades)`,
                                )
                                .join('; ')}
                            .
                        </span>
                    </div>
                )}

                {result.errors.length > 0 && (
                    <div className="alert alert-warning mt-4 text-sm">
                        <ul className="list-inside list-disc">
                            {result.errors.map((item) => (
                                <li key={item.message}>{item.message}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {error && (
                    <div className="alert alert-error mt-4 text-sm" role="alert">
                        <span>{error}</span>
                    </div>
                )}

                <div className="modal-action">
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={onClose}
                        disabled={sending}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={!canSend}
                    >
                        {sending ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : result.lines.length > 0 ? (
                            `Traspasar ${result.lines.length} SKU`
                        ) : (
                            'Traspasar'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TransferModal
