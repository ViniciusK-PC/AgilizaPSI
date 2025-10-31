"use client";
import { TabItem } from "flowbite-react";
import { Tabs } from "flowbite-react";
// import { HiUserCircle } from "react-icons/hi2";
import { HiAdjustments, HiClipboardList, HiUserCircle } from "react-icons/hi";
// import { MdDashboard } from "react-icons/md";
import ServiceList from "./Services/ServiceList";


export default function TabbedItems() {
  const tabs = [
      {
        title:"Serviços populares",
        icon: HiUserCircle,
         component: <ServiceList />,
        content:[]
      },
        {
        title:"Pisicologos",
        icon: HiUserCircle,
        component: <ServiceList />,
        content:[]
      },
        {
        title:"Especialistas",
        icon: HiUserCircle,
         component: <ServiceList />,
        content:[]
      },
        {
        title:"Sintomas",
        icon: HiUserCircle,
        component: <ServiceList />,
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