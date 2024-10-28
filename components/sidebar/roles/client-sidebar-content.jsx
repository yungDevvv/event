import {
   ChevronRight,
   CalendarFold
} from "lucide-react";

import {
   SidebarContent,
   SidebarItem,
   useSidebar,
} from "@/components/ui/sidebar";

import {
   Collapsible,
   CollapsibleContent,
   CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
   Select,
   SelectContent,
   SelectGroup,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button"

import Link from "next/link";
import { useModal } from "@/hooks/use-modal";

const ClientSidebarContent = () => {
   const { onOpen } = useModal();
  const { onOpenChange } = useSidebar(); 
   return (
      <SidebarContent>
         <SidebarItem>
            <ul className="grid gap-0.5">
               <Collapsible defaultOpen={false}>
                  <li>
                     <div className="relative flex items-center">
                        <CollapsibleTrigger asChild>
                           <div className="relative flex items-center w-full cursor-pointer">
                              <div
                                 className="min-w-8 flex h-8 flex-1 items-center gap-2 overflow-hidden rounded-md px-1.5 font-medium outline-none ring-ring transition-all hover:bg-accent hover:text-accent-foreground focus-visible:ring-2"
                              >
                                 <CalendarFold className="h-4 w-4 shrink-0" />
                                 <div className="flex flex-1 overflow-hidden select-none">
                                    <div className="line-clamp-1 pr-6">Tapahtumat</div>
                                 </div>
                              </div>
                              <div
                                 className="absolute right-1 h-6 w-6 flex items-center justify-center rounded-md p-0 ring-ring transition-all focus-visible:ring-2"
                              >
                                 <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform`} />
                              </div>
                           </div>
                        </CollapsibleTrigger>
                     </div>

                     {/* Collapsible Content */}
                     <CollapsibleContent className="px-4 py-0.5">
                        <ul className="grid border-l px-2">
                           <li>
                              <Button
                                 variant="ghost"
                                 onClick={() => {
                                    onOpen("create-event", {edit: false})
                                    onOpenChange(false)
                                 }}
                                 className="min-w-8 w-full justify-start flex h-8 items-center gap-2 overflow-hidden rounded-md px-2 text-sm font-normal text-foreground ring-ring transition-all hover:bg-accent hover:text-accent-foreground focus-visible:ring-2"
                              >
                                 <div className="line-clamp-1">Lisää uusi tapahtuma</div>
                              </Button>
                           </li>
                           <li>
                              <Link
                                 href={"/dashboard/events"}
                                 className="min-w-8 flex h-8 items-center gap-2 overflow-hidden rounded-md px-2 text-sm font-normal text-foreground ring-ring transition-all hover:bg-accent hover:text-accent-foreground focus-visible:ring-2"
                              >
                                 <div className="line-clamp-1">Kaikki tapahtumat</div>
                              </Link>
                           </li>
                        </ul>
                     </CollapsibleContent>
                  </li>
               </Collapsible>

            </ul>
         </SidebarItem>
      </SidebarContent>
   )
}

export default ClientSidebarContent;