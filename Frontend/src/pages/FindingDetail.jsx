import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import findingsServices from "../services/findings"
import evidenceServices from "../services/evidence"
import api from "../services/interceptor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SeverityBadge, StatusBadge } from "@/components/FindingLabels"
import FindingFormFields from "@/components/FindingFormFields"

const AuthImage = ({ src, alt }) => {
  const [objectUrl, setObjectUrl] = useState(null)

  useEffect(() => {
    let isCancelled = false
    let objectUrlToRevoke = null

    api
      .get(src, { responseType: "blob" })
      .then((res) => {
        if (isCancelled) return
        const url = URL.createObjectURL(res.data)
        objectUrlToRevoke = url
        setObjectUrl(url)
      })
      .catch(() => {
        if (!isCancelled) setObjectUrl(null)
      })

    return () => {
      isCancelled = true
      if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke)
    }
  }, [src])

  if (!objectUrl) {
    return <p className="text-xs text-muted-foreground">Loading preview…</p>
  }
  return <img src={objectUrl} alt={alt} className="max-h-56 w-full object-contain bg-muted" />
}

const formatDate = (value) =>
  new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

const FindingDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [finding, setFinding] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [severity, setSeverity] = useState("")
  const [remediation, setRemediation] = useState("")
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(true)
  const [evidence, setEvidence] = useState([])
  const [file, setFile] = useState(null)
  const fileInputRef = useRef(null)

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
      } catch {
        alert("Failed to fetch finding")
        navigate("/findings")
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
      } catch {
        console.error("Failed to fetch evidence")
      }
    }
    if (finding) {
      fetchEvidence()
    }
  }, [finding, id])

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!title || !description || !severity || !remediation || !status) {
      alert("All fields are required")
      return
    }
    if (title.length > 50) {
      alert("Title must be 50 characters or less")
      return
    }
    if (description.length > 255) {
      alert("Description must be 255 characters or less")
      return
    }
    if (remediation.length > 5000) {
      alert("Remediation must be 5000 characters or less")
      return
    }
    try {
      const updated = await findingsServices.update(id, { title, description, severity, remediation, status })
      setFinding(updated)
      setIsEditing(false)
    } catch (error) {
      alert(error.response?.data?.error || "Failed to update finding")
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Delete this finding?")) {
      return
    }
    try {
      await findingsServices.remove(id)
      navigate("/findings")
    } catch (error) {
      alert(error.response?.data?.error || "Failed to delete finding")
    }
  }

  const handleFileUpload = async (e) => {
    e.preventDefault()
    if (!file) {
      alert("Please select a file")
      return
    }
    try {
      await evidenceServices.upload(id, file)
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      const updatedEvidence = await evidenceServices.list(id)
      setEvidence(updatedEvidence)
    } catch (error) {
      alert(error.response?.data?.error || "Failed to upload evidence")
    }
  }

  const handleEvidenceDelete = async (evidenceId) => {
    if (!window.confirm("Delete this evidence?")) {
      return
    }
    try {
      await evidenceServices.remove(evidenceId)
      setEvidence(evidence.filter((item) => item.id !== evidenceId))
    } catch (error) {
      alert(error.response?.data?.error || "Failed to delete evidence")
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading finding…</p>
  }

  if (!finding) {
    return <p className="text-sm text-muted-foreground">Finding not found.</p>
  }

  return (
    <div className="grid gap-6">
      <Button variant="ghost" size="sm" className="-ml-2 w-fit text-muted-foreground" onClick={() => navigate("/findings")}>
        ← Findings
      </Button>

      {!isEditing ? (
        <div className="grid gap-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-heading text-3xl tracking-tight">{finding.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <SeverityBadge severity={finding.severity} />
                <StatusBadge status={finding.status} />
              </div>
              <p className="mt-3 font-mono text-xs text-muted-foreground">
                Created {formatDate(finding.created_at)} · Updated {formatDate(finding.updated_at)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>

          <section className="grid gap-2">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{finding.description}</p>
          </section>

          <section className="grid gap-2">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Remediation</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{finding.remediation}</p>
          </section>

          <section className="grid gap-4 border-t border-border pt-6">
            <h2 className="font-heading text-xl tracking-tight">Evidence</h2>
            <form onSubmit={handleFileUpload} className="flex flex-wrap items-center gap-2">
              <Input
                type="file"
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files[0])}
                className="max-w-sm"
              />
              <Button type="submit" variant="outline">
                Upload
              </Button>
            </form>
            {evidence.length === 0 ? (
              <p className="text-sm text-muted-foreground">No files attached.</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {evidence.map((item) => (
                  <li key={item.id} className="overflow-hidden rounded-md border border-border bg-card">
                    <AuthImage
                      src={`${import.meta.env.VITE_API_URL}/api/findings/${id}/evidence/${item.id}/download`}
                      alt={item.original_filename}
                    />
                    <div className="flex items-center justify-between gap-2 px-3 py-2">
                      <p className="truncate font-mono text-xs">{item.original_filename}</p>
                      <Button variant="ghost" size="sm" onClick={() => handleEvidenceDelete(item.id)}>
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : (
        <div className="mx-auto grid w-full max-w-2xl gap-6">
          <h1 className="font-heading text-3xl tracking-tight">Edit finding</h1>
          <form onSubmit={handleUpdate} className="grid gap-6">
            <FindingFormFields
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              severity={severity}
              setSeverity={setSeverity}
              remediation={remediation}
              setRemediation={setRemediation}
              status={status}
              setStatus={setStatus}
            />
            <div className="flex gap-2">
              <Button type="submit">Save changes</Button>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default FindingDetail
