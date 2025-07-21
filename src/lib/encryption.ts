import crypto from 'crypto';

export function encrypt(text: string) {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.SECRET!);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function decrypt(enc: string) {
  const decipher = crypto.createDecipher('aes-256-cbc', process.env.SECRET!);
  let decrypted = decipher.update(enc, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}