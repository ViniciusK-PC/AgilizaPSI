import { Tab } from "@headlessui/react";
import React from "react";

const TabbedSection = () => {
  return (
    <section className="pb-12 pt-20 dark:bg-dark lg:py-[60px]">
      <div className="container mx-auto">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="mx-auto mb-12 max-w-5xl text-center lg:mb-20">
            
              <h2 className="mb-3 text-3xl font-bold leading-[1.2] text-dark dark:text-white sm:text-4xl md:text-[40px]">
                Consulte seu Pisicologo.
              </h2>
              <p className="text-base text-body-color dark:text-dark-6">
                Escolha entre milhares de fornecedores a preços acessíveis todos os dias. 
                Reserve online hoje mesmo.
              </p>
            </div>
          </div>
        </div>

     {/* Tabs */}
      </div>
    </section>
  );
};

export default TabbedSection;

