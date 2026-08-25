import { Navigate, Routes, Route } from 'react-router-dom'
import DashboardProductsSection from '../features/dashboard/products/sections/DashboardProductsSection'
import DashboardLayout from '../layout/DashboardLayout'

const AdminDashboard = () => {
    return (
        <section>
            <Routes>
                <Route path="/" element={<DashboardLayout />}>
                    <Route index element={<DashboardProductsSection />} />
                    <Route
                        path="products"
                        element={<DashboardProductsSection />}
                    />
                    <Route
                        path="products/createProduct"
                        element={<Navigate to="/admin/dashboard/products" replace />}
                    />
                    <Route
                        path="products/updateProduct/:id"
                        element={<Navigate to="/admin/dashboard/products" replace />}
                    />
                </Route>
            </Routes>
        </section>
    )
}

export default AdminDashboard

