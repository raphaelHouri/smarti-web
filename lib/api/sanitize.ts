export function sanitizeDates<T extends Record<string, any>>(payload: T): T {
    const out: Record<string, any> = { ...payload };
    const dateLikeKeys = new Set([
        'createdAt', 'updatedAt', 'deletedAt',
        'startedAt', 'completedAt', 'systemUntil',
        'validFrom', 'validUntil'
    ]);
    for (const key of Object.keys(out)) {
        const value = out[key];
        if (value == null) continue;
        const isCandidate = key.endsWith('At') || dateLikeKeys.has(key);
        if (isCandidate && typeof value === 'string') {
            const d = new Date(value);
            if (!isNaN(d.getTime())) {
                out[key] = d;
            } else {
                delete out[key];
            }
        }
    }
    return out as T;
}


