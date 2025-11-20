import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';

export async function POST(req: Request) {
    // Get the Svix headers for verification
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error occurred -- no svix headers', {
            status: 400
        });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret.
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

    let evt: WebhookEvent;

    // Verify the payload with the headers
    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error('Error verifying webhook:', err);
        return new Response('Error occurred', {
            status: 400
        });
    }

    // Handle the webhook
    const eventType = evt.type;

    if (eventType === 'user.created') {
        const { id } = evt.data;

        // Create user in database
        // Note: We need to call this in a way that works with the auth context
        // Since webhooks don't have a user session, we'll need to modify the function
        // or create a server action that can be called with userId
        try {
            // This will need to be adapted based on your function signature
            // For now, we'll need to create a version that accepts userId directly
            await createUserInDatabase(id);
        } catch (error) {
            console.error('Error creating user in database:', error);
            return new Response('Error creating user', { status: 500 });
        }
    }

    return new Response('', { status: 200 });
}

async function createUserInDatabase(userId: string) {
    const { createUserFromClerkId } = await import('@/db/queries');
    await createUserFromClerkId(userId, undefined);
}

