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
    const tokenCookie = useCookie('auth_token', {
      maxAge: expiresInDays * 24 * 60 * 60,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })
    tokenCookie.value = token

    // Update user state
    userState.value = decodeToken(token)
  }

  /**
   * Get token from localStorage or cookie
   * @returns Stored token or null
   */
  const getToken = (): string | null => {
    // Try to get from cookie first (works on both client & server)
    const tokenCookie = useCookie('auth_token')
    if (tokenCookie.value) return tokenCookie.value

    // Fallback to localStorage (client-side only)
    if (import.meta.client) {
      return localStorage.getItem('auth_token')
    }

    return null
  }

  /**
   * Remove token from both localStorage and cookie
   */
  const removeToken = () => {
    // Remove from localStorage (client-side only)
    if (import.meta.client) {
      localStorage.removeItem('auth_token')
    }

    // Remove from cookie
    const tokenCookie = useCookie('auth_token')
    tokenCookie.value = null

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
