import { Link, useLocation, useNavigate } from 'react-router-dom'
import { HowToBuy } from '../../../widgets/how-to-buy'

const sectionTitleClass = 'text-lg font-semibold text-base-content mb-3'

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

                <h1 className="text-3xl sm:text-4xl font-bold text-base-content mb-10">
                    Envíos y Entregas
                </h1>

                <div className="text-sm text-base-content/80 space-y-10">
                    <p>
                        En Nebadon compras por WhatsApp: armas tu pedido en la
                        web, nos lo envías sin pagar y te respondemos para
                        confirmar el stock, la forma de entrega y el pago.
                    </p>

                    {/* Los mismos 4 pasos del Home (shared/config/shipping.js) */}
                    <HowToBuy />

                    <section>
                        <h2 className={sectionTitleClass}>Formas de entrega</h2>
                        <ul className="space-y-3">
                            <li>
                                📦{' '}
                                <strong className="text-base-content">
                                    Envío por agencia (todo Chile):
                                </strong>{' '}
                                despachamos por Starken (también por Blue
                                Express). Si prefieres Chilexpress o Correos de
                                Chile, lo vemos contigo.{' '}
                                <strong className="text-base-content">
                                    Tus productos los pagas por transferencia
                                    antes del despacho
                                </strong>
                                , y despachamos el día hábil siguiente de
                                recibida la transferencia.{' '}
                                <strong className="text-base-content">
                                    El envío es por pagar:
                                </strong>{' '}
                                el costo del envío se lo pagas directamente a la
                                agencia al recibir el paquete o al retirarlo en
                                la sucursal. Te informamos un valor aproximado
                                por WhatsApp.
                            </li>
                            <li>
                                🛵{' '}
                                <strong className="text-base-content">
                                    Envío Express (solo Santiago):
                                </strong>{' '}
                                por Uber o DiDi, el mismo día. Te cotizamos el
                                viaje por WhatsApp y haces una sola transferencia
                                por el total (productos + envío). Apenas la
                                recibimos, pedimos tu envío.
                            </li>
                            <li>
                                🤝{' '}
                                <strong className="text-base-content">
                                    Entrega en Metro:
                                </strong>{' '}
                                en las estaciones Ciudad del Niño (Línea 2) o
                                Mirador (Línea 5), en un horario que nos acomode a
                                ambos. Puedes pagar en efectivo o por
                                transferencia.
                            </li>
                            <li>
                                🏠{' '}
                                <strong className="text-base-content">
                                    Retiro en bodega (La Granja):
                                </strong>{' '}
                                gratis. De lunes a viernes de 19:00 a 22:00, y
                                fines de semana de 10:00 a 20:00. Si necesitas
                                otro horario, lo coordinamos. Te damos la
                                dirección por WhatsApp. Puedes pagar en efectivo
                                o por transferencia.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className={sectionTitleClass}>Pago</h2>
                        <p>
                            Transferencia bancaria. En el retiro en bodega y en
                            la entrega en Metro también puedes pagar en
                            efectivo. No pagues nada antes de que te confirmemos
                            el pedido.
                        </p>
                    </section>

                    <section>
                        <h2 className={sectionTitleClass}>Atención</h2>
                        <p>
                            Te respondemos por WhatsApp en menos de 1 hora,
                            todos los días de 12:00 a 22:00.
                        </p>
                    </section>
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
