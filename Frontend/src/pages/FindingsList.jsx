import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import findingsServices from "../services/findings"
import { Button } from "@/components/ui/button"
import FindingsTable from "@/components/FindingsTable"

const FindingsList = () => {
  const navigate = useNavigate()
  const [findings, setFindings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFindings = async () => {
      try {
        const data = await findingsServices.getAll()
        setFindings(data)
      } catch {
        toast.error("Failed to fetch findings")
      } finally {
        setLoading(false)
      }
    }
    fetchFindings()
  }, [])

  const handleDelete = async (id) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Delete this finding?</p>
          <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
          <div className="flex gap-2 mt-1">
            <button
              className="rounded px-3 py-1 text-xs font-medium bg-destructive text-white hover:opacity-90"
              onClick={async () => {
                toast.dismiss(t.id)
                try {
                  await findingsServices.remove(id)
                  setFindings((prev) => prev.filter((f) => f.id !== id))
                  toast.success("Finding deleted")
                } catch (error) {
                  toast.error(error.response?.data?.error || "Failed to delete finding")
                }
              }}
            >
              Delete
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

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Loading findings…
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl tracking-tight">Findings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {findings.length} {findings.length === 1 ? "record" : "records"}
          </p>
        </div>
        <Button onClick={() => navigate("/findings/create")}>New finding</Button>
      </div>
      <FindingsTable findings={findings} onDelete={handleDelete} />
    </div>
  )
}

export default FindingsList
