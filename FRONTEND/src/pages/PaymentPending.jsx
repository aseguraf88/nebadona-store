import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FaClock } from 'react-icons/fa'
import { toast } from 'react-hot-toast'

const PaymentPending = () => {
    const [searchParams] = useSearchParams()
    const paymentId = searchParams.get('payment_id')
    const status = searchParams.get('status')
    const merchantOrder = searchParams.get('merchant_order_id')

    useEffect(() => {
        // Mostrar notificación de pendiente
        toast('Pago en proceso de verificación', {
            icon: '⏳',
            duration: 4000,
        })
    }, [])

    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="card w-full max-w-md bg-base-100 shadow-xl">
                <div className="card-body text-center">
                    <div className="mb-6">
                        <FaClock className="mx-auto mb-4 text-6xl text-warning" />
                        <h1 className="mb-2 text-3xl font-bold text-warning">
                        Pago Pendiente
                        </h1>
                        <p className="text-lg text-base-content/70">
                        Tu pago está siendo procesado
                        </p>
                    </div>

                    <div className="mb-6 rounded-box bg-base-200 p-4">
                        <h3 className="mb-2 font-semibold">¿Qué significa esto?</h3>
                        <div className="space-y-2 text-left text-sm">
                            <p>
                                Tu pago está siendo verificado por Mercado Pago.
                                Esto puede suceder cuando:
                            </p>
                            <ul className="ml-4 space-y-1">
                                <li>
                                    • Pagaste en efectivo (Rapipago, Pago Fácil,
                                    etc.)
                                </li>
                                <li>• Usaste transferencia bancaria</li>
                                <li>• El banco está verificando la transacción</li>
                            </ul>
                        </div>
                    </div>

                {(paymentId || status || merchantOrder) && (
                    <div className="mb-6 rounded-box bg-base-200 p-4 text-left">
                        <h3 className="mb-2 font-semibold">
                            Detalles del Pago:
                        </h3>
                        <div className="space-y-1 text-sm">
                            {paymentId && (
                                <p>
                                    <span className="font-medium">
                                        ID de Pago:
                                    </span>{' '}
                                    {paymentId}
                                </p>
                            )}
                            {status && (
                                <p>
                                    <span className="font-medium">Estado:</span>{' '}
                                    {status}
                                </p>
                            )}
                            {merchantOrder && (
                                <p>
                                    <span className="font-medium">Orden:</span>{' '}
                                    {merchantOrder}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                    <div className="space-y-3">
                        <div className="alert alert-info">
                            <div className="text-sm">
                                <p className="font-medium">
                                    Te notificaremos por email
                                </p>
                                <p>
                                    Una vez que se confirme el pago, recibirás un
                                    email de confirmación.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Link to="/" className="btn btn-primary flex-1">
                                Volver al Inicio
                            </Link>
                            <Link to="/orders" className="btn btn-outline flex-1">
                                Ver mis Órdenes
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PaymentPending

