import { useState } from 'react'

const NewProductCategoryModal = ({ isOpen, onClose, categories, onContinue }) => {
    const [selectedCategory, setSelectedCategory] = useState('')

    // Si el modal no está abierto, no renderizamos nada
    if (!isOpen) return null

    const handleClose = () => {
        setSelectedCategory('') // Arranca limpio la próxima vez
        onClose()
    }

    const handleContinue = (e) => {
        e.preventDefault()
        if (!selectedCategory) return
        onContinue(selectedCategory)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-base-100 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative">
                {/* Botón de cerrar superior derecho */}
                <button
                    onClick={handleClose}
                    className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
                >
                    ✕
                </button>

                <h3 className="text-lg font-bold text-base-content mb-4">
                    Nuevo producto
                </h3>

                <form onSubmit={handleContinue} className="flex flex-col gap-4">
                    <label className="form-control w-full">
                        <div className="label">
                            <span className="label-text font-semibold">
                                Categoría{' '}
                                <span className="text-error">*</span>
                            </span>
                        </div>
                        <select
                            className="select select-bordered w-full bg-base-100"
                            value={selectedCategory}
                            onChange={(e) =>
                                setSelectedCategory(e.target.value.toLowerCase())
                            }
                            autoFocus
                        >
                            <option value="">Selecciona...</option>
                            {categories?.map((item) => (
                                <option
                                    key={item._id}
                                    value={item.name.toLowerCase()}
                                >
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="btn btn-ghost"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedCategory}
                            className="btn btn-primary text-white"
                        >
                            Continuar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default NewProductCategoryModal
