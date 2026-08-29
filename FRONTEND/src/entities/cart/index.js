// src/entities/cart/index.js

// 1. Exportamos el Modelo (El estado y el cerebro)
export { CartContext, CartContextProvider, useCart } from './model/CartContext'

// 2. Exportamos los Servicios de API
export * from './api/cartServices'
// (Nota: uso "export *" asumiendo que exportaste las funciones
// getCartService, addToCartService, etc. con "export const")
