import ServiceCard from "./ServiceCard";

export default function ServiceList() {
    return (
        <div className="grid lg:grid-cols-5 md:grid-cols-3
        sm:grid-cols-2 grid-col-1 gap-6">
            <ServiceCard />
            <ServiceCard />
            <ServiceCard />
            <ServiceCard />
            <ServiceCard />
            <ServiceCard />
        </div>
    )
}