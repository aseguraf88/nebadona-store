import AddEntityModal from './AddEntityModal'
import ProductImagesModal from './ProductImagesModal'

/**
 * Los tres modales del formulario de producto (Tema, Franquicia, Galería),
 * conectados al estado de useProductAttributes. Compartido entre el
 * formulario de edición y el futuro formulario de creación.
 */
const ProductFormModals = ({ attributes, template, setTemplate }) => (
    <>
        <AddEntityModal
            isOpen={attributes.isThemeModalOpen}
            onClose={() => attributes.setIsThemeModalOpen(false)}
            onSave={attributes.handleSaveTheme}
            title="Agregar Tema"
            placeholder="Ej: Steampunk..."
        />
        <AddEntityModal
            isOpen={attributes.isFranchiseModalOpen}
            onClose={() => attributes.setIsFranchiseModalOpen(false)}
            onSave={attributes.handleSaveFranchise}
            title="Agregar Franquicia"
            placeholder="Ej: Marvel..."
        />
        <ProductImagesModal
            open={attributes.isImageModalOpen}
            template={template}
            setTemplate={setTemplate}
            setDragIndex={attributes.setDragIndex}
            handleDropImage={attributes.handleDropImage}
            handleImageUpload={attributes.handleImageUpload}
            handleRemoveImage={attributes.handleRemoveImage}
            onClose={() => attributes.setIsImageModalOpen(false)}
        />
    </>
)

export default ProductFormModals
