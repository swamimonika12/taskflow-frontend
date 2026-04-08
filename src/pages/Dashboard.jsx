// src/pages/Dashboard.jsx
import useAuth from '../hooks/useAuth'

export default function Dashboard() {
  const { user } = useAuth()  // redirects if not logged in!

  return <div>Welcome {user.name}!</div>
}