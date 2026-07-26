import { useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'

const DashboardLayout = ({ children }) => {
	const [sidebarOpen, setSidebarOpen] = useState(false)

	return (
		<div className="min-h-screen bg-zinc-50 text-zinc-900">
			<Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
			<div className="min-h-screen md:pl-72">
				<Navbar onMenuClick={() => setSidebarOpen(true)} />
				<main className="mx-auto w-full max-w-7xl overflow-x-hidden px-3 py-4 sm:px-6 sm:py-6 lg:px-8">{children}</main>
			</div>
		</div>
	)
}

export default DashboardLayout
