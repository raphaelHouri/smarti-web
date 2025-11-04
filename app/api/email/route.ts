import { downloadReadyHtml } from '@/emails/downloadReady';
import { sendEmail } from '@/lib/sendMail';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const recipient = "raphaelhouri789@gmail.com";
        const downloadLink = "https://example.com/download";
        const filename = "example-file.txt";
        const password = "securepassword123";
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        await sendEmail(
            recipient,
            downloadReadyHtml({ recipient, filename, downloadLink, password, expiresAt }),
            "Your download is ready"
        );

        return NextResponse.json({
            message: 'Email created successfully',
            env: process.env.NEXT_PUBLIC_BASE_URL,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ message: 'Failed to create email', error: errorMessage }, { status: 500 });
    }
}


