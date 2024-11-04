"use client";

import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogFooter,
   DialogDescription
} from '@/components/ui/dialog'

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import DatePicker from '@/components/date-picker';
import { Input } from '@/components/ui/input';
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod";
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import MultipleSelectWithCheckbox from "../ui/MultipleSelectWithCheckbox";
import { useModal } from '@/hooks/use-modal';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { generateId, generateInviteId } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';


const eventTypes = [
   { value: 'rallicross', label: 'Rallicross', image: '/images/rallicross.jpg' },
   { value: 'offroad', label: 'Offroad', image: '/images/offroad.jpg' },
   { value: 'motocross', label: 'Motocross', image: '/images/motocross.jpg' },
   { value: 'monkijasafari', label: 'Mönkijäsafari', image: '/images/monkijasafari.jpg' },
   { value: 'sahkopyoraily', label: 'Sähköpyöräily', image: '/images/sahkopyoraily.jpg' },
];

const formSchema = z.object({
   eventType: z.string().min(1, {
      message: "Valitse tapahtumatyyppi."
   }),
   clientName: z.string().min(1, "Asiakkaan nimi vaaditaan."),
   groupSize: z.preprocess((val) => Number(val), z.number().positive("Ryhmän koon on oltava suurempi kuin 0.")),
   eventName: z.string().min(1, "Tapahtuman nimi vaaditaan."),
   eventTime: z.string().min(1, "Valitse tapahtuman aika."),
   eventDate: z.date({ message: "Valitse tapahtuman päivämäärä." }),
   instructionsFile: z.any().optional(),
   additionalServices: z.any().optional()
});

const CreateEventModal = () => {
   const supabase = createClient();

   const router = useRouter();
   const { toast } = useToast();
   const { isOpen, onClose, type, data } = useModal();

   const [eventData, setEventData] = useState({});
   const [selectedImage, setSelectedImage] = useState(null);


   const form = useForm({
      resolver: zodResolver(formSchema),
      defaultValues: {
         eventName: '',
         clientName: '',
         eventDate: null,
         eventType: '',
         groupSize: 1,
         eventTime: '',
         additionalServices: [],
         instructionsFile: null
      }
   });

   const isModalOpen = isOpen && type === "create-event";
   const isLoading = form.formState.isSubmitting;
   console.log(form, "FOOORM")
   const { reset } = form;

   const onSubmit = async (datar) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (data.edit) {
         if (user) {
            /* Update Event */
            // const fileName = `${user.id}/instructions/${generateInviteId()}`; // eventID/userID.png

            // const { data: uploadedFile, error: uploadedFileError } = await supabase.storage
            //    .from('client_data')
            //    .upload(fileName, datar.instructionsFile[0]);

            // if(uploadedFileError) {
            //    console.error(uploadedFileError);
            //    toast({
            //       variant: "supabaseError",
            //       description: "Tuntematon virhe tiedoston latauksessa.",
            //    });
            //    return;
            // }

            const { error: updateError } = await supabase
               .from('events')
               .update({
                  event_name: datar.eventName,
                  client_name: datar.clientName,
                  group_size: datar.groupSize,
                  event_type: datar.eventType,
                  event_date: datar.eventDate,
                  event_time: datar.eventTime,
                  additional_services: datar.additionalServices,
                  // instructions_file: instructionsFile !== 0 ? uploadedFile.fullPath : null,
                  instructions_file: null,
               })
               .eq("id", eventData.id);

            if (updateError) {
               console.error(updateError);
               toast({ 
                  variant: "supabaseError",
                  description: "Tuntematon virhe päivittäessä tapahtumaa."
               });
               return;
            }

            toast({
               variant: "success",
               title: "Onnistui!",
               description: "Tapahtuma on päivitetty onnistuneesti!"
            });

            router.refresh();
            router.push('/dashboard/events');
            onClose();
         }
         return;
      } else {
         /* Create Event */
         if (user) {
            console.log(datar.instructionsFile, "ASDASDASDASD!!!!!!")
            // const fileName = `${user.id}/instructions/${generateInviteId()}`; // eventID/userID.png

            // const { data: uploadedFile, error: uploadedFileError } = await supabase.storage
            //    .from('client_data')
            //    .upload(fileName, datar.instructionsFile[0]);

            // if(uploadedFileError) {
            //    console.error(uploadedFileError);
            //    toast({
            //       variant: "supabaseError",
            //       description: "Tuntematon virhe tiedoston latauksessa.",
            //    });
            //    return;
            // }

            const { data: createdEvent, error: createdEventError } = await supabase
               .from('events')
               .insert({
                  event_name: datar.eventName,
                  client_name: datar.clientName,
                  group_size: datar.groupSize,
                  event_type: datar.eventType,
                  event_date: datar.eventDate,
                  event_time: datar.eventTime,
                  additional_services: datar.additionalServices,
                  // instructions_file: instructionsFile !== 0 ? uploadedFile.fullPath : null,
                  instructions_file: null,
                  invintation_id: generateId(),
                  user_id: user.id
               }).select();
            if (createdEventError) {
               console.error(createdEventError);
               toast({ 
                  variant: "supabaseError",
                  description: "Tuntematon virhe luotaessa tapahtumaa." 
               });
               return;
            }

            /* ADD CREATOR AS MEMBER */
            const { error } = await supabase
               .from("event_member")
               .insert({ event_id: createdEvent[0].id, user_id: user.id });

            if (error) {
               console.error(error);
               toast({ 
                  variant: "supabaseError",
                  description: "Tuntematon virhe lisäessä sinut osallistujaksi."
               });
               return;
            }

            toast({
               variant: "success",
               title: "Onnistui!",
               description: "Tapahtuma on luotu onnistuneesti."
            });

            router.pathname === '/dashboard/events'
               ? (
                  router.push('/dashboard/events'),
                  router.refresh()
               )
               : (
                  router.push('/dashboard/events'),
                  router.refresh()
               )

            onClose()

         }
      }


   };

   useEffect(() => {
      const fetchEventData = async () => {
         const event = await supabase
            .from("events")
            .select("*")
            .eq("id", data.eventId);

         if (event && event.error) {
            console.error(event.error);
            toast({
               variant: "supabaseError",
               description: "Tuntematon virhe ladattaessa tapahtumatietoja.",
            });
            return;
         }

         setEventData(...event.data)
      }
      if (data.edit) {
         fetchEventData();
      }

   }, [data, toast, supabase])

   useEffect(() => {
      if (eventData) {
         const newEventDate = new Date(eventData.event_date)
         console.log(eventData.event_date, "!111111111")
         console.log(newEventDate)
         reset({
            eventName: eventData.event_name || '',
            clientName: eventData.client_name || '',
            eventDate: newEventDate || null,
            eventType: eventData.event_type || '',
            groupSize: eventData.group_size || 1,
            eventTime: eventData.event_time || '',
            additionalServices: eventData.additional_services || [],
            instructionsFile: null
         });
      }
   }, [eventData, reset]);

   return (
      <Dialog open={isModalOpen} onOpenChange={onClose}>
         <DialogContent className='bg-white text-black p-0'>
            <DialogHeader className='pt-8 px-6'>
               <DialogTitle className='text-2xl text-center font-bold'>
                  {data.edit
                     ? "Muokkaa tapahtuma"
                     : "Luo uusi tapahtuma"
                  }
               </DialogTitle>
            </DialogHeader>
            <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-[600px] mx-auto space-y-3 max-sm:mx-0 max-sm:px-5">
                  {/* Event Name */}
                  <FormField
                     control={form.control}
                     name="eventName"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel className="block mb-1">Tapahtuman nimi</FormLabel>
                           <FormControl>
                              <Input {...field} />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  {/* Client Name */}
                  <FormField
                     control={form.control}
                     name="clientName"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel className="block mb-1">Asiakkaan nimi</FormLabel>
                           <FormControl>
                              <Input {...field} />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  {/* Group size */}
                  <FormField
                     control={form.control}
                     name="groupSize"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel className="block mb-1">Ryhmän koko</FormLabel>
                           <FormControl>
                              <Input type="number" {...field} />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  {/* Event Type */}
                  <FormField
                     control={form.control}
                     name="eventType"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel className="block mb-1">Tapahtuman tyyppi</FormLabel>
                           <FormControl>
                              <Select
                                 onValueChange={field.onChange}
                              >
                                 <SelectTrigger className="w-full capitalize">
                                    <SelectValue placeholder={eventData && eventData.event_type ? eventData.event_type : "Valitse tapahtuman tyyppi"} />
                                 </SelectTrigger>
                                 <SelectContent>
                                    <SelectGroup>
                                       {eventTypes.map((type) => (
                                          <SelectItem key={type.value} value={type.value}>
                                             {type.label}
                                          </SelectItem>
                                       ))}
                                    </SelectGroup>
                                 </SelectContent>
                              </Select>
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  {/* */}
                  {selectedImage && (
                     <div className="my-4">
                        <label className="font-medium">Tapahtuman taustakuva</label>
                        <img src={selectedImage} alt="Event background" className="w-full h-40 object-cover rounded-md" />
                     </div>
                  )}

                  {/* Additional Services */}
                  <FormField
                     control={form.control}
                     name="additionalServices"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Lisäpalvelut</FormLabel>
                           <FormControl>
                              <MultipleSelectWithCheckbox
                                 placeholder="Valitse lisäpalvelut"
                                 options={['Ruokailu', 'Kuljetus', 'Valokuvaus', 'Majoitus']}
                                 field={field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <div className="flex max-sm:block max-sm:space-y-3">

                     {/* Event Date */}
                     <FormField
                        control={form.control}
                        name="eventDate"
                        render={({ field }) => (
                           <FormItem className="mr-1 max-sm:mr-0">
                              <FormLabel className="block mb-1">Tapahtuman päivämäärä</FormLabel>
                              <FormControl>
                                 <DatePicker {...field} />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     >
                     </FormField>

                     {/* Event Time */}
                     <FormField
                        control={form.control}
                        name="eventTime"
                        render={({ field }) => (
                           <FormItem className="ml-1 max-sm:ml-0">
                              <FormLabel className="block mb-1">Tapahtuman kellonaika</FormLabel>
                              <FormControl>
                                 <Input
                                    type="time"
                                    className="block cursor-pointer"
                                    {...field}
                                 />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     >
                     </FormField>
                  </div>

                  <FormField
                     control={form.control}
                     name="instructionsFile"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel className="block mb-1">Tapahtumaohjeistus</FormLabel>
                           <FormControl>
                              <Input type="file" onChange={(e) => field.onChange(e.target.files)} />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  <DialogFooter className="pb-8">
                     <Button type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : data.edit ? "Muokkaa tapahtuma" : "Luo tapahtuma"}</Button>
                  </DialogFooter>
               </form>
            </Form>
         </DialogContent>
      </Dialog>
   );
}

export default CreateEventModal;