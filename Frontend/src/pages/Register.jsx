import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import authServices from '../services/auth'
import { setToken } from "../services/interceptor"

const Register = ({ setUser }) => {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')

    const handleRegister = async (e) => {
        e.preventDefault()
        if (!username.trim() || !name.trim() || !password) {
            alert('Fill in all fields')
            return
        }
        try {
            const newUser = await authServices.register({ username, name, password })
            const loggingUser = await authServices.login({ username: newUser.username, password })
            await setToken(loggingUser.token)
            localStorage.setItem('token', JSON.stringify(loggingUser))
            setUser(loggingUser)
            setUsername('')
            setName('')
            setPassword('')
            navigate('/dashboard')
        } catch (error) {
            alert(error.response?.data?.error || 'Registration failed')
        }
    }

    return (
        <div>
            <h1>Create an account</h1>
            <form onSubmit={handleRegister}>
                <div>
                    <label>Username</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
                </div>
                <div>
                    <label>Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                    <label>Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <button type="submit">Register</button>
            </form>
            <p>
                Already have an account? <Link to="/login">Sign in</Link>
            </p>
        </div>
    )
}

export default Register
