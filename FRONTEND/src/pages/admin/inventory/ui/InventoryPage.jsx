import { useState } from 'react'
import toast from 'react-hot-toast'
import { useProduct } from '../../../../entities/product'
import { CatalogManagerModal } from '../../../../features/products'
import { ConfirmationModal } from '../../../../shared/ui'

const CatalogSettingsPage = () => {
    const {
        productCategories,
        designThemes,
        franchiseNames,
        createProductCategory,
        updateProductCategory,
        deleteProductCategory,
        createDesignTheme,
        updateDesignTheme,
        deleteDesignTheme,
        createFranchiseName,
        updateFranchiseName,
        deleteFranchiseName,
    } = useProduct()

    const [openModal, setOpenModal] = useState(null) // 'category' | 'franchise' | 'theme' | null

    const [categoryDraft, setCategoryDraft] = useState('')
    const [franchiseDraft, setFranchiseDraft] = useState('')
    const [themeDraft, setThemeDraft] = useState('')

    const [editingCategoryId, setEditingCategoryId] = useState('')
    const [editingCategoryName, setEditingCategoryName] = useState('')
    const [editingFranchiseId, setEditingFranchiseId] = useState('')
    const [editingFranchiseName, setEditingFranchiseName] = useState('')
    const [editingThemeId, setEditingThemeId] = useState('')
    const [editingThemeName, setEditingThemeName] = useState('')

    const [deleteConfirmation, setDeleteConfirmation] = useState({
        open: false,
        entityType: '',
        id: '',
        name: '',
    })

    // --- Categorías ---
    const handleCategoryCreate = async () => {
        const name = categoryDraft.trim()
        if (!name) return
        const result = await createProductCategory(name)
        if (result?.success) {
            setCategoryDraft('')
            toast.success(result.message)
        } else toast.error(result?.message || 'No se pudo crear la categoria.')
    }
    const startCategoryEditing = (item) => {
        setEditingCategoryId(item._id)
        setEditingCategoryName(item.name)
    }
    const cancelCategoryEditing = () => {
        setEditingCategoryId('')
        setEditingCategoryName('')
    }
    const handleCategoryUpdate = async () => {
        if (!editingCategoryId || !editingCategoryName.trim()) return
        const result = await updateProductCategory(
            editingCategoryId,
            editingCategoryName,
        )
        if (result?.success) {
            toast.success(result.message)
            cancelCategoryEditing()
        } else
            toast.error(
                result?.message || 'No se pudo actualizar la categoria.',
            )
    }
    const requestCategoryDelete = (item) =>
        setDeleteConfirmation({
            open: true,
            entityType: 'category',
            id: item._id,
            name: item.name,
        })

    // --- Franquicias ---
    const handleFranchiseCreate = async () => {
        const name = franchiseDraft.trim()
        if (!name) return
        const result = await createFranchiseName(name)
        if (result?.success) {
            setFranchiseDraft('')
            toast.success(result.message)
        } else toast.error(result?.message || 'No se pudo crear la franquicia.')
    }
    const startFranchiseEditing = (item) => {
        setEditingFranchiseId(item._id)
        setEditingFranchiseName(item.name)
    }
    const cancelFranchiseEditing = () => {
        setEditingFranchiseId('')
        setEditingFranchiseName('')
    }
    const handleFranchiseUpdate = async () => {
        if (!editingFranchiseId || !editingFranchiseName.trim()) return
        const result = await updateFranchiseName(
            editingFranchiseId,
            editingFranchiseName,
        )
        if (result?.success) {
            toast.success(result.message)
            cancelFranchiseEditing()
        } else
            toast.error(
                result?.message || 'No se pudo actualizar la franquicia.',
            )
    }
    const requestFranchiseDelete = (item) =>
        setDeleteConfirmation({
            open: true,
            entityType: 'franchise',
            id: item._id,
            name: item.name,
        })

    // --- Temas ---
    const handleThemeCreate = async () => {
        const name = themeDraft.trim()
        if (!name) return
        const result = await createDesignTheme(name)
        if (result?.success) {
            setThemeDraft('')
            toast.success(result.message)
        } else toast.error(result?.message || 'No se pudo crear el tema.')
    }
    const startThemeEditing = (item) => {
        setEditingThemeId(item._id)
        setEditingThemeName(item.name)
    }
    const cancelThemeEditing = () => {
        setEditingThemeId('')
        setEditingThemeName('')
    }
    const handleThemeUpdate = async () => {
        if (!editingThemeId || !editingThemeName.trim()) return
        const result = await updateDesignTheme(editingThemeId, editingThemeName)
        if (result?.success) {
            toast.success(result.message)
            cancelThemeEditing()
        } else toast.error(result?.message || 'No se pudo actualizar el tema.')
    }
    const requestThemeDelete = (item) =>
        setDeleteConfirmation({
            open: true,
            entityType: 'theme',
            id: item._id,
            name: item.name,
        })

    // --- Borrado genérico ---
    const closeDeleteConfirmation = () =>
        setDeleteConfirmation({ open: false, entityType: '', id: '', name: '' })

    const handleConfirmDelete = async () => {
        const { entityType, id } = deleteConfirmation
        if (!id) return

        let result
        if (entityType === 'category') result = await deleteProductCategory(id)
        if (entityType === 'franchise') result = await deleteFranchiseName(id)
        if (entityType === 'theme') result = await deleteDesignTheme(id)

        if (result?.success) toast.success(result.message)
        else toast.error(result?.message || 'No se pudo eliminar.')

        closeDeleteConfirmation()
    }

    return (
        <div className="flex w-full flex-col gap-6 pb-12">
            <section className="card w-full bg-base-100 shadow-xl border border-base-200 p-6">
                <h2 className="text-xl font-black text-base-content mb-1">
                    Categorías, Franquicias y Temas
                </h2>
                <p className="text-sm text-base-content/60 mb-6">
                    Gestioná las listas que usa el formulario de productos para
                    clasificar el catálogo.
                </p>
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => setOpenModal('category')}
                    >
                        Categorías ({productCategories?.length || 0})
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => setOpenModal('franchise')}
                    >
                        Franquicias ({franchiseNames?.length || 0})
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => setOpenModal('theme')}
                    >
                        Temas ({designThemes?.length || 0})
                    </button>
                </div>
            </section>

            <CatalogManagerModal
                open={openModal === 'category'}
                title="Categorias"
                placeholder="Nueva categoria"
                draft={categoryDraft}
                setDraft={setCategoryDraft}
                onCreate={handleCategoryCreate}
                items={productCategories}
                emptyMessage="No hay categorias cargadas."
                editingId={editingCategoryId}
                editingName={editingCategoryName}
                setEditingName={setEditingCategoryName}
                onStartEditing={startCategoryEditing}
                onSaveEditing={handleCategoryUpdate}
                onCancelEditing={cancelCategoryEditing}
                onRequestDelete={requestCategoryDelete}
                onClose={() => {
                    cancelCategoryEditing()
                    setOpenModal(null)
                }}
            />

            <CatalogManagerModal
                open={openModal === 'franchise'}
                title="Franquicias"
                placeholder="Nueva franquicia"
                draft={franchiseDraft}
                setDraft={setFranchiseDraft}
                onCreate={handleFranchiseCreate}
                items={franchiseNames}
                emptyMessage="No hay franquicias cargadas."
                editingId={editingFranchiseId}
                editingName={editingFranchiseName}
                setEditingName={setEditingFranchiseName}
                onStartEditing={startFranchiseEditing}
                onSaveEditing={handleFranchiseUpdate}
                onCancelEditing={cancelFranchiseEditing}
                onRequestDelete={requestFranchiseDelete}
                onClose={() => {
                    cancelFranchiseEditing()
                    setOpenModal(null)
                }}
            />

            <CatalogManagerModal
                open={openModal === 'theme'}
                title="Temas"
                placeholder="Nuevo tema"
                draft={themeDraft}
                setDraft={setThemeDraft}
                onCreate={handleThemeCreate}
                items={designThemes}
                emptyMessage="No hay temas cargados."
                editingId={editingThemeId}
                editingName={editingThemeName}
                setEditingName={setEditingThemeName}
                onStartEditing={startThemeEditing}
                onSaveEditing={handleThemeUpdate}
                onCancelEditing={cancelThemeEditing}
                onRequestDelete={requestThemeDelete}
                onClose={() => {
                    cancelThemeEditing()
                    setOpenModal(null)
                }}
            />

            <ConfirmationModal
                open={deleteConfirmation.open}
                title="Confirmar eliminación"
                message={`¿Seguro que deseas eliminar "${deleteConfirmation.name}"?`}
                onConfirm={handleConfirmDelete}
                onCancel={closeDeleteConfirmation}
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                confirmButtonClass="btn btn-error"
            />
        </div>
    )
}

export default CatalogSettingsPage
