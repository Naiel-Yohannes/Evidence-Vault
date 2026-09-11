import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import findingsServices from "../services/findings"
import evidenceServices from "../services/evidence"
import api from "../services/interceptor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SeverityBadge, StatusBadge } from "@/components/FindingLabels"
import FindingFormFields from "@/components/FindingFormFields"
import shareServices from "../services/shares"

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
    return (
      <div className="flex items-center justify-center bg-muted py-6">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      </div>
    )
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

const confirmToast = ({ message, subtext, onConfirm, confirmLabel = "Confirm" }) => {
  toast(
    (t) => (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">{message}</p>
        {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
        <div className="flex gap-2 mt-1">
          <button
            className="rounded px-3 py-1 text-xs font-medium bg-destructive text-white hover:opacity-90"
            onClick={() => {
              toast.dismiss(t.id)
              onConfirm()
            }}
          >
            {confirmLabel}
          </button>
          <button
            className="rounded px-3 py-1 text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
        </div>
      </div>
    ),
    { duration: Infinity }
  )
}

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
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [evidence, setEvidence] = useState([])
  const [file, setFile] = useState(null)
  const fileInputRef = useRef(null)
  const [shareURL, setShareURL] = useState(null)

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
        toast.error("Failed to fetch finding")
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
      toast.error("All fields are required")
      return
    }
    if (title.length > 50) {
      toast.error("Title must be 50 characters or less")
      return
    }
    if (description.length > 255) {
      toast.error("Description must be 255 characters or less")
      return
    }
    if (remediation.length > 5000) {
      toast.error("Remediation must be 5000 characters or less")
      return
    }
    setSaving(true)
    try {
      const updated = await findingsServices.update(id, { title, description, severity, remediation, status })
      setFinding(updated)
      setIsEditing(false)
      toast.success("Finding updated")
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update finding")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = () => {
    confirmToast({
      message: "Delete this finding?",
      subtext: "This will also remove all attached evidence. This action cannot be undone.",
      confirmLabel: "Delete",
      onConfirm: async () => {
        try {
          await findingsServices.remove(id)
          toast.success("Finding deleted")
          navigate("/findings")
        } catch (error) {
          toast.error(error.response?.data?.error || "Failed to delete finding")
        }
      },
    })
  }

  const handleFileUpload = async (e) => {
    e.preventDefault()
    if (!file) {
      toast.error("Please select a file")
      return
    }
    setUploading(true)
    try {
      await evidenceServices.upload(id, file)
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      const updatedEvidence = await evidenceServices.list(id)
      setEvidence(updatedEvidence)
      toast.success("Evidence uploaded")
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to upload evidence")
    } finally {
      setUploading(false)
    }
  }

  const handleEvidenceDelete = (evidenceId) => {
    confirmToast({
      message: "Delete this evidence file?",
      subtext: "This action cannot be undone.",
      confirmLabel: "Delete",
      onConfirm: async () => {
        try {
          await evidenceServices.remove(evidenceId)
          setEvidence(evidence.filter((item) => item.id !== evidenceId))
          toast.success("Evidence deleted")
        } catch (error) {
          toast.error(error.response?.data?.error || "Failed to delete evidence")
        }
      },
    })
  }

  const handleSharing = async (findingId) => {
    const toastId = toast.loading("Generating share link…")
    try {
      const response = await shareServices.shareFinding(findingId)
      const url = `${window.location.origin}/shared/${response.token}`
      setShareURL(url)
      toast.dismiss(toastId)
      try {
        await navigator.clipboard.writeText(url)
        toast.success("Share link copied to clipboard!")
      } catch {
        toast.success("Share link generated — copy it below")
      }
    } catch (error) {
      toast.dismiss(toastId)
      toast.error(error.response?.data?.error || "Failed to share finding")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Loading finding…
      </div>
    )
  }

  if (!finding) {
    return <p className="text-sm text-muted-foreground">Finding not found.</p>
  }

  return (
    <div className="grid gap-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit text-muted-foreground"
        onClick={() => navigate("/findings")}
      >
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-heading text-xl tracking-tight">Evidence</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSharing(finding.id)}
              >
                Share finding
              </Button>
            </div>

            {shareURL && (
              <div className="flex items-start gap-3 rounded-md border border-border bg-muted/50 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Shareable link</p>
                  <p className="truncate font-mono text-xs text-foreground">{shareURL}</p>
                </div>
                <button
                  className="shrink-0 text-xs text-muted-foreground underline hover:text-foreground"
                  onClick={() => {
                    navigator.clipboard.writeText(shareURL).then(() => toast.success("Copied!"))
                  }}
                >
                  Copy
                </button>
              </div>
            )}

            <form onSubmit={handleFileUpload} className="flex flex-wrap items-center gap-2">
              <Input
                type="file"
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files[0])}
                className="max-w-sm"
                disabled={uploading}
              />
              <Button type="submit" variant="outline" disabled={uploading}>
                {uploading ? "Uploading…" : "Upload"}
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
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={saving}>
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
