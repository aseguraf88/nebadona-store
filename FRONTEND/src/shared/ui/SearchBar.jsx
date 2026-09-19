import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiOutlineSearch } from 'react-icons/hi'

const SearchBar = () => {
    // 1. Creamos el estado para guardar lo que el usuario escribe
    const [searchTerm, setSearchTerm] = useState('')
    const navigate = useNavigate()

    // 2. Esta función se ejecuta al presionar Enter o hacer clic en la lupa
    const handleSubmit = (e) => {
        e.preventDefault() // Evita que la página se recargue

        if (searchTerm.trim()) {
            // Si hay texto, redirigimos a ShoppingPage mandando la búsqueda por la URL
            navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="form-control w-full max-w-2xl relative mx-auto"
        >
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar calcetas, franquicias, personajes..."
                className="input input-bordered w-full rounded-2xl pl-11 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-base-100 shadow-sm"
            />

            <button
                type="submit"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-primary transition-colors cursor-pointer"
                aria-label="Ejecutar búsqueda"
            >
                {/* 👇 Ícono Heroicons lupa pequeña (h-5 w-5) */}
                <HiOutlineSearch className="h-5 w-5" />
            </button>
        </form>
    )
}

export default SearchBar
