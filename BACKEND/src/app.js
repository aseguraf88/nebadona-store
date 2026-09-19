import express from 'express'
import authRoutes from './routes/authRoutes.js'
import productsRoutes from './routes/productsRoutes.js'
import productCategoriesRoutes from './routes/productCategoriesRoutes.js'
import designThemesRoutes from './routes/designThemesRoutes.js'
import franchiseNamesRoutes from './routes/franchiseNamesRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'

const app = express()

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Demasiadas peticiones. Inténtalo de nuevo más tarde.',
    },
})

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message:
            'Demasiados intentos de autenticación. Inténtalo de nuevo más tarde.',
    },
})

app.disable('x-powered-by')
app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Cookie',
            'Set-Cookie',
        ],
        credentials: true,
    })
)
app.use(cookieParser())
app.use(generalLimiter)
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true, limit: '2mb' }))
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    res.setHeader('X-Frame-Options', 'DENY')
    next()
})

app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/products', productsRoutes)
app.use('/api/product-categories', productCategoriesRoutes)
app.use('/api/design-themes', designThemesRoutes)
app.use('/api/franchise-names', franchiseNamesRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)

app.use((req, res) => {
    res.status(404).json({ message: 'Recurso no encontrado.' })
})

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err)
    res.status(err.status || 500).json({
        message: 'Error interno del servidor.',
    })
})

export default app
