import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FaCheckCircle } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { useCart } from '../context/CartContext'

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams()
    const { clearCart } = useCart()
    const paymentId = searchParams.get('payment_id')
    const status = searchParams.get('status')
    const merchantOrder = searchParams.get('merchant_order_id')

    useEffect(() => {
        // Limpiar carrito ya que el pago fue exitoso
        clearCart()

        // Limpiar respaldo del sessionStorage
        sessionStorage.removeItem('checkoutCart')

        // Mostrar notificación de éxito
        toast.success('¡Pago realizado exitosamente!')
    }, [])

    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="card w-full max-w-md bg-base-100 shadow-xl">
                <div className="card-body text-center">
                    <div className="mb-6">
                        <FaCheckCircle className="mx-auto mb-4 text-6xl text-success" />
                        <h1 className="mb-2 text-3xl font-bold text-success">
                        ¡Pago Exitoso!
                        </h1>
                        <p className="text-lg text-base-content/70">
                        Tu pago ha sido procesado correctamente
                        </p>
                    </div>

                    <div className="rounded-box bg-base-200 p-4 text-left">
                        <h3 className="mb-2 font-semibold">Detalles del Pago:</h3>
                        <div className="space-y-1 text-sm">
                            {paymentId && (
                                <p>
                                    <span className="font-medium">ID de Pago:</span>{' '}
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

                    <div className="space-y-3">
                        <p className="text-sm text-base-content/60">
                            Recibirás un email de confirmación con los detalles de
                            tu compra.
                        </p>

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

export default PaymentSuccess

