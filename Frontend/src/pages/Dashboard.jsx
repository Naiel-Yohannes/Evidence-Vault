import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import findingsServices from "../services/findings"
import { Button } from "@/components/ui/button"
import FindingsTable from "@/components/FindingsTable"

const Dashboard = () => {
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

  const openCount = findings.filter((f) => f.status === "Open").length
  const resolvedCount = findings.filter((f) => f.status === "Resolved").length
  const criticalCount = findings.filter((f) => f.severity === "Critical" || f.severity === "High").length

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading findings…</p>
  }

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl tracking-tight">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">Open items and recent findings in this vault.</p>
        </div>
        <Button onClick={() => navigate("/findings/create")}>New finding</Button>
      </div>

      <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-md border border-border bg-border">
        <div className="bg-card px-4 py-3">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Open</dt>
          <dd className="mt-1 font-mono text-2xl tabular-nums">{openCount}</dd>
        </div>
        <div className="bg-card px-4 py-3">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">High / critical</dt>
          <dd className="mt-1 font-mono text-2xl tabular-nums">{criticalCount}</dd>
        </div>
        <div className="bg-card px-4 py-3">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Resolved</dt>
          <dd className="mt-1 font-mono text-2xl tabular-nums">{resolvedCount}</dd>
        </div>
      </dl>

      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Recent findings</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/findings")}>
            View all
          </Button>
        </div>
        <FindingsTable findings={findings.slice(0, 8)} />
      </section>
    </div>
  )
}

export default Dashboard
