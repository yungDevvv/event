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
import Link from 'next/link';


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
   eventAddress: z.string().min(1, "Tapahtuman osoite vaaditaan."),
   eventPlace: z.string().min(1, "Tapahtuman paikka vaaditaan."),
   eventName: z.string().min(1, "Tapahtuman nimi vaaditaan."),
   eventTime: z.string().min(1, "Valitse tapahtuman aika."),
   eventDate: z.date({ message: "Valitse tapahtuman päivämäärä." }),
   instructionsFile: z.any().optional(),
   additionalServices: z.any().optional(),
   eventImage: z.any().optional()
});

const CreateEventModal = () => {
   const supabase = createClient();

   const router = useRouter();
   const { toast } = useToast();
   const { isOpen, onClose, type, data } = useModal();

   const [eventData, setEventData] = useState({});
   const [eventImage, setEventImage] = useState(null);


   const form = useForm({
      resolver: zodResolver(formSchema),
      defaultValues: {
         eventName: '',
         clientName: '',
         eventDate: null,
         eventType: '',
         eventAddress: '',
         eventPlace: '',
         groupSize: 1,
         eventTime: '',
         additionalServices: [],
         instructionsFile: null,
         eventImage: null
      }
   });

   const isModalOpen = isOpen && type === "create-event";
   const isLoading = form.formState.isSubmitting;
   const { reset } = form;

   const onSubmit = async (datar) => {
      const { data: { user } } = await supabase.auth.getUser();

      if (data?.duplicate) {
         /* Create Event */
         if (user) {
            const instructionsFileName = `${user.id}/instructions/${generateInviteId()}`; // eventID/userID.png
            const eventImageFileName = `${user.id}/event_image/${generateInviteId()}`;

            let instructionUploadedFile;
            let eventImageUploadedFile;

            if (datar?.instructionsFile) {
               const { data: uploadedFilee, error: uploadedFileError } = await supabase.storage
                  .from('client_data')
                  .upload(instructionsFileName, datar.instructionsFile[0]);

               if (uploadedFileError) {
                  console.error(uploadedFileError);
                  toast({
                     variant: "supabaseError",
                     description: "Tuntematon virhe tiedoston latauksessa varastoon.",
                  });
                  return;
               }

               instructionUploadedFile = uploadedFilee;
            }

            if (datar?.eventImage) {
               const { data: uploadedFilee, error: uploadedFileError } = await supabase.storage
                  .from('client_data')
                  .upload(eventImageFileName ? eventImageFileName : `${user.id}/event_image/${generateInviteId()}`, datar.eventImage[0]);

               if (uploadedFileError) {
                  console.error(uploadedFileError);
                  toast({
                     variant: "supabaseError",
                     description: "Tuntematon virhe kuvan latauksessa varastoon.",
                  });
                  return;
               }

               eventImageUploadedFile = uploadedFilee;
            }

            // console.log(uploadedFile, "uploadedFile !!!")
            const { data: createdEvent, error: createdEventError } = await supabase
               .from('events')
               .insert({
                  event_name: datar.eventName,
                  client_name: datar.clientName,
                  group_size: datar.groupSize,
                  event_type: datar.eventType,
                  event_date: datar.eventDate,
                  event_time: datar.eventTime,
                  event_address: datar.eventAddress,
                  event_place: datar.eventPlace,
                  additional_services: datar.additionalServices,
                  instructions_file: datar?.instructionsFile ? instructionUploadedFile.fullPath : eventData.instructions_file,
                  event_image: datar?.eventImage ? eventImageUploadedFile.fullPath : eventData.event_image,
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
               .insert({ event_id: createdEvent[0].id, user_id: user.id, active_event: createdEvent[0].invintation_id});

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

         return;
      }
      if (data.edit) {
         if (user) {
            /* Update Event */
            const instructionsFileName = `${user.id}/instructions/${generateInviteId()}`; // eventID/userID.png
            const eventImageFileName = `${user.id}/event_image/${generateInviteId()}`;

            let instructionUploadedFile;
            let eventImageUploadedFile;

            if (datar?.instructionsFile) {
               const { data: uploadedFilee, error: uploadedFileError } = await supabase.storage
                  .from('client_data')
                  .upload(instructionsFileName, datar.instructionsFile[0]);

               if (uploadedFileError) {
                  console.error(uploadedFileError);
                  toast({
                     variant: "supabaseError",
                     description: "Tuntematon virhe tiedoston latauksessa varastoon.",
                  });
                  return;
               }

               instructionUploadedFile = uploadedFilee;
            }

            if (datar?.eventImage) {
               const { data: uploadedFilees, error: uploadedFileError } = await supabase.storage
                  .from('client_data')
                  .upload(eventImageFileName ? eventImageFileName : `${user.id}/event_image/${generateInviteId()}`, datar.eventImage[0]);

               if (uploadedFileError) {
                  console.error(uploadedFileError);
                  toast({
                     variant: "supabaseError",
                     description: "Tuntematon virhe kuvan latauksessa varastoon.",
                  });
                  return;
               }

               eventImageUploadedFile = uploadedFilees;
            }
            console.log(eventImageUploadedFile, "EVENT IMAGE");
            console.log(instructionUploadedFile, "INSTURCTIONS");
            const { error: updateError } = await supabase
               .from('events')
               .update({
                  event_name: datar.eventName,
                  client_name: datar.clientName,
                  group_size: datar.groupSize,
                  event_type: datar.eventType,
                  event_date: datar.eventDate,
                  event_time: datar.eventTime,
                  event_address: datar.eventAddress,
                  event_place: datar.eventPlace,
                  additional_services: datar.additionalServices,
                  instructions_file: datar?.instructionsFile ? instructionUploadedFile.fullPath : eventData.instructions_file,
                  event_image: datar?.eventImage ? eventImageUploadedFile.fullPath : eventData.event_image
                  
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

            router.push('/dashboard/events');
            router.refresh();
            onClose();
         }

         return;
      } else {
         /* Create Event */
         if (user) {
            const instructionsFileName = `${user.id}/instructions/${generateInviteId()}`; // eventID/userID.png

            let instructionUploadedFile;
            let eventImageUploadedFile;

            if (datar?.eventImage) {
               const { data: uploadedFilee, error: uploadedFileError } = await supabase.storage
                  .from('client_data')
                  .upload(eventImageFileName ? eventImageFileName : `${user.id}/event_image/${generateInviteId()}`, datar.eventImage[0]);

               if (uploadedFileError) {
                  console.error(uploadedFileError);
                  toast({
                     variant: "supabaseError",
                     description: "Tuntematon virhe kuvan latauksessa varastoon.",
                  });
                  return;
               }

               eventImageUploadedFile = uploadedFilee;
            }

            if (datar?.instructionsFile) {
               const { data: uploadedFilee, error: uploadedFileError } = await supabase.storage
                  .from('client_data')
                  .upload(instructionsFileName, datar.instructionsFile[0]);

               if (uploadedFileError) {
                  console.error(uploadedFileError);
                  toast({
                     variant: "supabaseError",
                     description: "Tuntematon virhe tiedoston latauksessa varastoon.",
                  });
                  return;
               }

               instructionUploadedFile = uploadedFilee;
            }
            
            const { data: createdEvent, error: createdEventError } = await supabase
               .from('events')
               .insert({
                  event_name: datar.eventName,
                  client_name: datar.clientName,
                  group_size: datar.groupSize,
                  event_type: datar.eventType,
                  event_date: datar.eventDate,
                  event_time: datar.eventTime,
                  event_address: datar.eventAddress,
                  event_place: datar.eventPlace,
                  additional_services: datar.additionalServices,
                  instructions_file: datar?.instructionsFile ? instructionUploadedFile.fullPath : eventData.instructions_file,
                  event_image: datar?.eventImage ? eventImageUploadedFile.fullPath : eventData.event_image,
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
      if (data?.edit || data?.duplicate) {
         fetchEventData();
      }

   }, [data, toast, supabase])

   useEffect(() => {
      if (eventData) {
         const newEventDate = new Date(eventData.event_date)
         reset({
            eventName: eventData.event_name || '',
            clientName: eventData.client_name || '',
            eventDate: newEventDate || null,
            eventType: eventData.event_type || '',
            groupSize: eventData.group_size || 1,
            eventTime: eventData.event_time || '',
            additionalServices: eventData.additional_services || [],
            eventAddress: eventData.event_address || '',
            eventPlace: eventData.event_place || '',
            instructionsFile: null,
            eventImage: null
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
               <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-[600px] mx-auto space-y-3 max-sm:mx-0 max-sm:px-5 px-10">
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
                  <div className="flex max-sm:block max-sm:space-y-3">

                     {/* Event Address */}
                     <FormField
                        control={form.control}
                        name="eventAddress"
                        render={({ field }) => (
                           <FormItem className="mr-1 max-sm:mr-0 w-full">
                              <FormLabel className="block mb-1">Tapahtuman osoite</FormLabel>
                              <FormControl>
                                 <Input {...field} />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />

                     {/* Event Place */}
                     <FormField
                        control={form.control}
                        name="eventPlace"
                        render={({ field }) => (
                           <FormItem className="ml-1 max-sm:ml-0 w-full">
                              <FormLabel className="block mb-1">Tapahtuman paikka</FormLabel>
                              <FormControl>
                                 <Input placeholder="Helsinki" {...field} />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />

                  </div>

                  <div className="flex max-sm:block max-sm:space-y-3">
                     {/* Group size */}
                     <FormField
                        control={form.control}
                        name="groupSize"
                        render={({ field }) => (
                           <FormItem className="mr-1 max-sm:mr-0 w-full">
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
                           <FormItem className="ml-1 max-sm:ml-0 w-full">
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
                  </div>

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
                           <FormItem className="mr-1 max-sm:mr-0 w-full">
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
                           <FormItem className="ml-1 max-sm:ml-0 w-full">
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
                  <div className="flex max-sm:block max-sm:space-y-3">
                     <FormField
                        control={form.control}
                        name="instructionsFile"
                        render={({ field }) => (
                           <FormItem className="mr-1">
                              <FormLabel className="block mb-1">Tapahtumaohjeistus</FormLabel>
                              <FormControl className="cursor-pointer">
                                 <Input type="file" onChange={(e) => field.onChange(e.target.files)} />
                              </FormControl>
                              <FormMessage />
                              {console.log(eventData)}
                              {eventData && eventData?.instructions_file && <Link className='block mt-1 underline text-center' target="_blank" rel="noopener noreferrer" href={"https://supa.crossmedia.fi/storage/v1/object/public/" + eventData?.instructions_file}>Aktiivinen ohjeistus</Link>}
                           </FormItem>
                        )}
                     />

                     <FormField
                        control={form.control}
                        name="eventImage"
                        render={({ field }) => (
                           <FormItem className="ml-1">
                              <FormLabel className="block mb-1">Tapahtuman kuva</FormLabel>
                              <FormControl className="cursor-pointer">
                                 <Input type="file" onChange={(e) => {
                                    field.onChange(e.target.files)
                                    setEventImage(e.target?.files[0] ? e.target.files[0] : null)
                                    }} />
                              </FormControl>
                              <FormMessage />
                              {eventData && eventData?.event_image && <img className='mt-2 h-[80px] rounded-md w-full object-cover' src={"https://supa.crossmedia.fi/storage/v1/object/public/" + eventData?.event_image} />}
                              {eventImage && <img className='mt-2 h-[80px] rounded-md w-full object-cover' src={URL.createObjectURL(eventImage)} />} {console.log(eventImage)}
                           </FormItem>
                        )}
                     />
                  </div>
                  {/* <FormField
                     control={form.control}
                     name="instructionsFile"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel className="block mb-1">Tapahtumaohjeistus</FormLabel>
                           <FormControl className="cursor-pointer">
                              <Input type="file" onChange={(e) => field.onChange(e.target.files)} />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  {eventData && eventData?.instructions_file && <Link className='block mt-1 underline' target="_blank" rel="noopener noreferrer" href={"https://supa.crossmedia.fi/storage/v1/object/public/" + eventData?.instructions_file}>Aktiivinen ohjeistus</Link>}
                  
                  <FormField
                     control={form.control}
                     name="eventImage"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel className="block mb-1">Tapahtuman kuva</FormLabel>
                           <FormControl className="cursor-pointer">
                              <Input type="file" onChange={(e) => field.onChange(e.target.files)} />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  /> */}
                  <DialogFooter className="pb-8">
                     {data?.duplicate && <Button type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Luo tapahtuma"}</Button>}
                     {!data?.duplicate && <Button type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : data.edit ? "Muokkaa tapahtuma" : "Luo tapahtuma"}</Button>}
                  </DialogFooter>
               </form>
            </Form>
         </DialogContent>
      </Dialog>
   );
}

export default CreateEventModal;