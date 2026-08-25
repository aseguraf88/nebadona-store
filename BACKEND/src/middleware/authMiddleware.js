import jwt from 'jsonwebtoken'
import UserModel from '../models/UserModel.js'

export const authenticate = async (req, res, next) => {
    const token = req.cookies?.accessToken || (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null)

    if (!token) {
        return res.status(401).json({ message: 'No autorizado.' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if (!decoded?.userId) {
            return res.status(401).json({ message: 'No autorizado.' })
        }

        const user = await UserModel.findById(decoded.userId).select('-password')

        if (!user) {
            return res.status(401).json({ message: 'No autorizado.' })
        }

        req.user = user
        next()
    } catch (error) {
        return res.status(401).json({ message: 'No autorizado.' })
    }
}

export const requireAdmin = (req, res, next) => {
    if (!req.user?.isAdmin) {
        return res.status(403).json({ message: 'No tienes permisos de administrador.' })
    }

    next()
}

export const requireSelfOrAdmin = (req, res, next) => {
    const targetUserId = req.params.userId || req.body.userId

    if (req.user?.isAdmin) {
        return next()
    }

    if (targetUserId && req.user?._id?.toString() === targetUserId.toString()) {
        return next()
    }

    return res.status(403).json({ message: 'No tienes permisos para este recurso.' })
}
