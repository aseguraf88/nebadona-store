import { isSockCategory } from '../../../../entities/product'
import { getSizeStandardsForGender } from '../../../../entities/product/config/sizeStandardOptions'

// Opción vacía: el campo es opcional y un radio no se puede desmarcar
const NO_STANDARD_OPTION = { id: '', label: 'Sin estándar', euRange: null }

const SizeStandardFields = ({ template, setTemplate }) => {
    if (!isSockCategory(template.product_category)) return null

    const options = [
        NO_STANDARD_OPTION,
        ...getSizeStandardsForGender(template.gender),
    ]
    const selected = template.size_standard || ''

    return (
        <fieldset className="form-control w-full">
            <legend className="label">
                <span className="label-text font-semibold">
                    Estándar de talla
                </span>
            </legend>
            <div className="flex flex-col gap-2">
                {options.map((option) => (
                    <div key={option.id || 'none'}>
                        <label className="flex cursor-pointer items-start gap-3">
                            <input
                                type="radio"
                                name="size_standard"
                                className="radio radio-primary radio-sm mt-0.5"
                                value={option.id}
                                checked={selected === option.id}
                                onChange={() =>
                                    setTemplate((prev) => ({
                                        ...prev,
                                        size_standard: option.id,
                                        // El rango solo vale para Talla Única
                                        ...(option.id !== 'personalizado' && {
                                            size_range_min: '',
                                            size_range_max: '',
                                        }),
                                    }))
                                }
                            />
                            <span className="flex flex-1 justify-between gap-2 text-sm">
                                <span className="font-semibold">
                                    {option.label}
                                </span>
                                {option.euRange && (
                                    <span className="text-base-content/60">
                                        EU {option.euRange}
                                    </span>
                                )}
                            </span>
                        </label>

                        {option.id === 'personalizado' &&
                            selected === 'personalizado' && (
                                <div className="ml-7 mt-2 grid grid-cols-2 gap-3">
                                    <label className="form-control w-full">
                                        <span className="label-text text-xs font-semibold text-base-content/60 mb-1">
                                            Mínimo (EU)
                                        </span>
                                        <input
                                            type="number"
                                            className="input input-sm input-bordered w-full"
                                            min={15}
                                            max={49}
                                            step={1}
                                            placeholder="Ej. 36"
                                            value={template.size_range_min}
                                            onChange={(e) =>
                                                setTemplate((prev) => ({
                                                    ...prev,
                                                    size_range_min:
                                                        e.target.value,
                                                }))
                                            }
                                        />
                                    </label>
                                    <label className="form-control w-full">
                                        <span className="label-text text-xs font-semibold text-base-content/60 mb-1">
                                            Máximo (EU)
                                        </span>
                                        <input
                                            type="number"
                                            className="input input-sm input-bordered w-full"
                                            min={15}
                                            max={49}
                                            step={1}
                                            placeholder="Ej. 42"
                                            value={template.size_range_max}
                                            onChange={(e) =>
                                                setTemplate((prev) => ({
                                                    ...prev,
                                                    size_range_max:
                                                        e.target.value,
                                                }))
                                            }
                                        />
                                    </label>
                                </div>
                            )}

                        {option.id === 'internacional' &&
                            selected === 'internacional' && (
                                <p className="ml-7 mt-1 text-xs text-base-content/60">
                                    Las tallas de este producto se definen en
                                    Variantes y Stock.
                                </p>
                            )}
                    </div>
                ))}
            </div>
        </fieldset>
    )
}

export default SizeStandardFields
