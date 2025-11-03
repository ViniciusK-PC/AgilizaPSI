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
      <DoctorList title="Consulta Pisicologico presencial" isInPerson={true}/>
    </section>
  );
}
  