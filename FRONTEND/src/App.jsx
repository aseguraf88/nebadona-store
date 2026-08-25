import { Routes, Route } from 'react-router-dom'
import Layout from './layout/Layout'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import { UserContextProvider } from './context/UserContext'
import { Toaster } from 'react-hot-toast'
import { ProductContextProvider } from './context/ProductContext'
import { CartContextProvider } from './context/CartContext'
import Checkout from './pages/Checkout'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentFailure from './pages/PaymentFailure'
import PaymentPending from './pages/PaymentPending'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import ShoppingPage from './pages/ShoppingPage'
import ProductPage from './pages/ProductPage'
import ScrollToTop from './components/ScrollToTop/ScrollToTop'

function App() {
    return (
        <UserContextProvider>
            <ProductContextProvider>
                <CartContextProvider>
                    <ScrollToTop />

                    <Routes>
                        <Route element={<Layout />}>
                            <Route path="/" element={<Home />}></Route>
                            <Route
                                path="/shop"
                                element={<ShoppingPage />}
                            ></Route>
                            <Route
                                path="/register"
                                element={<Register />}
                            ></Route>
                            <Route path="/login" element={<Login />}></Route>
                            <Route path="/checkout" element={<Checkout />} />
                            <Route
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
                            />
                            <Route
                                path="/admin/dashboard/*"
                                element={
                                    <ProtectedRoute>
                                        <AdminDashboard />
                                    </ProtectedRoute>
                                }
                            ></Route>
                            <Route
                                path="/product/:id"
                                element={<ProductPage />}
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
