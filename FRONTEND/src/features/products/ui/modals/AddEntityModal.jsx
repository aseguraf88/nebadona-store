import { useState } from 'react'

const AddEntityModal = ({ isOpen, onClose, onSave, title, placeholder }) => {
    const [inputValue, setInputValue] = useState('')

    // Si el modal no está abierto, no renderizamos nada
    if (!isOpen) return null

    const handleSave = (e) => {
        e.preventDefault()
        // Evitar guardar textos vacíos
        if (inputValue.trim().length === 0) return

        onSave(inputValue.trim())
        setInputValue('') // Limpiamos el input para la próxima vez
        onClose() // Cerramos el modal
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-base-100 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative">
                {/* Botón de cerrar superior derecho */}
                <button
                    onClick={onClose}
                    className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
                >
                    ✕
                </button>

                <h3 className="text-lg font-bold text-base-content mb-4">
                    {title}
                </h3>

                <form onSubmit={handleSave} className="flex flex-col gap-4">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={placeholder}
                        className="input input-bordered w-full focus:input-primary"
                        autoFocus
                    />

                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-ghost"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!inputValue.trim()}
                            className="btn btn-primary text-white"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddEntityModal
