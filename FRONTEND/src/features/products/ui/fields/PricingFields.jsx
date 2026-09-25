const PricingFields = ({ template, setTemplate }) => (
    <>
        <label className="form-control w-full">
            <div className="label">
                <span className="label-text font-semibold">
                    Precio Base ($){' '}
                    <span className="text-error">*</span>
                </span>
            </div>
            <input
                type="number"
                className="input input-bordered w-full font-bold text-base-content"
                value={
                    template.price === '0000'
                        ? ''
                        : template.price
                }
                onChange={(e) =>
                    setTemplate((prev) => ({
                        ...prev,
                        price: e.target.value,
                    }))
                }
            />
        </label>
        <label className="form-control w-full">
            <div className="label">
                <span className="label-text font-semibold">
                    Precio Oferta ($)
                </span>
            </div>
            <input
                type="number"
                className="input input-bordered w-full text-error"
                value={template.compareAtPrice}
                onChange={(e) =>
                    setTemplate((prev) => ({
                        ...prev,
                        compareAtPrice: e.target.value,
                    }))
                }
            />
        </label>
        <label className="form-control w-full">
            <div className="label">
                <span className="label-text font-semibold">
                    Costo Bodega ($)
                </span>
            </div>
            <input
                type="number"
                className="input input-bordered w-full text-success"
                value={template.cost_price}
                onChange={(e) =>
                    setTemplate((prev) => ({
                        ...prev,
                        cost_price: e.target.value,
                    }))
                }
            />
        </label>
    </>
)

export default PricingFields
