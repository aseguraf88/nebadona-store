const ConfirmationModal = ({
    open,
    title,
    message,
    confirmLabel = 'Si',
    cancelLabel = 'No',
    onConfirm,
    onCancel,
    isConfirming = false,
    confirmButtonClass = 'btn btn-primary',
}) => {
    if (!open) return null

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-sm">
                <h3 className="text-lg font-bold">{title}</h3>
                {message ? <p className="mt-2 text-sm text-base-content/80">{message}</p> : null}
                <div className="modal-action">
                    <button
                        type="button"
                        className={confirmButtonClass}
                        onClick={onConfirm}
                        disabled={isConfirming}
                    >
                        {isConfirming ? 'Guardando...' : confirmLabel}
                    </button>
                    <button
                        type="button"
                        className="btn"
                        onClick={onCancel}
                    >
                        {cancelLabel}
                    </button>
                </div>
            </div>
        </dialog>
    )
}

export default ConfirmationModal
