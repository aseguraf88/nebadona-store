import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

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
    // Aquí guardaremos el respaldo exacto de cómo entraron las imágenes
    const [initialImages, setInitialImages] = useState([])
    const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false)

    // Capturamos el estado original solo cuando el modal se abre
    useEffect(() => {
        if (open) {
            setInitialImages([...template.images])
        }
    }, [open])

    const handleApply = () => {
        if (template.images?.length > 0) {
            toast.success('Imágenes listas en el borrador')
        } else {
            toast('No cargaste ninguna imagen', { icon: 'ℹ️' })
        }
        onClose()
    }

    const handleRequestClose = () => {
        // Comparamos los IDs originales con los actuales
        const initialIds = initialImages.map((img) => img.id).join(',')
        const currentIds = template.images.map((img) => img.id).join(',')

        if (initialIds !== currentIds) {
            setIsCloseConfirmOpen(true)
            return
        }
        onClose()
    }

    const handleRevertAndClose = () => {
        // ¡Magia! Si cancelas, restauramos las imágenes a como estaban antes
        setTemplate((prev) => ({ ...prev, images: initialImages }))
        setIsCloseConfirmOpen(false)
        onClose()
    }

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (open && !isCloseConfirmOpen && e.key === 'Escape') {
                e.preventDefault()
                handleRequestClose()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [open, isCloseConfirmOpen, initialImages, template.images])

    const moveImage = (fromIndex, toIndex) => {
        if (toIndex < 0 || toIndex >= template.images.length) return
        setTemplate((prev) => {
            const reordered = [...prev.images]
            const [moved] = reordered.splice(fromIndex, 1)
            reordered.splice(toIndex, 0, moved)
            return { ...prev, images: reordered }
        })
    }

    if (!open) return null

    return (
        <div className="modal modal-open z-50">
            <div className="modal-box max-w-3xl bg-base-100">
                <button
                    type="button"
                    className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
                    onClick={handleRequestClose}
                >
                    ✕
                </button>

                <h3 className="text-lg font-bold">📸 Gestión de Imágenes</h3>

                {/* Textos dinámicos dependiendo de la pantalla */}
                <p className="py-2 text-sm text-base-content/70 hidden sm:block">
                    Carga las imágenes de tu producto y ordénalas
                    arrastrándolas.
                </p>
                <p className="py-2 text-sm text-base-content/70 sm:hidden">
                    Carga las imágenes y ordénalas usando las flechas
                    inferiores.
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-4">
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

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 bg-base-200/30 p-4 rounded-2xl border border-base-200">
                    {template.images?.length > 0 ? (
                        template.images.map((image, index) => (
                            <div
                                key={image.id}
                                className="relative bg-base-100 border border-base-200 rounded-xl shadow-sm hover:shadow-md cursor-move overflow-hidden transition-all group"
                                draggable
                                onDragStart={() => setDragIndex(index)}
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={() => handleDropImage(index)}
                            >
                                {/* Badge de Número Superior Izquierdo */}
                                <div className="absolute top-2 left-2 z-10">
                                    <span className="badge badge-sm badge-neutral shadow-sm font-bold opacity-80">
                                        {index + 1}
                                    </span>
                                </div>

                                {/* Botón X Superior Derecho */}
                                <button
                                    type="button"
                                    className="absolute top-2 right-2 btn btn-xs btn-circle btn-error shadow-sm z-10 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleRemoveImage(image.id)}
                                >
                                    ✕
                                </button>

                                {/* En móvil damos un padding inferior mayor para que no se superponga con la barra de mover */}
                                <img
                                    src={image.src}
                                    alt={`Preview ${index + 1}`}
                                    className="h-32 w-full object-contain p-2 pb-8 sm:pb-2"
                                />

                                {/* Barra < MOVER > Inferior (Solo Móvil) */}
                                <div className="absolute bottom-0 left-0 w-full bg-base-200/90 backdrop-blur-sm flex justify-between items-center px-2 py-1 sm:hidden border-t border-base-300">
                                    <button
                                        type="button"
                                        className="btn btn-xs btn-circle btn-ghost"
                                        disabled={index === 0}
                                        onClick={() =>
                                            moveImage(index, index - 1)
                                        }
                                    >
                                        ◀
                                    </button>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-base-content/60">
                                        Mover
                                    </span>
                                    <button
                                        type="button"
                                        className="btn btn-xs btn-circle btn-ghost"
                                        disabled={
                                            index === template.images.length - 1
                                        }
                                        onClick={() =>
                                            moveImage(index, index + 1)
                                        }
                                    >
                                        ▶
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-10 text-center border-2 border-dashed border-base-300 rounded-2xl text-base-content/50">
                            No hay imágenes cargadas aún.
                        </div>
                    )}
                </div>

                <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <button
                        type="button"
                        className="btn btn-ghost w-full sm:w-auto"
                        onClick={handleRequestClose}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary w-full sm:w-auto"
                        onClick={handleApply}
                    >
                        Aplicar
                    </button>
                </div>
            </div>

            {/* --- MODAL CONFIRMACIÓN CIERRE --- */}
            {isCloseConfirmOpen && (
                <div className="modal modal-open z-[100]">
                    <div className="modal-box max-w-md shadow-2xl">
                        <h4 className="text-lg font-semibold text-warning">
                            ⚠️ Cambios sin aplicar
                        </h4>
                        <p className="mt-2 text-sm text-base-content/80">
                            Agregaste, quitaste o reordenaste imágenes pero no
                            le diste a "Aplicar". Si cierras ahora, tus cambios
                            se descartarán.
                        </p>
                        <div className="modal-action flex-col-reverse sm:flex-row">
                            <button
                                type="button"
                                className="btn btn-ghost w-full sm:w-auto"
                                onClick={() => setIsCloseConfirmOpen(false)}
                            >
                                Volver a editar
                            </button>
                            <button
                                type="button"
                                className="btn btn-error w-full sm:w-auto"
                                onClick={handleRevertAndClose} // Llama a la función de restaurar
                            >
                                Descartar cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductImagesModal
