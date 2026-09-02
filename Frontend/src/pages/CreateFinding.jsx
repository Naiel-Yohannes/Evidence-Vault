import { useState } from "react"
import { useNavigate } from "react-router-dom"
import findingsServices from '../services/findings'

const CreateFinding = () => {
    const navigate = useNavigate()
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [severity, setSeverity] = useState('')
    const [remediation, setRemediation] = useState('')
    const [status, setStatus] = useState('')
    
    const SEVERITY_OPTIONS = ["Low", "Medium", "High", "Critical"]
    const STATUS_OPTIONS = ["Open", "Resolved"]

    const handleSubmit = async (e) => {
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
            await findingsServices.create({ title, description, severity, remediation, status })
            setTitle('')
            setDescription('')
            setSeverity('')
            setRemediation('')
            setStatus('')
            navigate('/dashboard')
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to create finding')
        }
    }

    return (
        <div>
            <h1>Create New Finding</h1>
            <form onSubmit={handleSubmit}>
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
                        <option value="">Select severity</option>
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
                        <option value="">Select status</option>
                        {STATUS_OPTIONS.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
                <button type="submit">Create Finding</button>
                <button type="button" onClick={() => navigate('/dashboard')}>Cancel</button>
            </form>
        </div>
    )
}

export default CreateFinding
