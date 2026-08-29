import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FaTimesCircle } from 'react-icons/fa'
import { toast } from 'react-hot-toast'

const PaymentFailure = () => {
    const [searchParams] = useSearchParams()
    const paymentId = searchParams.get('payment_id')
    const status = searchParams.get('status')
    const merchantOrder = searchParams.get('merchant_order_id')

    useEffect(() => {
        // Mostrar notificación de error
        toast.error('El pago no pudo ser procesado')
    }, [])

    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="card w-full max-w-md bg-base-100 shadow-xl">
                <div className="card-body text-center">
                    <div className="mb-6">
                        <FaTimesCircle className="mx-auto mb-4 text-6xl text-error" />
                        <h1 className="mb-2 text-3xl font-bold text-error">
                        Pago Rechazado
                        </h1>
                        <p className="text-lg text-base-content/70">
                        No se pudo procesar tu pago
                        </p>
                    </div>

                    <div className="mb-6 rounded-box bg-base-200 p-4">
                        <h3 className="mb-2 font-semibold">Posibles causas:</h3>
                        <ul className="space-y-1 text-left text-sm">
                            <li>• Fondos insuficientes</li>
                            <li>• Datos de tarjeta incorrectos</li>
                            <li>• Tarjeta vencida o bloqueada</li>
                            <li>• Límite de compra excedido</li>
                        </ul>
                    </div>

                {(paymentId || status || merchantOrder) && (
                    <div className="mb-6 rounded-box bg-base-200 p-4 text-left">
                        <h3 className="mb-2 font-semibold">
                            Detalles del Intento:
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
                        <p className="text-sm text-base-content/60">
                            Puedes intentar nuevamente con otro método de pago o
                            contactar a tu banco.
                        </p>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Link to="/checkout" className="btn btn-primary flex-1">
                                Intentar Nuevamente
                            </Link>
                            <Link to="/" className="btn btn-outline flex-1">
                                Volver al Inicio
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PaymentFailure

