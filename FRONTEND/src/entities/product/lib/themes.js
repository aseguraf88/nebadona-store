// Menú por temática: el tema sale del design_theme de cada producto
// publicado, y cada franquicia va bajo el tema más común entre sus productos

// Orden del menú (por slug). Un tema que no esté acá va al final, por nombre
export const THEME_ORDER = [
    'anime',
    'videojuegos',
    'cartoons',
    'cine-y-terror',
    'musica',
    'disenos-originales',
]

// "Diseños originales" → "disenos-originales" (sin tildes ni espacios)
export const slugify = (value) =>
    String(value ?? '')
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

const themeRank = (slug) => {
    const index = THEME_ORDER.indexOf(slug)
    return index === -1 ? THEME_ORDER.length : index
}

// Nombre visible: el de la colección de Configuración (con mayúsculas);
// si no está, el valor guardado con la primera letra en mayúscula
const displayName = (collection, value) => {
    const slug = slugify(value)
    const match = collection?.find((item) => slugify(item.name) === slug)
    if (match) return match.name
    return value.charAt(0).toUpperCase() + value.slice(1)
}

const byName = (a, b) => a.name.localeCompare(b.name, 'es')

// [{ slug, name, direct, franchises: [{ slug, name }] }], solo con lo que
// tiene productos publicados (products ya viene filtrado a PUBLISHED)
export const buildThemeMenu = (products, designThemes, franchiseNames) => {
    const themes = new Map()
    const franchiseVotes = new Map()

    for (const product of products ?? []) {
        const themeSlug = slugify(product.design_theme)
        if (!themeSlug) continue

        if (!themes.has(themeSlug)) {
            themes.set(themeSlug, {
                slug: themeSlug,
                name: displayName(designThemes, product.design_theme),
                franchises: [],
            })
        }

        const franchiseSlug = slugify(product.franchise_name)
        if (!franchiseSlug) continue

        if (!franchiseVotes.has(franchiseSlug)) {
            franchiseVotes.set(franchiseSlug, {
                name: displayName(franchiseNames, product.franchise_name),
                votes: new Map(),
            })
        }
        const { votes } = franchiseVotes.get(franchiseSlug)
        votes.set(themeSlug, (votes.get(themeSlug) ?? 0) + 1)
    }

    // Cada franquicia, una sola vez: bajo su tema más común (empate: el
    // primero según THEME_ORDER)
    for (const [slug, { name, votes }] of franchiseVotes) {
        const [winner] = [...votes].sort(
            ([themeA, a], [themeB, b]) =>
                b - a || themeRank(themeA) - themeRank(themeB),
        )[0]
        themes.get(winner).franchises.push({ slug, name })
    }

    return [...themes.values()]
        .map((theme) => ({
            ...theme,
            franchises: theme.franchises.sort(byName),
            // Sin desplegable: sin franquicias, o una sola con el mismo
            // nombre del tema ("Diseños originales")
            direct:
                theme.franchises.length === 0 ||
                (theme.franchises.length === 1 &&
                    theme.franchises[0].slug === theme.slug),
        }))
        .sort((a, b) => themeRank(a.slug) - themeRank(b.slug) || byName(a, b))
}
