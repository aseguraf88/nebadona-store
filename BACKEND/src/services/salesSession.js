import jwt from 'jsonwebtoken'

// Sesión de la app de ventas (paso 67b), aparte de la de la tienda:
// - cookie propia (salesToken) con path /api/sales: no viaja a ninguna
//   otra ruta, así que authenticate nunca la ve;
// - el token no lleva userId (usa sub): authenticate lo rechaza aunque
//   llegue como Bearer. No agregarle userId, es una de las barreras;
// - lleva audience 'ventas': un token de la tienda (sin aud) no pasa
//   verifySalesToken.
// Usa el mismo JWT_SECRET que la tienda: rotarlo cierra las dos sesiones
export const SALES_COOKIE_NAME = 'salesToken'

const SALES_AUDIENCE = 'ventas'
const SALES_SCOPE = 'sales'
const SESSION_DAYS = 20

// api.nebadon.cl y ventas.nebadon.cl son del mismo sitio, así que alcanza
// con strict (protege contra peticiones desde otros sitios). En local,
// localhost:5174 y localhost:3001 también son del mismo sitio
export const salesCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/sales',
})

// Devuelve el token y su vencimiento, para la cookie y para la respuesta:
// la app no puede leer una cookie httpOnly y necesita saber cuántos días
// le quedan a la sesión aunque no tenga señal
export const signSalesToken = (user) => {
    const exp = Math.floor(Date.now() / 1000) + SESSION_DAYS * 24 * 60 * 60
    const token = jwt.sign(
        {
            scope: SALES_SCOPE,
            sc: user.sellerCode,
            tv: user.tokenVersion ?? 0,
            exp,
        },
        process.env.JWT_SECRET,
        {
            subject: user._id.toString(),
            audience: SALES_AUDIENCE,
            algorithm: 'HS256',
        },
    )
    return { token, expiresAt: new Date(exp * 1000) }
}

// Devuelve el contenido del token o null (vencido, firma mala, otra
// audiencia, sin token): nunca lanza
export const verifySalesToken = (token) => {
    if (!token) return null
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ['HS256'],
            audience: SALES_AUDIENCE,
        })
        if (decoded?.scope !== SALES_SCOPE || !decoded.sub) return null
        return decoded
    } catch {
        return null
    }
}
