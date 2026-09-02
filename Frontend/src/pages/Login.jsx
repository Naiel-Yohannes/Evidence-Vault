import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import authServices from '../services/auth'
import { setToken } from "../services/interceptor"

const Login = ({ setUser }) => {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const handleLogin = async (e) => {
        e.preventDefault()
        if (!username.trim() || !password) {
            alert('Enter your username and password')
            return
        }
        try {
            const loggingUser = await authServices.login({ username, password })
            await setToken(loggingUser.token)
            localStorage.setItem('token', JSON.stringify(loggingUser))
            setUser(loggingUser)
            setUsername('')
            setPassword('')
            navigate('/dashboard')
        } catch (error) {
            alert(error.response?.data?.error || 'Login failed')
        }
    }

    return (
        <div>
            <h1>Sign in to your account</h1>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Username</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
                </div>
                <div>
                    <label>Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <button type="submit">Sign in</button>
            </form>
            <p>
                No account yet? <Link to="/register">Register</Link>
            </p>
        </div>
    )
}

export default Login
