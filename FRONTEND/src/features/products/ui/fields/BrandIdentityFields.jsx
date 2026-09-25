import { TbPlus } from 'react-icons/tb'

const BrandIdentityFields = ({
    template,
    setTemplate,
    franchiseNames,
    designThemes,
    onOpenFranchiseModal,
    onOpenThemeModal,
}) => (
    <>
        <label className="form-control w-full">
            <div className="label w-full flex justify-between items-center pr-1">
                <span className="label-text font-semibold">
                    Franquicia
                </span>
                <button
                    type="button"
                    className="btn btn-xs btn-circle btn-ghost text-primary"
                    onClick={onOpenFranchiseModal}
                >
                    <TbPlus />
                </button>
            </div>
            <select
                className="select select-bordered w-full"
                value={
                    template.franchise_name?.toLowerCase() || ''
                }
                onChange={(e) =>
                    setTemplate((prev) => ({
                        ...prev,
                        franchise_name:
                            e.target.value.toLowerCase(),
                    }))
                }
            >
                <option value="">Opcional...</option>
                {franchiseNames?.map((item) => (
                    <option
                        key={item._id}
                        value={item.name.toLowerCase()}
                    >
                        {item.name}
                    </option>
                ))}
            </select>
        </label>
        <label className="form-control w-full">
            <div className="label">
                <span className="label-text font-semibold">
                    Personaje
                </span>
            </div>
            <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Ej. Goku..."
                value={template.character_name || ''}
                onChange={(e) =>
                    setTemplate((prev) => ({
                        ...prev,
                        character_name: e.target.value,
                    }))
                }
                disabled={!template.franchise_name}
            />
        </label>
        <label className="form-control w-full">
            <div className="label w-full flex justify-between items-center pr-1">
                <span className="label-text font-semibold">
                    Tema
                </span>
                <button
                    type="button"
                    className="btn btn-xs btn-circle btn-ghost text-primary"
                    onClick={onOpenThemeModal}
                >
                    <TbPlus />
                </button>
            </div>
            <select
                className="select select-bordered w-full"
                value={
                    template.design_theme?.toLowerCase() || ''
                }
                onChange={(e) =>
                    setTemplate((prev) => ({
                        ...prev,
                        design_theme:
                            e.target.value.toLowerCase(),
                    }))
                }
            >
                <option value="">Opcional...</option>
                {designThemes?.map((item) => (
                    <option
                        key={item._id}
                        value={item.name.toLowerCase()}
                    >
                        {item.name}
                    </option>
                ))}
            </select>
        </label>
        <label className="form-control w-full">
            <div className="label">
                <span className="label-text font-semibold">
                    Etiquetas (Tags)
                </span>
            </div>
            <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Ej: anime, regalo..."
                value={template.tags}
                onChange={(e) =>
                    setTemplate((prev) => ({
                        ...prev,
                        tags: e.target.value,
                    }))
                }
            />
        </label>
    </>
)

export default BrandIdentityFields
