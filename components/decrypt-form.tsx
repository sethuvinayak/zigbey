"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { decodeMessage } from "@/lib/steganography"

export default function DecryptForm() {
  const [file, setFile] = useState<File | null>(null)
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [decodedMessage, setDecodedMessage] = useState<string | null>(null)
  const [requiresPassword, setRequiresPassword] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      // Only accept image files for now
      if (!selectedFile.type.startsWith("image/")) {
        setError("Currently only image files are supported")
        setFile(null)
        return
      }

      setFile(selectedFile)
      setError(null)
      setDecodedMessage(null)

      try {
        // Check if the file requires a password
        const needsPassword = await checkIfPasswordRequired(selectedFile)
        setRequiresPassword(needsPassword)
      } catch (err) {
        setError("Unable to process this file")
      }
    }
  }

  // This is a placeholder function - in a real implementation,
  // you would check the file metadata or try to decode without a password
  const checkIfPasswordRequired = async (file: File): Promise<boolean> => {
    try {
      // Try to decode without password
      await decodeMessage(file)
      return false
    } catch (err) {
      // If it fails, assume it needs a password
      return true
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError("Please select a file")
      return
    }

    if (requiresPassword && !password.trim()) {
      setError("This file requires a password")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const message = await decodeMessage(file, requiresPassword ? password : undefined)
      setDecodedMessage(message)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to decrypt message")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file">Select Encrypted File</Label>
        <Input id="file" type="file" onChange={handleFileChange} className="border-2" accept="image/*" />
        {file && <p className="text-sm text-gray-400">Selected: {file.name}</p>}
      </div>

      {requiresPassword && file && (
        <div className="space-y-2">
          <Label htmlFor="password">Password Required</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="border-white text-white bg-black"
          />
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="border-red-500 text-red-500">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {decodedMessage && (
        <div className="p-4 border-2 rounded-md">
          <Label className="block mb-2">Decoded Message:</Label>
          <div className="p-3 rounded whitespace-pre-wrap break-words border">{decodedMessage}</div>
        </div>
      )}

      <Button type="submit" disabled={loading || !file} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Decrypting...
          </>
        ) : (
          "Decrypt Message"
        )}
      </Button>
    </form>
  )
}
