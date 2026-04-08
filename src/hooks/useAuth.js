import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function useAuth() {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
    }
  }, [])

  return {
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || '{}')
  }
}