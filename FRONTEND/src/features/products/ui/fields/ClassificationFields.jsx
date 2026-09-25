const ClassificationFields = ({
    template,
    setTemplate,
    productCategories,
    currentProductTypeOptions,
}) => (
    <>
        <label className="form-control w-full">
            <div className="label">
                <span className="label-text font-semibold">
                    Categoría{' '}
                    <span className="text-error">*</span>
                </span>
            </div>
            <select
                className="select select-bordered w-full bg-base-100"
                value={
                    template.product_category?.toLowerCase() ||
                    ''
                }
                onChange={(e) =>
                    setTemplate((prev) => ({
                        ...prev,
                        product_category:
                            e.target.value.toLowerCase(),
                        sock_type: '', // Resetea el tipo si cambia la categoría
                    }))
                }
            >
                <option value="">Selecciona...</option>
                {productCategories?.map((item) => (
                    <option
                        key={item._id}
                        value={item.name.toLowerCase()}
                    >
                        {item.name}
                    </option>
                ))}
            </select>
        </label>

        {/* --- AQUÍ VOLVIÓ EL TIPO --- */}
        <label className="form-control w-full animate-fadeIn">
            <div className="label">
                <span className="label-text font-semibold text-base-content/80">
                    Tipo
                </span>
            </div>
            <select
                className="select select-bordered w-full bg-base-100"
                value={template.sock_type}
                onChange={(e) =>
                    setTemplate((prev) => ({
                        ...prev,
                        sock_type: e.target.value,
                    }))
                }
                disabled={!template.product_category}
            >
                <option value="">
                    {template.product_category
                        ? 'Selecciona tipo...'
                        : 'Requiere categoría'}
                </option>
                {currentProductTypeOptions?.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </label>
        {/* --------------------------- */}

        <label className="form-control w-full">
            <div className="label">
                <span className="label-text font-semibold">
                    Género
                </span>
            </div>
            <select
                className="select select-bordered w-full bg-base-100"
                value={template.gender}
                onChange={(e) =>
                    setTemplate((prev) => ({
                        ...prev,
                        gender: e.target.value,
                    }))
                }
            >
                <option value="unisex">Unisex</option>
                <option value="men">Hombre</option>
                <option value="women">Mujer</option>
                <option value="kids">Niños</option>
            </select>
        </label>
    </>
)

export default ClassificationFields
