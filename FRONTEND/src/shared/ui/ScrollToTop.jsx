import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
    const { pathname, search } = useLocation()

    useEffect(() => {
        // Cada vez que cambie la ruta o los parámetros de búsqueda, subimos
        window.scrollTo(0, 0)
    }, [pathname, search])

    return null // Este componente no renderiza nada visualmente
}

export default ScrollToTop
