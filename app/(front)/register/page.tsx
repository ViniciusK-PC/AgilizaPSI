import RegisterForm from "@/components/Auth/RegisterForm";

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
    return (
        <div className="min-h-screen">
            <RegisterForm />
        </div>
    );
}
