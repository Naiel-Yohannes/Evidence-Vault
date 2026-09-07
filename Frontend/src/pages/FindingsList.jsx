import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
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
        alert("Failed to fetch findings")
      } finally {
        setLoading(false)
      }
    }
    fetchFindings()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this finding?")) {
      return
    }
    try {
      await findingsServices.remove(id)
      setFindings(findings.filter((f) => f.id !== id))
    } catch (error) {
      alert(error.response?.data?.error || "Failed to delete finding")
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading findings…</p>
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
