import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from '../api/axiosConfig'

export default function useFetch(url, options = {}) {
	const [data, setData] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const params = useMemo(() => options.params || {}, [options.params])

	const fetchData = useCallback(
		async (opts = {}, showLoading = true) => {
			if (showLoading) setLoading(true)
			setError(null)
			try {
				const res = await axios.get(url, { params: opts })
				setData(res.data)
				return res.data
			} catch (err) {
				setError(err)
				return null
			} finally {
				setLoading(false)
			}
		},
		[url],
	)

	useEffect(() => {
		let active = true
		axios
			.get(url, { params })
			.then((res) => {
				if (active) setData(res.data)
			})
			.catch((err) => {
				if (active) setError(err)
			})
			.finally(() => {
				if (active) setLoading(false)
			})

		return () => {
			active = false
		}
	}, [url, params])

	return { data, loading, error, refetch: fetchData }
}
