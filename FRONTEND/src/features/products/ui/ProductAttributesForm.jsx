import { TbFileDescription, TbPhoto, TbCash, TbBox } from 'react-icons/tb'
import { useProductAttributes } from '../model/useProductAttributes'
import BasicInfoFields from './fields/BasicInfoFields'
import ClassificationFields from './fields/ClassificationFields'
import PhysicalAttributesFields from './fields/PhysicalAttributesFields'
import BrandIdentityFields from './fields/BrandIdentityFields'
import VariantsFields from './fields/VariantsFields'
import ImagesFields from './fields/ImagesFields'
import PricingFields from './fields/PricingFields'
import VisibilityFields from './fields/VisibilityFields'
import ProductFormModals from './modals/ProductFormModals'

const ProductAttributesForm = ({
    template,
    setTemplate,
    productCategories,
    designThemes,
    franchiseNames,
    sizeOptions,
    currentProductTypeOptions, // <-- Añadido aquí para que funcione la lista de Tipos
    onCreateTheme,
    onCreateFranchise,
}) => {
    const attributes = useProductAttributes({
        template,
        setTemplate,
        onCreateTheme,
        onCreateFranchise,
    })

    return (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            <div className="flex flex-col gap-6 lg:col-span-8">
                {/* 1. INFORMACIÓN PRINCIPAL */}
                <section className="card bg-base-100 shadow-sm ring-1 ring-base-200">
                    <div className="border-b border-base-200 px-6 py-4 flex items-center gap-2">
                        <TbFileDescription className="text-primary text-xl" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-base-content/80">
                            Información Principal
                        </h3>
                    </div>
                    <div className="card-body gap-5 p-6">
                        <BasicInfoFields
                            template={template}
                            setTemplate={setTemplate}
                        />
                    </div>
                </section>

                {/* 2. MULTIMEDIA */}
                <section className="card bg-base-100 shadow-sm ring-1 ring-base-200">
                    <div className="border-b border-base-200 px-6 py-4 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TbPhoto className="text-base-content/60 text-xl" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-base-content/80">
                                Imágenes
                            </h3>
                        </div>
                        {attributes.hasImages && (
                            <button
                                onClick={() =>
                                    attributes.setIsImageModalOpen(true)
                                }
                                className="btn btn-xs btn-outline btn-primary"
                            >
                                Editar Galería
                            </button>
                        )}
                    </div>
                    <div className="card-body p-6">
                        <ImagesFields
                            template={template}
                            hasImages={attributes.hasImages}
                            onOpenGallery={() =>
                                attributes.setIsImageModalOpen(true)
                            }
                        />
                    </div>
                </section>

                {/* 3. PRECIOS GLOBALES */}
                <section className="card bg-base-200/20 border border-base-200 shadow-sm">
                    <div className="border-b border-base-200 px-6 py-4 flex items-center gap-2">
                        <TbCash className="text-base-content/60 text-xl" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-base-content/80">
                            Precios Globales
                        </h3>
                    </div>
                    <div className="card-body gap-4 p-6 grid grid-cols-1 sm:grid-cols-3">
                        <PricingFields
                            template={template}
                            setTemplate={setTemplate}
                        />
                    </div>
                </section>

                {/* 4. VARIANTES (EL NUEVO CORAZÓN) */}
                <section className="card bg-base-100 border border-base-200 shadow-sm">
                    <div className="border-b border-base-200 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TbBox className="text-base-content/60 text-xl" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-base-content/80">
                                Variantes y Stock
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={attributes.addVariant}
                            className="btn btn-sm btn-primary btn-outline"
                        >
                            + Agregar Variante
                        </button>
                    </div>

                    <VariantsFields
                        template={template}
                        sizeOptions={sizeOptions}
                        handleVariantChange={attributes.handleVariantChange}
                        removeVariant={attributes.removeVariant}
                        autoGenerateSku={attributes.autoGenerateSku}
                        lastVariantRef={attributes.lastVariantRef}
                    />
                </section>
            </div>

            {/* COLUMNA DERECHA */}
            <div className="flex flex-col gap-6 lg:col-span-4">
                {/* ESTADO */}
                <section className="card bg-base-100 shadow-sm ring-1 ring-base-200">
                    <div className="border-b border-base-200 px-6 py-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-base-content/80">
                            Visibilidad
                        </h3>
                    </div>
                    <div className="card-body gap-4 p-6">
                        <VisibilityFields
                            template={template}
                            setTemplate={setTemplate}
                        />
                    </div>
                </section>

                {/* ORGANIZACIÓN Y TAXONOMÍA */}
                <section className="card bg-base-100 shadow-sm ring-1 ring-base-200">
                    <div className="border-b border-base-200 px-6 py-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-base-content/80">
                            Organización
                        </h3>
                    </div>
                    <div className="card-body gap-4 p-6">
                        <ClassificationFields
                            template={template}
                            setTemplate={setTemplate}
                            productCategories={productCategories}
                            currentProductTypeOptions={
                                currentProductTypeOptions
                            }
                        />
                        <PhysicalAttributesFields
                            template={template}
                            setTemplate={setTemplate}
                        />
                        <div className="divider my-0"></div>

                        <BrandIdentityFields
                            template={template}
                            setTemplate={setTemplate}
                            franchiseNames={franchiseNames}
                            designThemes={designThemes}
                            onOpenFranchiseModal={() =>
                                attributes.setIsFranchiseModalOpen(true)
                            }
                            onOpenThemeModal={() =>
                                attributes.setIsThemeModalOpen(true)
                            }
                        />
                    </div>
                </section>
            </div>

            {/* MODALES MANTENIDOS INTACTOS */}
            <ProductFormModals
                attributes={attributes}
                template={template}
                setTemplate={setTemplate}
            />
        </div>
    )
}

export default ProductAttributesForm
