import UserModel from '../models/UserModel.js'
import {
    SALES_COOKIE_NAME,
    verifySalesToken,
} from '../services/salesSession.js'

// Todo 401 de las rutas de ventas lleva el mismo código. La app (67d)
// lo usa para pedir que se vuelva a iniciar sesión, sin descartar nunca
// las ventas en cola
const sessionInvalid = (res) =>
    res.status(401).json({
        message: 'Tu sesión de ventas no es válida. Inicia sesión de nuevo.',
        code: 'SALES_SESSION_INVALID',
    })

// Solo rutas de la app de ventas (paso 67b). Lee solo la cookie
// salesToken, nunca Authorization ni accessToken. Además del token, exige
// que la cuenta siga existiendo, que sea de vendedor y no de admin, que
// su código coincida y que tokenVersion no haya cambiado (revocación)
export const requireSeller = async (req, res, next) => {
    const decoded = verifySalesToken(req.cookies?.[SALES_COOKIE_NAME])
    if (!decoded) return sessionInvalid(res)

    try {
        const user = await UserModel.findById(decoded.sub)
            .select('username isAdmin isSeller sellerCode tokenVersion')
            .lean()

        if (
            !user ||
            user.isSeller !== true ||
            user.isAdmin === true ||
            user.sellerCode !== decoded.sc ||
            (user.tokenVersion ?? 0) !== decoded.tv
        ) {
            return sessionInvalid(res)
        }

        req.seller = {
            id: user._id,
            sellerCode: user.sellerCode,
            username: user.username,
        }
        req.salesSession = { expiresAt: new Date(decoded.exp * 1000) }
        next()
    } catch (error) {
        // Una falla de la base no es una sesión inválida: responder 401
        // mandaría a iniciar sesión de nuevo sin motivo
        console.error('Error requireSeller:', error)
        return res
            .status(500)
            .json({ message: 'Error interno al verificar la sesión.' })
    }
}
