import express from 'express'
import {
    registerUser,
    profile,
    loginUser,
    logout,
} from '../controllers/authControllers.js'
import { authenticate } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', logout)
router.get('/profile', authenticate, profile)

export default router
