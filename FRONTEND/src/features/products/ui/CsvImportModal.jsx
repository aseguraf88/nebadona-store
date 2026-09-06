import { useState } from 'react'
import toast from 'react-hot-toast'

export const CsvImportModal = ({ open, onClose, onSuccess }) => {
    const [file, setFile] = useState(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadSummary, setUploadSummary] = useState(null)

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (
            selectedFile &&
            selectedFile.type !== 'text/csv' &&
            !selectedFile.name.endsWith('.csv')
        ) {
            toast.error('Por favor selecciona un archivo con extensión .csv')
            return
        }
        setFile(selectedFile)
        setUploadSummary(null)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        const droppedFile = e.dataTransfer.files[0]
        if (
            droppedFile &&
            (droppedFile.type === 'text/csv' ||
                droppedFile.name.endsWith('.csv'))
        ) {
            setFile(droppedFile)
            setUploadSummary(null)
        } else {
            toast.error('El archivo debe ser formato CSV')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!file) return

        setIsUploading(true)
        setUploadSummary(null)

        const formData = new FormData()
        formData.append('file', file)

        try {
            // 1. Apuntamos explícitamente al puerto 3001
            const response = await fetch(
                'http://localhost:3001/api/products/import',
                {
                    method: 'POST',
                    // 2. Fundamental para que Express lea tu cookie de sesión/admin
                    credentials: 'include',
                    body: formData,
                },
            )

            // Validación de seguridad para evitar que colapse si el server devuelve un HTML por error
            const contentType = response.headers.get('content-type')
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error(
                    `Error del servidor (Status: ${response.status}). Ruta no encontrada o problema interno.`,
                )
            }

            const data = await response.json()

            if (response.ok || response.status === 207) {
                toast.success(data.message || 'Importación procesada')
                setUploadSummary(data)
                if (onSuccess) onSuccess()
            } else {
                toast.error(data.message || 'Error al importar el archivo')
            }
        } catch (error) {
            console.error('Error importando CSV:', error)
            toast.error(
                error.message || 'Error de conexión al enviar el archivo.',
            )
        } finally {
            setIsUploading(false)
        }
    }

    const handleCloseModal = () => {
        setFile(null)
        setUploadSummary(null)
        setIsUploading(false)
        onClose()
    }

    if (!open) return null

    return (
        <dialog className="modal modal-open modal-bottom sm:modal-middle bg-base-300/80 backdrop-blur-sm">
            <div className="modal-box bg-base-100 border border-base-200 shadow-xl max-w-md p-6">
                <button
                    onClick={handleCloseModal}
                    className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
                >
                    ✕
                </button>

                <h3 className="text-lg font-bold text-base-content flex items-center gap-2 mb-4">
                    <i className="ti ti-file-upload text-primary text-xl" />
                    Importar Inventario Masivo (.csv)
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Zona Drag & Drop */}
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        className="border-2 border-dashed border-base-300 hover:border-primary/50 bg-base-200/30 rounded-xl p-6 text-center cursor-pointer transition-colors relative"
                    >
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <i className="ti ti-cloud-upload text-4xl text-primary mb-2 block" />
                        {file ? (
                            <div className="text-sm font-semibold text-success flex items-center justify-center gap-1">
                                <i className="ti ti-file-text" />
                                {file.name}
                            </div>
                        ) : (
                            <>
                                <p className="text-sm font-bold text-base-content">
                                    Haz clic o arrastra tu archivo CSV aquí
                                </p>
                                <p className="text-xs text-base-content/50 mt-1">
                                    Columnas esperadas: Nombre, Categoría,
                                    Stock, Precio, Talla, Color, Franquicia,
                                    Personaje, Tema
                                </p>
                            </>
                        )}
                    </div>

                    {/* Resumen de carga */}
                    {uploadSummary && (
                        <div className="p-3 bg-base-200 rounded-lg text-xs space-y-1 border border-base-300">
                            <p className="font-bold text-base-content">
                                Registros importados:{' '}
                                {uploadSummary.totalImported || 0}
                            </p>
                            {uploadSummary.errors?.length > 0 && (
                                <div className="text-error font-medium">
                                    <p>
                                        Advertencias/Errores (
                                        {uploadSummary.errors.length}):
                                    </p>
                                    <ul className="list-disc pl-4 max-h-24 overflow-y-auto mt-1">
                                        {uploadSummary.errors.map(
                                            (err, idx) => (
                                                <li key={idx}>{err}</li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={handleCloseModal}
                            disabled={isUploading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary btn-sm gap-2"
                            disabled={!file || isUploading}
                        >
                            {isUploading && (
                                <span className="loading loading-spinner loading-xs" />
                            )}
                            Procesar e Importar
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    )
}
