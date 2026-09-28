import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
    const { pathname, search, hash } = useLocation()

    useEffect(() => {
        // Con #ancla (ej. /guia-tallas#bebes) vamos a esa sección; si no,
        // subimos. En una SPA el navegador no lo hace solo: al cargar, la
        // sección todavía no existe (y antes este efecto la pisaba con 0,0).
        if (hash) {
            const target = document.getElementById(
                decodeURIComponent(hash.slice(1)),
            )
            if (target) {
                target.scrollIntoView()
                return
            }
        }
        window.scrollTo(0, 0)
    }, [pathname, search, hash])

    return null // Este componente no renderiza nada visualmente
}

export default ScrollToTop
