// src/entities/product/index.js

export { default as ProductCard } from './ui/ProductCard'

export { COLOR_FAMILIES } from './config/colorFamilies.js'
export { normalizeCategoryKey } from './config/productTypeOptions.js'
export { SIZE_OPTIONS } from './config/productTypeOptions.js'
export { getProductTypesByCategory } from './config/productTypeOptions.js'

export {
    ProductContext,
    ProductContextProvider,
    useProduct,
} from './model/ProductContext'

export { default as productServices } from './api/productServices.js'
