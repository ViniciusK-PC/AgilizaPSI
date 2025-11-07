"use client"
import { useState } from "react";
import Availability from "./Availability";
 

export default function DoctorDetails() {
  const [isActive,setIsActive] = useState('disponibilidade')
  
  return (
    <div className="">
        <div className="flex items-center justify-between ">
            <button onClick={()=>setIsActive("details")} 
            className={isActive==="details"
                ?"py-4 px-8 w-full uppercase tracking-widest bg-blue-600 text-white"
                : "border border-gray-200 bg-slate-100 w-full text-slate-800 py-4 px-8 uppercase tracking-widest"
        }
            > 
                Detalhes do serviço
                </button>
            <button onClick={()=>setIsActive("disponibilidade")} 
            className={isActive==="disponibilidade"?"py-4 px-8 w-full uppercase tracking-widest bg-blue-600 text-white"
                :"border border-gray-200 bg-slate-100 w-full text-slate-800 py-4 px-8 uppercase tracking-widest"
        }
            >     
          Disponibilidade
          </button>
        </div>

        <div className="py-8 px-6">
            {isActive==="disponibilidade"?(
            <div>
              <Availability />
            </div>
            ):(
            <div>Detalhes do serviço Componentes</div>
            )}
        </div>
    </div>
  );
}




