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
}

export type LoginInputProps = {
    email: string;
    password: string;
}