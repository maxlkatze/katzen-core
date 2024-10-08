// useAuthentication
// replacement for JWT no jwt required

interface Token {
  username: string
  expiresAt: number
}

const xorEncryptDecrypt = (input: string, secret: string) => {
  let output = ''
  for (let i = 0; i < input.length; i++) {
    const inputCharCode = input.charCodeAt(i)
    const secretCharCode = secret.charCodeAt(i % secret.length)
    output += String.fromCharCode(inputCharCode ^ secretCharCode)
  }
  return output
}

const encryptToken = (token: Token, secret: string) => {
  const tokenString = JSON.stringify(token)
  const encrypted = xorEncryptDecrypt(tokenString, secret)
  return Buffer.from(encrypted, 'utf8').toString('base64')
}

const decryptToken = (encrypted: string, secret: string) => {
  const decoded = Buffer.from(encrypted, 'base64').toString('utf8')
  const decrypted = xorEncryptDecrypt(decoded, secret)
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
      console.error(e)
      return false
    }
  }

  return {
    generateToken,
    verifyToken,
  }
}
