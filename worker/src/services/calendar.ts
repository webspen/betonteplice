interface TokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

interface TokenErrorResponse {
    error: string;
    error_description?: string;
}

interface CalendarErrorResponse {
    error: {
        code: number;
        message: string;
        status: string;
        errors?: Array<{
            message: string;
            domain: string;
            reason: string;
        }>;
    };
}

interface Env {
    GOOGLE_CLIENT_EMAIL: string;
    GOOGLE_PRIVATE_KEY: string;
    GOOGLE_CALENDAR_ID: string;
}

interface CalendarEvent {
    summary: string;
    description: string;
    location: string;
    start: {
        dateTime: string;
        timeZone: string;
    };
    end: {
        dateTime: string;
        timeZone: string;
    };
    colorId: string;
    reminders: {
        useDefault: boolean;
        overrides: Array<{
            method: string;
            minutes: number;
        }>;
    };
}

interface CalendarCredentials {
    client_email: string | undefined;
    private_key: string | undefined;
    calendar_id: string | undefined;
}

async function createJWT(clientEmail: string, privateKey: string): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const oneHour = 60 * 60;
    const expiry = now + oneHour;

    // Create header
    const header = {
        alg: "RS256",
        typ: "JWT"
    };

    // Create claim with OAuth2 token endpoint as audience
    const claim = {
        iss: clientEmail,
        sub: clientEmail,
        aud: "https://oauth2.googleapis.com/token",
        exp: expiry,
        iat: now,
        scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events"
    };

    // Base64URL encode header and claim
    const encodedHeader = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const encodedClaim = btoa(JSON.stringify(claim)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const signatureInput = `${encodedHeader}.${encodedClaim}`;

    // Convert PEM private key to ArrayBuffer
    const pemHeader = '-----BEGIN PRIVATE KEY-----';
    const pemFooter = '-----END PRIVATE KEY-----';
    const pemContents = privateKey
        .replace(pemHeader, '')
        .replace(pemFooter, '')
        .replace(/\s/g, '');
    const binaryKey = atob(pemContents);
    const keyArray = new Uint8Array(binaryKey.length);
    for (let i = 0; i < binaryKey.length; i++) {
        keyArray[i] = binaryKey.charCodeAt(i);
    }

    // Import key using Web Crypto API
    const key = await crypto.subtle.importKey(
        'pkcs8',
        keyArray.buffer,
        {
            name: 'RSASSA-PKCS1-v1_5',
            hash: { name: 'SHA-256' }
        },
        false,
        ['sign']
    );

    // Sign the input
    const encoder = new TextEncoder();
    const data = encoder.encode(signatureInput);
    const signature = await crypto.subtle.sign(
        { name: 'RSASSA-PKCS1-v1_5' },
        key,
        data
    );

    // Base64URL encode the signature
    const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    return `${signatureInput}.${encodedSignature}`;
}

export async function createCalendarEvent(order: any, env: Env): Promise<any> {
    try {
        // Validate date and time
        if (!order.date || !order.time) {
            throw new Error('Missing date or time in order');
        }

        // Handle PostgreSQL DATE and TIME types
        let dateStr = order.date;
        let timeStr = order.time;

        // If date is a PostgreSQL DATE object, convert to string
        if (typeof order.date === 'object' && order.date.toISOString) {
            dateStr = order.date.toISOString().split('T')[0];
        }

        // If time is a PostgreSQL TIME object, convert to string
        if (typeof order.time === 'object' && order.time.toString) {
            timeStr = order.time.toString();
        }

        // Ensure date and time are in correct format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const timeRegex = /^\d{2}:\d{2}(:\d{2})?$/;

        if (!dateRegex.test(dateStr)) {
            throw new Error(`Invalid date format: ${dateStr}. Expected format: YYYY-MM-DD`);
        }

        if (!timeRegex.test(timeStr)) {
            throw new Error(`Invalid time format: ${timeStr}. Expected format: HH:MM:SS or HH:MM`);
        }

        // Normalize time format to ensure it has seconds
        const normalizedTime = timeStr.length === 5 ? `${timeStr}:00` : timeStr;

        // Create and validate datetime
        const startTime = new Date(`${dateStr}T${normalizedTime}`);
        if (isNaN(startTime.getTime())) {
            throw new Error(`Invalid date/time combination: ${dateStr} ${normalizedTime}`);
        }

        // First get an access token using JWT
        const jwt = await createJWT(env.GOOGLE_CLIENT_EMAIL, env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'));

        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: jwt
            })
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json() as TokenErrorResponse;
            console.error('Token error:', errorData);
            throw new Error(`Failed to get access token: ${errorData.error_description || errorData.error || 'Unknown error'}`);
        }

        const { access_token } = await tokenResponse.json() as TokenResponse;

        // Calculate end time (2 hours after start)
        const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

        const event: CalendarEvent = {
            summary: `Betonáž - ${order.customer_name}`,
            description: `
                Zákazník: ${order.customer_name}
                Telefon: ${order.customer_phone || 'Neuvedeno'}
                Email: ${order.customer_email || 'Neuvedeno'}
                Adresa: ${order.address_street || ''}, ${order.address_city || ''}
                Typ betonu: ${order.config_type || 'Neuvedeno'}
                Kvalita: ${order.config_quality || 'Neuvedeno'}
                Délka hadic: ${order.config_hose_length || 0}m
                Výška čerpání: ${order.config_volume_height || 0}m
                Poznámka: ${order.config_description || 'Bez poznámky'}
            `.trim(),
            location: `${order.address_street || ''}, ${order.address_city || ''}, ${order.address_zip || ''}`.trim(),
            start: {
                dateTime: startTime.toISOString(),
                timeZone: 'Europe/Prague',
            },
            end: {
                dateTime: endTime.toISOString(),
                timeZone: 'Europe/Prague',
            },
            colorId: '11',
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 60 },
                ],
            },
        };

        // Use access token to create calendar event
        const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${env.GOOGLE_CALENDAR_ID}/events`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event)
            }
        );

        if (!response.ok) {
            const errorData = await response.json() as CalendarErrorResponse;
            console.error('Calendar API error:', errorData);
            throw new Error(`Calendar API error: ${errorData.error?.message || 'Unknown error'}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error creating calendar event:', error);
        throw error;
    }
} 