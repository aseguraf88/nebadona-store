import toast from 'react-hot-toast'
import { useUser, logoutService } from '../../../entities/user'

// Cierre de sesión compartido: lo usan UserDropDown (desktop), el menú
// hamburguesa (mobile) y el menú del avatar del dashboard (AdminLayout)
export const useLogout = () => {
    const { setUserInfo } = useUser()

    return async () => {
        try {
            await logoutService()
            setUserInfo({})
            toast.success('Sesión cerrada correctamente.')
        } catch (error) {
            console.error('Error al cerrar sesión.', error)
            toast.error('Error al cerrar sesión. Intente más tarde.')
        }
    }
}
