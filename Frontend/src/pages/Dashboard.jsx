import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import findingsServices from '../services/findings'

const Dashboard = ({ user, setUser }) => {
    const navigate = useNavigate()
    const [findings, setFindings] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchFindings = async () => {
            try {
                const data = await findingsServices.getAll()
                setFindings(data)
            } catch (error) {
                alert('Failed to fetch findings')
            } finally {
                setLoading(false)
            }
        }
        fetchFindings()
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('token')
        setUser(null)
        navigate('/login')
    }

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <div>
                <h1>Welcome, {user.name}</h1>
                <button onClick={handleLogout}>Logout</button>
            </div>
            <div>
                <h2>Your Findings</h2>
                <button onClick={() => navigate('/findings')}>View All Findings</button>
                <button onClick={() => navigate('/findings/create')}>Create New Finding</button>
                {findings.length === 0 ? (
                    <p>No findings yet</p>
                ) : (
                    <div>
                        {findings.map(finding => (
                            <div key={finding.id}>
                                <h3>{finding.title}</h3>
                                <p>{finding.description}</p>
                                <p>Severity: {finding.severity}</p>
                                <p>Status: {finding.status}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dashboard
