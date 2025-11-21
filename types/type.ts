import { UserRole, AppointmentStatus, AppointmentType } from "@prisma/client";


export type ServiceProps = {
    title: string;  
    image: string;
    slug: string;
}

export type RegisterInputProps = {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    role: UserRole;
}

export type LoginInputProps = {
    email: string;
    password: string;
}

export type CreateAppointmentProps = {
    psychologistId: string;
    patientId?: string;
    date: string | Date;
    startTime: string;
    endTime: string;
    duration: number;
    type: AppointmentType;
    notes?: string;
    price?: number;
}

export type UpdateAppointmentProps = {
    patientId?: string;
    date?: string | Date;
    startTime?: string;
    endTime?: string;
    duration?: number;
    status?: AppointmentStatus;
    type?: AppointmentType;
    notes?: string;
    price?: number;
}

export type AppointmentFilterProps = {
    psychologistId?: string;
    patientId?: string;
    status?: AppointmentStatus;
    type?: AppointmentType;
    dateFrom?: string | Date;
    dateTo?: string | Date;
}