import { Link } from 'react-router-dom'

const EnviosYEntregas = () => {
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

                <div className="text-sm text-base-content/80 space-y-4">
                    <p>
                        Para brindarte el mejor servicio y adaptarnos a tu
                        disponibilidad, todas las entregas y envíos se coordinan
                        directamente por interno (WhatsApp) al momento de
                        confirmar tu compra. Contamos con las siguientes
                        modalidades para que elijas la que más te acomode:
                    </p>

                    <ul className="space-y-3">
                        <li>
                            📦{' '}
                            <strong className="text-base-content">
                                Envíos por Agencia (Todo el país):
                            </strong>{' '}
                            Despachamos a través de Starken, Chilexpress o
                            Bluexpress. Los envíos se realizan en modalidad por
                            pagar (pagas el envío al recibir) o sumando el costo
                            al total de tu pedido, según la agencia.
                        </li>
                        <li>
                            🛵{' '}
                            <strong className="text-base-content">
                                Envíos Express (Solo Santiago):
                            </strong>{' '}
                            Si necesitas tu pedido el mismo día o de forma
                            rápida, podemos enviarlo a través de aplicaciones de
                            delivery como Uber Entregas o DiDi Entregas. El
                            costo dependerá de la tarifa de la app en el
                            momento.
                        </li>
                        <li>
                            🤝{' '}
                            <strong className="text-base-content">
                                Entregas Presenciales:
                            </strong>{' '}
                            Coordinamos en las estaciones de metro Ciudad del
                            Niño (Línea 2) o Mirador (Línea 5), en un horario
                            que nos acomode a ambos.
                        </li>
                        <li>
                            🏠{' '}
                            <strong className="text-base-content">
                                Retiro en Bodega/Domicilio:
                            </strong>{' '}
                            Si prefieres, puedes venir a retirar tu pedido
                            directamente a nuestras instalaciones ubicadas en La
                            Granja de manera gratuita, previa coordinación de
                            día y hora.
                        </li>
                    </ul>

                    <p>
                        Una vez que agregues tus productos al carrito y nos
                        contactes por WhatsApp, acordaremos juntos el método que
                        prefieras.
                    </p>
                </div>
            </div>
        </main>
    )
}

export default EnviosYEntregas
