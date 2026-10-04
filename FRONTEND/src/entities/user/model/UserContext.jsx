import { useContext, createContext, useState, useEffect } from 'react'
import { getProfileService } from '../api/authServices'

export const UserContext = createContext({})

export const UserContextProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState({})
    const [loading, setLoading] = useState(true)

    // Verifica la sesión contra el backend (GET /api/auth/profile). Devuelve
    // el usuario si la cookie de sesión llegó, o null si no: login y registro
    // lo usan para no dar por iniciada una sesión que el navegador bloqueó
    const checkSession = async () => {
        try {
            setLoading(true)
            const userData = await getProfileService()
            setUserInfo(userData)
            return userData
        } catch (error) {
            setUserInfo({})
            return null
        } finally {
            setLoading(false)
        }
    }

    // Función para obtener el id del usuario autenticando
    const getUserId = () => {
        return userInfo?.id || null
    }

    // Verificar si el usuario está autenticado o no
    const isAuthenticated = () => {
        return !!userInfo?.id
    }

    useEffect(() => {
        checkSession()
    }, [])

    return (
        <UserContext.Provider
            value={{
                userInfo,
                setUserInfo,
                loading,
                checkSession,
                getUserId,
                isAuthenticated,
            }}
        >
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => useContext(UserContext)
