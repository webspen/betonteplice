import * as jwt from '@tsndr/cloudflare-worker-jwt';

interface LoginRequest {
    email: string;
    password: string;
}

interface Env {
    NEON_DB_URL: string;
    VITE_ADMIN_EMAIL: string;
    VITE_ADMIN_PASSWORD: string;
    JWT_SECRET?: string;
}

export const adminLoginHandler = async (request: Request, env: Env) => {
    try {
        const { email, password } = await request.json() as LoginRequest;
        console.log({ email, password, env });

        // Validate credentials against environment variables
        if (email !== env.VITE_ADMIN_EMAIL || password !== env.VITE_ADMIN_PASSWORD) {
            return new Response(JSON.stringify({
                message: 'Invalid credentials'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Generate JWT token
        const token = await jwt.sign({
            email: env.VITE_ADMIN_EMAIL,
            role: 'admin',
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours expiration
        }, env.JWT_SECRET || 'your-default-secret-key');

        return new Response(JSON.stringify({
            token,
            message: 'Login successful'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error during login:', error);
        return new Response(JSON.stringify({
            message: 'Error during login',
            error: error instanceof Error ? error.message : 'Unknown error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}; 