const Card = ({ children, className = '' }) => (
	<div className={`rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}>{children}</div>
)

export default Card
