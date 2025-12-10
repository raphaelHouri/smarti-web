import { heIL } from '@clerk/localizations';

// Custom Hebrew localization with improved email address error message
export const customHeIL = {
    ...heIL,
    unstable__errors: {
        ...heIL.unstable__errors,
        form_identifier_exists__email_address: "כתובת המייל קיימת במערכת. כדי להתחבר, לחצו על הקישור 'התחבר' המופיע למטה.",
    },
};


