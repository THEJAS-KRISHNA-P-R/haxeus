import { Resend } from 'resend'

// Lazy-load Resend client to ensure env vars are available
let resendClient: Resend | null = null

function getResendClient() {
    if (!resendClient && process.env.RESEND_API_KEY) {
        resendClient = new Resend(process.env.RESEND_API_KEY)
    }
    return resendClient
}

export async function sendEmail({
    to,
    subject,
    html,
    from = `HAXEUS <${process.env.FROM_EMAIL ?? 'orders@haxeus.in'}>`,
    replyTo,
}: {
    to: string
    subject: string
    html: string
    from?: string
    replyTo?: string
}) {
    const key = process.env.RESEND_API_KEY
    if (!key) {
        return { success: true }
    }

    const client = getResendClient()
    if (!client) {
        return { success: false, error: 'Failed to initialize Resend client' }
    }

    try {
        const { data, error } = await client.emails.send({
            from,
            to,
            subject,
            html,
            ...(replyTo ? { replyTo } : {}),
        })
        if (error) throw error
        return { success: true, data }
    } catch (err) {
        console.error('Email send failed:', err)
        return { success: false, error: err }
    }
}
