import { Link } from 'react-router-dom'
import { CARE_GUIDES_BY_CATEGORY } from '../../../entities/product/config/careGuides'

const GuiaCuidados = () => {
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
                            <span>{guide.icon}</span> {guide.title}
                        </h2>
                        <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-6">
                            {guide.technique}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {guide.items.map((item) => (
                                <div
                                    key={item.label}
                                    className="flex items-start gap-3 p-4 rounded-xl bg-base-100 border border-base-200"
                                >
                                    <span className="text-2xl shrink-0">{item.icon}</span>
                                    <div>
                                        <p className="font-semibold text-base-content">{item.label}</p>
                                        <p className="text-sm text-base-content/70">{item.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </main>
    )
}

export default GuiaCuidados
