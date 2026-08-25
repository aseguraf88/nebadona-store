import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useCart } from '../context/CartContext'
import { useUser } from '../context/UserContext'
// import { createOrder } from '../services/orderServices' // Lo comento por si en el futuro quieres volver a usar pasarela
import toast from 'react-hot-toast'

const Checkout = () => {
    const { cart, total, loading: cartLoading } = useCart()
    const { userInfo } = useUser()
    const [loading, setLoading] = useState(false)
    const fieldClass = (hasError) =>
        `input input-bordered w-full ${hasError ? 'input-error' : ''}`

    // Formateador de precios para el mensaje
    const formatPrice = (amount) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
        }).format(amount || 0)
    }

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            firstName: '',
            lastName: '',
            email: userInfo?.email || '',
            phone: '',
            street: '',
            number: '',
            city: '',
            state: '',
            zipCode: '',
        },
        mode: 'onChange',
    })

    if (cartLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-base-200">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg" />
                    <p className="mt-4 text-lg">Cargando carrito....</p>
                </div>
            </div>
        )
    }

    const onSubmit = (data) => {
        setLoading(true)

        try {
            // 1. EL NÚMERO DE TU SEÑORA
            const phoneNumber = '56968048987'

            // Generar fecha y hora actual para el membrete
            const today = new Date()
            const dateStr = today.toLocaleDateString('es-CL')
            const timeStr = today.toLocaleTimeString('es-CL', {
                hour: '2-digit',
                minute: '2-digit',
            })

            // 2. Construir el membrete de la Orden de Compra
            let message = `*================================*\n`
            message += `*ORDEN DE COMPRA NEBADONA*\n`
            message += `*Fecha emisión:* ${dateStr} ${timeStr}\n`
            message += `*================================*\n\n`

            // 3. Bloque de Datos del Cliente
            message += `*1. DATOS DEL CLIENTE*\n`
            message += `--------------------------------\n`
            message += `Nombre: ${data.firstName} ${data.lastName}\n`
            message += `Teléfono: ${data.phone}\n`
            message += `Email: ${data.email}\n\n`

            // 4. Bloque de Datos de Despacho
            message += `*2. DATOS DE DESPACHO*\n`
            message += `--------------------------------\n`
            message += `Dirección: ${data.street} ${data.number}\n`
            message += `Comuna/Ciudad: ${data.city}\n`
            message += `Región: ${data.state}\n`
            message += `Cód. Postal: ${data.zipCode}\n\n`

            // 5. Bloque de Detalle del Pedido
            message += `*3. DETALLE DEL PEDIDO*\n`
            message += `--------------------------------\n`
            cart.forEach((item) => {
                const itemTotal = item.price * (item.quantity || 1)
                message += `${item.quantity || 1}x ${item.name}\n`
                message += `   Subtotal: ${formatPrice(itemTotal)}\n`
            })
            message += `--------------------------------\n`

            // 6. Totales y Cierre Formal
            message += `*TOTAL A PAGAR: ${formatPrice(total)}*\n`
            message += `_(Valores incluyen IVA)_\n`
            message += `*================================*\n\n`

            message += `Solicito confirmación de recepción de esta orden y los datos para realizar la transferencia bancaria.`

            // 7. Codificar y redirigir
            const encodedMessage = encodeURIComponent(message)
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`

            window.open(whatsappUrl, '_blank')
            toast.success('¡Orden generada con éxito!')
        } catch (error) {
            toast.error('Hubo un error al generar la orden.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="mb-8 text-center text-3xl font-bold">
                Finalizar Compra
            </h1>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Formulario de envío */}
                <div className="card bg-base-100 shadow-xl border border-base-200">
                    <div className="card-body">
                        <h2 className="mb-6 text-2xl font-semibold">
                            Tus datos para el envío
                        </h2>

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="flex flex-col gap-4 lg:gap-6"
                        >
                            {/* --- SE MANTIENEN EXACTAMENTE TUS MISMOS INPUTS --- */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
                                <div>
                                    <input
                                        {...register('firstName', {
                                            required: 'El nombre es requerido',
                                            minLength: {
                                                value: 2,
                                                message: 'Mínimo 2 caracteres',
                                            },
                                            maxLength: {
                                                value: 50,
                                                message: 'Máximo 50 caracteres',
                                            },
                                            pattern: {
                                                value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                                                message:
                                                    'Solo se permiten letras',
                                            },
                                        })}
                                        className={fieldClass(
                                            Boolean(errors.firstName),
                                        )}
                                        type="text"
                                        placeholder="Nombre *"
                                    />
                                    {errors.firstName && (
                                        <p className="mt-2 ml-1 text-sm text-error">
                                            {errors.firstName.message}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <input
                                        {...register('lastName', {
                                            required:
                                                'El apellido es requerido',
                                            minLength: {
                                                value: 2,
                                                message: 'Mínimo 2 caracteres',
                                            },
                                            maxLength: {
                                                value: 50,
                                                message: 'Máximo 50 caracteres',
                                            },
                                            pattern: {
                                                value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                                                message:
                                                    'Solo se permiten letras',
                                            },
                                        })}
                                        className={fieldClass(
                                            Boolean(errors.lastName),
                                        )}
                                        type="text"
                                        placeholder="Apellido *"
                                    />
                                    {errors.lastName && (
                                        <p className="mt-2 ml-1 text-sm text-error">
                                            {errors.lastName.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <input
                                    {...register('email', {
                                        required: 'El email es requerido',
                                        pattern: {
                                            value: /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_+-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/,
                                            message: 'Email inválido',
                                        },
                                    })}
                                    className={fieldClass(
                                        Boolean(errors.email),
                                    )}
                                    type="email"
                                    placeholder="Email *"
                                />
                                {errors.email && (
                                    <p className="mt-2 ml-1 text-sm text-error">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <input
                                    {...register('phone', {
                                        required: 'El teléfono es requerido',
                                        pattern: {
                                            value: /^[0-9+\-\s()]+$/,
                                            message: 'Formato inválido',
                                        },
                                        minLength: {
                                            value: 8,
                                            message: 'Mínimo 8 dígitos',
                                        },
                                    })}
                                    className={fieldClass(
                                        Boolean(errors.phone),
                                    )}
                                    type="tel"
                                    placeholder="Teléfono * (Ej: +569 1234 5678)"
                                />
                                {errors.phone && (
                                    <p className="mt-2 ml-1 text-sm text-error">
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
                                <div className="md:col-span-2">
                                    <input
                                        {...register('street', {
                                            required: 'La calle es requerida',
                                        })}
                                        className={fieldClass(
                                            Boolean(errors.street),
                                        )}
                                        type="text"
                                        placeholder="Calle *"
                                    />
                                    {errors.street && (
                                        <p className="mt-2 ml-1 text-sm text-error">
                                            {errors.street.message}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <input
                                        {...register('number', {
                                            required: 'El número es requerido',
                                        })}
                                        className={fieldClass(
                                            Boolean(errors.number),
                                        )}
                                        type="text"
                                        placeholder="Número *"
                                    />
                                    {errors.number && (
                                        <p className="mt-2 ml-1 text-sm text-error">
                                            {errors.number.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
                                <div>
                                    <input
                                        {...register('city', {
                                            required: 'La ciudad es requerida',
                                        })}
                                        className={fieldClass(
                                            Boolean(errors.city),
                                        )}
                                        type="text"
                                        placeholder="Comuna / Ciudad *"
                                    />
                                    {errors.city && (
                                        <p className="mt-2 ml-1 text-sm text-error">
                                            {errors.city.message}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <input
                                        {...register('state', {
                                            required: 'La región es requerida',
                                        })}
                                        className={fieldClass(
                                            Boolean(errors.state),
                                        )}
                                        type="text"
                                        placeholder="Región *"
                                    />
                                    {errors.state && (
                                        <p className="mt-2 ml-1 text-sm text-error">
                                            {errors.state.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <input
                                    {...register('zipCode', {
                                        required:
                                            'El código postal es requerido',
                                    })}
                                    className={fieldClass(
                                        Boolean(errors.zipCode),
                                    )}
                                    type="text"
                                    placeholder="Código Postal *"
                                />
                                {errors.zipCode && (
                                    <p className="mt-2 ml-1 text-sm text-error">
                                        {errors.zipCode.message}
                                    </p>
                                )}
                            </div>

                            {/* 🔥 BOTÓN DE WHATSAPP OFICIAL */}
                            <button
                                type="submit"
                                disabled={loading || cart.length === 0}
                                className="btn mt-6 w-full h-14 rounded-2xl text-sm font-bold uppercase tracking-widest border-none text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                                style={{ backgroundColor: '#25D366' }}
                            >
                                {loading ? (
                                    <>
                                        <span className="loading loading-spinner" />
                                        Generando Orden...
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            fill="currentColor"
                                            viewBox="0 0 16 16"
                                        >
                                            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.005-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                                        </svg>
                                        Enviar Pedido por WhatsApp
                                    </>
                                )}
                            </button>
                            <p className="text-xs text-center text-base-content/60 mt-2">
                                No te cobraremos nada aún. Coordinaremos el pago
                                directo por chat.
                            </p>
                        </form>
                    </div>
                </div>

                {/* Resumen de la orden */}
                <div className="card bg-base-100 shadow-xl border border-base-200 h-fit sticky top-24">
                    <div className="card-body">
                        <h2 className="mb-6 text-2xl font-semibold">
                            Resumen de la Orden
                        </h2>

                        <div className="space-y-4">
                            {cart.map((item) => (
                                <div
                                    key={item._id}
                                    className="flex items-center justify-between border-b border-base-200 pb-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="indicator">
                                            <span className="indicator-item badge badge-primary badge-sm">
                                                {item.quantity || 1}
                                            </span>
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="h-16 w-16 rounded-xl object-cover border border-base-200"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-medium line-clamp-1 max-w-[150px]">
                                                {item.name}
                                            </h3>
                                        </div>
                                    </div>
                                    <span className="font-semibold text-primary">
                                        {formatPrice(
                                            item.price * (item.quantity || 1),
                                        )}
                                    </span>
                                </div>
                            ))}

                            <div className="pt-4">
                                <div className="flex items-center justify-between text-2xl font-bold">
                                    <span>Total:</span>
                                    <span className="text-primary">
                                        {formatPrice(total)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Checkout
