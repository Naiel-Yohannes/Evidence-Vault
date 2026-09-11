import { useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import findingsServices from "../services/findings"
import { Button } from "@/components/ui/button"
import FindingFormFields from "@/components/FindingFormFields"

const CreateFinding = () => {
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [severity, setSeverity] = useState("")
  const [remediation, setRemediation] = useState("")
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
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
    setLoading(true)
    try {
      await findingsServices.create({ title, description, severity, remediation, status })
      toast.success("Finding created")
      setTitle("")
      setDescription("")
      setSeverity("")
      setRemediation("")
      setStatus("")
      navigate("/findings")
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create finding")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <div>
        <h1 className="font-heading text-3xl tracking-tight">New finding</h1>
        <p className="mt-1 text-sm text-muted-foreground">Record a finding and attach evidence after it is created.</p>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-6">
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
          <Button type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create finding"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/findings")} disabled={loading}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateFinding
