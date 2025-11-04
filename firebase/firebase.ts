import { initializeApp, getApps, App, getApp, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from "firebase-admin/firestore";

let app: App | null = null;
let adminDb: Firestore | null = null;

function getFirebaseApp(): App {
    if (app) {
        return app;
    }

    if (getApps().length > 0) {
        app = getApp();
        return app;
    }

    // Validate environment variables before initialization
    const projectId = process.env.GCS_PROJECT_ID;
    const clientEmail = process.env.GCS_CLIENT_EMAIL;
    const privateKey = process.env.GCS_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            'Firebase Admin initialization failed: Missing required environment variables. ' +
            'Please ensure GCS_PROJECT_ID, GCS_CLIENT_EMAIL, and GCS_PRIVATE_KEY are set.'
        );
    }

    app = initializeApp({
        credential: cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n')
        })
    });

    return app;
}

function getAdminDb(): Firestore {
    if (adminDb) {
        return adminDb;
    }

    const firebaseApp = getFirebaseApp();
    adminDb = getFirestore(firebaseApp);
    return adminDb;
}

export { getFirebaseApp as adminApp, getAdminDb };


