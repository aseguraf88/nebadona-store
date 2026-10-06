import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiChevronDown } from 'react-icons/fi'
import { useProduct } from '../../../entities/product'
import { buildThemeMenu } from '../../../entities/product/lib/themes'

// Retardo al sacar el cursor, para poder cruzar del botón al panel
const CLOSE_DELAY = 150

const itemClass = 'hover:text-primary transition-colors'

// Submenú de desktop: Tienda + una entrada por temática con productos
// publicados. Las que tienen franquicias abren un panel al pasar el cursor,
// al hacer clic o con Enter; Escape, clic afuera, salir con Tab o navegar
// lo cierran
const ThemeMenu = () => {
    const { products, designThemes, franchiseNames } = useProduct()
    const themes = useMemo(
        () => buildThemeMenu(products, designThemes, franchiseNames),
        [products, designThemes, franchiseNames],
    )

    const [openSlug, setOpenSlug] = useState(null)
    const closeTimer = useRef(null)
    const buttonRefs = useRef({})
    const navRef = useRef(null)
    const location = useLocation()

    const open = (slug) => {
        clearTimeout(closeTimer.current)
        setOpenSlug(slug)
    }

    const close = () => {
        clearTimeout(closeTimer.current)
        setOpenSlug(null)
    }

    const scheduleClose = () => {
        clearTimeout(closeTimer.current)
        closeTimer.current = setTimeout(() => setOpenSlug(null), CLOSE_DELAY)
    }

    // Se cierra al navegar (también con atrás/adelante)
    useEffect(() => {
        close()
    }, [location.key])

    // Clic afuera
    useEffect(() => {
        if (!openSlug) return
        const handleClick = (event) => {
            if (!navRef.current?.contains(event.target)) close()
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [openSlug])

    useEffect(() => () => clearTimeout(closeTimer.current), [])

    const handleKeyDown = (event, slug) => {
        if (event.key === 'Escape' && openSlug === slug) {
            close()
            buttonRefs.current[slug]?.focus()
        }
    }

    // Salir con Tab del botón y del panel
    const handleBlur = (event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close()
    }

    return (
        <nav ref={navRef} aria-label="Temáticas">
            <ul className="flex items-center gap-6 text-sm font-bold text-base-content/70">
                <li>
                    <Link to="/shop" className={itemClass}>
                        Tienda
                    </Link>
                </li>

                {themes.map((theme) =>
                    theme.direct ? (
                        <li key={theme.slug}>
                            <Link
                                to={`/shop?tematica=${theme.slug}`}
                                className={itemClass}
                            >
                                {theme.name}
                            </Link>
                        </li>
                    ) : (
                        <li
                            key={theme.slug}
                            className="relative"
                            onMouseEnter={() => open(theme.slug)}
                            onMouseLeave={scheduleClose}
                            onKeyDown={(event) => handleKeyDown(event, theme.slug)}
                            onBlur={handleBlur}
                        >
                            <button
                                type="button"
                                ref={(node) => {
                                    buttonRefs.current[theme.slug] = node
                                }}
                                // El clic abre (no alterna): si el cursor ya
                                // lo abrió, el clic no lo cierra
                                onClick={() => open(theme.slug)}
                                aria-expanded={openSlug === theme.slug}
                                aria-controls={`tematica-${theme.slug}`}
                                className={`${itemClass} flex items-center gap-1`}
                            >
                                {theme.name}
                                <FiChevronDown
                                    aria-hidden="true"
                                    className={`h-4 w-4 transition-transform ${
                                        openSlug === theme.slug ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>

                            {/* pt-2 en vez de margen: sin hueco entre el botón
                                y el panel, para que el cursor no lo cierre */}
                            <div
                                id={`tematica-${theme.slug}`}
                                className={`absolute left-0 top-full pt-2 z-50 ${
                                    openSlug === theme.slug ? 'block' : 'hidden'
                                }`}
                            >
                                <ul className="menu w-60 rounded-box border border-base-content/10 bg-base-100 p-2 shadow-lg font-medium text-base-content">
                                    <li>
                                        <Link
                                            to={`/shop?tematica=${theme.slug}`}
                                            onClick={close}
                                            className="font-bold"
                                        >
                                            Ver todo {theme.name}
                                        </Link>
                                    </li>
                                    {theme.franchises.map((franchise) => (
                                        <li key={franchise.slug}>
                                            <Link
                                                to={`/shop?franquicia=${franchise.slug}`}
                                                onClick={close}
                                            >
                                                {franchise.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </li>
                    ),
                )}
            </ul>
        </nav>
    )
}

export default ThemeMenu
