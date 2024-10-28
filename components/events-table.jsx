"use client"

import {
   Table,
   TableBody,
   TableCaption,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table"

import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { format } from 'date-fns';
import { Check, Copy, Delete, EllipsisVertical, Eye, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { forwardRef, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation";
import { useOrigin } from "@/hooks/use-origin";
import Link from "next/link";
import { useModal } from "@/hooks/use-modal";


const EventsTable = ({ data }) => {
   const [copied, setCopied] = useState(false);
   const [tab, setTab] = useState();

   const { toast } = useToast()
   const router = useRouter();
   const origin = useOrigin();
   const { onOpen } = useModal();

   const [dropdownMenuOpen, setDropdownMenuOpen] = useState(false);

   const deleteEvent = async (eventId) => {
      const supabase = createClient();
      const { data, error } = await supabase.from('events').delete().eq('id', eventId);

      if (error) {
         console.error(error)
         toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "There was a problem with your request."
         })
         return;
      }
      router.refresh();
      toast({
         variant: "outline",
         className: "border-green-500 font-medium",
         description: "Tapahtuma on poistettu onnistuneesti."
      })
   }

   const onCopy = (invintation_id) => {
      const inviteUrl = `${origin}/register-for-event/${invintation_id}`;

      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);

      setTimeout(() => {
         setCopied(false);
      }, 1000)
   }

   const [openDropdownId, setOpenDropdownId] = useState(null);

   const [isClient, setIsClient] = useState(false);

   useEffect(() => {
      setIsClient(true);
   }, []);

   if (!isClient) {
      return null;
   }
   return (
      <Table>
         <TableCaption>Tapahtumien lista</TableCaption>
         <TableHeader>
            <TableRow>
               <TableHead>Tapahtuman nimi</TableHead>
               <TableHead>Tapahtuman tyyppi</TableHead>
               <TableHead>Tapahtuman päivämäärä</TableHead>
               <TableHead>Ryhmän koko</TableHead>
               <TableHead>Lisäpalvelut</TableHead>
            </TableRow>
         </TableHeader>
         <TableBody>
            {data.length !== 0
               ? data.map(event => (
                  <TableRow key={event.id}>
                     <TableCell className="font-medium">{event.event_name}</TableCell>
                     <TableCell className="capitalize">{event.event_type}</TableCell>
                     <TableCell>{format(new Date(event.event_date), 'dd/MM/yyyy')}</TableCell>
                     <TableCell>{event.group_size}</TableCell>
                     <TableCell className="max-w-[150px] truncate">
                        {
                           event.additional_services?.length
                              ? event.additional_services.join(", ")
                              : "Ei ole"
                        }
                     </TableCell>
                     <TableCell className="text-right">
                        <DropdownMenu open={openDropdownId === event.id} onOpenChange={(isOpen) => setOpenDropdownId(isOpen ? event.id : null)}>
                           <DropdownMenuTrigger className="hover:bg-zinc-200 p-1 rounded-md" onClick={() => setTab(event.id)}>
                              <EllipsisVertical />
                           </DropdownMenuTrigger>
                           <DropdownMenuContent side={"left"}>
                              <DropdownMenuItem className="flex items-center" onClick={() => {
                                 onOpen("create-event", { edit: true, eventId: event.id })
                                 setOpenDropdownId(null);
                              }}>
                                 <Pencil size={18} className="mr-1" />
                                 <span>Muokkaa</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                 <ConfirmDialog deleteEvent={deleteEvent} eventId={event.id} />
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-sm" asChild>
                                 <Link className="flex" href={"event/" + event.invintation_id}>
                                    <Eye size={18} className="mr-1" />
                                    <span>Näytä</span>
                                 </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-sm" onClick={() => onCopy(event.invintation_id)}>
                                 {copied ? <Check /> : <Copy size={18} className="mr-1" />}
                                 <span>Kopioi kutsulinkki</span>
                              </DropdownMenuItem>
                           </DropdownMenuContent>
                        </DropdownMenu>
                     </TableCell>
                  </TableRow>
               ))
               : <TableRow>
                  <TableCell colSpan="5" className="text-center">Ei luotuja tapahtumia.</TableCell>
               </TableRow>
            }
         </TableBody>
      </Table>
   )
}

const ConfirmDialog = forwardRef(({ deleteEvent, eventId }, ref) => {
   return (
      <AlertDialog>
         <AlertDialogTrigger ref={ref} className="relative w-full cursor-default select-none rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 flex items-center">
            <Delete size={18} className="mr-1" />
            <span>Poista</span>
         </AlertDialogTrigger>
         <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>Oletko varma?</AlertDialogTitle>
               <AlertDialogDescription>
                  Tätä toimintoa ei voida peruuttaa. Tämä poistaa pysyvästi tapahtumasi ja kaikki siihen liittyvät tiedot palvelimiltamme.
               </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
               <AlertDialogCancel>Peruuta</AlertDialogCancel>
               <AlertDialogAction onClick={() => deleteEvent(eventId)} className="bg-red-500 hover:bg-red-600 text-white">Kyllä, poista</AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   )
})


export default EventsTable;

