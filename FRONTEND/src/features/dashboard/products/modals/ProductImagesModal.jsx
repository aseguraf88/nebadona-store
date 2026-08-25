import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { normalizeProductColorData } from '../../../../utils/colorUtils'

const MAX_COLORS = 4

export const COLOR_FAMILY_REFERENCE = [
    { name: 'Negro', hex: '#1a1a1a' },
    { name: 'Blanco', hex: '#ffffff' },
    { name: 'Gris', hex: '#9e9e9e' },
    { name: 'Rojo', hex: '#e53935' },
    { name: 'Azul', hex: '#1e88e5' },
    { name: 'Azul marino', hex: '#0d1b3e' },
    { name: 'Celeste', hex: '#81d4fa' },
    { name: 'Verde', hex: '#43a047' },
    { name: 'Amarillo', hex: '#fdd835' },
    { name: 'Naranja', hex: '#fb8c00' },
    { name: 'Rosa', hex: '#f48fb1' },
    { name: 'Fucsia', hex: '#e91e63' },
    { name: 'Morado', hex: '#8e24aa' },
    { name: 'Marrón', hex: '#6d4c41' },
    { name: 'Beige', hex: '#e8dcc4' },
    { name: 'Dorado', hex: '#c9a227' },
    { name: 'Plateado', hex: '#c0c0c0' },
]

const getContrastTextClass = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
    return luminance > 160 ? 'text-base-content' : 'text-base-100'
}

const ProductImagesModal = ({
    open,
    template,
    setTemplate,
    setDragIndex,
    handleDropImage,
    handleImageUpload,
    handleRemoveImage,
    onClose,
}) => {
    const [selectedColors, setSelectedColors] = useState([])
    const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false)

    // Inicializar colores desde el template al abrir el modal
    useEffect(() => {
        if (!open) return

        if (template.colors && template.colors.length > 0) {
            setSelectedColors(template.colors.map((c) => c.hex.toLowerCase()))
        } else if (template.color) {
            setSelectedColors([template.color.toLowerCase()])
        } else {
            setSelectedColors([])
        }
    }, [open, template.color, template.colors])

    const hasAppliedColors = Boolean(template.colors?.length)

    const handleToggleColor = (colorItem) => {
        const hex = colorItem.hex.toLowerCase()

        setSelectedColors((prev) => {
            if (prev.includes(hex)) {
                return prev.filter((c) => c !== hex)
            }
            if (prev.length >= MAX_COLORS) {
                toast.error(
                    `Solo puedes seleccionar hasta ${MAX_COLORS} colores.`,
                )
                return prev
            }
            return [...prev, hex]
        })
    }

    const handleApplyColorSelection = () => {
        if (selectedColors.length === 0) {
            setTemplate((prev) => ({
                ...prev,
                color: '',
                colors: [],
            }))
            toast.success('Colores limpiados del producto.')
            return
        }

        // Reconstruir el objeto de colores para el backend
        const mappedColors = selectedColors.map((hex, index) => {
            const reference = COLOR_FAMILY_REFERENCE.find(
                (c) => c.hex.toLowerCase() === hex,
            )
            return {
                name: reference ? reference.name : `Color ${index + 1}`,
                hex: hex,
                percentage: index === 0 ? 100 : 0,
                source: 'manual',
                selected: index === 0,
            }
        })

        const colorData = normalizeProductColorData({
            color: mappedColors[0].hex,
            colors: mappedColors,
            source: 'manual',
        })

        setTemplate((prev) => ({
            ...prev,
            color: colorData.color,
            colors: colorData.colors,
        }))

        toast.success('Colores aplicados exitosamente.')
    }

    const handleRequestClose = () => {
        // Lógica simple para saber si hay cambios sin guardar
        const templateHexes = (template.colors || [])
            .map((c) => c.hex.toLowerCase())
            .sort()
            .join(',')
        const currentHexes = [...selectedColors].sort().join(',')

        if (templateHexes !== currentHexes) {
            setIsCloseConfirmOpen(true)
            return
        }
        onClose()
    }

    if (!open) return null

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-3xl">
                <h3 className="text-lg font-bold">
                    Gestión de imágenes y colores
                </h3>
                <p className="py-2 text-sm text-base-content/70">
                    Carga las imágenes de tu producto y define los colores
                    disponibles en el catálogo.
                </p>

                {/* --- SECCIÓN 1: IMÁGENES --- */}
                <div className="flex flex-wrap items-center gap-3 mt-2">
                    <label className="btn btn-primary btn-sm cursor-pointer">
                        Cargar imágenes
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageUpload}
                        />
                    </label>
                    <span className="badge badge-outline">
                        {template.images?.length || 0}/6 cargadas
                    </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {template.images?.map((image, index) => (
                        <div
                            key={image.id}
                            className="card card-border relative p-2 bg-base-100"
                            draggable
                            onDragStart={() => setDragIndex(index)}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={() => handleDropImage(index)}
                        >
                            <img
                                src={image.src}
                                alt={`Preview ${index + 1}`}
                                className="h-28 w-full rounded-box object-cover"
                            />
                            <div className="mt-2 flex items-center justify-between">
                                <span className="badge badge-sm">
                                    #{index + 1}
                                </span>
                                <button
                                    type="button"
                                    className="btn btn-xs btn-error btn-outline"
                                    onClick={() => handleRemoveImage(image.id)}
                                >
                                    Quitar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- SECCIÓN 2: COLORES (NUEVO DISEÑO) --- */}
                <div className="collapse collapse-arrow mt-5 border border-base-300 bg-base-200/40">
                    <input type="checkbox" defaultChecked />
                    <div className="collapse-title">
                        <div className="flex items-center justify-between gap-2 pr-6">
                            <div>
                                <p className="font-semibold">
                                    Colores del producto
                                </p>
                                <p className="text-xs text-base-content/70">
                                    Selecciona hasta {MAX_COLORS} colores
                                    representativos.
                                </p>
                            </div>
                            <span
                                className={`badge ${hasAppliedColors ? 'badge-success' : 'badge-ghost'}`}
                            >
                                {hasAppliedColors ? 'Aplicados' : 'Opcional'}
                            </span>
                        </div>
                    </div>

                    <div className="collapse-content space-y-4">
                        <div className="flex flex-wrap gap-2 pt-2">
                            {COLOR_FAMILY_REFERENCE.map((color) => {
                                const isSelected = selectedColors.includes(
                                    color.hex.toLowerCase(),
                                )
                                const isPrimary =
                                    selectedColors[0] ===
                                    color.hex.toLowerCase()

                                return (
                                    <button
                                        key={color.hex}
                                        type="button"
                                        onClick={() => handleToggleColor(color)}
                                        className={`group relative flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition-all hover:scale-110 ${
                                            isSelected
                                                ? 'ring-2 ring-primary ring-offset-2 ring-offset-base-100'
                                                : 'border-base-300'
                                        }`}
                                        style={{ backgroundColor: color.hex }}
                                        title={color.name}
                                    >
                                        {isSelected && (
                                            <span
                                                className={`text-sm ${getContrastTextClass(color.hex)}`}
                                            >
                                                {isPrimary ? '1' : '✓'}
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t border-base-300 pt-4">
                            <button
                                type="button"
                                className="btn btn-sm btn-ghost"
                                onClick={() => setSelectedColors([])}
                                disabled={selectedColors.length === 0}
                            >
                                Limpiar selección
                            </button>
                            <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                onClick={handleApplyColorSelection}
                            >
                                Guardar Colores
                            </button>
                        </div>
                    </div>
                </div>

                <div className="modal-action">
                    <button
                        type="button"
                        className="btn"
                        onClick={handleRequestClose}
                    >
                        Cerrar panel
                    </button>
                </div>
            </div>

            {/* --- MODAL CONFIRMACIÓN CIERRE --- */}
            {isCloseConfirmOpen && (
                <div className="modal modal-open z-[100]">
                    <div className="modal-box max-w-md shadow-2xl">
                        <h4 className="text-lg font-semibold text-warning">
                            Cambios sin guardar
                        </h4>
                        <p className="mt-2 text-sm text-base-content/80">
                            Has modificado los colores pero no le diste a
                            "Guardar Colores". ¿Estás seguro de que quieres
                            cerrar y perder los cambios?
                        </p>
                        <div className="modal-action">
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => setIsCloseConfirmOpen(false)}
                            >
                                Volver
                            </button>
                            <button
                                type="button"
                                className="btn btn-error"
                                onClick={() => {
                                    setIsCloseConfirmOpen(false)
                                    onClose()
                                }}
                            >
                                Sí, cerrar igual
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </dialog>
    )
}

export default ProductImagesModal
