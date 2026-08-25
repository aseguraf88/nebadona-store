const normalizeHexColor = (value = '') => {
    const trimmed = String(value || '').trim()

    if (!trimmed) return ''
    if (/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(trimmed)) {
        return trimmed.toLowerCase()
    }

    return trimmed
}

const normalizeColorOption = (entry, index, source = 'manual') => {
    if (typeof entry === 'string') {
        const normalizedValue = normalizeHexColor(entry)
        const isHex = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(normalizedValue)

        return {
            name: normalizedValue || `Color ${index + 1}`,
            hex: isHex ? normalizedValue : '#000000',
            percentage: Math.max(0, 100 - index * 10),
            source: isHex ? source : 'fallback',
            selected: index === 0,
        }
    }

    if (!entry || typeof entry !== 'object') return null

    const rawHex = normalizeHexColor(entry.hex || entry.name || '')
    const isHex = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(rawHex)
    const derivedName = entry.name?.trim() || (isHex ? 'Color principal' : 'Sin nombre')
    const percentage = Number.isFinite(Number(entry.percentage))
        ? Math.min(100, Math.max(0, Number(entry.percentage)))
        : Math.max(0, 100 - index * 10)

    return {
        name: derivedName || `Color ${index + 1}`,
        hex: isHex ? rawHex : '#000000',
        percentage,
        source: entry.source || (isHex ? source : 'fallback'),
        selected: Boolean(entry.selected) || index === 0,
    }
}

export const normalizeProductColorData = ({ color, colors = [], source = 'manual' }) => {
    const parsedColors = (Array.isArray(colors) ? colors : [])
        .map((entry, index) => normalizeColorOption(entry, index, source))
        .filter(Boolean)
        .slice(0, 4)

    if (!parsedColors.length && color) {
        const normalizedColor = normalizeHexColor(color)
        const isHex = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(normalizedColor)

        parsedColors.push({
            name: isHex ? 'Color principal' : String(color).trim() || 'Color principal',
            hex: isHex ? normalizedColor : '#000000',
            percentage: 100,
            source: isHex ? source : 'fallback',
            selected: true,
        })
    }

    const selectedColor = parsedColors.find((item) => item.selected) || parsedColors[0]
    const primaryColor = normalizeHexColor(color) || selectedColor?.hex || ''

    return {
        color: primaryColor,
        colors: parsedColors,
    }
}
