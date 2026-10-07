import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Wallet, MessageCircle } from 'lucide-react'
import { HowToBuy } from '../../../widgets/how-to-buy'
import { DELIVERY_METHODS } from '../../../shared/config/shipping'

const sectionTitleClass = 'text-lg font-semibold text-base-content mb-4'

// Tarjetas de pago y atención: solo se usan en esta página
const INFO_CARDS = [
    {
        title: 'Pago',
        icon: Wallet,
        details: [
            'Transferencia bancaria.',
            'Efectivo, si retiras en bodega o en el punto de encuentro.',
        ],
    },
    {
        title: 'Atención',
        icon: MessageCircle,
        details: [
            'Por WhatsApp, todos los días de 12:00 a 22:00.',
            'Te respondemos en menos de 1 hora.',
        ],
    },
]

// Tarjeta con ícono, título y viñetas cortas (formas de entrega, pago y
// atención: mismo formato)
const InfoCard = ({ icon: Icon, title, details }) => (
    <li className="rounded-box bg-base-200/40 p-5">
        <div className="flex items-center gap-3 mb-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon aria-hidden="true" className="h-5 w-5" />
            </span>
            <h3 className="text-sm font-bold text-base-content">{title}</h3>
        </div>
        <ul className="list-disc space-y-1 pl-5">
            {details.map((detail) => (
                <li key={detail}>{detail}</li>
            ))}
        </ul>
    </li>
)

const EnviosYEntregas = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const cameFromProduct = location.state?.from === 'product'

    return (
        <main className="min-h-screen bg-base-100 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-sm breadcrumbs text-base-content/60 mb-8">
                    <ul>
                        <li>
                            <Link to="/">Inicio</Link>
                        </li>
                        <li className="font-medium text-base-content">
                            Envíos y Entregas
                        </li>
                    </ul>
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold text-base-content mb-4">
                    Envíos y Entregas
                </h1>

                <div className="text-sm text-base-content/80 space-y-10">
                    <p>
                        Haces tu pedido en la web y lo coordinamos por WhatsApp.
                        No pagas nada hasta que te confirmemos.
                    </p>

                    {/* Las mismas 4 tarjetas del Home (shared/config/shipping.js) */}
                    <HowToBuy />

                    <section>
                        <h2 className={sectionTitleClass}>Formas de entrega</h2>
                        {/* Una tarjeta por modalidad, desde DELIVERY_METHODS */}
                        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {DELIVERY_METHODS.map((method) => (
                                <InfoCard
                                    key={method.id}
                                    icon={method.icon}
                                    title={method.name}
                                    details={method.details}
                                />
                            ))}
                        </ul>
                    </section>

                    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {INFO_CARDS.map((card) => (
                            <InfoCard key={card.title} {...card} />
                        ))}
                    </ul>
                </div>

                {cameFromProduct && (
                    <div className="mt-10">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="btn btn-outline btn-primary"
                        >
                            ← Volver al producto
                        </button>
                    </div>
                )}
            </div>
        </main>
    )
}

export default EnviosYEntregas
