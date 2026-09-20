import { useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi'

const SearchBar = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const inputRef = useRef(null)

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
