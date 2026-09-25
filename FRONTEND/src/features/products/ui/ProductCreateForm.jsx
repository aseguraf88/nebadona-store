import {
    TbFileDescription,
    TbCategory,
    TbNeedleThread,
    TbTags,
    TbBox,
    TbPhoto,
    TbCash,
    TbEye,
    TbCircleCheckFilled,
    TbCircleDashed,
} from 'react-icons/tb'
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

/**
 * Acordeón independiente (checkbox, no radio): cada sección se abre y
 * cierra sola. min-w-0 en los dos niveles, regla de DaisyUI de CLAUDE.md.
 * isComplete solo se pasa en las secciones con campo obligatorio.
 */
const AccordionSection = ({
    icon: Icon,
    title,
    isComplete,
    defaultOpen = false,
    children,
}) => (
    <div className="collapse collapse-plus bg-base-100 border border-base-200 rounded-xl min-w-0">
        <input type="checkbox" defaultChecked={defaultOpen} />
        <div className="collapse-title text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
            <Icon className="text-base-content/60 text-xl" />
            {title}
            {isComplete !== undefined &&
                (isComplete ? (
                    <TbCircleCheckFilled
                        className="text-success text-lg"
                        role="img"
                        aria-label="Sección completa"
                    />
                ) : (
                    <TbCircleDashed
                        className="text-base-content/30 text-lg"
                        role="img"
                        aria-label="Falta un campo obligatorio"
                    />
                ))}
        </div>
        <div className="collapse-content min-w-0">{children}</div>
    </div>
)

const ProductCreateForm = ({
    template,
    setTemplate,
    productCategories,
    designThemes,
    franchiseNames,
    sizeOptions,
    currentProductTypeOptions,
    onCreateTheme,
    onCreateFranchise,
}) => {
    const attributes = useProductAttributes({
        template,
        setTemplate,
        onCreateTheme,
        onCreateFranchise,
    })

    // Mismos criterios que isFormValid en useProductForm
    const isBasicInfoComplete = Boolean(
        template.title &&
            template.title !== 'Titulo' &&
            template.title.trim() !== '',
    )
    const isClassificationComplete = Boolean(template.product_category)
    const isPricingComplete = Boolean(
        template.price &&
            template.price !== '0000' &&
            String(template.price).trim() !== '',
    )

    return (
        <div className="flex flex-col gap-4">
            <AccordionSection
                icon={TbFileDescription}
                title="Información básica"
                isComplete={isBasicInfoComplete}
                defaultOpen
            >
                <div className="flex flex-col gap-5">
                    <BasicInfoFields
                        template={template}
                        setTemplate={setTemplate}
                    />
                </div>
            </AccordionSection>

            <AccordionSection
                icon={TbCategory}
                title="Clasificación"
                isComplete={isClassificationComplete}
                defaultOpen
            >
                <div className="flex flex-col gap-4">
                    <ClassificationFields
                        template={template}
                        setTemplate={setTemplate}
                        productCategories={productCategories}
                        currentProductTypeOptions={currentProductTypeOptions}
                    />
                </div>
            </AccordionSection>

            <AccordionSection icon={TbNeedleThread} title="Atributos físicos">
                <div className="flex flex-col gap-4">
                    <PhysicalAttributesFields
                        template={template}
                        setTemplate={setTemplate}
                    />
                </div>
            </AccordionSection>

            <AccordionSection icon={TbTags} title="Identidad y marca">
                <div className="flex flex-col gap-4">
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
            </AccordionSection>

            <AccordionSection icon={TbBox} title="Variantes y Stock">
                <div className="flex justify-end mb-3">
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
            </AccordionSection>

            <AccordionSection icon={TbPhoto} title="Imágenes">
                {attributes.hasImages && (
                    <div className="flex justify-end mb-3">
                        <button
                            type="button"
                            onClick={() => attributes.setIsImageModalOpen(true)}
                            className="btn btn-xs btn-outline btn-primary"
                        >
                            Editar Galería
                        </button>
                    </div>
                )}
                <ImagesFields
                    template={template}
                    hasImages={attributes.hasImages}
                    onOpenGallery={() => attributes.setIsImageModalOpen(true)}
                />
            </AccordionSection>

            <AccordionSection
                icon={TbCash}
                title="Precio"
                isComplete={isPricingComplete}
            >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <PricingFields
                        template={template}
                        setTemplate={setTemplate}
                    />
                </div>
            </AccordionSection>

            <AccordionSection icon={TbEye} title="Visibilidad">
                <div className="flex flex-col gap-4">
                    <VisibilityFields
                        template={template}
                        setTemplate={setTemplate}
                    />
                </div>
            </AccordionSection>

            <ProductFormModals
                attributes={attributes}
                template={template}
                setTemplate={setTemplate}
            />
        </div>
    )
}

export default ProductCreateForm
