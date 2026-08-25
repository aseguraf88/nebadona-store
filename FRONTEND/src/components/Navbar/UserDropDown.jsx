import { HiOutlineLogout, HiOutlineUser } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useUser } from '../../context/UserContext'
import { logoutService } from '../../services/authServices'

const UserDropDown = () => {
    const { userInfo, loading, setUserInfo } = useUser()

    const handleLogout = async () => {
        try {
            await logoutService()
            setUserInfo({})
            toast.success('Sesión cerrada correctamente.')
        } catch (error) {
            console.error('Error al cerrar sesión.', error)
            toast.error('Error al cerrar sesión. Intente más tarde.')
        }
    }

    const getInitials = () => {
        const fullName = userInfo?.name || userInfo?.username || ''
        if (!fullName) return 'U'

        return fullName
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0].toUpperCase())
            .join('')
    }

    const isAuthenticated = Boolean(userInfo?.id) && !loading

    return (
        <div className="dropdown dropdown-end">
            {isAuthenticated ? (
                <>
                    {/* BOTÓN ESTADO LOGUEADO (Círculo con Iniciales y Mini-Zoom) */}
                    <div
                        tabIndex={0}
                        role="button"
                        className="h-10 w-10 flex items-center justify-center rounded-full bg-primary text-primary-content shadow-sm transition-transform duration-300 hover:scale-110 outline-none cursor-pointer"
                        aria-label="Menú de usuario"
                    >
                        <span className="text-sm font-bold">
                            {getInitials()}
                        </span>
                    </div>

                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content z-[1] mt-3 w-52 rounded-box border border-base-300 bg-base-100 p-2 shadow-xl"
                    >
                        <li className="menu-title">
                            <span>Mi cuenta</span>
                        </li>
                        <li>
                            <button type="button" className="w-full text-left">
                                <span className="flex items-center gap-2">
                                    <HiOutlineUser className="h-5 w-5" />
                                    Mi cuenta
                                </span>
                            </button>
                        </li>
                        <li>
                            <button type="button" className="w-full text-left">
                                <span className="flex items-center gap-2">
                                    <HiOutlineUser className="h-5 w-5" />
                                    Mis pedidos
                                </span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left text-error hover:bg-error/10"
                            >
                                <span className="flex items-center gap-2">
                                    <HiOutlineLogout className="h-5 w-5" />
                                    Cerrar sesión
                                </span>
                            </button>
                        </li>
                    </ul>
                </>
            ) : (
                <>
                    {/* BOTÓN ESTADO NO LOGUEADO (Fondo limpio, ícono centrado y Mini-Zoom) */}
                    <div
                        tabIndex={0}
                        role="button"
                        className="h-10 w-10 flex items-center justify-center rounded-full text-base-content transition-transform duration-300 hover:scale-110 outline-none cursor-pointer"
                        aria-label="Opciones de cuenta"
                    >
                        <HiOutlineUser className="h-6 w-6" />
                    </div>

                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content z-[1] mt-3 w-56 rounded-box border border-base-300 bg-base-100 p-2 shadow-xl"
                    >
                        <li>
                            <Link
                                to="/login"
                                onClick={() => document.activeElement.blur()}
                                className="btn btn-primary btn-block mb-1"
                            >
                                Iniciar sesión
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/register"
                                onClick={() => document.activeElement.blur()}
                                className="text-sm text-base-content/80 hover:text-primary justify-center"
                            >
                                ¿Nuevo aquí? Crear cuenta
                            </Link>
                        </li>
                    </ul>
                </>
            )}
        </div>
    )
}

export default UserDropDown
