import express from 'express'
import {
    createProductCategory,
    deleteProductCategory,
    getAllProductCategories,
    getProductCategoryById,
    updateProductCategory,
} from '../controllers/productCategoriesControllers.js'
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', getAllProductCategories)
router.get('/:id', getProductCategoryById)
router.post('/', authenticate, requireAdmin, createProductCategory)
router.put('/:id', authenticate, requireAdmin, updateProductCategory)
router.delete('/:id', authenticate, requireAdmin, deleteProductCategory)

export default router
