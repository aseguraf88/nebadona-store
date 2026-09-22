export const SIZE_GUIDES_BY_CATEGORY = {
    camisas: {
        columns: ['Talla', 'Pecho (cm)', 'Largo total (cm)', 'Ancho de hombros (cm)'],
        rows: [
            ['S', '90 - 96', '70', '43'],
            ['M', '97 - 104', '72', '45'],
            ['L', '105 - 112', '74', '47'],
            ['XL', '113 - 120', '76', '49'],
            ['XXL', '121 - 128', '78', '51'],
        ],
        note: null,
    },
    calcetines: {
        columns: ['Talla', 'Talla de calzado (EU/CL)', 'Largo del pie (cm)'],
        rows: [
            ['S', '35 - 38', '22 - 24'],
            ['M', '39 - 42', '25 - 27'],
            ['L', '43 - 46', '28 - 30'],
        ],
        note: null,
    },
    polerones: {
        columns: ['Talla', 'Pecho (cm)', 'Largo total (cm)', 'Ancho de hombros (cm)', 'Largo de manga (cm)'],
        rows: [
            ['S', '114 - 118', '69', '56', '56'],
            ['M', '119 - 124', '71', '58', '58'],
            ['L', '125 - 130', '73', '60', '60'],
            ['XL', '131 - 136', '75', '62', '61'],
        ],
        note: 'Corte: Oversize — diseñado para un calce holgado y urbano.',
    },
}

export const getSizeGuideByCategory = (category = '') =>
    SIZE_GUIDES_BY_CATEGORY[category] || null
