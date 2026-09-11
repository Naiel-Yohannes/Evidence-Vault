import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import shareServices from "../services/shares"
import { SeverityBadge, StatusBadge } from "@/components/FindingLabels"
import SharedImage from "./SharePage"

const formatDate = (value) => {
  if (!value) return "N/A"
  const date = new Date(value)
  if (isNaN(date.getTime())) return "N/A"
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const SharedFindingDetail = () => {
  const { token } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSharedFinding = async () => {
      try {
        const result = await shareServices.getSharedFInding(token)
        setData(result)
      } catch (err) {
        if (err.response?.status === 410) {
          setError("This share link has expired. Please ask the owner to generate a new link.")
        } else if (err.response?.status === 404) {
          setError("This share link is invalid or the finding has been deleted.")
        } else {
          setError("Failed to load the shared finding. Please try again later.")
        }
      } finally {
        setLoading(false)
      }
    }
    fetchSharedFinding()
  }, [token])

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Loading shared finding…
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-2 bg-background px-4 text-center">
        <p className="font-heading text-lg text-foreground">Unable to load finding</p>
        <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-12 max-w-5xl items-center px-4">
          <span className="font-heading text-[17px] tracking-tight text-foreground">Evidence Vault</span>
          <span className="ml-3 rounded-sm border border-border bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground uppercase tracking-wide">
            Shared view
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-8">
          <div className="min-w-0">
            <h1 className="font-heading text-3xl tracking-tight">{data.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <SeverityBadge severity={data.severity} />
              <StatusBadge status={data.status} />
            </div>
            <p className="mt-3 font-mono text-xs text-muted-foreground">
              Created {formatDate(data.created_at)} · Updated {formatDate(data.updated_at)}
            </p>
          </div>

          <section className="grid gap-2">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{data.description}</p>
          </section>

          <section className="grid gap-2">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Remediation</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{data.remediation}</p>
          </section>

          <section className="grid gap-4 border-t border-border pt-6">
            <h2 className="font-heading text-xl tracking-tight">Evidence</h2>
            {data.evidence.length === 0 ? (
              <p className="text-sm text-muted-foreground">No files attached.</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {data.evidence.map((item) => (
                  <li key={item.id} className="overflow-hidden rounded-md border border-border bg-card">
                    <SharedImage
                      token={token}
                      fileId={item.id}
                      alt={item.original_filename}
                    />
                    <div className="px-3 py-2">
                      <p className="truncate font-mono text-xs">{item.original_filename}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default SharedFindingDetail
