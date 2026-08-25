import express from 'express'
import {
    createFranchiseName,
    deleteFranchiseName,
    getAllFranchiseNames,
    getFranchiseNameById,
    updateFranchiseName,
} from '../controllers/franchiseNamesControllers.js'
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', getAllFranchiseNames)
router.get('/:id', getFranchiseNameById)
router.post('/', authenticate, requireAdmin, createFranchiseName)
router.put('/:id', authenticate, requireAdmin, updateFranchiseName)
router.delete('/:id', authenticate, requireAdmin, deleteFranchiseName)

export default router
