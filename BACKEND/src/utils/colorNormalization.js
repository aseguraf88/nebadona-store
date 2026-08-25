const normalizeHexColor = (value = '') => {
    const trimmed = String(value || '').trim()

    if (!trimmed) return ''
    if (/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(trimmed)) {
        return trimmed.toLowerCase()
    }

    return trimmed
}

const normalizeColorPayload = ({ color, colors = [] }) => {
    const parsedColors = (Array.isArray(colors) ? colors : [])
        .slice(0, 4)
        .map((entry, index) => {
            if (typeof entry === 'string') {
                const normalizedValue = normalizeHexColor(entry)
                const isHex = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(normalizedValue)

                return {
                    name: normalizedValue || `Color ${index + 1}`,
                    hex: isHex ? normalizedValue : '#000000',
                    percentage: Math.max(0, 100 - index * 10),
                    source: isHex ? 'manual' : 'fallback',
                    selected: index === 0,
                }
            }

            const rawHex = normalizeHexColor(entry?.hex || entry?.name || '')
            const isHex = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(rawHex)
            const selected = Boolean(entry?.selected) || index === 0

            return {
                name: entry?.name?.trim() || (isHex ? 'Color principal' : 'Sin nombre'),
                hex: isHex ? rawHex : '#000000',
                percentage: Number.isFinite(Number(entry?.percentage))
                    ? Math.min(100, Math.max(0, Number(entry.percentage)))
                    : Math.max(0, 100 - index * 10),
                source: entry?.source || (isHex ? 'manual' : 'fallback'),
                selected,
            }
        })

    if (!parsedColors.length && color) {
        const normalizedColor = normalizeHexColor(color)
        const isHex = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(normalizedColor)

        parsedColors.push({
            name: isHex ? 'Color principal' : String(color).trim() || 'Color principal',
            hex: isHex ? normalizedColor : '#000000',
            percentage: 100,
            source: isHex ? 'manual' : 'fallback',
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

export { normalizeColorPayload }
