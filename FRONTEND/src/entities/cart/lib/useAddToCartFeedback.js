import { useEffect, useRef, useState } from 'react'

// Estado del botón "Agregar" que comparten la tarjeta, el modal y la ficha.
// Cada botón conserva su layout; aquí viven el estado, los textos y los
// colores, para que los tres se comporten igual

// Cuánto dura "Listo" antes de volver a "Agregar"
const SUCCESS_MS = 1500

export const ADD_TO_CART_LABELS = {
    idle: 'Agregar',
    added: 'Listo',
    soldOut: 'Agotado',
}

// Clases escritas completas (Tailwind solo genera las que encuentra como
// texto). "Listo": fondo verde claro #1FFF1F con texto verde oscuro
// #052E16, contraste 10,9:1 (AAA); con texto blanco daría 1,4:1, ilegible.
// Las variantes hover: y disabled: le ganan a las reglas de .btn de
// DaisyUI en el modal y la ficha
export const ADD_TO_CART_CLASSES = {
    transition: 'transition-colors duration-300',
    added: 'bg-[#1FFF1F] text-[#052E16] hover:bg-[#1FFF1F] hover:text-[#052E16]',
    soldOut:
        'bg-base-200 text-base-content/60 cursor-not-allowed disabled:bg-base-200 disabled:text-base-content/60',
}

// add: función que agrega y devuelve true si se agregó. "Listo" solo
// aparece con true. Mientras se agrega o se muestra "Listo", los clics se
// ignoran: evita agregar dos veces con un doble clic
export const useAddToCartFeedback = (add) => {
    const [status, setStatus] = useState('idle') // 'idle' | 'adding' | 'added'
    // Ref y no estado: frena el segundo clic aunque llegue antes del re-render
    const busyRef = useRef(false)
    const timerRef = useRef(null)

    useEffect(() => () => clearTimeout(timerRef.current), [])

    const trigger = async (...args) => {
        if (busyRef.current) return
        busyRef.current = true
        setStatus('adding')

        let ok = false
        try {
            ok = await add(...args)
        } catch {
            ok = false
        }

        if (!ok) {
            busyRef.current = false
            setStatus('idle')
            return
        }

        setStatus('added')
        timerRef.current = setTimeout(() => {
            busyRef.current = false
            setStatus('idle')
        }, SUCCESS_MS)
    }

    return { status, trigger, isBusy: status !== 'idle' }
}
