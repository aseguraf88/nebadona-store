import { Link } from 'react-router-dom'

// Ruta catch-all (path="*") dentro del Layout de la tienda: cualquier URL
// que no existe, incluidas /admin y las rutas inexistentes bajo
// /admin/dashboard/. Mismo estilo que "Producto no disponible" de la ficha
const NotFound = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
            <h1 className="text-2xl font-bold">No encontramos esta página</h1>
            <p className="text-base-content/70">
                Puede que el enlace esté mal escrito o que la página ya no exista.
            </p>
            <Link to="/shop" className="btn btn-primary mt-4">
                Ir a la tienda
            </Link>
        </div>
    )
}

export default NotFound
