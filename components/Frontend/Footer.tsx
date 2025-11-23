"use client"

export default function Footer() {
    return (
        <footer className="text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-950 px-4 py-5">
            <div className="max-w-screen-xl mx-auto text-center">
                <p>&copy; {new Date().getFullYear()} AgilizaPSI. Todos os direitos reservados.</p>
            </div>
        </footer>
    )
}
