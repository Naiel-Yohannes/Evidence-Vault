import { NavLink, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const AppShell = ({ user, setUser, children }) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("token")
    setUser(null)
    navigate("/login")
  }

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-12 max-w-5xl items-center gap-6 px-4">
          <NavLink to="/dashboard" className="font-heading text-[17px] tracking-tight text-foreground">
            Evidence Vault
          </NavLink>
          <nav className="flex items-center gap-1 text-sm">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                cn(
                  "rounded-md px-2 py-1 text-muted-foreground hover:text-foreground",
                  isActive && "bg-muted text-foreground"
                )
              }
            >
              Overview
            </NavLink>
            <NavLink
              to="/findings"
              className={({ isActive }) =>
                cn(
                  "rounded-md px-2 py-1 text-muted-foreground hover:text-foreground",
                  isActive && "bg-muted text-foreground"
                )
              }
            >
              Findings
            </NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}

export default AppShell
