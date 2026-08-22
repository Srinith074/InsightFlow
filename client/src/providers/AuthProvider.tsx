import { useEffect, useMemo, useState, type ReactNode } from "react"
import { api } from "@/utils/api"
import type { AuthUser } from "@/types"
import { AuthContext } from "./AuthContext"

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/api/auth/me")
        setUser(response.data.user)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const login = async (credentials: { email: string; password: string }) => {
    setError(null)
    const response = await api.post<{ user: AuthUser; token?: string }>("/api/auth/login", credentials)
    if (response.data.token && typeof window !== "undefined") {
      localStorage.setItem("token", response.data.token)
    }
    setUser(response.data.user)
  }

  const register = async (credentials: { name: string; email: string; password: string }) => {
    setError(null)
    const response = await api.post<{ user: AuthUser; token?: string }>("/api/auth/register", credentials)
    if (response.data.token && typeof window !== "undefined") {
      localStorage.setItem("token", response.data.token)
    }
    setUser(response.data.user)
  }

  const logout = async () => {
    try {
      await api.post("/api/auth/logout")
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
      }
      setUser(null)
    }
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      login,
      register,
      logout,
    }),
    [user, loading, error]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
