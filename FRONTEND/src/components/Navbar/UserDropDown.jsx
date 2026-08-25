import { HiOutlineLogout } from 'react-icons/hi'
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
        if (!fullName) return 'A' // 'A' de Admin por defecto

        return fullName
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0].toUpperCase())
            .join('')
    }

    const isAuthenticated = Boolean(userInfo?.id) && !loading

    // 🔥 LA PUERTA INVISIBLE: Si no hay nadie logueado, desaparecemos de la interfaz
    if (!isAuthenticated) return null

    // Solo se renderiza si tu señora (Admin) inició sesión desde la ruta oculta /login
    return (
        <div className="dropdown dropdown-end">
            <div
                tabIndex={0}
                role="button"
                className="h-10 w-10 flex items-center justify-center rounded-full bg-primary text-primary-content shadow-sm transition-transform duration-300 hover:scale-110 outline-none cursor-pointer"
                aria-label="Menú de administrador"
            >
                <span className="text-sm font-bold">{getInitials()}</span>
            </div>

            <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content z-[1] mt-3 w-52 rounded-box border border-base-300 bg-base-100 p-2 shadow-xl"
            >
                <li className="menu-title">
                    <span>Administración</span>
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
        </div>
    )
}

export default UserDropDown
