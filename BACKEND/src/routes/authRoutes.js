import express from 'express'
import {
    profile,
    loginUser,
    logout,
} from '../controllers/authControllers.js'
import { authenticate } from '../middleware/authMiddleware.js'

const router = express.Router()

// Registro de cuentas desactivado: los clientes compran como invitados y el
// admin ya existe. Cerrarlo evita además que, con la colección de usuarios
// vacía, el primero en registrarse quede como admin (isFirstUser). Para
// reactivarlo, volver a router.post('/register', registerUser): la función
// sigue en authControllers.js
router.post('/register', (req, res) =>
    res
        .status(403)
        .json({ message: 'El registro de cuentas no está disponible.' }),
)
router.post('/login', loginUser)
router.post('/logout', logout)
router.get('/profile', authenticate, profile)

export default router
