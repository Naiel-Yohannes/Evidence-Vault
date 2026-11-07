import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import toast from "react-hot-toast"
import authServices from "../services/auth"
import { setToken } from "../services/interceptor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const passwordRequirements = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (value) => value.length >= 8,
  },
  {
    id: "uppercase",
    label: "At least one uppercase letter (A-Z)",
    test: (value) => /[A-Z]/.test(value),
  },
  {
    id: "lowercase",
    label: "At least one lowercase letter (a-z)",
    test: (value) => /[a-z]/.test(value),
  },
  {
    id: "number",
    label: "At least one number (0-9)",
    test: (value) => /\d/.test(value),
  },
  {
    id: "special",
    label: "At least one special character",
    test: (value) => /[^A-Za-z0-9\s]/.test(value),
  },
]

const Register = ({ setUser }) => {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!username.trim() || !name.trim() || !password) {
      toast.error("Fill in all fields")
      return
    }
    const unmetRequirements = passwordRequirements.filter(({ test }) => !test(password))
    if (unmetRequirements.length > 0) {
      toast.error(`Password needs: ${unmetRequirements.map(({ label }) => label).join(", ")}`)
      return
    }
    setLoading(true)
    try {
      const newUser = await authServices.register({ username, name, password })
      const loggingUser = await authServices.login({ username: newUser.username, password })
      await setToken(loggingUser.token)
      localStorage.setItem("token", JSON.stringify(loggingUser))
      setUser(loggingUser)
      setUsername("")
      setName("")
      setPassword("")
      navigate("/dashboard")
    } catch (error) {
      const responseData = error.response?.data
      const unmetRequirements = responseData?.unmetRequirements
        ?.map(({ label }) => label)
        .join(", ")

      toast.error(
        unmetRequirements
          ? `Password needs: ${unmetRequirements}`
          : responseData?.error || "Registration failed",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 bg-background">
      <div className="mb-8 text-center">
        <p className="font-heading text-2xl tracking-tight text-foreground">Evidence Vault</p>
        <p className="mt-1 text-sm text-muted-foreground">Secure findings management</p>
      </div>
      <Card className="w-full max-w-sm rounded-lg shadow-none">
        <CardHeader className="border-b pb-4">
          <CardTitle>Create an account</CardTitle>
          <CardDescription>You'll be signed in after registration.</CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <form onSubmit={handleRegister} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <ul className="mt-1 grid gap-1 text-xs" aria-label="Password requirements">
                {passwordRequirements.map((requirement) => {
                  const isMet = requirement.test(password)
                  return (
                    <li
                      key={requirement.id}
                      className={isMet ? "text-green-600" : "text-muted-foreground"}
                    >
                      {isMet ? "✓" : "○"} {requirement.label}
                    </li>
                  )
                })}
              </ul>
            </div>
            <Button type="submit" className="mt-1 w-full" disabled={loading}>
              {loading ? "Creating account…" : "Register"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-foreground underline underline-offset-3">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default Register
