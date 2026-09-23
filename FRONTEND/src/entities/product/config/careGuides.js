import { createElement } from 'react'
import { Droplet, Wind, Ban, Spool, Icon } from 'lucide-react'
import { iron } from '@lucide/lab'

const IronIcon = (props) => createElement(Icon, { iconNode: iron, ...props })

export const CARE_GUIDES_BY_CATEGORY = {
    calcetines: {
        title: 'Calcetines',
        technique: 'Bordado',
        emoji: '🧦',
        items: [
            { icon: Droplet, label: 'Lavado', text: 'Agua fría, a mano o en lavadora dentro de una bolsa de malla' },
            { icon: Wind, label: 'Secado', text: 'Al aire libre, a la sombra — nunca secadora' },
            { icon: Spool, label: 'Bordado', text: 'No frotar ni planchar directamente sobre el bordado' },
            { icon: Ban, label: 'Evitar', text: 'Cloro y blanqueadores' },
        ],
    },
    camisas: {
        title: 'Camisas',
        technique: 'Estampado',
        emoji: '👕',
        items: [
            { icon: Droplet, label: 'Lavado', text: 'Por el revés, agua fría o tibia (máx. 30°C)' },
            { icon: Wind, label: 'Secado', text: 'Al aire libre, a la sombra — nunca secadora' },
            { icon: IronIcon, label: 'Planchado', text: 'Por el revés, nunca directo sobre el estampado' },
            { icon: Ban, label: 'Evitar', text: 'Lavado en seco' },
        ],
    },
    polerones: {
        title: 'Polerones',
        technique: 'Estampado, oversize',
        emoji: '🧥',
        items: [
            { icon: Droplet, label: 'Lavado', text: 'Por el revés, agua fría o tibia (máx. 30°C)' },
            { icon: Wind, label: 'Secado', text: 'Al aire libre, a la sombra — nunca secadora, para evitar que encoja' },
            { icon: IronIcon, label: 'Planchado', text: 'Por el revés, nunca directo sobre el estampado' },
            { icon: Ban, label: 'Evitar', text: 'Lavado en seco, retorcer al escurrir' },
        ],
    },
}

export const getCareGuideByCategory = (category = '') =>
    CARE_GUIDES_BY_CATEGORY[category] || null
