import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../utils/api'
import { styles } from '../styles/common'

export default function Login() {
  // Navigation hook - redirect after login
  const navigate = useNavigate()

  // State for form data
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '' 
  })

  // State for error message
  const [error, setError] = useState('')

  // State for loading (disable button while calling API)
  const [loading, setLoading] = useState(false)

  // When user types in any input
  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    })
  }

  // When user clicks Login button
  const handleSubmit = async (e) => {
    e.preventDefault()  // prevent page refresh!
    setLoading(true)
    setError('')

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    try {
      // Call login API
      const res = await loginUser(formData)

      // Save token and user to localStorage
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))

      // Redirect to dashboard
      navigate('/dashboard')

    } catch (err) {
      // Show error from backend
      setError(err.response?.data?.message || 'Something went wrong!')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className={styles.card}>

        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">TaskFlow</h1>
          <p className="text-gray-500 mt-1 text-sm">Welcome back!</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className={styles.error}>{error}</div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@gmail.com"
              required
              className={styles.input}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.button}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

        </form>

        {/* Register Link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-medium hover:underline">
            Register
          </Link>
        </p>

      </div>
    </div>
  )
}