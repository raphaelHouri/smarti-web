import { heIL } from '@clerk/localizations';

// Custom Hebrew localization with improved email address error message
export const customHeIL = {
    ...heIL,
    unstable__errors: {
        ...heIL.unstable__errors,
        form_identifier_exists__email_address: "כתובת המייל קיימת במערכת. כדי להתחבר, לחצו על הקישור 'התחבר' המופיע למטה.",
    },
    legalConsent: {
        ...((heIL as any).legalConsent || {}),
        checkbox: {
            ...((heIL as any).legalConsent?.checkbox || {}),
            label__onlyTermsOfService: 'אני מאשר/ת את {{ termsOfServiceLink || link("תנאי השירות") }}',
            label__termsOfServiceAndPrivacyPolicy: 'אני מאשר/ת את {{ termsOfServiceLink || link("תנאי השירות") }} ו-{{ privacyPolicyLink || link("מדיניות הפרטיות") }}',
            label__onlyPrivacyPolicy: 'אני מאשר/ת את {{ privacyPolicyLink || link("מדיניות הפרטיות") }}',
        },
    },
};


