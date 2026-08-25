import express from 'express'
import {
    createDesignTheme,
    deleteDesignTheme,
    getAllDesignThemes,
    getDesignThemeById,
    updateDesignTheme,
} from '../controllers/designThemesControllers.js'
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', getAllDesignThemes)
router.get('/:id', getDesignThemeById)
router.post('/', authenticate, requireAdmin, createDesignTheme)
router.put('/:id', authenticate, requireAdmin, updateDesignTheme)
router.delete('/:id', authenticate, requireAdmin, deleteDesignTheme)

export default router
