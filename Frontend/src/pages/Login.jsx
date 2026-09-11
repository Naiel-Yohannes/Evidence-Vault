import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import toast from "react-hot-toast"
import authServices from "../services/auth"
import { setToken } from "../services/interceptor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const Login = ({ setUser }) => {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password) {
      toast.error("Enter your username and password")
      return
    }
    setLoading(true)
    try {
      const loggingUser = await authServices.login({ username, password })
      await setToken(loggingUser.token)
      localStorage.setItem("token", JSON.stringify(loggingUser))
      setUser(loggingUser)
      setUsername("")
      setPassword("")
      navigate("/dashboard")
    } catch (error) {
      toast.error(error.response?.data?.error || "Login failed")
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
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Use your workspace credentials.</CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <form onSubmit={handleLogin} className="grid gap-4">
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="mt-1 w-full" disabled={loading}>
              {loading ? "Signing in…" : "Continue"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            No account yet?{" "}
            <Link to="/register" className="text-foreground underline underline-offset-3">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
