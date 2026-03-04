"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Lock, ShieldCheck, KeyRound } from "lucide-react"

interface PasswordGuardProps {
  children: React.ReactNode
}

export function PasswordGuard({ children }: PasswordGuardProps) {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const savedPassword = localStorage.getItem("app_password")
    setIsFirstTime(!savedPassword)
  }, [])

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 4) {
      setError("Password must be at least 4 characters long.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    localStorage.setItem("app_password", password)
    setIsUnlocked(true)
    setIsFirstTime(false)
  }

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault()
    const savedPassword = localStorage.getItem("app_password")
    if (password === savedPassword) {
      setIsUnlocked(true)
      setError("")
    } else {
      setError("Incorrect password. Please try again.")
    }
  }

  if (isFirstTime === null) return null // Loading state

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
              {isFirstTime ? (
                <ShieldCheck className="h-8 w-8 text-primary" />
              ) : (
                <Lock className="h-8 w-8 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold">
              {isFirstTime ? "Set Your Password" : "App Locked"}
            </CardTitle>
            <CardDescription>
              {isFirstTime
                ? "Secure your financial data with a password. You'll need this every time you open the app."
                : "Please enter your password to access your balance manager."}
            </CardDescription>
          </CardHeader>
          <form onSubmit={isFirstTime ? handleSetPassword : handleUnlock}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">{isFirstTime ? "New Password" : "Password"}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    autoFocus
                  />
                  <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              {isFirstTime && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                    />
                    <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              )}

              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full h-11 text-base">
                {isFirstTime ? "Create Password" : "Unlock App"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
