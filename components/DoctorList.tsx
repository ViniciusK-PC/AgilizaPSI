import Link from "next/link";
import SectionHeading from "./SectionHeading";
import ToggleButton from "./ToggleButton";

import { Map } from "lucide-react";
import DoctorListCarousel from "./DoctorsListCarousel";

export default function DoctorList({
    title = "Telessaúde Visite",
    isInPerson,
    className = "bg-pink-100 py-8 lg:py-24",
}: {
    title?: string;
    isInPerson?: boolean;
    className?: string;
}) {
    const doctors = [
        {
            id: "1",
            name: "Carolina Silva",
            email: "carolina@example.com",
            phone: "123456789",
            image: "/dotor.jpeg",
            role: "PSICOLOGO" as const,
            emailVerified: null,
            password: "dummy",
            isVerfied: true,
            token: 123,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: "2",
            name: "João Pereira",
            email: "joao@example.com",
            phone: "987654321",
            image: "/dotor.jpeg",
            role: "PSICOLOGO" as const,
            emailVerified: null,
            password: "dummy",
            isVerfied: true,
            token: 123,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: "3",
            name: "Maria Santos",
            email: "maria@example.com",
            phone: "555666777",
            image: "/dotor.jpeg",
            role: "PSICOLOGO" as const,
            emailVerified: null,
            password: "dummy",
            isVerfied: true,
            token: 123,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: "4",
            name: "Pedro Oliveira",
            email: "pedro@example.com",
            phone: "111222333",
            image: "/dotor.jpeg",
            role: "PSICOLOGO" as const,
            emailVerified: null,
            password: "dummy",
            isVerfied: true,
            token: 123,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: "5",
            name: "Ana Costa",
            email: "ana@example.com",
            phone: "444555666",
            image: "/dotor.jpeg",
            role: "PSICOLOGO" as const,
            emailVerified: null,
            password: "dummy",
            isVerfied: true,
            token: 123,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: "6",
            name: "Lucas Ferreira",
            email: "lucas@example.com",
            phone: "777888999",
            image: "/dotor.jpeg",
            role: "PSICOLOGO" as const,
            emailVerified: null,
            password: "dummy",
            isVerfied: true,
            token: 123,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: "7",
            name: "Sofia Rodrigues",
            email: "sofia@example.com",
            phone: "000111222",
            image: "/dotor.jpeg",
            role: "PSICOLOGO" as const,
            emailVerified: null,
            password: "dummy",
            isVerfied: true,
            token: 123,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: "8",
            name: "Miguel Almeida",
            email: "miguel@example.com",
            phone: "333444555",
            image: "/dotor.jpeg",
            role: "PSICOLOGO" as const,
            emailVerified: null,
            password: "dummy",
            isVerfied: true,
            token: 123,
            createdAt: new Date(),
            updatedAt: new Date()
        },
    ]
    return (
        <div className={className}>
            <div className="max-w-6xl mx-auto">
                <SectionHeading title={title} />
                <div className="py-4 flex items-center justify-between">
                    {isInPerson ? (
                        <Link
                            href=""
                            className="text-sm flex items-center text-blue-700
                        font-semibold"
                        >
                            <Map className="mr-2 flex-shrink-0 w-4 h-4" />
                            <span>Map View</span>
                        </Link>
                    ) : (
                        <ToggleButton />
                    )}
                    <Link className="py-3 px-6 border border-blue-600 bg-white"
                        href="#">
                        See All
                    </Link>
                </div>

                <div className="py-6">
                    <DoctorListCarousel doctors={doctors} isInPerson={isInPerson} />
                </div>
            </div>
        </div>
    );
}
