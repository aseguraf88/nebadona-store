import { useState, useRef } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi'

// La caja sigue a ?search= solo en /shop, y solo cuando ese valor cambia
// (enviar, la cruz, "Ver todos los productos", F5, atrás): lo que el cliente
// está escribiendo no se toca. Fuera de /shop (una ficha) conserva su texto.
// Hay dos instancias (desktop y mobile) y cada una se sincroniza sola
const SearchBar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const inputRef = useRef(null)
    // null fuera de /shop: ahí la URL no dice nada sobre la caja
    const urlSearch =
        location.pathname === '/shop' ? (searchParams.get('search') ?? '') : null
    const [searchTerm, setSearchTerm] = useState(urlSearch ?? '')
    const [lastUrlSearch, setLastUrlSearch] = useState(urlSearch)

    // Ajuste durante el render (no en un efecto): sin un pintado con el
    // texto viejo. Si la caja ya tiene ese término (la que lo envió, quizá
    // con espacios al final), no se pisa
    if (urlSearch !== lastUrlSearch) {
        setLastUrlSearch(urlSearch)
        if (urlSearch !== null && urlSearch !== searchTerm.trim()) {
            setSearchTerm(urlSearch)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (searchTerm.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`)
            inputRef.current?.blur()
        }
    }

    const handleClear = () => {
        setSearchTerm('')
        if (searchParams.get('search')) {
            navigate('/shop')
        }
        inputRef.current?.focus()
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="form-control w-full max-w-2xl relative mx-auto"
        >
            <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar calcetas, franquicias, personajes..."
                className="input input-bordered w-full rounded-2xl pl-11 pr-10 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-base-100 shadow-sm"
            />

            <button
                type="submit"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-primary transition-colors cursor-pointer"
                aria-label="Ejecutar búsqueda"
            >
                <HiOutlineSearch className="h-5 w-5" />
            </button>

            {searchTerm && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-primary transition-colors cursor-pointer"
                    aria-label="Limpiar búsqueda"
                >
                    <HiOutlineX className="h-5 w-5" />
                </button>
            )}
        </form>
    )
}

export default SearchBar
