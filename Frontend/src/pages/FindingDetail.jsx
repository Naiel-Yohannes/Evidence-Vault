import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import findingsServices from '../services/findings'

const FindingDetail = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [finding, setFinding] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [severity, setSeverity] = useState('')
    const [remediation, setRemediation] = useState('')
    const [status, setStatus] = useState('')
    const [loading, setLoading] = useState(true)

    const SEVERITY_OPTIONS = ["Low", "Medium", "High", "Critical"]
    const STATUS_OPTIONS = ["Open", "Resolved"]

    useEffect(() => {
        const fetchFinding = async () => {
            try {
                const data = await findingsServices.getOne(id)
                setFinding(data)
                setTitle(data.title)
                setDescription(data.description)
                setSeverity(data.severity)
                setRemediation(data.remediation)
                setStatus(data.status)
            } catch (error) {
                alert('Failed to fetch finding')
                navigate('/findings')
            } finally {
                setLoading(false)
            }
        }
        fetchFinding()
    }, [id, navigate])

    const handleUpdate = async (e) => {
        e.preventDefault()
        if (!title || !description || !severity || !remediation || !status) {
            alert('All fields are required')
            return
        }
        if (title.length > 50) {
            alert('Title must be 50 characters or less')
            return
        }
        if (description.length > 255) {
            alert('Description must be 255 characters or less')
            return
        }
        if (remediation.length > 5000) {
            alert('Remediation must be 5000 characters or less')
            return
        }
        try {
            const updated = await findingsServices.update(id, { title, description, severity, remediation, status })
            setFinding(updated)
            setIsEditing(false)
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to update finding')
        }
    }

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this finding?')) {
            return
        }
        try {
            await findingsServices.remove(id)
            navigate('/findings')
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to delete finding')
        }
    }

    if (loading) {
        return <div>Loading...</div>
    }

    if (!finding) {
        return <div>Finding not found</div>
    }

    return (
        <div>
            <button onClick={() => navigate('/findings')}>Back to Findings</button>
            
            {!isEditing ? (
                <div>
                    <h1>{finding.title}</h1>
                    <p><strong>Description:</strong> {finding.description}</p>
                    <p><strong>Severity:</strong> {finding.severity}</p>
                    <p><strong>Remediation:</strong> {finding.remediation}</p>
                    <p><strong>Status:</strong> {finding.status}</p>
                    <p><strong>Created:</strong> {new Date(finding.created_at).toLocaleString()}</p>
                    <p><strong>Updated:</strong> {new Date(finding.updated_at).toLocaleString()}</p>
                    <button onClick={() => setIsEditing(true)}>Edit</button>
                    <button onClick={handleDelete}>Delete</button>
                </div>
            ) : (
                <div>
                    <h1>Edit Finding</h1>
                    <form onSubmit={handleUpdate}>
                        <div>
                            <label>Title</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} maxLength={50} />
                        </div>
                        <div>
                            <label>Description</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={255} />
                        </div>
                        <div>
                            <label>Severity</label>
                            <select value={severity} onChange={e => setSeverity(e.target.value)}>
                                {SEVERITY_OPTIONS.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>Remediation</label>
                            <textarea value={remediation} onChange={e => setRemediation(e.target.value)} maxLength={5000} />
                        </div>
                        <div>
                            <label>Status</label>
                            <select value={status} onChange={e => setStatus(e.target.value)}>
                                {STATUS_OPTIONS.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit">Save Changes</button>
                        <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
                    </form>
                </div>
            )}
        </div>
    )
}

export default FindingDetail
