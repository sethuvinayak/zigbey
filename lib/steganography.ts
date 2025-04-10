/**
 * Basic steganography implementation for images
 *
 * This is a simplified implementation for demonstration purposes.
 * In a production environment, you would want to use more sophisticated
 * algorithms and support for different file types.
 */

// Encode a message into an image
export async function encodeMessage(imageFile: File, message: string, password?: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        if (!e.target?.result) {
          throw new Error("Failed to read file")
        }

        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          try {
            // Create a canvas to work with the image
            const canvas = document.createElement("canvas")
            canvas.width = img.width
            canvas.height = img.height

            const ctx = canvas.getContext("2d")
            if (!ctx) {
              throw new Error("Could not create canvas context")
            }

            // Draw the image on the canvas
            ctx.drawImage(img, 0, 0)

            // Get the image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const data = imageData.data

            // Prepare the message
            let messageToHide = message

            // If password is provided, add a marker and the password hash
            if (password) {
              // In a real app, you'd use a proper encryption method
              // This is just a simple demonstration
              messageToHide = `[PROTECTED]${password}[DATA]${message}`
            }

            // Convert the message to binary
            const binaryMessage = stringToBinary(messageToHide)

            // Check if the image is large enough to store the message
            if (binaryMessage.length > data.length / 4) {
              throw new Error("Message is too large for this image")
            }

            // Add message length at the beginning (32 bits / 4 bytes)
            const messageLength = binaryMessage.length
            const lengthBinary = messageLength.toString(2).padStart(32, "0")

            // Embed the length
            for (let i = 0; i < 32; i++) {
              // Modify the least significant bit of the red channel
              if (lengthBinary[i] === "1") {
                data[i * 4] = data[i * 4] | 1 // Set LSB to 1
              } else {
                data[i * 4] = data[i * 4] & 254 // Set LSB to 0
              }
            }

            // Embed the message
            for (let i = 0; i < messageLength; i++) {
              // Start after the length (32 bytes)
              const position = (i + 32) * 4

              if (binaryMessage[i] === "1") {
                data[position] = data[position] | 1 // Set LSB to 1
              } else {
                data[position] = data[position] & 254 // Set LSB to 0
              }
            }

            // Put the modified data back on the canvas
            ctx.putImageData(imageData, 0, 0)

            // Convert the canvas to a blob
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error("Failed to create image"))
              }
            }, imageFile.type)
          } catch (error) {
            reject(error)
          }
        }

        img.onerror = () => {
          reject(new Error("Failed to load image"))
        }

        img.src = e.target.result as string
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    reader.readAsDataURL(imageFile)
  })
}

// Decode a message from an image
export async function decodeMessage(imageFile: File, password?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        if (!e.target?.result) {
          throw new Error("Failed to read file")
        }

        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          try {
            // Create a canvas to work with the image
            const canvas = document.createElement("canvas")
            canvas.width = img.width
            canvas.height = img.height

            const ctx = canvas.getContext("2d")
            if (!ctx) {
              throw new Error("Could not create canvas context")
            }

            // Draw the image on the canvas
            ctx.drawImage(img, 0, 0)

            // Get the image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const data = imageData.data

            // Extract the message length (first 32 bits)
            let lengthBinary = ""
            for (let i = 0; i < 32; i++) {
              lengthBinary += (data[i * 4] & 1).toString()
            }

            const messageLength = Number.parseInt(lengthBinary, 2)

            if (isNaN(messageLength) || messageLength <= 0 || messageLength > data.length / 4) {
              throw new Error("Invalid data or no message found")
            }

            // Extract the message
            let binaryMessage = ""
            for (let i = 0; i < messageLength; i++) {
              // Start after the length (32 bytes)
              const position = (i + 32) * 4
              binaryMessage += (data[position] & 1).toString()
            }

            // Convert binary to string
            let extractedMessage = binaryToString(binaryMessage)

            // Check if the message is password protected
            if (extractedMessage.startsWith("[PROTECTED]")) {
              // Extract the password and data
              const protectedParts = extractedMessage.split("[DATA]")
              if (protectedParts.length !== 2) {
                throw new Error("Invalid protected message format")
              }

              const storedPassword = protectedParts[0].replace("[PROTECTED]", "")

              // Check if password matches
              if (!password) {
                throw new Error("This message is password protected")
              }

              if (password !== storedPassword) {
                throw new Error("Incorrect password")
              }

              // Return the actual message
              extractedMessage = protectedParts[1]
            }

            resolve(extractedMessage)
          } catch (error) {
            reject(error)
          }
        }

        img.onerror = () => {
          reject(new Error("Failed to load image"))
        }

        img.src = e.target.result as string
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    reader.readAsDataURL(imageFile)
  })
}

// Helper function to convert string to binary
function stringToBinary(str: string): string {
  let result = ""
  for (let i = 0; i < str.length; i++) {
    const binary = str.charCodeAt(i).toString(2).padStart(8, "0")
    result += binary
  }
  return result
}

// Helper function to convert binary to string
function binaryToString(binary: string): string {
  let result = ""
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.substr(i, 8)
    const charCode = Number.parseInt(byte, 2)
    result += String.fromCharCode(charCode)
  }
  return result
}
