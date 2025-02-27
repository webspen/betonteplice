import * as jwt from '@tsndr/cloudflare-worker-jwt';

export async function verifyAuth(request: Request, env: { JWT_SECRET?: string }) {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];

    try {
        const isValid = await jwt.verify(token, env.JWT_SECRET || 'your-default-secret-key');
        if (!isValid) {
            throw new Error('Invalid token');
        }

        // Optionally decode token to get user info
        const decoded = await jwt.decode(token);
        return decoded;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
} 