import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const SEVERITY_OPTIONS = ["Low", "Medium", "High", "Critical"]
export const STATUS_OPTIONS = ["Open", "Resolved"]

const Field = ({ id, label, hint, children }) => (
  <div className="grid gap-1.5">
    <div className="flex items-baseline justify-between gap-3">
      <Label htmlFor={id}>{label}</Label>
      {hint ? <span className="font-mono text-[11px] text-muted-foreground">{hint}</span> : null}
    </div>
    {children}
  </div>
)

const FindingFormFields = ({
  title,
  setTitle,
  description,
  setDescription,
  severity,
  setSeverity,
  remediation,
  setRemediation,
  status,
  setStatus,
}) => {
  return (
    <div className="grid gap-5">
      <Field id="title" label="Title" hint={`${title.length}/50`}>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={50} />
      </Field>
      <Field id="description" label="Description" hint={`${description.length}/255`}>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={255}
          rows={3}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="severity" label="Severity">
          <Select value={severity || undefined} onValueChange={setSeverity}>
            <SelectTrigger id="severity" className="w-full">
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              {SEVERITY_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field id="status" label="Status">
          <Select value={status || undefined} onValueChange={setStatus}>
            <SelectTrigger id="status" className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      <Field id="remediation" label="Remediation" hint={`${remediation.length}/5000`}>
        <Textarea
          id="remediation"
          value={remediation}
          onChange={(e) => setRemediation(e.target.value)}
          maxLength={5000}
          rows={6}
          className="min-h-32"
        />
      </Field>
    </div>
  )
}

export default FindingFormFields
