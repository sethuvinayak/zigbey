"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Check, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { encodeMessage } from "@/lib/steganography"

export default function EncryptForm() {
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState("")
  const [password, setPassword] = useState("")
  const [usePassword, setUsePassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError("Please select a file")
      return
    }

    if (!message.trim()) {
      setError("Please enter a message to encrypt")
      return
    }

    if (usePassword && !password.trim()) {
      setError("Please enter a password or disable password protection")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await encodeMessage(file, message, usePassword ? password : undefined)

      // Create a download link for the encoded image
      const url = URL.createObjectURL(result)
      const a = document.createElement("a")
      a.href = url
      a.download = `zigbey_${file.name}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to encrypt message")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file">Select File</Label>
        <Input id="file" type="file" onChange={handleFileChange} className="border-2" accept="image/*" />
        {file && <p className="text-sm text-gray-400">Selected: {file.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message to Encrypt</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your secret message here"
          className="border-2 min-h-[100px]"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="usePassword"
          checked={usePassword}
          onCheckedChange={(checked) => setUsePassword(checked === true)}
          className="border-2"
        />
        <Label htmlFor="usePassword">Password Protect</Label>
      </div>

      {usePassword && (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="border-2"
          />
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="border-red-500 text-red-500">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 text-green-500">
          <Check className="h-4 w-4" />
          <AlertDescription>File encrypted and downloaded successfully!</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Encrypt and Download"
        )}
      </Button>
    </form>
  )
}
