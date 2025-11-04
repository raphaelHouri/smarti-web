import 'server-only';
import { getAdminDb } from '@/firebase/firebase';

const getDb = () => getAdminDb();

export const getDocument = async (docPath: string) => {
    assertEvenDocPath(docPath);
    const snap = await getDb().doc(docPath).get();
    return snap.exists ? snap.data() : null;
};

function assertEvenDocPath(p: string) {
    const n = p.split('/').filter(Boolean).length;
    if (n % 2 !== 0) throw new Error(
        `Invalid Firestore document path '${p}'. Must be even segments (col/doc[/...]).`
    );
}

export const setDocument = async (
    docPath: string,
    data: Record<string, unknown>
) => {
    assertEvenDocPath(docPath);
    const docData = {
        ...data,
        updatedAt: new Date().toISOString(),
    };
    await getDb().doc(docPath).set(docData, { merge: true });
};

export const updateDocumentFields = async (
    docPath: string,
    updates: Record<string, unknown>
) => {
    assertEvenDocPath(docPath);
    await getDb().doc(docPath).update({
        ...updates,
        updatedAt: new Date().toISOString(),
    });
};

export const documentExists = async (docPath: string): Promise<boolean> => {
    assertEvenDocPath(docPath);
    const snap = await getDb().doc(docPath).get();
    return snap.exists;
};


