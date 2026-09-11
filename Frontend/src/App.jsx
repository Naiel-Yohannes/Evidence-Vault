import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { setToken } from "./services/interceptor"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import CreateFinding from "./pages/CreateFinding"
import FindingsList from "./pages/FindingsList"
import FindingDetail from "./pages/FindingDetail"
import SharedFindingDetail from "./pages/sharedFindingDetail"
import AppShell from "./components/AppShell"

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const loggedUserJSON = localStorage.getItem("token")
    if (loggedUserJSON) {
      const parsed = JSON.parse(loggedUserJSON)
      setUser(parsed)
      setToken(parsed.token)
    }
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register setUser={setUser} /> : <Navigate to="/dashboard" />} />
        <Route
          path="/dashboard"
          element={
            user ? (
              <AppShell user={user} setUser={setUser}>
                <Dashboard />
              </AppShell>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/findings"
          element={
            user ? (
              <AppShell user={user} setUser={setUser}>
                <FindingsList />
              </AppShell>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/findings/create"
          element={
            user ? (
              <AppShell user={user} setUser={setUser}>
                <CreateFinding />
              </AppShell>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/findings/:id"
          element={
            user ? (
              <AppShell user={user} setUser={setUser}>
                <FindingDetail />
              </AppShell>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/shared/:token" element={<SharedFindingDetail />} />
      </Routes>
    </Router>
  )
}

export default App
