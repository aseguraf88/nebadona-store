import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getSizeStandardsForGender } from '../../../entities/product/config/sizeStandardOptions'

// Grupos con talla fija. Adultos no lleva tabla: cada producto de adulto
// define su talla en la ficha (Talla Única con rango, o varias tallas).
const FIXED_SIZE_GROUPS = [
    { id: 'bebes', title: 'Bebés', gender: 'babies' },
    { id: 'ninos', title: 'Niños y niñas', gender: 'kids' },
]

// "Bebé (0 - 6 meses)" → "0 - 6 meses": el título de la sección ya dice el grupo
const ageFromLabel = (label) => label.replace(/^[^(]*\(|\)$/g, '')

const SizeGuide = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const cameFromProduct = location.state?.from === 'product'

    return (
        <main className="min-h-screen bg-base-100 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-sm breadcrumbs text-base-content/60 mb-8">
                    <ul>
                        <li><Link to="/">Inicio</Link></li>
                        <li className="font-medium text-base-content">Guía de Tallas</li>
                    </ul>
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold text-base-content mb-4">
                    Guía de Tallas
                </h1>
                <p className="text-base-content/80 mb-10">
                    Nuestros calcetines se organizan por edad y por talla de
                    calzado europea (EU). En la ficha de cada producto verás la
                    talla que le corresponde; esta guía te muestra todas juntas.
                </p>

                {FIXED_SIZE_GROUPS.map((group) => (
                    <section key={group.id} id={group.id} className="scroll-mt-32 mb-14">
                        <h2 className="text-xl font-bold text-base-content mb-6">
                            {group.title}
                        </h2>
                        <div className="overflow-x-auto rounded-box border border-base-content/10">
                            <table className="table table-sm">
                                <thead>
                                    <tr className="bg-neutral text-neutral-content">
                                        <th className="text-xs">Edad</th>
                                        <th className="text-xs">Talla EU</th>
                                        <th className="text-xs">Código</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getSizeStandardsForGender(group.gender).map((option) => (
                                        <tr key={option.id} className="border-base-content/10">
                                            <td className="font-semibold whitespace-nowrap">
                                                {ageFromLabel(option.label)}
                                            </td>
                                            <td className="text-base-content/80">{option.euRange}</td>
                                            <td className="text-base-content/80 font-mono">{option.variantSize}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                ))}

                <section id="adultos" className="scroll-mt-32 mb-14">
                    <h2 className="text-xl font-bold text-base-content mb-6">
                        Adultos
                    </h2>
                    <p className="text-base-content/80">
                        Para hombre, mujer y unisex, cada producto indica en su
                        ficha si es de <strong>Talla Única</strong> (con su rango
                        de talla EU, por ejemplo 36 - 42) o si viene en{' '}
                        <strong>varias tallas</strong> que eliges al comprar.
                    </p>
                </section>

                {cameFromProduct && (
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="btn btn-outline btn-primary"
                    >
                        ← Volver al producto
                    </button>
                )}
            </div>
        </main>
    )
}

export default SizeGuide
