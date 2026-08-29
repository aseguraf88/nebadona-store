const CatalogManagerModal = ({
    open,
    title,
    placeholder,
    draft,
    setDraft,
    onCreate,
    items,
    emptyMessage,
    editingId,
    editingName,
    setEditingName,
    onStartEditing,
    onSaveEditing,
    onCancelEditing,
    onRequestDelete,
    onClose,
}) => {
    if (!open) return null

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-lg">
                <h3 className="text-lg font-bold">{title}</h3>

                <div className="mt-3 flex items-center gap-2">
                    <input
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder={placeholder}
                        className="input input-bordered w-full"
                    />
                    <button
                        type="button"
                        className="btn btn-square"
                        onClick={onCreate}
                    >
                        +
                    </button>
                </div>

                <div className="mt-4 max-h-72 overflow-y-auto rounded-box border border-base-300 bg-base-100">
                    {items.length === 0 ? (
                        <p className="p-4 text-sm text-base-content/70">{emptyMessage}</p>
                    ) : (
                        <ul className="menu p-2">
                            {items.map((item) => (
                                <li key={item._id}>
                                    <div className="flex w-full items-center gap-2">
                                        {editingId === item._id ? (
                                            <input
                                                className="input input-bordered input-sm w-full"
                                                value={editingName}
                                                onChange={(event) =>
                                                    setEditingName(event.target.value)
                                                }
                                                onKeyDown={(event) => {
                                                    if (event.key === 'Enter') {
                                                        onSaveEditing()
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <span className="w-full text-left">{item.name}</span>
                                        )}

                                        {editingId === item._id ? (
                                            <>
                                                <button
                                                    type="button"
                                                    className="btn btn-xs"
                                                    onClick={onSaveEditing}
                                                >
                                                    Guardar
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-xs btn-ghost"
                                                    onClick={onCancelEditing}
                                                >
                                                    Cancelar
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    className="btn btn-xs"
                                                    onClick={() => onStartEditing(item)}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-xs btn-error"
                                                    onClick={() => onRequestDelete(item)}
                                                >
                                                    Eliminar
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="modal-action">
                    <button
                        type="button"
                        className="btn"
                        onClick={onClose}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </dialog>
    )
}

export default CatalogManagerModal
