import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import authServices from "../services/auth"
import { setToken } from "../services/interceptor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const Register = ({ setUser }) => {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!username.trim() || !name.trim() || !password) {
      alert("Fill in all fields")
      return
    }
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
      alert(error.response?.data?.error || "Registration failed")
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4">
      <p className="mb-8 font-heading text-2xl tracking-tight">Evidence Vault</p>
      <Card className="w-full max-w-sm rounded-lg shadow-none">
        <CardHeader className="border-b pb-4">
          <CardTitle>Create an account</CardTitle>
          <CardDescription>You’ll be signed in after registration.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
              />
            </div>
            <Button type="submit" className="mt-1 w-full">
              Register
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
