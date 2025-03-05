import { type JWTPayload, jwtVerify, SignJWT } from 'jose'
import { ref } from 'vue'

/**
 * Authentication utilities composable
 * Provides functions for token generation, verification, and storage
 * Syncs token between localStorage and cookies for universal authentication
 */
export const useAuthentication = () => {
  const userState = ref<JWTPayload | null>(null)

  /**
   * Generate a JWT token
   * @param payload - Data to encode in the token
   * @param secretKey - Secret key for signing
   * @param expiresIn - Token expiration in seconds (default 24h)
   * @returns JWT token string
   */
  const generateToken = async (payload: JWTPayload, secretKey: string, expiresIn = '24h') => {
    // Convert duration string to seconds
    const expirationTime = getExpirationTime(expiresIn)

    // Create the JWT
    const encoder = new TextEncoder()
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + expirationTime)
      .sign(encoder.encode(secretKey))
  }

  /**
   * Verify a JWT token
   * @param token - Token to verify
   * @param secretKey - Secret key for verification
   * @returns Boolean indicating if token is valid
   */
  const verifyToken = async (token: string, secretKey: string): Promise<boolean> => {
    try {
      const encoder = new TextEncoder()
      await jwtVerify(token, encoder.encode(secretKey))
      return true
    }
    catch {
      return false
    }
  }

  /**
   * Decode token payload without verification
   * @param token - Token to decode
   * @returns Decoded token payload
   */
  const decodeToken = (token: string): JWTPayload | null => {
    try {
      // Basic JWT decode without verification
      // Extract the payload (second part of the JWT)
      const payloadBase64 = token.split('.')[1]
      const payloadJson = atob(payloadBase64)
      return JSON.parse(payloadJson)
    }
    catch {
      return null
    }
  }

  /**
   * Store token in both localStorage and cookie
   * @param token - Token to store
   * @param expiresInDays - Cookie expiration in days
   */
  const setToken = (token: string, expiresInDays = 7) => {
    if (!token) return

    // Set token in localStorage (client-side only)
    if (import.meta.client) {
      localStorage.setItem('auth_token', token)
    }

    // Set token in cookie (works on both client & server)
    // Use a try/catch since cookie access might fail on server in some contexts
    try {
      // Dynamically import cookie functionality to avoid server-side issues
      if (import.meta.client) {
        document.cookie = `auth_token=${token}; max-age=${expiresInDays * 24 * 60 * 60}; path=/; ${process.env.NODE_ENV === 'production' ? 'secure; ' : ''}samesite=strict`
      }
      else {
        // For server-side, we'll rely on the actual requests/responses
        // This would typically be handled by your API routes
      }

      // Update user state
      userState.value = decodeToken(token)
    }
    catch (error) {
      console.error('Error setting cookie:', error)
    }
  }

  /**
   * Get token from localStorage or cookie
   * @returns Stored token or null
   */
  const getToken = (): string | null => {
    if (import.meta.server) {
      // On server, we would typically get this from the request headers
      // This would be implemented in your API middleware
      return null
    }

    // Client-side implementation
    // Try to get from cookie first
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === 'auth_token') return value
    }

    // Fallback to localStorage
    return localStorage.getItem('auth_token')
  }

  /**
   * Remove token from both localStorage and cookie
   */
  const removeToken = () => {
    // Remove from localStorage (client-side only)
    if (import.meta.client) {
      localStorage.removeItem('auth_token')
      // Remove cookie by setting expiration to past date
      document.cookie = 'auth_token=; max-age=0; path=/;'
    }

    // Reset user state
    userState.value = null
  }

  /**
   * Convert time string to seconds
   * Examples: '1h' => 3600, '7d' => 604800
   * @param timeString - Time string like '1h', '7d', '30m'
   * @returns Seconds
   */
  const getExpirationTime = (timeString: string): number => {
    const match = timeString.match(/^(\d+)([hdms])$/)
    if (!match) return 24 * 60 * 60 // Default to 24 hours

    const value = Number.parseInt(match[1], 10)
    const unit = match[2]

    switch (unit) {
      case 'h': return value * 60 * 60
      case 'd': return value * 24 * 60 * 60
      case 'm': return value * 60
      case 's': return value
      default: return 24 * 60 * 60
    }
  }

  return {
    generateToken,
    verifyToken,
    decodeToken,
    setToken,
    getToken,
    removeToken,
    user: userState,
  }
}
