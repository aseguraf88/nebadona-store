const BasicInfoFields = ({ template, setTemplate }) => (
    <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="form-control w-full">
                <div className="label">
                    <span className="label-text font-semibold text-base-content/80">
                        Handle (Cód. Agrupador){' '}
                        <span className="text-error">*</span>
                    </span>
                </div>
                <input
                    type="text"
                    className="input input-bordered w-full bg-base-100/50 uppercase font-mono tracking-widest"
                    placeholder="Ej. POL-SPI-01"
                    value={template.handle}
                    onChange={(e) =>
                        setTemplate((prev) => ({
                            ...prev,
                            handle: e.target.value.toUpperCase(),
                        }))
                    }
                />
            </label>
            <label className="form-control w-full">
                <div className="label">
                    <span className="label-text font-semibold text-base-content/80">
                        Título del Producto{' '}
                        <span className="text-error">*</span>
                    </span>
                </div>
                <input
                    type="text"
                    className="input input-bordered w-full bg-base-100/50"
                    placeholder="Ej. Polera de Goku..."
                    value={
                        template.title === 'Titulo'
                            ? ''
                            : template.title
                    }
                    onChange={(e) =>
                        setTemplate((prev) => ({
                            ...prev,
                            title: e.target.value,
                        }))
                    }
                />
            </label>
        </div>
        <label className="form-control w-full">
            <div className="label">
                <span className="label-text font-semibold text-base-content/80">
                    Descripción
                </span>
            </div>
            <textarea
                className="textarea textarea-bordered h-24 bg-base-100/50"
                placeholder="Añade detalles, medidas..."
                value={
                    template.description ===
                    'Producto editable desde dashboard. Descripcion base para crear o editar productos sin bloquear el guardado.'
                        ? ''
                        : template.description
                }
                onChange={(e) =>
                    setTemplate((prev) => ({
                        ...prev,
                        description: e.target.value,
                    }))
                }
            />
        </label>
    </>
)

export default BasicInfoFields
