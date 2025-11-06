import LoginForm from "@/components/Auth/LoginForm";
import RegisterForm from "@/components/Auth/RegisterForm";

export default function page() {

    return (
        <div className="bg-blue-100 min-h-screen py-8">
            <div className="grid grid-cols-2 w-full max-w-5xl mx-auto 
              bg-white border border-gray-200 rounded-lg 
              shadow dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
                <div className="hidden md:flex bg-cover bg-no-repeat
                 bg-center bg-[url('/img3.jpg')] overflow-hidden"></div>
                <div className="">
                    <RegisterForm />
                </div>
            </div>
        </div>
    );
}