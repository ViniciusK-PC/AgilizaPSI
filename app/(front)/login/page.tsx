import LoginForm from "@/components/Auth/Login";

export const dynamic = 'force-dynamic';

export default function LoginPage() {
    return (
        <div className="min-h-screen">
            <LoginForm />
        </div>
    );
}
