
import DoctorDetails from "@/components/DoctorDetails";
import FixedBookButton from "@/components/FixedBookButton";
import Image from "next/image";

export default function page() {
    return (
        <div className="bg-slate-50 py-24 min-h-screen">
            <div className="bg-white max-w-4xl border border-gray-200
             mx-auto shadow-md rounded-md">
                <div className="py-8 px-6">
                    <div className="flex items-center justify-between">
                        <div className="">
                            <div className="flex flex-col">
                                <h2 className="uppercase font-bold text-2xl
            tracking-widest">Carolina Büttow, PS-G</h2>
                                <p className="text-gray-500 text-xs uppercase">Saúde do adulto</p>
                            </div>
                            <div className="py-3">
                                <p>Consulta Psicologica presencial</p>
                                <p>308 Rua Alberto Rosa, Pelotas, BR 96020350</p>
                            </div>
                        </div>
                        <Image
                            src="/dotor.jpeg"
                            width={243}
                            height={207}
                            alt="img1"
                            className="w-36 h-36 rounded-full object-cover"
                        />
                    </div>
                </div>
                <div className="">
                    <DoctorDetails />
                </div>
            </div>
            <FixedBookButton />
        </div>
    );
}
