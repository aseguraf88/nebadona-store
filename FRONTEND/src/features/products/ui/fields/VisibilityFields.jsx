const VisibilityFields = ({ template, setTemplate }) => (
    <>
        <label className="form-control w-full mb-2">
            <div className="label">
                <span className="label-text font-semibold">
                    Estado de Publicación
                </span>
            </div>
            <select
                className={`select select-bordered w-full font-bold ${template.status === 'PUBLISHED' ? 'text-success' : 'text-warning'}`}
                value={template.status}
                onChange={(e) =>
                    setTemplate((prev) => ({
                        ...prev,
                        status: e.target.value,
                    }))
                }
            >
                <option value="DRAFT">Borrador (Oculto)</option>
                <option value="PUBLISHED">
                    Publicado (Visible)
                </option>
            </select>
        </label>

        <label className="flex cursor-pointer items-center justify-between gap-3 border-t border-base-200 pt-4">
            <span className="label-text font-medium text-base-content/80">
                Destacado
            </span>
            <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                checked={Boolean(template.featured)}
                onChange={(e) =>
                    setTemplate((prev) => ({
                        ...prev,
                        featured: e.target.checked,
                    }))
                }
            />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3">
            <span className="label-text font-medium text-base-content/80">
                Popular
            </span>
            <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                checked={Boolean(template.popular)}
                onChange={(e) =>
                    setTemplate((prev) => ({
                        ...prev,
                        popular: e.target.checked,
                    }))
                }
            />
        </label>
    </>
)

export default VisibilityFields
