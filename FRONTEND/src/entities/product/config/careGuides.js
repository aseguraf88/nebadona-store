export const CARE_GUIDES_BY_CATEGORY = {
    calcetines: {
        title: 'Calcetines',
        technique: 'Bordado',
        icon: '🧦',
        items: [
            { icon: '💧', label: 'Lavado', text: 'Agua fría, a mano o en lavadora dentro de una bolsa de malla' },
            { icon: '🌬️', label: 'Secado', text: 'Al aire libre, a la sombra — nunca secadora' },
            { icon: '🧵', label: 'Bordado', text: 'No frotar ni planchar directamente sobre el bordado' },
            { icon: '🚫', label: 'Evitar', text: 'Cloro y blanqueadores' },
        ],
    },
    camisas: {
        title: 'Camisas',
        technique: 'Estampado',
        icon: '👕',
        items: [
            { icon: '💧', label: 'Lavado', text: 'Por el revés, agua fría o tibia (máx. 30°C)' },
            { icon: '🌬️', label: 'Secado', text: 'Al aire libre, a la sombra — nunca secadora' },
            { icon: '♨️', label: 'Planchado', text: 'Por el revés, nunca directo sobre el estampado' },
            { icon: '🚫', label: 'Evitar', text: 'Lavado en seco' },
        ],
    },
    polerones: {
        title: 'Polerones',
        technique: 'Estampado, oversize',
        icon: '🧥',
        items: [
            { icon: '💧', label: 'Lavado', text: 'Por el revés, agua fría o tibia (máx. 30°C)' },
            { icon: '🌬️', label: 'Secado', text: 'Al aire libre, a la sombra — nunca secadora, para evitar que encoja' },
            { icon: '♨️', label: 'Planchado', text: 'Por el revés, nunca directo sobre el estampado' },
            { icon: '🚫', label: 'Evitar', text: 'Lavado en seco, retorcer al escurrir' },
        ],
    },
}

export const getCareGuideByCategory = (category = '') =>
    CARE_GUIDES_BY_CATEGORY[category] || null
