import DesignThemeModel from '../models/DesignThemeModel.js'
import ProductModel from '../models/ProductModel.js'
import { designThemeSchema } from '../schemas/designThemeSchema.js'
import { ZodError } from 'zod'

export const createDesignTheme = async (req, res) => {
    try {
        const { name } = designThemeSchema.parse(req.body)

        const designTheme = await DesignThemeModel.create({ name })

        return res.status(201).json({
            message: 'Tema creado exitosamente.',
            designTheme,
        })
    } catch (error) {
        if (error instanceof ZodError) {
            return res
                .status(400)
                .json(error.issues.map((issue) => ({ message: issue.message })))
        }

        return res.status(500).json({ message: 'Error al crear el tema.' })
    }
}

export const updateDesignTheme = async (req, res) => {
    try {
        const validatedData = designThemeSchema.partial().parse(req.body)

        const existingDesignTheme = await DesignThemeModel.findById(req.params.id)

        if (!existingDesignTheme) {
            return res.status(404).json({ message: 'Tema no encontrado.' })
        }

        const previousName = existingDesignTheme.name

        const updatedDesignTheme = await DesignThemeModel.findByIdAndUpdate(
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
                { design_theme: previousName },
                { $set: { design_theme: validatedData.name } },
            )
        }

        return res.status(200).json(updatedDesignTheme)
    } catch (error) {
        if (error instanceof ZodError) {
            return res
                .status(400)
                .json(error.issues.map((issue) => ({ message: issue.message })))
        }

        return res.status(500).json({ message: 'Error al actualizar el tema.' })
    }
}

export const getDesignThemeById = async (req, res) => {
    try {
        const designTheme = await DesignThemeModel.findById(req.params.id)

        if (!designTheme) {
            return res.status(404).json({ message: 'Tema no encontrado.' })
        }

        return res.status(200).json(designTheme)
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener el tema.' })
    }
}

export const getAllDesignThemes = async (_req, res) => {
    try {
        const designThemes = await DesignThemeModel.find().sort({ name: 1 })
        return res.status(200).json(designThemes)
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener temas.' })
    }
}

export const deleteDesignTheme = async (req, res) => {
    try {
        const deletedDesignTheme = await DesignThemeModel.findByIdAndDelete(
            req.params.id,
        )

        if (!deletedDesignTheme) {
            return res.status(404).json({ message: 'Tema no encontrado.' })
        }

        await ProductModel.updateMany(
            { design_theme: deletedDesignTheme.name },
            { $set: { design_theme: '' } },
        )

        return res.status(200).json(deletedDesignTheme)
    } catch (error) {
        return res.status(500).json({ message: 'Error al eliminar el tema.' })
    }
}
