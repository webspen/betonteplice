interface TokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
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

export async function createCalendarEvent(order: any, env: Env): Promise<any> {
    try {
        const credentials = {
            client_email: env.GOOGLE_CLIENT_EMAIL,
            private_key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            calendar_id: env.GOOGLE_CALENDAR_ID
        };

        // Get access token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: await createJWT(credentials.client_email!, credentials.private_key!)
            })
        });

        const { access_token } = await tokenResponse.json() as TokenResponse;

        const startTime = new Date(order.date + 'T' + order.time);
        const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration

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

        const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${credentials.calendar_id}/events`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event)
            }
        );

        return response.json();
    } catch (error) {
        console.error('Error creating calendar event:', error);
        throw error;
    }
}

async function createJWT(clientEmail: string, privateKey: string): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const oneHour = 60 * 60;
    const expiry = now + oneHour;

    const header = {
        alg: 'RS256',
        typ: 'JWT'
    };

    const claim = {
        iss: clientEmail,
        scope: 'https://www.googleapis.com/auth/calendar',
        aud: 'https://oauth2.googleapis.com/token',
        exp: expiry,
        iat: now
    };

    const encodedHeader = btoa(JSON.stringify(header));
    const encodedClaim = btoa(JSON.stringify(claim));
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

    // Sign using Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(signatureInput);

    const key = await crypto.subtle.importKey(
        'pkcs8',
        keyArray.buffer,
        {
            name: 'RSASSA-PKCS1-v1_5',
            hash: 'SHA-256'
        },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign(
        'RSASSA-PKCS1-v1_5',
        key,
        data
    );

    const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)));
    return `${signatureInput}.${encodedSignature}`;
} 