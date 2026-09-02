import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import findingsServices from '../services/findings'

const FindingsList = () => {
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

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this finding?')) {
            return
        }
        try {
            await findingsServices.remove(id)
            setFindings(findings.filter(f => f.id !== id))
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to delete finding')
        }
    }

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <div>
                <h1>Your Findings</h1>
                <button onClick={() => navigate('/findings/create')}>Create New Finding</button>
                <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
            </div>
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
                            <button onClick={() => navigate(`/findings/${finding.id}`)}>View Details</button>
                            <button onClick={() => handleDelete(finding.id)}>Delete</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default FindingsList
