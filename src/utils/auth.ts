import jwt, { JwtPayload } from 'jsonwebtoken';

// Define a custom interface that extends JwtPayload to include userId
export interface DecodedToken extends JwtPayload {
  userId: string;
  // Add any other custom claims your token might have
}

/**
 * Verifies a JWT token and returns the decoded payload
 * @param token The JWT token to verify
 * @returns The decoded token payload or null if verification fails
 */
export async function verifyToken(token: string): Promise<DecodedToken | null> {
  try {
    // Replace 'your-secret-key' with your actual secret key
    // You might want to store this in an environment variable
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as DecodedToken;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}
