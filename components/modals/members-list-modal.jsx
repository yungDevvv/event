"use client";

import {
   CommandDialog,
   CommandEmpty,
   CommandInput,
   CommandItem,
   CommandList,
} from "@/components/ui/command"

import { useModal } from "@/hooks/use-modal";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

const MembersListModal = () => {
   const { isOpen, onClose, type, data } = useModal();

   const isModalOpen = isOpen && type === "event-members-list";

   const [eventMembers, setEventMembers] = useState([]);

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
                  className="cursor-pointer flex justify-between"
               // onSelect={() => clickHandler({ id, type: "user" })}
               >
                  <div className="flex items-center">
                     {console.log(data.user_id)}
                     {console.log(users)}
                     <span>{`${users.first_name} ${users.last_name}`}</span>
                     {users.id === data.user_id && <ShieldCheck size={18} className="text-red-500 ml-1" />}
                  </div>

                  <span className="ml-2 text-sm text-gray-500">{users.email}</span>
               </CommandItem>
            ))}
         </CommandList>
      </CommandDialog>
   )
}

export default MembersListModal;