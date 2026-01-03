import React, { createContext, useContext, useEffect, useState } from 'react'
import { mockLogin, mockRegister, getMe } from '../services/mockApi'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    getMe().then((u) => {
      if (u) setUser(u)
      else localStorage.removeItem('token')
    }).catch(() => localStorage.removeItem('token'))
  }, [])

  async function login({ email, password }) {
    const res = await mockLogin(email, password)
    // when backend returns { user, token }
    if (res && res.user && res.token) {
      localStorage.setItem('token', res.token)
      setUser(res.user)
      return res.user
    }
    setUser(res)
    return res
  }

  async function register({ employeeId, name, email, password, role }) {
    const res = await mockRegister({ employeeId, name, email, password, role })
    // If backend returns a token + user (dev AUTO_VERIFY) or token on register (dev helper), handle accordingly
    if (res && res.token && res.user) {
      localStorage.setItem('token', res.token)
      setUser(res.user)
      return res
    }
    if (res && res.token && !(res.user)) {
      // Received verification token only (DEV_RETURN_VERIFICATION_TOKEN) — do not auto-login
      return res
    }
    if (res && res.user) setUser(res.user)
    return res
  }

  function logout() {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
