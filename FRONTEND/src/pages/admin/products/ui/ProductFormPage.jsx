import { Link } from 'react-router-dom'
import { useProduct } from '../../../../entities/product'
import { SIZE_OPTIONS } from '../../../../entities/product'
import { ProductAttributesForm } from '../../../../features/products'
import { ConfirmationModal } from '../../../../shared/ui'
import { useProductForm } from '../model/useProductForm'

const ProductFormPage = () => {
    const {
        productCategories,
        designThemes,
        franchiseNames,
        createDesignTheme,
        createFranchiseName,
    } = useProduct()

    const {
        isEditMode,
        isLoadingProduct,
        notFound,
        template,
        setTemplate,
        isSaving,
        isSaveModalOpen,
        setIsSaveModalOpen,
        hasUnsavedChanges,
        isFormValid,
        currentProductTypeOptions,
        handleConfirmSave,
    } = useProductForm()

    if (isLoadingProduct) {
        return (
            <div className="flex justify-center py-24">
                <span className="loading loading-infinity loading-lg text-primary" />
            </div>
        )
    }

    if (notFound) {
        return (
            <div className="flex flex-col items-center gap-4 py-24">
                <p className="text-lg font-semibold text-base-content">
                    No encontramos ese producto.
                </p>
                <Link
                    to="/admin/dashboard/products"
                    className="btn btn-primary btn-sm"
                >
                    ← Volver al listado
                </Link>
            </div>
        )
    }

    return (
        <div className="flex w-full flex-col gap-6 pb-12">
            <section className="card relative w-full bg-base-100 shadow-xl border border-base-200">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-b border-base-200 bg-base-200/30 p-4 rounded-t-2xl">
                    <Link
                        to="/admin/dashboard/products"
                        className="btn btn-sm btn-ghost"
                    >
                        ← Volver al listado
                    </Link>

                    <button
                        type="button"
                        className="btn btn-primary btn-sm w-full sm:w-auto sm:ml-auto shadow-md mt-1 sm:mt-0"
                        disabled={
                            !hasUnsavedChanges || isSaving || !isFormValid
                        }
                        onClick={() => setIsSaveModalOpen(true)}
                    >
                        {isSaving ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            '💾 Guardar Cambios'
                        )}
                    </button>
                </div>

                <div className="p-6 lg:p-8 bg-base-200/10">
                    <div className="mb-6">
                        <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-1">
                            {isEditMode ? 'Modo Edición' : 'Modo Creación'}
                        </p>
                        <h2 className="text-2xl font-black text-base-content tracking-tight">
                            {isEditMode ? 'Editar Producto' : 'Nuevo Producto'}
                        </h2>
                    </div>

                    <ProductAttributesForm
                        template={template}
                        setTemplate={setTemplate}
                        productCategories={productCategories}
                        designThemes={designThemes}
                        franchiseNames={franchiseNames}
                        currentProductTypeOptions={currentProductTypeOptions}
                        sizeOptions={SIZE_OPTIONS}
                        onCreateTheme={createDesignTheme}
                        onCreateFranchise={createFranchiseName}
                    />
                </div>
            </section>

            <ConfirmationModal
                open={isSaveModalOpen}
                title="¿Guardar cambios efectuados?"
                onConfirm={handleConfirmSave}
                onCancel={() => setIsSaveModalOpen(false)}
                isConfirming={isSaving}
                confirmLabel="Sí"
            />
        </div>
    )
}

export default ProductFormPage
