import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CARE_GUIDES_BY_CATEGORY } from '../../../entities/product/config/careGuides'

const GuiaCuidados = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const cameFromProduct = location.state?.from === 'product'

    return (
        <main className="min-h-screen bg-base-100 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-sm breadcrumbs text-base-content/60 mb-8">
                    <ul>
                        <li><Link to="/">Inicio</Link></li>
                        <li className="font-medium text-base-content">Guía de Cuidados</li>
                    </ul>
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold text-base-content mb-10">
                    Guía de Cuidados
                </h1>

                {Object.entries(CARE_GUIDES_BY_CATEGORY).map(([key, guide]) => (
                    <section key={key} id={key} className="scroll-mt-32 mb-14">
                        <h2 className="text-xl font-bold text-base-content mb-1 flex items-center gap-2">
                            <span>{guide.emoji}</span> {guide.title}
                        </h2>
                        <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-6">
                            {guide.technique}
                        </p>
                        <div className="overflow-x-auto">
                            <table className="table table-sm">
                                <thead>
                                    <tr>
                                        <th className="text-xs w-12"></th>
                                        <th className="text-xs">Acción</th>
                                        <th className="text-xs">Instrucción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {guide.items.map((item) => (
                                        <tr key={item.label}>
                                            <td>
                                                <item.icon className="h-5 w-5 text-primary" />
                                            </td>
                                            <td className="font-semibold whitespace-nowrap">{item.label}</td>
                                            <td className="text-base-content/80">{item.text}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                ))}

                {cameFromProduct && (
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="btn btn-outline"
                    >
                        ← Volver al producto
                    </button>
                )}
            </div>
        </main>
    )
}

export default GuiaCuidados
