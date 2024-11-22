import {
   CalendarFold,
   Settings
} from "lucide-react";

import {
   SidebarContent,
   SidebarItem,
} from "@/components/ui/sidebar";

import { Button } from "@/components/ui/button"

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { NavUser } from "@/components/nav-user";

const ClientSidebarContent = ({user}) => {
   const pathname = usePathname();
   const lastSegment = pathname.split('/').pop();


   return (
      <SidebarContent>
         {/* <SidebarItem className="relative flex items-center w-full cursor-pointer"> <NavUser user={user} /></SidebarItem> */}
         <SidebarItem className="relative flex items-center w-full cursor-pointer">
            <Button variant="ghost" className={cn(" min-w-8 w-full justify-start flex items-center gap-2 rounded-lg p-2 text-sm font-normal transition-all hover:bg-white hover:outline hover:outline-1 outline-zinc-200", lastSegment === "settings" && "bg-white outline outline-zinc-200 outline-1 hover:bg-white")}>
               <Settings className={cn("h-5 w-5 shrink-0", lastSegment === "settings" && "text-orange-400")} />
               <Link href="/dashboard/settings" className="flex flex-1 overflow-hidden select-none">
                  <div className={cn("line-clamp-1 pr-6 text-base tracking-wider text-black", lastSegment === "settings" && "font-medium")}>Perustiedot</div>
               </Link>
            </Button>
         </SidebarItem>
         <SidebarItem className="relative flex items-center w-full cursor-pointer">
            <Button variant="ghost" className={cn(" min-w-8 w-full justify-start flex items-center gap-2 rounded-md p-2 text-sm font-normal transition-all hover:bg-white hover:outline hover:outline-1 outline-zinc-200", lastSegment === "events" && "bg-white outline outline-zinc-200 outline-1 hover:bg-white")}>
               <CalendarFold className={cn("h-5 w-5 shrink-0", lastSegment === "events" && "text-orange-400")} />
               <Link href="/dashboard/events" className="flex flex-1 overflow-hidden select-none">
                  <div className={cn("line-clamp-1 pr-6 text-base tracking-wider", lastSegment === "events" && "font-medium")}>Tapahtumat</div>
               </Link>
            </Button>
         </SidebarItem>
      </SidebarContent>
   )
}

export default ClientSidebarContent;