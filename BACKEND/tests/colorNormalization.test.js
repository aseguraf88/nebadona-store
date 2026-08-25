import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeColorPayload } from '../src/utils/colorNormalization.js'

test('normalizeColorPayload convierte colores en formato compatible', () => {
    const result = normalizeColorPayload({
        color: '#1e88e5',
        colors: ['#1e88e5', '#ffffff'],
    })

    assert.equal(result.color, '#1e88e5')
    assert.equal(result.colors.length, 2)
    assert.equal(result.colors[0].hex, '#1e88e5')
    assert.equal(result.colors[0].selected, true)
    assert.equal(result.colors[1].source, 'manual')
})

test('normalizeColorPayload usa el primer elemento como principal cuando no hay selección', () => {
    const result = normalizeColorPayload({
        color: '',
        colors: [
            { name: 'Azul', hex: '#1e88e5', percentage: 70, source: 'auto' },
            { name: 'Blanco', hex: '#ffffff', percentage: 30, source: 'auto' },
        ],
    })

    assert.equal(result.color, '#1e88e5')
    assert.equal(result.colors[0].selected, true)
    assert.equal(result.colors[1].selected, false)
})

test('normalizeColorPayload crea una opción compatible cuando solo llega un color principal', () => {
    const result = normalizeColorPayload({
        color: '#1e88e5',
        colors: [],
    })

    assert.equal(result.color, '#1e88e5')
    assert.equal(result.colors.length, 1)
    assert.equal(result.colors[0].hex, '#1e88e5')
    assert.equal(result.colors[0].selected, true)
})
