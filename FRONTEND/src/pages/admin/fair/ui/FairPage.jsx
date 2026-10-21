import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { ArrowRightLeft, TriangleAlert } from 'lucide-react'
import {
    getCurrentFair,
    getFairMovements,
    openFair,
} from '../../../../entities/fair'
import { useProduct } from '../../../../entities/product'
import TransferModal from './TransferModal'

// Hasta el 67e no hay cierre: el stock traspasado no vuelve a la web
const NO_CLOSE_WARNING =
    'El cierre de feria aún no existe: no abrir una feria real hasta tenerlo'

const MOVEMENT_TYPES = { transfer: 'Traspaso' }

// dd-mm-aaaa HH:mm en hora de Chile; "—" si la fecha falta o no es válida
const formatDateTime = (isoString) => {
    const date = new Date(isoString)
    if (!isoString || Number.isNaN(date.getTime())) return '—'
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat('es-CL', {
            timeZone: 'America/Santiago',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23',
        })
            .formatToParts(date)
            .map((part) => [part.type, part.value]),
    )
    return `${parts.day}-${parts.month}-${parts.year} ${parts.hour}:${parts.minute}`
}

const formatUnits = (n) => new Intl.NumberFormat('es-CL').format(n)

const WarningAlert = () => (
    <div className="alert alert-warning text-sm" role="alert">
        <TriangleAlert className="h-5 w-5 shrink-0" />
        <span>{NO_CLOSE_WARNING}</span>
    </div>
)

const OpenFairModal = ({ onClose, onOpened }) => {
    const [name, setName] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const trimmed = name.trim()
    const valid = trimmed.length >= 3 && trimmed.length <= 100

    const handleOpen = async () => {
        if (saving || !valid) return
        setSaving(true)
        setError(null)
        try {
            const fair = await openFair(trimmed)
            onOpened(fair)
        } catch (err) {
            setError(
                err.status
                    ? err.message
                    : 'No se pudo conectar con el servidor. Inténtalo de nuevo.',
            )
            setSaving(false)
        }
    }

    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <h3 className="text-lg font-bold">Abrir feria</h3>
                <div className="mt-3">
                    <WarningAlert />
                </div>
                <label className="form-control mt-4 w-full">
                    <span className="label-text mb-1 text-sm font-semibold">
                        Nombre de la feria
                    </span>
                    <input
                        className="input input-bordered w-full"
                        maxLength={100}
                        placeholder="Feria navideña 2026"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={saving}
                    />
                </label>
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
                        disabled={saving}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleOpen}
                        disabled={saving || !valid}
                    >
                        {saving ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            'Abrir feria'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

// Página "Feria" del panel (paso 67c-1): abrir la feria, traspasar stock
// de la web a la feria y ver el stock y el historial. Nunca muestra
// cost_price (el backend tampoco lo manda)
const FairPage = () => {
    const { getAdminProducts, getProducts } = useProduct()
    // { fair, stock, totalUnits }; null hasta la primera carga
    const [current, setCurrent] = useState(null)
    const [loadError, setLoadError] = useState(null)
    const [refreshing, setRefreshing] = useState(false)
    // Feria de lo que se muestra: el historial se reinicia solo si cambia
    const shownFairId = useRef(null)

    // Historial: los movimientos cargados y el before de la página siguiente
    const [history, setHistory] = useState({ items: [], nextBefore: null })
    const [historyLoading, setHistoryLoading] = useState(false)
    const [historyError, setHistoryError] = useState(null)

    const [isOpenModal, setIsOpenModal] = useState(false)
    const [isTransferModal, setIsTransferModal] = useState(false)

    const fair = current?.fair ?? null
    // Spinner de página completa solo en la primera carga
    const firstLoading = current === null && !loadError

    // Primera página (reemplaza) o la siguiente con "Cargar más" (agrega)
    const loadHistory = async (fairId, before = null) => {
        setHistoryLoading(true)
        setHistoryError(null)
        try {
            const data = await getFairMovements(fairId, { before })
            setHistory((prev) => ({
                items: before ? [...prev.items, ...data.movements] : data.movements,
                nextBefore: data.nextBefore,
            }))
        } catch (error) {
            setHistoryError(error.message)
        } finally {
            setHistoryLoading(false)
        }
    }

    // Recarga silenciosa de la misma feria: suma arriba los movimientos
    // nuevos y conserva lo ya cargado y "Cargar más". Si toda la primera
    // página es nueva, puede faltar un tramo entre lo nuevo y lo cargado:
    // entonces vuelve a la primera página
    const mergeLatestHistory = async (fairId) => {
        try {
            const data = await getFairMovements(fairId)
            setHistory((prev) => {
                const known = new Set(prev.items.map((m) => m._id))
                const fresh = data.movements.filter((m) => !known.has(m._id))
                if (fresh.length === data.movements.length) {
                    return { items: data.movements, nextBefore: data.nextBefore }
                }
                return { items: [...fresh, ...prev.items], nextBefore: prev.nextBefore }
            })
        } catch (error) {
            toast.error(`No se pudo actualizar el historial: ${error.message}`)
        }
    }

    // Primera carga con spinner; después, en silencio: lo que se ve se
    // reemplaza al terminar, sin vaciar la tabla ni el historial
    const loadFair = async () => {
        const firstLoad = current === null
        if (!firstLoad) setRefreshing(true)
        setLoadError(null)
        try {
            const data = await getCurrentFair()
            const nextFairId = data.fair?._id ?? null
            const fairChanged = nextFairId !== shownFairId.current
            shownFairId.current = nextFairId
            setCurrent(data)
            if (!nextFairId) setHistory({ items: [], nextBefore: null })
            else if (fairChanged) await loadHistory(nextFairId)
            else await mergeLatestHistory(nextFairId)
        } catch (error) {
            if (firstLoad) setLoadError(error.message)
            else toast.error(`No se pudo actualizar la feria: ${error.message}`)
        } finally {
            setRefreshing(false)
        }
    }

    useEffect(() => {
        loadFair()
    }, [])

    const handleOpened = (opened) => {
        setIsOpenModal(false)
        toast.success(`Feria «${opened.name}» abierta`)
        loadFair()
    }

    const handleTransferDone = (data) => {
        setIsTransferModal(false)
        if (data.replayed) toast.success('Ese traspaso ya estaba aplicado')
        else toast.success(`Traspaso hecho: ${data.lines.length} SKU`)
        loadFair()
        // Bajó el stock de la web: el dashboard y la tienda vuelven a pedirlo
        getAdminProducts()
        getProducts()
    }

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-6">
                <h1 className="flex items-center gap-2 text-2xl font-black text-base-content sm:text-3xl">
                    Feria
                    {refreshing && (
                        <span
                            className="loading loading-spinner loading-xs"
                            aria-label="Actualizando"
                        />
                    )}
                </h1>
                <p className="mt-1 text-sm text-base-content/60">
                    Stock de la feria y traspasos desde la web.
                </p>
            </div>

            <div className="mb-6">
                <WarningAlert />
            </div>

            {firstLoading && (
                <div className="py-12 text-center">
                    <span className="loading loading-spinner loading-md" />
                </div>
            )}

            {current === null && loadError && (
                <div className="alert alert-error justify-between" role="alert">
                    <span>{loadError}</span>
                    <button type="button" className="btn btn-sm" onClick={loadFair}>
                        Reintentar
                    </button>
                </div>
            )}

            {current !== null && !fair && (
                <div className="card border border-base-200 bg-base-100 shadow-sm">
                    <div className="card-body items-start">
                        <p className="text-sm text-base-content/70">
                            No hay ninguna feria abierta.
                        </p>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => setIsOpenModal(true)}
                        >
                            Abrir feria
                        </button>
                    </div>
                </div>
            )}

            {current !== null && fair && (
                <div className="flex flex-col gap-6">
                    <div className="card border border-base-200 bg-base-100 shadow-sm">
                        <div className="card-body gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <h2 className="break-words text-xl font-bold">
                                    {fair.name}
                                </h2>
                                <p className="text-sm text-base-content/60">
                                    Abierta el {formatDateTime(fair.openedAt)} ·{' '}
                                    {formatUnits(current.totalUnits)} unidades en la
                                    feria
                                </p>
                            </div>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => setIsTransferModal(true)}
                            >
                                <ArrowRightLeft className="h-4 w-4" />
                                Traspasar a la feria
                            </button>
                        </div>
                    </div>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold">
                            Stock de la feria
                        </h2>
                        {current.stock.length === 0 ? (
                            <p className="text-sm text-base-content/60">
                                Todavía no hay stock en la feria.
                            </p>
                        ) : (
                            <div className="overflow-x-auto rounded-box border border-base-content/10">
                                <table className="table">
                                    <thead>
                                        <tr className="bg-neutral text-neutral-content">
                                            <th>Producto</th>
                                            <th>Talla</th>
                                            <th>Color</th>
                                            <th>SKU</th>
                                            <th className="text-right">Feria</th>
                                            <th className="text-right">Web</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {current.stock.map((row) => (
                                            <tr key={row.sku} className="border-base-content/10">
                                                <td>{row.name ?? '—'}</td>
                                                <td>{row.size ?? '—'}</td>
                                                <td>{row.baseColor ?? '—'}</td>
                                                <td className="font-mono text-xs">{row.sku}</td>
                                                <td
                                                    className={`text-right font-bold ${row.fairStock < 0 ? 'text-error' : ''}`}
                                                >
                                                    {row.fairStock}
                                                </td>
                                                <td className="text-right">
                                                    {row.webStock ?? '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    <section>
                        <h2 className="mb-3 text-lg font-semibold">Historial</h2>
                        {historyError && (
                            <div className="alert alert-error mb-3 justify-between" role="alert">
                                <span>{historyError}</span>
                                <button
                                    type="button"
                                    className="btn btn-sm"
                                    onClick={() => loadHistory(fair._id, history.nextBefore)}
                                >
                                    Reintentar
                                </button>
                            </div>
                        )}
                        {history.items.length === 0 && !historyLoading && !historyError ? (
                            <p className="text-sm text-base-content/60">
                                Todavía no hay movimientos.
                            </p>
                        ) : (
                            <div className="overflow-x-auto rounded-box border border-base-content/10">
                                <table className="table table-sm">
                                    <thead>
                                        <tr className="bg-neutral text-neutral-content">
                                            <th>Fecha</th>
                                            <th>Tipo</th>
                                            <th>Producto</th>
                                            <th>SKU</th>
                                            <th className="text-right">Cantidad</th>
                                            <th className="text-right">Web después</th>
                                            <th className="text-right">Feria después</th>
                                            <th>Por</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.items.map((m) => (
                                            <tr key={m._id} className="border-base-content/10">
                                                <td className="whitespace-nowrap">
                                                    {formatDateTime(m.createdAt)}
                                                </td>
                                                <td>{MOVEMENT_TYPES[m.type] ?? m.type}</td>
                                                <td>{m.label}</td>
                                                <td className="font-mono text-xs">{m.sku}</td>
                                                <td className="text-right">
                                                    {m.fairDelta > 0 ? `+${m.fairDelta}` : m.fairDelta}
                                                </td>
                                                <td className="text-right">
                                                    {m.webStockAfter ?? '—'}
                                                </td>
                                                <td className="text-right">{m.fairStockAfter}</td>
                                                <td>{m.createdBy?.username ?? '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {historyLoading && (
                            <div className="py-4 text-center">
                                <span className="loading loading-spinner loading-sm" />
                            </div>
                        )}
                        {history.nextBefore && !historyLoading && (
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm mt-3"
                                onClick={() => loadHistory(fair._id, history.nextBefore)}
                            >
                                Cargar más
                            </button>
                        )}
                    </section>
                </div>
            )}

            {isOpenModal && (
                <OpenFairModal
                    onClose={() => setIsOpenModal(false)}
                    onOpened={handleOpened}
                />
            )}
            {isTransferModal && fair && (
                <TransferModal
                    fair={fair}
                    onClose={() => setIsTransferModal(false)}
                    onDone={handleTransferDone}
                />
            )}
        </div>
    )
}

export default FairPage
