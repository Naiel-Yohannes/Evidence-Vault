import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SeverityBadge, StatusBadge } from "@/components/FindingLabels"

const FindingsTable = ({ findings, onDelete }) => {
  const navigate = useNavigate()

  if (findings.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border px-4 py-10 text-center">
        <p className="text-sm text-muted-foreground">No findings recorded yet.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/60 hover:bg-muted/60">
            <TableHead className="px-3 text-xs uppercase tracking-wide text-muted-foreground">Title</TableHead>
            <TableHead className="px-3 text-xs uppercase tracking-wide text-muted-foreground">Severity</TableHead>
            <TableHead className="px-3 text-xs uppercase tracking-wide text-muted-foreground">Status</TableHead>
            {onDelete ? (
              <TableHead className="px-3 text-right text-xs uppercase tracking-wide text-muted-foreground">
                Actions
              </TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {findings.map((finding) => (
            <TableRow
              key={finding.id}
              className="cursor-pointer"
              onClick={() => navigate(`/findings/${finding.id}`)}
            >
              <TableCell className="max-w-md px-3">
                <div className="truncate font-medium">{finding.title}</div>
                <div className="truncate text-xs text-muted-foreground">{finding.description}</div>
              </TableCell>
              <TableCell className="px-3">
                <SeverityBadge severity={finding.severity} />
              </TableCell>
              <TableCell className="px-3">
                <StatusBadge status={finding.status} />
              </TableCell>
              {onDelete ? (
                <TableCell className="px-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(finding.id)
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default FindingsTable
