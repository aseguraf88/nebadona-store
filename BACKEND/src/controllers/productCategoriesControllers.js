import ProductCategoryModel from '../models/ProductCategoryModel.js'
import ProductModel from '../models/ProductModel.js'
import { productCategorySchema } from '../schemas/productCategorySchema.js'
import { ZodError } from 'zod'

export const createProductCategory = async (req, res) => {
    try {
        const { name } = productCategorySchema.parse(req.body)

        const productCategory = await ProductCategoryModel.create({ name })

        return res.status(201).json({
            message: 'Categoria creada exitosamente.',
            productCategory,
        })
    } catch (error) {
        if (error instanceof ZodError) {
            return res
                .status(400)
                .json(error.issues.map((issue) => ({ message: issue.message })))
        }

        return res.status(500).json({ message: 'Error al crear la categoria.' })
    }
}

export const updateProductCategory = async (req, res) => {
    try {
        const validatedData = productCategorySchema.partial().parse(req.body)

        const existingProductCategory = await ProductCategoryModel.findById(
            req.params.id,
        )

        if (!existingProductCategory) {
            return res.status(404).json({ message: 'Categoria no encontrada.' })
        }

        const previousName = existingProductCategory.name

        const updatedProductCategory = await ProductCategoryModel.findByIdAndUpdate(
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
                { product_category: previousName },
                { $set: { product_category: validatedData.name } },
            )
        }

        return res.status(200).json(updatedProductCategory)
    } catch (error) {
        if (error instanceof ZodError) {
            return res
                .status(400)
                .json(error.issues.map((issue) => ({ message: issue.message })))
        }

        return res
            .status(500)
            .json({ message: 'Error al actualizar la categoria.' })
    }
}

export const getProductCategoryById = async (req, res) => {
    try {
        const productCategory = await ProductCategoryModel.findById(req.params.id)

        if (!productCategory) {
            return res.status(404).json({ message: 'Categoria no encontrada.' })
        }

        return res.status(200).json(productCategory)
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener la categoria.' })
    }
}

export const getAllProductCategories = async (_req, res) => {
    try {
        const productCategories = await ProductCategoryModel.find().sort({
            name: 1,
        })
        return res.status(200).json(productCategories)
    } catch (error) {
        return res
            .status(500)
            .json({ message: 'Error al obtener categorias.' })
    }
}

export const deleteProductCategory = async (req, res) => {
    try {
        const deletedProductCategory =
            await ProductCategoryModel.findByIdAndDelete(req.params.id)

        if (!deletedProductCategory) {
            return res.status(404).json({ message: 'Categoria no encontrada.' })
        }

        await ProductModel.updateMany(
            { product_category: deletedProductCategory.name },
            { $set: { product_category: '' } },
        )

        return res.status(200).json(deletedProductCategory)
    } catch (error) {
        return res.status(500).json({ message: 'Error al eliminar la categoria.' })
    }
}
