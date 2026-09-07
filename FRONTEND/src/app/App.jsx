import { Routes, Route } from 'react-router-dom'
import { Layout } from '../widgets/layouts'
import { Home } from '../pages/Home'
//import Register from '../pages/Register'
import { Login } from '../pages/login'
import { UserContextProvider } from '../entities/user'
import { Toaster } from 'react-hot-toast'
import { ProductContextProvider } from '../entities/product'
import { CartContextProvider } from '../entities/cart'
import { Checkout } from '../pages/checkout'
/* import PaymentSuccess from '../pages/payment-results/PaymentSuccess'
import PaymentFailure from '../pages/payment-results/PaymentFailure'
import PaymentPending from '../pages/payment-results/PaymentPending' */
import { AdminLayout } from '../widgets/layouts'
import { AdminHome } from '../pages/admin/home'
import {
    ProductsListPage,
    ProductFormPage,
    CatalogSettingsPage,
} from '../pages/admin/products'
import { InventoryPage } from '../pages/admin/inventory'
import { OrdersPage } from '../pages/admin/orders'
import { CustomersPage } from '../pages/admin/customers'
import ProtectedRoute from '../app/routes/ProtectedRoute'
import { ShoppingPage } from '../pages/shopping'
import { ProductPage } from '../pages/product'
import { ScrollToTop } from '../shared/ui'
function App() {
    return (
        <UserContextProvider>
            <ProductContextProvider>
                <CartContextProvider>
                    <ScrollToTop />

                    <Routes>
                        {/* 🌍 RUTAS PÚBLICAS (Con Navbar, Footer y decoración) */}
                        <Route element={<Layout />}>
                            <Route path="/" element={<Home />} />
                            <Route path="/shop" element={<ShoppingPage />} />
                            {/* <Route path="/register" element={<Register />} /> */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/checkout" element={<Checkout />} />
                            {/*                             <Route
                                path="/payment/success"
                                element={<PaymentSuccess />}
                            />
                            <Route
                                path="/payment/failure"
                                element={<PaymentFailure />}
                            />
                            <Route
                                path="/payment/pending"
                                element={<PaymentPending />}
                            /> */}
                            <Route
                                path="/product/:id"
                                element={<ProductPage />}
                            />
                        </Route>

                        {/* 🔒 RUTAS PRIVADAS / ADMIN (El Cascarón Maestro) */}
                        <Route
                            path="/admin/dashboard"
                            element={
                                <ProtectedRoute>
                                    <AdminLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<AdminHome />} />

                            {/* Antes era una sola ruta con ProductsPage. Ahora
                                cada pantalla tiene su propia URL en vez de vivir
                                atrás de un modo interno (activeMode). */}
                            <Route
                                path="products"
                                element={<ProductsListPage />}
                            />
                            <Route
                                path="products/nuevo"
                                element={<ProductFormPage />}
                            />
                            <Route
                                path="products/:id/editar"
                                element={<ProductFormPage />}
                            />
                            {/* Anidada bajo /products: el isActive de AdminLayout
                                elige el path más específico que matchee, así que
                                estar en /products/settings activa solo
                                "Configuración" y no también "Productos". */}
                            <Route
                                path="products/settings"
                                element={<CatalogSettingsPage />}
                            />
                            <Route
                                path="inventory"
                                element={<InventoryPage />}
                            />

                            <Route path="orders" element={<OrdersPage />} />
                            <Route
                                path="customers"
                                element={<CustomersPage />}
                            />
                        </Route>
                    </Routes>
                </CartContextProvider>
            </ProductContextProvider>
            <Toaster />
        </UserContextProvider>
    )
}

export default App
