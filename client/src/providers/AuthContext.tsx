import { createContext } from "react"
import type { AuthUser } from "@/types"

export interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  error: string | null
  login: (credentials: { email: string; password: string }) => Promise<void>
  register: (credentials: { name: string; email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
