import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

// "Volver" como el botón atrás del sistema, sin sacar al cliente de la
// tienda. React Router guarda en window.history.state un idx: 0 es la
// primera entrada de la app en esta pestaña, y sube 1 con cada navegación
// (sobrevive a F5). Si hay una entrada anterior de la app, vuelve a ella;
// si no (link directo, Google, pestaña nueva), va a fallback reemplazando
// la entrada actual. Se lee al hacer clic, no al renderizar. Si idx no es
// un número (cambio interno de React Router), va a fallback: nunca se sale
const useGoBack = (fallback = '/shop') => {
    const navigate = useNavigate()

    return useCallback(() => {
        const idx = window.history.state?.idx
        if (typeof idx === 'number' && idx > 0) {
            navigate(-1)
        } else {
            navigate(fallback, { replace: true })
        }
    }, [navigate, fallback])
}

export default useGoBack
