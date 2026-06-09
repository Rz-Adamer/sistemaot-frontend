import { Navigate, Route, Routes } from 'react-router-dom'
import Login from '../pages/Login.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import ListaOrdenes from '../pages/Ordenes/ListaOrdenes.jsx'
import DetalleOrden from '../pages/Ordenes/DetalleOrden.jsx'
import NuevaOrden from '../pages/Ordenes/NuevaOrden.jsx'
import ListaClientes from '../pages/Clientes/ListaClientes.jsx'
import ListaTecnicos from '../pages/Tecnicos/ListaTecnicos.jsx'
import LogsAuditoria from '../pages/Admin/LogsAuditoria.jsx'
import AdminUsuarios from '../pages/Admin/AdminUsuarios.jsx'
import ProtectedRoute from '../components/ProtectedRoute.jsx'
import DashboardLayout from '../layouts/DashboardLayout.jsx'

const withLayout = (children, roles) => (
	<ProtectedRoute roles={roles}>
		<DashboardLayout>{children}</DashboardLayout>
	</ProtectedRoute>
)

const AppRoutes = () => (
	<Routes>
		<Route path="/login" element={<Login />} />
		<Route path="/dashboard" element={withLayout(<Dashboard />, ['dueño'])} />
		<Route path="/ordenes" element={withLayout(<ListaOrdenes />, ['dueño'])} />
		<Route path="/ordenes/nueva" element={withLayout(<NuevaOrden />, ['dueño'])} />
		<Route path="/ordenes/:id" element={withLayout(<DetalleOrden />, ['dueño'])} />
		<Route path="/clientes" element={withLayout(<ListaClientes />, ['dueño'])} />
		<Route path="/tecnicos" element={withLayout(<ListaTecnicos />, ['dueño'])} />
		<Route path="/admin/usuarios" element={withLayout(<AdminUsuarios />, ['admin'])} />
		<Route path="/admin/logs" element={withLayout(<LogsAuditoria />, ['admin'])} />
		<Route path="/" element={<Navigate to="/dashboard" replace />} />
		<Route path="*" element={<Navigate to="/dashboard" replace />} />
	</Routes>
)

export default AppRoutes
