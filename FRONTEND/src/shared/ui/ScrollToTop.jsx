import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

// Posición de scroll al navegar, en toda la app:
// - Navegación nueva (PUSH o REPLACE: un enlace, una ficha, un filtro): con
//   #ancla (ej. /guia-tallas#bebes) va a esa sección; si no, sube al inicio.
// - Volver o avanzar (POP: el "atrás" del sistema, el gesto, los botones
//   "Volver") y F5: vuelve a la posición que tenía esa entrada del
//   historial. Si no hay una guardada, se comporta como navegación nueva.
// Las posiciones se guardan en sessionStorage (sobreviven a F5) por entrada
// del historial: location.key más la ruta. El scroll lo maneja la app y no
// el navegador (history.scrollRestoration = 'manual'), para que no se pisen

const STORAGE_KEY = 'nebadon:scroll-positions'
// Cuántas entradas del historial se recuerdan como máximo
const MAX_ENTRIES = 50
// Cuánto se espera, como máximo, a que la página sea lo bastante alta (el
// catálogo después de F5, la ficha mientras carga)
const MAX_WAIT_MS = 3000
// Lo que hace el cliente que corta la restauración: no se pelea con él
const CANCEL_EVENTS = ['wheel', 'touchstart', 'pointerdown', 'keydown']

const entryId = (location) =>
    `${location.key}|${location.pathname}${location.search}`

// sessionStorage puede estar bloqueado o lleno: sin él solo se pierde la
// restauración, la navegación sigue igual
const readPositions = () => {
    try {
        return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {}
    } catch {
        return {}
    }
}

const savePosition = (id, y) => {
    try {
        const positions = readPositions()
        delete positions[id]
        positions[id] = y
        const ids = Object.keys(positions)
        for (const oldId of ids.slice(0, Math.max(0, ids.length - MAX_ENTRIES))) {
            delete positions[oldId]
        }
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions))
    } catch {
        // Sin sessionStorage no se guarda nada
    }
}

// En la primera carga también es POP: solo se restaura si fue F5 o
// atrás/adelante del navegador. Un link directo, una pestaña nueva o una
// URL escrita van al inicio
const isReloadOrHistoryLoad = () => {
    try {
        const [navigation] = performance.getEntriesByType('navigation')
        return navigation?.type === 'reload' || navigation?.type === 'back_forward'
    } catch {
        return false
    }
}

const ScrollToTop = () => {
    const location = useLocation()
    const navigationType = useNavigationType()
    // Última posición de la página actual, actualizada al hacer scroll. Al
    // salir se guarda este valor, no window.scrollY: cuando la página
    // siguiente es más corta, el navegador recorta el scroll después
    const lastYRef = useRef(0)
    // Mientras se restaura, el scroll que mueve la app no cuenta
    const restoringRef = useRef(false)
    const currentIdRef = useRef(null)
    const isFirstLoadRef = useRef(true)

    useEffect(() => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual'
        }
    }, [])

    useEffect(() => {
        let frame = 0
        const handleScroll = () => {
            cancelAnimationFrame(frame)
            frame = requestAnimationFrame(() => {
                if (!restoringRef.current) lastYRef.current = window.scrollY
            })
        }
        // F5 o cerrar la pestaña: se guarda la posición de la página actual
        const handlePageHide = () => {
            if (currentIdRef.current && !restoringRef.current) {
                savePosition(currentIdRef.current, lastYRef.current)
            }
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        window.addEventListener('pagehide', handlePageHide)
        return () => {
            cancelAnimationFrame(frame)
            window.removeEventListener('scroll', handleScroll)
            window.removeEventListener('pagehide', handlePageHide)
        }
    }, [])

    // Antes de pintar, para que no se vea la posición equivocada
    useLayoutEffect(() => {
        const id = entryId(location)
        currentIdRef.current = id
        const isFirstLoad = isFirstLoadRef.current
        isFirstLoadRef.current = false

        const canRestore =
            navigationType === 'POP' && (!isFirstLoad || isReloadOrHistoryLoad())
        const savedY = canRestore ? readPositions()[id] : undefined

        let stopRestore = () => {}

        if (savedY > 0) {
            // La página puede no tener todavía su altura final: se insiste
            // en cada frame hasta llegar, hasta MAX_WAIT_MS o hasta que el
            // cliente toque, use la rueda o el teclado
            restoringRef.current = true
            const start = performance.now()
            let frame = 0
            stopRestore = () => {
                cancelAnimationFrame(frame)
                CANCEL_EVENTS.forEach((type) =>
                    window.removeEventListener(type, stopRestore),
                )
                if (restoringRef.current) {
                    restoringRef.current = false
                    lastYRef.current = window.scrollY
                }
            }
            const step = () => {
                const maxY =
                    document.documentElement.scrollHeight - window.innerHeight
                window.scrollTo(0, Math.min(savedY, Math.max(0, maxY)))
                if (maxY >= savedY || performance.now() - start >= MAX_WAIT_MS) {
                    stopRestore()
                    return
                }
                frame = requestAnimationFrame(step)
            }
            CANCEL_EVENTS.forEach((type) =>
                window.addEventListener(type, stopRestore, { passive: true }),
            )
            step()
        } else {
            // Con #ancla, a esa sección; si no, arriba. En una SPA el
            // navegador no lo hace solo: al cargar, la sección todavía no
            // existe
            const target = location.hash
                ? document.getElementById(decodeURIComponent(location.hash.slice(1)))
                : null
            if (target) {
                target.scrollIntoView()
            } else {
                window.scrollTo(0, 0)
            }
            lastYRef.current = window.scrollY
        }

        // Al salir de esta entrada se guarda su última posición. Si todavía
        // se estaba restaurando, no: el valor sería el de antes de llegar
        return () => {
            const wasRestoring = restoringRef.current
            stopRestore()
            if (!wasRestoring) savePosition(id, lastYRef.current)
        }
    }, [location, navigationType])

    return null
}

export default ScrollToTop
