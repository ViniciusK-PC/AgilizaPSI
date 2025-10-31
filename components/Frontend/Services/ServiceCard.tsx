import Link from "next/link";
import Image from "next/image";

export default function ServiceCard() {
    return (
        <Link 
        href="#" className="rounded-md bg-slate-100
         hover:bg-slate-200 duration-300 flex gap-4 overflow-hidden">

            <Image 
            src="/img1.jpg" 
            width={1170} 
            height={848} 
            alt="title" 
            className="w-1/3 object-cover aspect-video" 
            />
            
            <div className="flex flex-col w-2/3 py-4">
                <h2>TeleSaúde</h2>
                <p className="text-[0.6rem]">1 Pisicologa Avaliada</p>
            </div>
        </Link>
    );
}