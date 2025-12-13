import { SignIn } from "@clerk/nextjs";

export default function ResetPasswordPage() {
    return (
        <div className="flex items-center justify-center min-h-screen" dir="rtl">
            <SignIn
                routing="path"
                path="/sign-in/reset-password"
            />
        </div>
    );
}
