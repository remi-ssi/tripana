import JSEncrypt from 'jsencrypt';
import { apiClient } from '../api/apiClient'

let encryptor = null
let publicKeyPromise = null


//Fetch and cache the public key from the backend.
async function fetchPublicKey() {
  if (publicKeyPromise === null) {
    publicKeyPromise = apiClient.get('/auth/public-key')
      .then(response => {
        const publicKey = response.public_key
        console.log('[Crypto] Public key fetched successfully, length:', publicKey.length)
        const jsEncrypt = new JSEncrypt()
        const setResult = jsEncrypt.setPublicKey(publicKey)
        console.log('[Crypto] JSEncrypt public key set, result:', setResult)
        return jsEncrypt
      })
      .catch(err => {
        console.error('[Crypto] Failed to fetch public key:', err)
        publicKeyPromise = null
        throw new Error(`Failed to fetch encryption key: ${err.message}`)
      })
  }
  return publicKeyPromise
}

/**
 * Encrypts a single string value.
 * @param {string} value - The string to encrypt.
 * @returns {Promise<string>} The encrypted string.
 */
export async function encryptValue(value) {
  if (!value) return value

  try {
    const enc = await fetchPublicKey()
    const encrypted = enc.encrypt(value)

    if (encrypted === false) {
      console.error('Encryption failed for value - JSEncrypt returned false')
      throw new Error('Encryption failed: JSEncrypt returned false')
    }

    return encrypted
  } catch (error) {
    console.error('Encryption error:', error)
    throw error
  }
}

/**
 * Encrypts an object's values.
 * @param {object} data - The object to encrypt.
 * @returns {Promise<object>} A new object with encrypted values.
 */
export async function encryptObject(data) {
  try {
    console.log('[Crypto] Starting encryption of object with keys:', Object.keys(data))

    const enc = await fetchPublicKey()
    console.log('[Crypto] Public key ready for encryption')

    const encryptedData = {}

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key]

        // Only encrypt non-empty strings
        if (typeof value === 'string' && value.trim()) {
          try {
            console.log(`[Crypto] Encrypting field: ${key}`)
            const encrypted = enc.encrypt(value)

            if (encrypted === false) {
              console.error(`[Crypto] Encryption failed for key: ${key} - JSEncrypt returned false`)
              throw new Error(`Encryption failed for field: ${key}`)
            }

            console.log(`[Crypto] Successfully encrypted ${key}, length: ${encrypted.length}`)
            encryptedData[key] = encrypted
          } catch (encryptError) {
            console.error(`[Crypto] Failed to encrypt ${key}:`, encryptError)
            console.error(`[Crypto] Value length to encrypt: ${value.length}`)
            throw encryptError
          }
        } else {
          // Pass through empty strings, numbers, etc.
          console.log(`[Crypto] Passing through ${key}: (empty or non-string)`)
          encryptedData[key] = value
        }
      }
    }

    console.log('[Crypto] Encryption successful for all fields')
    return encryptedData
  } catch (error) {
    console.error('[Crypto] Error encrypting object:', error)
    throw new Error(`Encryption failed: ${error.message}`)
  }
}
