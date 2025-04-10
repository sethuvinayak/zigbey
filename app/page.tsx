"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import EncryptForm from "@/components/encrypt-form"
import DecryptForm from "@/components/decrypt-form"
import { ArrowLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  const [mode, setMode] = useState<"home" | "encrypt" | "decrypt">("home")

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold tracking-wider">ZIGBEY</CardTitle>
            <CardDescription>Steganography Tool</CardDescription>
          </CardHeader>
          <CardContent>
            {mode === "home" && (
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="border-2 transition-colors" onClick={() => setMode("encrypt")}>
                  Encrypt
                </Button>
                <Button variant="outline" className="border-2 transition-colors" onClick={() => setMode("decrypt")}>
                  Decrypt
                </Button>
              </div>
            )}

            {mode === "encrypt" && <EncryptForm />}
            {mode === "decrypt" && <DecryptForm />}
          </CardContent>

          {mode !== "home" && (
            <CardFooter>
              <Button variant="ghost" onClick={() => setMode("home")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            </CardFooter>
          )}
        </Card>

        <footer className="mt-8 text-center text-sm opacity-70">Created by Sethu</footer>
      </div>
    </main>
  )
}
