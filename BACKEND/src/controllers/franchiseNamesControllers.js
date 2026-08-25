import FranchiseNameModel from '../models/FranchiseNameModel.js'
import ProductModel from '../models/ProductModel.js'
import { franchiseNameSchema } from '../schemas/franchiseNameSchema.js'
import { ZodError } from 'zod'

export const createFranchiseName = async (req, res) => {
    try {
        const { name } = franchiseNameSchema.parse(req.body)

        const franchiseName = await FranchiseNameModel.create({ name })

        return res.status(201).json({
            message: 'Franquicia creada exitosamente.',
            franchiseName,
        })
    } catch (error) {
        if (error instanceof ZodError) {
            return res
                .status(400)
                .json(error.issues.map((issue) => ({ message: issue.message })))
        }

        return res.status(500).json({ message: 'Error al crear la franquicia.' })
    }
}

export const updateFranchiseName = async (req, res) => {
    try {
        const validatedData = franchiseNameSchema.partial().parse(req.body)

        const existingFranchiseName = await FranchiseNameModel.findById(req.params.id)

        if (!existingFranchiseName) {
            return res.status(404).json({ message: 'Franquicia no encontrada.' })
        }

        const previousName = existingFranchiseName.name

        const updatedFranchiseName = await FranchiseNameModel.findByIdAndUpdate(
            req.params.id,
            validatedData,
            { new: true, runValidators: true },
        )

        if (
            validatedData.name &&
            previousName &&
            previousName !== validatedData.name
        ) {
            await ProductModel.updateMany(
                { franchise_name: previousName },
                { $set: { franchise_name: validatedData.name } },
            )
        }

        return res.status(200).json(updatedFranchiseName)
    } catch (error) {
        if (error instanceof ZodError) {
            return res
                .status(400)
                .json(error.issues.map((issue) => ({ message: issue.message })))
        }

        return res
            .status(500)
            .json({ message: 'Error al actualizar la franquicia.' })
    }
}

export const getFranchiseNameById = async (req, res) => {
    try {
        const franchiseName = await FranchiseNameModel.findById(req.params.id)

        if (!franchiseName) {
            return res.status(404).json({ message: 'Franquicia no encontrada.' })
        }

        return res.status(200).json(franchiseName)
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener la franquicia.' })
    }
}

export const getAllFranchiseNames = async (_req, res) => {
    try {
        const franchiseNames = await FranchiseNameModel.find().sort({ name: 1 })
        return res.status(200).json(franchiseNames)
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener franquicias.' })
    }
}

export const deleteFranchiseName = async (req, res) => {
    try {
        const deletedFranchiseName = await FranchiseNameModel.findByIdAndDelete(
            req.params.id,
        )

        if (!deletedFranchiseName) {
            return res.status(404).json({ message: 'Franquicia no encontrada.' })
        }

        await ProductModel.updateMany(
            { franchise_name: deletedFranchiseName.name },
            { $set: { franchise_name: '' } },
        )

        return res.status(200).json(deletedFranchiseName)
    } catch (error) {
        return res
            .status(500)
            .json({ message: 'Error al eliminar la franquicia.' })
    }
}
