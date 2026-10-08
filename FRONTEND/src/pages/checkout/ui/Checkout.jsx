import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useCart } from '../../../entities/cart'
import { useUser } from '../../../entities/user'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { jsPDF } from 'jspdf'
import { WHATSAPP_URL } from '../../../shared/config/contact'
import {
    DELIVERY_METHODS,
    getDeliveryMethod,
} from '../../../shared/config/shipping'

const Checkout = () => {
    const { cart, total, loading: cartLoading, openModal, clearCart } = useCart()
    const { userInfo } = useUser()

    const [loading, setLoading] = useState(false)
    // La modalidad elegida (shared/config/shipping.js). deliveryType sale de
    // ella: 'delivery' (pide dirección) o 'pickup'; null si no hay elegida
    const [deliveryMethodId, setDeliveryMethodId] = useState(null)
    const deliveryMethod = getDeliveryMethod(deliveryMethodId)
    const deliveryType = deliveryMethod?.deliveryType ?? null
    const [completedOrder, setCompletedOrder] = useState(null)

    const fieldClass = (hasError) =>
        `input input-bordered w-full bg-base-100 ${hasError ? 'input-error' : ''}`

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

    const navigate = useNavigate()

    useEffect(() => {
        if (!cartLoading && !completedOrder && cart.length === 0) {
            toast.error('Tu carrito está vacío. Agrega productos antes de continuar.')
            navigate('/shop')
        }
    }, [cartLoading, completedOrder, cart.length, navigate])

    if (cartLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-base-200">
                <span className="loading loading-spinner loading-lg text-primary" />
            </div>
        )
    }

    if (completedOrder) {
        return (
            <div className="container mx-auto px-4 py-16 sm:py-24 max-w-2xl text-center">
                <div className="flex justify-center mb-6">
                    <div className="h-20 w-20 rounded-full bg-success/10 text-success flex items-center justify-center">
                        <FiCheckCircle size={48} />
                    </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content mb-3">
                    ¡Tu orden #ORD-{completedOrder.folio} fue registrada!
                </h1>
                <p className="text-base-content/70 mb-8">
                    Descargamos tu comprobante en PDF y abrimos WhatsApp con el
                    detalle de tu pedido.
                </p>

                {/* Qué pasa después: la orden queda registrada (no reservada:
                    el stock se descuenta recién al aprobarla) y sin pagar */}
                <div className="text-left bg-base-200/40 rounded-box p-5 sm:p-6 mb-8">
                    <h2 className="text-lg font-bold text-base-content mb-3">
                        ¿Qué sigue?
                    </h2>
                    <ol className="list-decimal pl-5 space-y-2 text-sm text-base-content/80">
                        <li>
                            Envía el mensaje que se abrió en WhatsApp (o usa el
                            botón de abajo).
                        </li>
                        <li>Te respondemos en menos de 1 hora (de 12:00 a 22:00).</li>
                        <li>Pagas cuando confirmemos tu pedido.</li>
                    </ol>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                        href={completedOrder.whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn border-none text-white"
                        style={{ backgroundColor: '#25D366' }}
                    >
                        Reabrir WhatsApp
                    </a>
                    <Link to="/shop" className="btn btn-outline">
                        Seguir comprando
                    </Link>
                </div>
            </div>
        )
    }

    // ==========================================
    // GENERADOR DE PDF
    // ==========================================
    const generatePDF = (data, folio, dateStr, timeStr) => {
        const doc = new jsPDF()

        // --- Encabezado ---
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(20)
        doc.setTextColor(200, 40, 40)
        doc.text('NEBADON STORE', 14, 20)

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100, 100, 100)
        doc.text('Orden de Compra', 14, 26)

        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 0, 0)
        doc.text(`Orden: #ORD-${folio}`, 196, 20, { align: 'right' })
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.text(`Fecha: ${dateStr} - ${timeStr}`, 196, 26, { align: 'right' })

        doc.setDrawColor(200, 200, 200)
        doc.line(14, 32, 196, 32)

        // --- Datos del Cliente y Entrega ---
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.text('Datos del Cliente:', 14, 42)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.text(`${data.firstName} ${data.lastName}`, 14, 48)
        doc.text(`Tel: ${data.phone}`, 14, 54)
        if (data.email && deliveryType === 'delivery')
            doc.text(`Email: ${data.email}`, 14, 60)

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.text('Logística de Entrega:', 105, 42)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)

        // Nombre de la modalidad; la dirección solo en las de despacho
        doc.text(deliveryMethod.name, 105, 48)
        if (deliveryType === 'delivery') {
            doc.text(`${data.street} #${data.number}, ${data.city}`, 105, 54)
            doc.text(`Región: ${data.state}`, 105, 60)
        } else {
            doc.text('Día y hora a convenir por WhatsApp', 105, 54)
        }

        // --- Tabla de Productos ---
        let startY = 75
        doc.setFillColor(240, 240, 240)
        doc.rect(14, startY, 182, 8, 'F')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)

        // Coordenadas X ajustadas para que nada choque
        doc.text('Cant.', 16, startY + 5.5)
        doc.text('SKU', 28, startY + 5.5)
        doc.text('Categoría', 70, startY + 5.5)
        doc.text('Producto', 105, startY + 5.5)
        doc.text('Subtotal', 192, startY + 5.5, { align: 'right' })

        startY += 12
        doc.setFont('helvetica', 'normal')

        cart.forEach((item) => {
            const qty = item.quantity || 1
            const itemTotal = item.price * qty
            const categoryName =
                item.product_category ||
                item.category ||
                item.categoryName ||
                'General'
            const sku = item.sku || 'SIN-SKU'
            // El SKU completo distingue variantes (el sufijo es talla/color):
            // si no entra en su columna (x 28 → 70), sigue en otra línea.
            // Corta solo en los guiones: agrega un espacio después de cada
            // "-" para que splitTextToSize corte ahí, y lo quita al dibujar
            // (solo si no entra en una línea: medido con los espacios, un
            // SKU que sí entra parecería más ancho y se cortaría de más)
            const skuLines =
                doc.getTextWidth(sku) <= 40
                    ? [sku]
                    : doc
                          .splitTextToSize(sku.replace(/-/g, '- '), 40)
                          .map((line) => line.replace(/- /g, '-').trim())

            doc.text(String(qty), 16, startY)
            doc.text(skuLines, 28, startY)
            doc.text(categoryName.substring(0, 15), 70, startY)
            doc.text(item.name.substring(0, 38), 105, startY)
            doc.text(formatPrice(itemTotal), 192, startY, { align: 'right' })

            // Fila de siempre (8 mm) + una línea extra por cada renglón de SKU
            startY += 8 + (skuLines.length - 1) * 4
        })

        doc.setDrawColor(200, 200, 200)
        doc.line(14, startY + 2, 196, startY + 2)

        // --- Total ---
        startY += 12
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.text('TOTAL (sin envío):', 140, startY, { align: 'right' })
        doc.setTextColor(200, 40, 40)
        doc.text(formatPrice(total), 196, startY, { align: 'right' })

        // --- Condiciones de pago ---
        // La fuente va antes de splitTextToSize: el corte depende del tamaño
        startY += 12
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(100, 100, 100)
        const paymentLines = doc.splitTextToSize(
            'Los productos se pagan por transferencia una vez confirmado el pedido por WhatsApp. Envío por agencia: el envío se paga a la agencia al recibir.',
            182,
        )
        // Si no entra antes del margen inferior (15 mm), pasa a una hoja nueva
        const lineHeight = doc.getLineHeight() / doc.internal.scaleFactor
        const pageBottom = doc.internal.pageSize.getHeight() - 15
        if (startY + paymentLines.length * lineHeight > pageBottom) {
            doc.addPage()
            startY = 20
        }
        doc.text(paymentLines, 14, startY)

        doc.save(`Nebadon-Orden-${folio}.pdf`)
    }

    // ==========================================
    // ENVÍO DE FORMULARIO
    // ==========================================
    const onSubmit = async (data) => {
        setLoading(true)

        try {
            const orderPayload = {
                // deliveryType se sigue mandando: un backend anterior al paso
                // 54 ignora deliveryMethod y guarda la orden con este
                deliveryType,
                deliveryMethod: deliveryMethod.id,
                customer: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: deliveryType === 'delivery' ? data.email : '',
                    phone: data.phone,
                },
                shippingInfo:
                    deliveryType === 'delivery'
                        ? {
                              street: data.street,
                              number: data.number,
                              city: data.city,
                              state: data.state,
                              zipCode: data.zipCode,
                          }
                        : {},
                items: cart.map((item) => ({
                    _id: item._id,
                    sku: item.sku || 'SIN-SKU',
                    size: item.size || '',
                    baseColor: item.baseColor || '',
                    name: item.name,
                    category:
                        item.product_category || item.category || 'Calcetines',
                    price: item.price,
                    quantity: item.quantity || 1,
                    imageUrl: item.imageUrl || '',
                })),
                totalAmount: total,
            }

            const baseUrl =
                import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api/'
            const apiUrl = `${baseUrl}orders/whatsapp`

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload),
            })

            const result = await response.json()
            if (!response.ok)
                throw new Error(result.message || 'Error del servidor')

            const folio = result.orderNumber
            const today = new Date()
            const dateStr = today.toLocaleDateString('es-CL')
            const timeStr = today.toLocaleTimeString('es-CL', {
                hour: '2-digit',
                minute: '2-digit',
            })

            // Generamos el PDF
            generatePDF(data, folio, dateStr, timeStr)

            // ==========================================
            // MENSAJE DE WHATSAPP (ESTILO MATRICIAL)
            // ==========================================
            let message = `┌────────────────────────┐\n`
            message += `│    NEBADON STORE       │\n`
            message += `│   ORDEN DE COMPRA      │\n`
            message += `├────────────────────────┤\n`
            message += `│ Folio : #ORD-${folio}        │\n`
            message += `│ Fecha : ${dateStr}     │\n`
            message += `│ Hora  : ${timeStr}          │\n`
            message += `└────────────────────────┘\n\n`

            message += `👤 *CLIENTE*\n`
            message += `├ Nombre: ${data.firstName} ${data.lastName}\n`
            message += `└ Tel   : ${data.phone}\n`
            if (data.email && deliveryType === 'delivery') {
                message += `└ Email : ${data.email}\n`
            }
            message += `\n`

            message += `🚚 *ENTREGA*\n`
            message += `└ ${deliveryMethod.name}${deliveryType === 'delivery' ? `: ${data.street} #${data.number}, ${data.city}` : ''}\n\n`

            message += `📦 *DETALLE DE ÍTEMS*\n`
            message += `┌────────────────────────┐\n`

            cart.forEach((item, index) => {
                const qty = item.quantity || 1
                const itemNum = String(index + 1).padStart(2, '0')
                const categoryName =
                    item.product_category || item.category || 'General'
                const sku = item.sku || 'SIN-SKU'
                const subtotal = formatPrice(item.price * qty)

                message += `│ #${itemNum} | Qty: ${qty}\n`
                message += `│ [${categoryName}] - [${sku}]\n`
                message += `│ ${item.name}\n`
                message += `│ Subtotal: ${subtotal}\n`
                message += `├────────────────────────┤\n`
            })

            message += `│ *TOTAL (sin envío): ${formatPrice(total)}*\n`
            message += `└────────────────────────┘\n\n`
            message += `Hola, acabo de enviar la orden #ORD-${folio} desde la web y descargué mi PDF. Quedo atento(a) a la confirmación.`

            const encodedMessage = encodeURIComponent(message)
            const whatsappUrl = `${WHATSAPP_URL}?text=${encodedMessage}`
            window.open(whatsappUrl, '_blank')

            toast.success(`¡Orden #ORD-${folio} registrada exitosamente!`)

            setCompletedOrder({ folio, whatsappUrl })
            await clearCart()
        } catch (error) {
            toast.error(error.message || 'Hubo un error al procesar el pedido.')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-6 sm:py-10 max-w-7xl">
            <div className="mb-8 text-center">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-base-content">
                    Orden de Compra
                </h1>
                <p className="text-xs sm:text-sm text-base-content/60 mt-2">
                    Elige cómo quieres recibir tu pedido. Lo enviarás por
                    WhatsApp y te responderemos para confirmar la entrega y el
                    pago.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-12 items-start">
                {/* COLUMNA IZQUIERDA: FORMULARIO */}
                <div className="lg:col-span-7 flex flex-col h-full">
                    <div className="card bg-base-100 shadow-xl border border-base-200 h-full">
                        <div className="card-body p-5 sm:p-8 flex flex-col justify-center">
                            {deliveryType === null ? (
                                <div className="py-4 animate-fadeIn my-auto">
                                    <h2 className="text-lg sm:text-xl font-bold mb-2 text-center text-base-content">
                                        ¿Cómo deseas recibir tu pedido?
                                    </h2>
                                    <p className="text-xs text-center text-base-content/60 mb-6">
                                        Elige una opción para continuar.
                                    </p>

                                    {/* Una tarjeta compacta por modalidad: ícono a la
                                        izquierda, nombre y condición a la derecha */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {DELIVERY_METHODS.map((method) => (
                                            <button
                                                key={method.id}
                                                type="button"
                                                onClick={() =>
                                                    setDeliveryMethodId(method.id)
                                                }
                                                className="flex items-center gap-3 p-4 rounded-2xl border-2 border-base-200 hover:border-primary hover:bg-primary/5 transition-all text-left group"
                                            >
                                                <span className="h-11 w-11 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <method.icon aria-hidden="true" className="h-5 w-5" />
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block text-sm font-bold text-base-content">
                                                        {method.name}
                                                    </span>
                                                    <span className="block text-xs text-base-content/60 mt-0.5">
                                                        {method.condition}
                                                    </span>
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <form
                                    onSubmit={handleSubmit(onSubmit)}
                                    className="flex flex-col gap-5 animate-fadeIn"
                                >
                                    <div className="flex items-center justify-between gap-3 border-b border-base-200 pb-3">
                                        {/* flex-wrap: en 375 px el nombre de la
                                            modalidad y el título pueden no caber
                                            en una línea */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="badge badge-primary badge-sm font-semibold">
                                                {deliveryMethod.name}
                                            </span>
                                            <h2 className="text-base font-bold text-base-content">
                                                Datos de contacto
                                            </h2>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setDeliveryMethodId(null)
                                            }
                                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                        >
                                            <FiArrowLeft size={14} /> Cambiar
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <input
                                                {...register('firstName', {
                                                    required: 'Requerido',
                                                })}
                                                className={fieldClass(
                                                    Boolean(errors.firstName),
                                                )}
                                                type="text"
                                                placeholder="Nombre *"
                                            />
                                            {errors.firstName && (
                                                <p className="mt-1 ml-1 text-xs text-error">
                                                    {errors.firstName.message}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <input
                                                {...register('lastName', {
                                                    required: 'Requerido',
                                                })}
                                                className={fieldClass(
                                                    Boolean(errors.lastName),
                                                )}
                                                type="text"
                                                placeholder="Apellido *"
                                            />
                                            {errors.lastName && (
                                                <p className="mt-1 ml-1 text-xs text-error">
                                                    {errors.lastName.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <input
                                            {...register('phone', {
                                                required: 'Requerido',
                                                minLength: 8,
                                            })}
                                            className={fieldClass(
                                                Boolean(errors.phone),
                                            )}
                                            type="tel"
                                            placeholder="Teléfono / WhatsApp * (Ej: +56912345678)"
                                        />
                                        {errors.phone && (
                                            <p className="mt-1 ml-1 text-xs text-error">
                                                {errors.phone.message}
                                            </p>
                                        )}
                                    </div>

                                    {deliveryType === 'delivery' && (
                                        <div>
                                            <input
                                                {...register('email')}
                                                className={fieldClass(
                                                    Boolean(errors.email),
                                                )}
                                                type="email"
                                                placeholder="Email (Opcional)"
                                            />
                                        </div>
                                    )}

                                    {deliveryType === 'delivery' && (
                                        <div className="bg-base-200/40 p-4 rounded-xl border border-base-200 space-y-4">
                                            <p className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                                                Dirección de entrega
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div className="md:col-span-2">
                                                    <input
                                                        {...register('street', {
                                                            required:
                                                                'Requerido',
                                                        })}
                                                        className={fieldClass(
                                                            Boolean(
                                                                errors.street,
                                                            ),
                                                        )}
                                                        type="text"
                                                        placeholder="Calle *"
                                                    />
                                                </div>
                                                <div>
                                                    <input
                                                        {...register('number', {
                                                            required:
                                                                'Requerido',
                                                        })}
                                                        className={fieldClass(
                                                            Boolean(
                                                                errors.number,
                                                            ),
                                                        )}
                                                        type="text"
                                                        placeholder="N° / Depto *"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <input
                                                        {...register('city', {
                                                            required:
                                                                'Requerido',
                                                        })}
                                                        className={fieldClass(
                                                            Boolean(
                                                                errors.city,
                                                            ),
                                                        )}
                                                        type="text"
                                                        placeholder="Comuna / Ciudad *"
                                                    />
                                                </div>
                                                <div>
                                                    <input
                                                        {...register('state', {
                                                            required:
                                                                'Requerido',
                                                        })}
                                                        className={fieldClass(
                                                            Boolean(
                                                                errors.state,
                                                            ),
                                                        )}
                                                        type="text"
                                                        placeholder="Región *"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <p className="mt-4 text-center text-xs sm:text-sm text-base-content/70">
                                        Todavía no pagas nada. Te escribiremos por
                                        WhatsApp para confirmar el stock, la entrega
                                        y los datos de transferencia.
                                    </p>

                                    <button
                                        type="submit"
                                        disabled={loading || cart.length === 0}
                                        className="btn w-full h-14 rounded-2xl border-none text-white shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
                                        style={{ backgroundColor: '#25D366' }}
                                    >
                                        {loading ? (
                                            <span className="loading loading-spinner loading-sm" />
                                        ) : (
                                            <>
                                                <FaWhatsapp aria-hidden="true" className="h-6 w-6" />
                                                <span className="text-sm md:text-base font-extrabold tracking-tight uppercase">
                                                    Enviar pedido por WhatsApp
                                                </span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA: RESUMEN DE ORDEN */}
                <div className="lg:col-span-5 card bg-base-100 shadow-xl border border-base-200 h-fit sticky top-24">
                    <div className="card-body p-5 sm:p-8">
                        <div className="mb-4 flex flex-row items-center justify-between border-b border-base-200 pb-4">
                            <h2 className="text-base sm:text-lg font-bold text-base-content">
                                Resumen de la Orden
                            </h2>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault()
                                    openModal()
                                }}
                                className="text-[10px] sm:text-xs font-bold text-primary hover:text-primary/80 uppercase bg-primary/10 px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                                Editar
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[350px] overflow-y-auto px-2 pt-3 custom-scrollbar">
                            {cart.map((item) => (
                                <div
                                    key={`${item._id}-${item.sku}`}
                                    className="flex items-center justify-between border-b border-base-200/60 pb-3"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="indicator">
                                            <span className="indicator-item badge badge-primary badge-sm font-bold z-10 shadow-sm border-none">
                                                {item.quantity || 1}
                                            </span>
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl object-cover border border-base-200"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-xs sm:text-sm font-medium line-clamp-2 max-w-[130px] sm:max-w-[150px] text-base-content leading-tight">
                                                {item.name}
                                            </h3>
                                            {[item.size, item.baseColor].filter(Boolean).join(' · ') && (
                                                <p className="mt-0.5 text-xs text-base-content/40 font-medium">
                                                    {[item.size, item.baseColor].filter(Boolean).join(' · ')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-xs sm:text-sm font-bold text-primary whitespace-nowrap">
                                        {formatPrice(
                                            item.price * (item.quantity || 1),
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 mt-1 border-t border-base-200">
                            <div className="flex items-center justify-between text-lg sm:text-xl font-black">
                                <span>Total (sin envío):</span>
                                <span className="text-primary">
                                    {formatPrice(total)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Checkout
