// Iniciales del usuario para el avatar: hasta dos palabras de name (o, si
// no viene, de username). Sin nombre devuelve 'A' (de Admin). La usan el
// menú de iniciales del navbar y el del dashboard
export const getInitials = (userInfo) => {
    const fullName = userInfo?.name || userInfo?.username || ''
    if (!fullName) return 'A'

    return fullName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('')
}
