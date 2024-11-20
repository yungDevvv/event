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
import { Check, Copy, Delete, EllipsisVertical, Eye, ImageOff, ImagePlay, Images, Pencil, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { forwardRef, useState, useEffect, Fragment } from "react";
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation";
import { useOrigin } from "@/hooks/use-origin";
import Link from "next/link";
import { useModal } from "@/hooks/use-modal";
import { Button } from "../ui/button";


const EventsTable = ({ data, user }) => {
   const [copied, setCopied] = useState(false);
   const [tab, setTab] = useState();

   const { toast } = useToast()
   const router = useRouter();
   const origin = useOrigin();
   const { onOpen } = useModal();

   const deleteEvent = async (eventId) => {
      const supabase = createClient();
      const { error } = await supabase.from('events').delete().eq('id', eventId);

      if (error) {
         console.error(error);
         toast({
            variant: "supabaseError",
            description: "Tuntematon virhe tapahtuman poistaessa."
         });
         return;
      }
      router.refresh();
      toast({
         variant: "success",
         title: "Onnistui!",
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

   const stopDiaesitys = async (event_id) => {
      const supabase = createClient();
      const { error } = await supabase
         .from("events")
         .update({ "diaesitys": false })
         .eq("id", event_id);

      if (error) {
         console.error(error);
         toast({
            variant: "supabaseError",
            description: "Tuntematon virhe diaesityksen tilan päivittämisessä."
         });
         return;
      }

      router.refresh();

      toast({
         variant: "success",
         title: "Onnistui!",
         description: "Diaesitys on nyt pysäytetty!"
      })
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
      <div>
         <div className="w-full text-right">
            <Button className="bg-orange-400 hover:bg-orange-500 mb-3" onClick={() => onOpen("create-event", { edit: false })}>Uusi tapahtuma</Button>
         </div>
         <Table>
            <TableCaption>Tapahtumien lista</TableCaption>
            <TableHeader>
               <TableRow>
                  <TableHead>Asiakkaan nimi</TableHead>
                  <TableHead>Nimi</TableHead>
                  <TableHead>Tyyppi</TableHead>
                  <TableHead>Päivämäärä ja aika</TableHead>
                  <TableHead>Osallistujat</TableHead>
                  <TableHead>Lisäpalvelut</TableHead>
                  <TableHead>Ryhmän koko</TableHead>
                  <TableHead>Diaesitys</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {data.length !== 0
                  ? data.map(event => (
                     <TableRow key={event.id}>
         
                        <TableCell className="font-medium">{event.client_name}</TableCell>
                        <TableCell className="font-medium">{event.event_name}</TableCell>
                        <TableCell className="capitalize">{event.event_type}</TableCell>
                        <TableCell>{format(new Date(event.event_date), 'dd.MM.yyyy')} {event.event_time.slice(0, 5)}</TableCell>
                        <TableCell>{event.memberCount}</TableCell>
                        <TableCell className="max-w-[100px] truncate">
                           {
                              event.additional_services?.length
                                 ? event.additional_services.join(", ")
                                 : "Ei ole"
                           }
                        </TableCell>
                        <TableCell>{event.group_size}</TableCell>
                        <TableCell>{event.diaesitys ? <div className="w-[7px] h-[7px] bg-green-500 rounded-full animate-glow ml-6"></div> : <div className="w-[7px] h-[7px] bg-red-500 rounded-full ml-6"></div>}</TableCell>
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
                                    <Pencil size={18} className="mr-2" />
                                    <span>Muokkaa</span>
                                 </DropdownMenuItem>
                                 <DropdownMenuItem asChild>
                                    <ConfirmDialog deleteEvent={deleteEvent} eventId={event.id} />
                                 </DropdownMenuItem>
                                 <DropdownMenuItem className="text-sm" asChild>
                                    <Link className="flex" href={"/event/" + event.invintation_id}>
                                       <Eye size={18} className="mr-2" />
                                       <span>Näytä</span>
                                    </Link>
                                 </DropdownMenuItem>
                                 <DropdownMenuItem className="flex items-center" onClick={() => {
                                    onOpen("create-event", { edit: false, duplicate: true, eventId: event.id })
                                    setOpenDropdownId(null);
                                 }}>
                                    <Pencil size={18} className="mr-2" />
                                    <span>Duplicate</span>
                                 </DropdownMenuItem>
                                 <DropdownMenuItem className="text-sm" onClick={() => onCopy(event.invintation_id)}>
                                    {copied ? <Check size={18} className="mr-2" /> : <Copy size={18} className="mr-2" />}
                                    <span>Kopioi kutsulinkki</span>
                                 </DropdownMenuItem>
                                 <DropdownMenuItem className="text-sm" onClick={() => {
                                    onOpen("event-members-list", { event_id: event.id, user_id: user.id })
                                    setOpenDropdownId(null);
                                 }}>
                                    <UserRound size={18} className="mr-2" />
                                    <span>Osallistujat</span>
                                 </DropdownMenuItem>
                                 {event.diaesitys
                                    ? (
                                       <Fragment>
                                          <DropdownMenuItem className="text-sm" onClick={() => {
                                             stopDiaesitys(event.id);
                                             setOpenDropdownId(null);
                                          }}>
                                             <ImageOff size={18} className="mr-2" />
                                             <span>Pysähdy diaesitys</span>
                                          </DropdownMenuItem>
                                          <DropdownMenuItem className="text-sm" onClick={() => {
                                             router.push("/dashboard/events/" + event.id + "/diaesitys/slider")
                                             setOpenDropdownId(null);
                                          }}>
                                             <ImagePlay size={18} className="mr-2" />
                                             <span>Diaesitys</span>
                                          </DropdownMenuItem>
                                       </Fragment>

                                    ) : (
                                       <Link href={`/dashboard/events/${event.id}/diaesitys`}>
                                          <DropdownMenuItem className="text-sm" onClick={() => {
                                             // onOpen("event-members-list", { event_id: event.id, user_id: user.id })
                                             // setOpenDropdownId(null);
                                          }}>
                                             <Images size={18} className="mr-2" />
                                             <span>Aloita diaesitys</span>
                                          </DropdownMenuItem>
                                       </Link>
                                    )
                                 }




                              </DropdownMenuContent>
                           </DropdownMenu>
                        </TableCell>
                     </TableRow>
                  ))
                  : <TableRow>
                     <TableCell colSpan="8" className="text-center">Ei luotuja tapahtumia.</TableCell>
                  </TableRow>
               }
            </TableBody>
         </Table>
      </div>

   )
}

const ConfirmDialog = forwardRef(({ deleteEvent, eventId }, ref) => {
   return (
      <AlertDialog>
         <AlertDialogTrigger ref={ref} className="relative w-full cursor-default select-none rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 flex items-center">
            <Delete size={18} className="mr-2" />
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

ConfirmDialog.displayName = "ConfirmDialog";

export default EventsTable;

