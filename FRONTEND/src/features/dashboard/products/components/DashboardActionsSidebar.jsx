const DashboardActionsSidebar = ({
    onOpenCreate,
    onOpenEdit,
    onOpenCategories,
    onOpenFranchises,
    onOpenThemes,
}) => {
    return (
        <aside className="drawer-side z-40">
            <label
                htmlFor="products-dashboard-drawer"
                aria-label="close sidebar"
                className="drawer-overlay"
            />
            <div className="h-full w-36 border-r border-base-300 bg-base-100 px-3 py-4">
                <ul className="menu gap-3 p-0">
                    <li>
                        <button
                            type="button"
                            className="btn btn-outline w-full"
                            onClick={onOpenCreate}
                        >
                            Crear
                        </button>
                    </li>

                    <li>
                        <button
                            type="button"
                            className="btn btn-outline w-full"
                            onClick={onOpenEdit}
                        >
                            Editar
                        </button>
                    </li>

                    <li>
                        <button
                            type="button"
                            className="btn btn-outline w-full"
                            onClick={onOpenCategories}
                        >
                            Categorias
                        </button>
                    </li>

                    <li>
                        <button
                            type="button"
                            className="btn btn-outline w-full"
                            onClick={onOpenFranchises}
                        >
                            Franquicias
                        </button>
                    </li>

                    <li>
                        <button
                            type="button"
                            className="btn btn-outline w-full"
                            onClick={onOpenThemes}
                        >
                            Temas
                        </button>
                    </li>
                </ul>
            </div>
        </aside>
    )
}

export default DashboardActionsSidebar
