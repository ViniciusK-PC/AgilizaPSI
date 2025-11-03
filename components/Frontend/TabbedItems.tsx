"use client";
import { TabItem } from "flowbite-react";
import { Tabs } from "flowbite-react";
// import { HiUserCircle } from "react-icons/hi2";
import { HiAdjustments, HiClipboardList, HiUserCircle } from "react-icons/hi";
import LinkCards from "./Doctors/LinkCards";

// import { MdDashboard } from "react-icons/md";
import ServiceList from "./Services/ServiceList";
import { Stethoscope, Microscope, Activity, Syringe } from "lucide-react";


export default function TabbedItems() {
  const services = [
    {
      title:"Telessaúde",
      image:"/img1.jpg",
      slug:"Telessaúde",
    },
    {
      title:"Video",
      image:"/img2.jpg",
      slug:"Telessaúde",
    },
    {
      title:"Telessaúde",
      image:"/img3.jpg",
      slug:"Telessaúde",
    },
    {
      title:"Telessaúde",
      image:"/img1.jpg",
      slug:"Telessaúde",
    },
    {
      title:"Telessaúde",
      image:"/img1.jpg",
      slug:"Telessaúde",
    },  
    {
      title:"Telessaúde",
      image:"/img1.jpg",
      slug:"Telessaúde",
    }
  ];
  const tabs = [
      {
        title:"Serviços populares",
        icon: Stethoscope,
         component: <ServiceList data={services}/>,
        content:[]
      },
        {
        title:"Pisicologos",
        icon: Microscope,
        component: <LinkCards />,
        content:[]
      },
        {
        title:"Especialistas",
        icon: Activity,
         component: <LinkCards className="bg-blue-900" />,
        content:[]
      },
        {
        title:"Sintomas",
        icon: Syringe,
        component: <LinkCards className="bg-pink-950"/>,
        content:[]
      }
  ];
  return (
    <Tabs aria-label="Tabs white underline">
      {
        tabs.map((tab, i) => {
          return(
            <TabItem key={i} active title={tab.title} icon={tab.icon}>
             {tab.component}
            </TabItem>
          );    
        })
      }
    </Tabs>
  );
}