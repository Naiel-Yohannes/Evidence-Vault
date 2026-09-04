import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import findingsServices from '../services/findings'
import evidenceServices from '../services/evidence'
import api from "../services/interceptor"

const AuthImage = ({ src, alt, style }) => {
    const [objectUrl, setObjectUrl] = useState(null)

    useEffect(() => {
        let isCancelled = false
        let objectUrlToRevoke = null

        api.get(src, { responseType: 'blob' })
            .then(res => {
                if (isCancelled) return
                const url = URL.createObjectURL(res.data)
                objectUrlToRevoke = url
                setObjectUrl(url)
            })
            .catch(() => { if (!isCancelled) setObjectUrl(null) })

        return () => {
            isCancelled = true
            if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke)
        }
    }, [src])

    if (!objectUrl) return <p style={{ color: '#888', fontStyle: 'italic' }}>Loading image...</p>
    return <img src={objectUrl} alt={alt} style={style} />
}

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
    const [evidence, setEvidence] = useState([])
    const [file, setFile] = useState(null)
    const fileInputRef = useRef(null)

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

    useEffect(() => {
        const fetchEvidence = async () => {
            try {
                const data = await evidenceServices.list(id)
                setEvidence(data)
            } catch (error) {
                console.error('Failed to fetch evidence')
            }
        }
        if (finding) {
            fetchEvidence()
        }
    }, [finding, id])

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

    const handleFileUpload = async (e) => {
        e.preventDefault()
        if (!file) {
            alert('Please select a file')
            return
        }
        try {
            await evidenceServices.upload(id, file)
            setFile(null)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
            const updatedEvidence = await evidenceServices.list(id)
            setEvidence(updatedEvidence)
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to upload evidence')
        }
    }

    const handleEvidenceDelete = async (evidenceId) => {
        if (!window.confirm('Are you sure you want to delete this evidence?')) {
            return
        }
        try {
            await evidenceServices.remove(evidenceId)
            setEvidence(evidence.filter(e => e.id !== evidenceId))
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to delete evidence')
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

                    <div>
                        <h2>Evidence</h2>
                        <form onSubmit={handleFileUpload}>
                            <input type="file" ref={fileInputRef} onChange={e => setFile(e.target.files[0])} />
                            <button type="submit">Upload</button>
                        </form>
                        {evidence.length === 0 ? (
                            <p>No evidence uploaded</p>
                        ) : (
                            <div>
                                {evidence.map(e => (
                                    <div key={e.id}>
                                        <AuthImage src={`${import.meta.env.VITE_API_URL}/api/findings/${id}/evidence/${e.id}/download`} alt={e.original_filename} style={{ maxWidth: '300px' }} />
                                        <p>{e.original_filename}</p>
                                        <button onClick={() => handleEvidenceDelete(e.id)}>Delete</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
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
