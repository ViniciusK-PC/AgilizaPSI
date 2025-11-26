"use client";

import Link from "next/link";
import SectionHeading from "./SectionHeading";
import DoctorListCarousel from "./DoctorsListCarousel";
import { useQuery } from "@tanstack/react-query";
import { User } from "@prisma/client";

export default function DoctorList({
    title = "Telessaúde Visite",
    isInPerson,
    className = "bg-green-50 dark:bg-gray-900 py-8 lg:py-24",
}: {
    title?: string;
    isInPerson?: boolean;
    className?: string;
}) {
    // Buscar psicólogos reais do banco de dados
    const { data: doctors = [], isLoading } = useQuery<User[]>({
        queryKey: ["psychologists-public"],
        queryFn: async () => {
            const response = await fetch("/api/psychologists");
            if (!response.ok) {
                throw new Error("Erro ao buscar psicólogos");
            }
            const data = await response.json();
            return data.data || [];
        },
    });

    return (
        <div className={className}>
            <div className="max-w-6xl mx-auto">
                <SectionHeading title={title} />

                <div className="py-6 px-4">
                    {isLoading ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">Carregando psicólogos...</p>
                        </div>
                    ) : doctors.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">Nenhum psicólogo disponível no momento.</p>
                        </div>
                    ) : (
                        <DoctorListCarousel doctors={doctors} isInPerson={isInPerson} />
                    )}
                </div>
            </div>
        </div>
    );
}
