import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

if (!process.env.ENCRYPTION_KEY) {
  console.warn('ENCRYPTION_KEY not set in environment. Using temporary key - API keys will not persist across restarts.');
}

export function encryptApiKey(apiKey: string): string {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
    
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Combine iv, authTag, and encrypted data
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    return apiKey; // Fallback to unencrypted in case of error
  }
}

export function decryptApiKey(encryptedApiKey: string): string {
  try {
    if (!encryptedApiKey || !encryptedApiKey.includes(':')) {
      return encryptedApiKey; // Return as-is if not encrypted format
    }
    
    const parts = encryptedApiKey.split(':');
    if (parts.length !== 3) {
      return encryptedApiKey; // Return as-is if not proper format
    }
    
    const [ivHex, authTagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedApiKey; // Return as-is if decryption fails
  }
}

export function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex').substring(0, 16);
}