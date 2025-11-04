import { initializeApp, getApps, App, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from "firebase-admin/firestore";

let app: App;
if (getApps().length == 0) {
    app = initializeApp({
        credential: cert({
            projectId: process.env.GCS_PROJECT_ID,
            clientEmail: process.env.GCS_CLIENT_EMAIL,
            privateKey: process.env.GCS_PRIVATE_KEY as string
        })
    });
} else {
    app = getApp();
}

const adminDb = getFirestore(app);
export { app as adminApp, adminDb };


