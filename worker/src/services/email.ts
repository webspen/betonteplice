interface Env {
    GMAIL_USER: string;
    GMAIL_CLIENT_ID: string;
    GMAIL_CLIENT_SECRET: string;
    GMAIL_REFRESH_TOKEN: string;
}

interface EmailConfig {
    from: string;
    to: string[];
    subject: string;
    text: string;
}

interface TokenErrorResponse {
    error: string;
    error_description?: string;
}

function encodeBase64Url(str: string): string {
    // First convert string to UTF-8
    const bytes = new TextEncoder().encode(str);
    // Convert bytes to binary string
    const binaryStr = Array.from(bytes).map(byte => String.fromCharCode(byte)).join('');
    // Convert to base64
    const base64 = btoa(binaryStr);
    // Convert to base64url
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getAccessToken(env: Env): Promise<string> {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: env.GMAIL_CLIENT_ID,
            client_secret: env.GMAIL_CLIENT_SECRET,
            refresh_token: env.GMAIL_REFRESH_TOKEN,
            grant_type: 'refresh_token'
        })
    });

    if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json() as TokenErrorResponse;
        console.error('Token error:', errorData);
        throw new Error(`Failed to get access token: ${errorData.error_description || errorData.error || 'Unknown error'}`);
    }

    const data = await tokenResponse.json() as { access_token: string };
    return data.access_token;
}

export async function sendEmail(config: EmailConfig, env: Env): Promise<void> {
    try {
        const access_token = await getAccessToken(env);

        // Create email in RFC 2822 format with MIME headers
        const email = [
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=utf-8',
            'Content-Transfer-Encoding: base64',
            'From: ' + config.from,
            'To: ' + config.to.join(', '),
            'Subject: =?utf-8?B?' + btoa(new TextEncoder().encode(config.subject).reduce((str, byte) => str + String.fromCharCode(byte), '')) + '?=',
            '',
            config.text
        ].join('\r\n');

        const base64Email = encodeBase64Url(email);

        const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/send`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                raw: base64Email
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Gmail API error response:', error);
            throw new Error(`Failed to send email: ${error}`);
        }
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
} 