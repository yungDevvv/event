"use client";

import {
   CommandDialog,
   CommandEmpty,
   CommandInput,
   CommandItem,
   CommandList,
} from "@/components/ui/command"

import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useModal } from "@/hooks/use-modal";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { EllipsisVertical, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

const MembersListModal = () => {
   const supabase = createClient();

   const { isOpen, onClose, type, data } = useModal();
   const { toast } = useToast();

   const isModalOpen = isOpen && type === "event-members-list";

   const [eventMembers, setEventMembers] = useState([]);
   const [openDropdownId, setOpenDropdownId] = useState(null);

   const kickMember = async (member_id) => {
      const { error } = await supabase
         .from("event_member")
         .delete()
         .eq("user_id", member_id);

      if (error) {
         console.error(error);
         toast({
            variant: "supabaseError",
            description: "Tuntematon virhe poistettaessa osallistujaa."
         });
         return;
      }

      toast({
         variant: "success",
         title: "Onnistui!",
         description: "Osallistuja poistettu onnistuneesti!"
      })

      setEventMembers(prev => prev.filter(({ id, users }) => users.id !== member_id))
   }

   useEffect(() => {
      (async () => {
         const supabase = createClient();

         const { data: members, error: memberError } = await supabase
            .from("event_member")
            .select("*, users!user_id(id, email, first_name, last_name)")
            .eq("event_id", data.event_id);

         if (memberError) {
            console.error(memberError);
            setEventMembers([{ first_name: "Virhe" }]);
            return;
         }
         setEventMembers([...members])

      })()
   }, [])

   return (
      <CommandDialog open={isModalOpen} onOpenChange={onClose} className="p-3">
         <CommandInput placeholder="Etsi osallistujat..." />
         <CommandList>
            <CommandEmpty>
               Tulosta ei löytynyt
            </CommandEmpty>
            {eventMembers.map(({ id, users }) => (
               <CommandItem
                  key={id}
                  className="cursor-pointer flex justify-between group"
               // onSelect={() => clickHandler({ id, type: "user" })}
               >
                  <div className="flex items-center">
                     <span>{`${users.first_name} ${users.last_name}`}</span>
                     {users.id === data.user_id && <ShieldCheck size={18} className="text-red-500 ml-1" />}
                  </div>
                  {/* <div className="group relative w-40 h-10 flex items-center justify-center border bg-gray-100">
                     <span className="group-hover:hidden">Текст</span>
                     <span className="hidden group-hover:inline">...</span>
                  </div> */}
                  <div className="flex items-center">
                     <span className="mr-2 text-sm text-gray-500">{users.email}</span>
                     {users.id !== data.user_id && (
                        <DropdownMenu open={openDropdownId === users.id} onOpenChange={(isOpen) => setOpenDropdownId(isOpen ? users.id : null)}>
                           <DropdownMenuTrigger className="hover:bg-zinc-200 p-1 rounded-md">
                              <EllipsisVertical size={20} />
                           </DropdownMenuTrigger>
                           <DropdownMenuContent side={"left"}>

                              <DropdownMenuItem className="flex items-center" onClick={() => kickMember(users.id)}>
                                 <span>Poista osallistuja</span>
                              </DropdownMenuItem>
                              {/* <DropdownMenuItem className="flex items-center">
                                 <span>Lähetä kutsulinkki</span>
                              </DropdownMenuItem> */}

                           </DropdownMenuContent>
                        </DropdownMenu>
                     )}
                  </div>
               </CommandItem>
            ))}
         </CommandList>
      </CommandDialog>
   )
}

export default MembersListModal;