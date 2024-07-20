// useAuthentication
// replacement for JWT no jwt required

interface Token {
  username: string
  expiresAt: number
}

const alphanum = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

const encryptToken = (token: Token, secret: string) => {
  const tokenString = JSON.stringify(token)
  let encrypted = ''
  for (let i = 0; i < tokenString.length; i++) {
    encrypted += alphanum[(alphanum.indexOf(tokenString[i]) + alphanum.indexOf(secret[i % secret.length])) % alphanum.length]
  }
  return encrypted
}

const decryptToken = (encrypted: string, secret: string) => {
  let decrypted = ''
  for (let i = 0; i < encrypted.length; i++) {
    decrypted += alphanum[(alphanum.indexOf(encrypted[i]) - alphanum.indexOf(secret[i % secret.length]) + alphanum.length) % alphanum.length]
  }
  return JSON.parse(decrypted) as Token
}

export const useAuthentication = () => {
  const generateToken = (username: string, secret: string) => {
    const token: Token = {
      username,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24,
    }
    return encryptToken(token, secret)
  }

  const verifyToken = (token: string, secret: string) => {
    try {
      const decrypted = decryptToken(token, secret)
      if (decrypted.expiresAt < Date.now()) return false
      return decrypted
    }
    catch (e) {
      return false
    }
  }

  return {
    generateToken,
    verifyToken,
  }
}
