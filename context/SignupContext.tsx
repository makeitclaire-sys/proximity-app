import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"

type SignupData = {
  phone: string
  userId: string | null
  username: string
  age: number | null
  mode: "social" | "professional"
  status: string
  bio: string
}

type SignupContextType = SignupData & {
  setPhone: (v: string) => void
  setUserId: (v: string | null) => void
  setUsername: (v: string) => void
  setAge: (v: number | null) => void
  setMode: (v: "social" | "professional") => void
  setStatus: (v: string) => void
  setBio: (v: string) => void
  reset: () => void
}

const INITIAL: SignupData = {
  phone: "",
  userId: null,
  username: "",
  age: null,
  mode: "social",
  status: "",
  bio: "",
}

const SignupContext = createContext<SignupContextType | null>(null)

export function SignupProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SignupData>(INITIAL)

  const setPhone    = (v: string)                        => setData(prev => ({ ...prev, phone: v }))
  const setUserId   = (v: string | null)                 => setData(prev => ({ ...prev, userId: v }))
  const setUsername = (v: string)                        => setData(prev => ({ ...prev, username: v }))
  const setAge      = (v: number | null)                 => setData(prev => ({ ...prev, age: v }))
  const setMode     = (v: "social" | "professional")     => setData(prev => ({ ...prev, mode: v }))
  const setStatus   = (v: string)                        => setData(prev => ({ ...prev, status: v }))
  const setBio      = (v: string)                        => setData(prev => ({ ...prev, bio: v }))
  const reset       = ()                                 => setData(INITIAL)

  return (
    <SignupContext.Provider value={{ ...data, setPhone, setUserId, setUsername, setAge, setMode, setStatus, setBio, reset }}>
      {children}
    </SignupContext.Provider>
  )
}

export function useSignup() {
  const ctx = useContext(SignupContext)
  if (!ctx) throw new Error("useSignup must be used within SignupProvider")
  return ctx
}
