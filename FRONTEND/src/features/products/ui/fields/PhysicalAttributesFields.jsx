const PhysicalAttributesFields = ({ template, setTemplate }) => (
    <>
        <label className="form-control w-full">
            <div className="label">
                <span className="label-text font-semibold">
                    Material
                </span>
            </div>
            <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Ej. Algodón"
                value={template.material || ''}
                onChange={(e) =>
                    setTemplate((prev) => ({
                        ...prev,
                        material: e.target.value,
                    }))
                }
            />
        </label>
        <label className="form-control w-full">
            <div className="label">
                <span className="label-text font-semibold">
                    Tipo de Calce
                </span>
            </div>
            <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Ej. Regular, Oversize"
                value={template.fit_type || ''}
                onChange={(e) =>
                    setTemplate((prev) => ({
                        ...prev,
                        fit_type: e.target.value,
                    }))
                }
            />
        </label>
        <label className="form-control w-full">
            <div className="label">
                <span className="label-text font-semibold">
                    Técnica de Decoración
                </span>
            </div>
            <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Ej. Bordado, Estampado"
                value={template.decoration_technique || ''}
                onChange={(e) =>
                    setTemplate((prev) => ({
                        ...prev,
                        decoration_technique: e.target.value,
                    }))
                }
            />
        </label>
        <label className="form-control w-full">
            <div className="label">
                <span className="label-text font-semibold">
                    Especificaciones
                </span>
            </div>
            <textarea
                className="textarea textarea-bordered h-20 w-full"
                placeholder="Ej. Cuello redondo, puños elasticados, bolsillo canguro"
                maxLength={500}
                value={template.specifications || ''}
                onChange={(e) =>
                    setTemplate((prev) => ({
                        ...prev,
                        specifications: e.target.value,
                    }))
                }
            />
        </label>
    </>
)

export default PhysicalAttributesFields
