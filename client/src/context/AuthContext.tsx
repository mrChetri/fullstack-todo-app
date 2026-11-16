import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'todo_app_token';
const USER_KEY = 'todo_app_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {\n  const [user, setUser] = useState<AuthUser | null>(null);\n  const [token, setToken] = useState<string | null>(null);\n  const [isLoading, setIsLoading] = useState(true);\n\n  useEffect(() => {\n    try {\n      const storedToken = localStorage.getItem(TOKEN_KEY);\n      const storedUser = localStorage.getItem(USER_KEY);\n\n      if (storedToken && storedUser) {\n        setToken(storedToken);\n        setUser(JSON.parse(storedUser) as AuthUser);\n      }\n    } catch (e) {\n      console.error('Failed to restore session from localStorage', e);\n      localStorage.removeItem(TOKEN_KEY);\n      localStorage.removeItem(USER_KEY);\n    } finally {\n      setIsLoading(false);\n    }\n  }, []);\n\n  const login = (newToken: string, newUser: AuthUser) => {\n    setToken(newToken);\n    setUser(newUser);\n    localStorage.setItem(TOKEN_KEY, newToken);\n    localStorage.setItem(USER_KEY, JSON.stringify(newUser));\n  };\n\n  const logout = () => {\n    setToken(null);\n    setUser(null);\n    localStorage.removeItem(TOKEN_KEY);\n    localStorage.removeItem(USER_KEY);\n  };\n\n  return (\n    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>\n      {children}\n    </AuthContext.Provider>\n  );\n}\n\nexport function useAuth(): AuthContextType {\n  const context = useContext(AuthContext);\n  if (!context) {\n    throw new Error('useAuth must be used within an AuthProvider');\n  }\n  return context;\n}\n