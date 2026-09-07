import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const severityClass = {
  Critical: "border-transparent bg-[#6b1c1c] text-[#fde8e8]",
  High: "border-transparent bg-[#9a3412] text-[#ffedd5]",
  Medium: "border-transparent bg-[#854d0e] text-[#fef3c7]",
  Low: "border-transparent bg-[#3f4a3c] text-[#e7eee6]",
}

const statusClass = {
  Open: "border-[#b7c4b0] bg-[#eef3ea] text-[#3d4a3c]",
  Resolved: "border-transparent bg-muted text-muted-foreground",
}

export const SeverityBadge = ({ severity }) => (
  <Badge className={cn("rounded-sm font-medium", severityClass[severity] || "bg-muted text-muted-foreground")}>
    {severity}
  </Badge>
)

export const StatusBadge = ({ status }) => (
  <Badge variant="outline" className={cn("rounded-sm font-medium", statusClass[status])}>
    {status}
  </Badge>
)
