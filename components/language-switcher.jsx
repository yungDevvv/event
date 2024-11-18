"use client"

import {
   DropdownMenu,
   DropdownMenuTrigger,
   DropdownMenuContent,
   DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import React, { useState } from "react"
import { CheckIcon, ChevronDownIcon, GlobeIcon } from "lucide-react"
import { useRouter } from 'next/navigation';

export default function LanguageSwitcher({ className }) {

   console.log(getCookie("locale"))
   const [curLocale, setCurLocale] = useState(getCookie("locale") ? getCookie("locale") : "fi")
   const router = useRouter();

   function getCookie(name) {
      if (typeof document === 'undefined') {
         return null;
      }
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
   }

   const changeLanguage = (locale) => {
      if (typeof document === 'undefined') {
         return null;
      }

      setCurLocale(locale);
      document.cookie = `locale=${locale}; path=/`;
      router.refresh();
   };
   return (
      <React.Fragment>
         <div className={className}>
            <DropdownMenu>
               <DropdownMenuTrigger className="flex items-center gap-2 border border-white rounded-md p-2 uppercase">
                  {/* <Button variant="outline" className="flex items-center gap-2"> */}
                  <GlobeIcon className="h-5 w-5" />
                  <span>{curLocale}</span>
                  <ChevronDownIcon className="h-4 w-4" />
                  {/* </Button> */}
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end" className="w-[90px]">
                  <DropdownMenuItem onClick={() => changeLanguage("fi")} className="flex items-center justify-between">
                     <span>Suomi</span>
                     {curLocale === "fi" && <CheckIcon className="h-5 w-5 " />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeLanguage("en")} className="flex items-center justify-between">
                     <span>English</span>
                     {curLocale === "en" && <CheckIcon className="h-5 w-5 " />}
                  </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
         </div>
      </React.Fragment>
   )
}