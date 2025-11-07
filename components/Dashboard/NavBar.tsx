"use client";
 
// import React from "react";
// import Image from "next/image";
import { Avatar, Dropdown, DropdownItem, DropdownHeader, DropdownDivider } from "flowbite-react";
import { useRouter } from "next/navigation";
import { AlignJustify, Bell, Mail, Search } from "lucide-react";
 
export default function Navbar() {
  const router = useRouter();
  async function handleLogout() {   
    router.push("/");
  }
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center -m-2 xl:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 text-gray-400 bg-white rounded-lg hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
            >
              <AlignJustify className="w-6 h-6" />
            </button>
          </div>
 
          <div className="flex ml-6 xl:ml-0">
            <div className="flex items-center flex-shrink-0">
              <h2>Pisicologia Logo</h2>
              {/* <img
                className="block w-auto h-16 lg:hidden"
                src="/logo.png"
                alt=""
              /> */}
              {/* <img
                className="hidden w-auto h-16 lg:block"
                src="/logo.png"
                alt=""
              /> */}
            </div>
          </div>
 
          <div className="flex-1 hidden max-w-xs ml-40 mr-auto lg:block">
            <label htmlFor="" className="sr-only">
              {" "}
              Search{" "}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
 
              <input
                type="search"
                name=""
                id=""
                className="block w-full py-2 pl-10 border border-gray-300 rounded-lg focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                placeholder="Type to search"
              />
            </div>
          </div>
 
          <div className="flex items-center justify-end ml-auto space-x-6">
            <div className="relative">
              <button
                type="button"
                className="p-1 text-gray-700 transition-all duration-200 bg-white rounded-full hover:text-gray-900 focus:outline-none hover:bg-gray-100"
              >
                <Mail className="w-6 h-6" />
              </button>
              <span className="inline-flex items-center px-1.5 absolute -top-px -right-1 py-0.5 rounded-full text-xs font-semibold bg-indigo-600 text-white">
                {" "}
                2{" "}
              </span>
            </div>
 
            <div className="relative">
              <button
                type="button"
                className="p-1 text-gray-700 transition-all duration-200 bg-white rounded-full hover:text-gray-900 focus:outline-none hover:bg-gray-100"
              >
                <Bell className="w-6 h-6" />
              </button>
            </div>
 
            <Dropdown
              arrowIcon={false}
              inline
              label={
                <Avatar
                  alt="User settings"
                  img={ "/dotor.jpeg"
                  }
                  rounded
                />
              }
            >
              <DropdownHeader>
                <span className="block text-sm">Carolina Buttow</span>
                <span className="block truncate text-sm font-medium">
                  carolinabuttow@gmail.com
                </span>
              </DropdownHeader>
              <DropdownItem>Dashboard</DropdownItem>
              <DropdownItem>Settings</DropdownItem>
              <DropdownItem>Earnings</DropdownItem>
              <DropdownDivider />
              <DropdownItem onClick={handleLogout}>Sign out</DropdownItem>
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  );
}
