const variants = {
	primary: 'bg-zinc-950 text-white hover:bg-zinc-800 focus:ring-zinc-300',
	secondary: 'bg-white text-zinc-800 ring-1 ring-zinc-200 hover:bg-zinc-50 focus:ring-zinc-300',
	danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-200',
	ghost: 'bg-transparent text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-200',
}

const Button = ({ children, className = '', variant = 'primary', type = 'button', ...props }) => (
	<button
		type={type}
		className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
		{...props}
	>
		{children}
	</button>
)

export default Button
