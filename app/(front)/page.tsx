import Hero from "@/components/Frontend/Hero";
import Brands from "@/components/Frontend/Brands";
import TabbedSection from "@/components/Frontend/TabbedSection";
import DoctorList from "@/components/DoctorList";


export default function Home() {
  return (
    <section className="">
      <Hero />
      <Brands />
      <TabbedSection />
      <DoctorList />
      <DoctorList className="bg-white-100 py-8 lg:py-24" title="Consulta Pisicologico presencial" isInPerson={true}/>
    </section>
  );
}
  