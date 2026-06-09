import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'

const DashboardLayout = ({ children }) => (
	<div className="min-h-screen bg-zinc-50 text-zinc-900">
		<Sidebar />
		<div className="min-h-screen md:pl-72">
			<Navbar />
			<main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
		</div>
	</div>
)

export default DashboardLayout
