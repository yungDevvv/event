"use client"
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export const RegisterEventMember = ({ user }) => {
   const [errorMessage, setErrorMessage] = useState("");
   const [eventExists, setEventExists] = useState(true);
   const [hasEffectRun, setHasEffectRun] = useState(false);

   const router = useRouter();
   const supabase = createClient();

   const memberExistsInEvent = async (invintationId) => {
      setErrorMessage("");
      const eventId = localStorage.getItem("event-app-respa");

      const { data, error } = await supabase
         .from('event_member')
         .select('*')
         .eq('user_id', user.id)
         .eq('event_id', eventId);

      if (error) {
         setErrorMessage(error.message);
         console.error(error)
         return;
      }
      
      if (data.length !== 0) {
         router.push(`/event/${invintationId}`)
         return;
      }

      return false;
   }

   const eventExistsCheck = async () => {
      const eventId = localStorage.getItem("event-app-respa");

      if (!eventId) {
         alert("Oops, tapahtui virhe, evenId ei löydy!")
         return;
      }

      const { data, error } = await supabase
         .from('events')
         .select('id, invintation_id')
         .eq('id', eventId)


      if (error) {
         setEventExists(false);
         return;
      }

      if (data.length !== 0) {
         localStorage.setItem("event-app-respa-invite-id", data[0].invintation_id)
         return data[0].invintation_id;
      } else {
         console.log("ERROR 2")
         alert("Oops, tapahtui virhe, tapahtuma ei löydy!")
         setEventExists(false);
         return;
      }
   }

   useEffect(() => {
      if (!localStorage.getItem("event-app-respa")) {
         setEventExists(false);
      }
   }, [])

   useEffect(() => {
      if (!hasEffectRun) {
         setHasEffectRun(true);
         // memberExistsInEvent();
         (async () => {
            const event = await eventExistsCheck();
            if (event) {
               const member = await memberExistsInEvent(event)
               if (member === false) {
                  const eventId = localStorage.getItem("event-app-respa");
                  const { error } = await supabase
                     .from('event_member')
                     .insert([
                        { user_id: user.id, event_id: eventId }
                     ]);
                     
                     if(error) {
                        // alert("Oops, tapahtui virhe, sinut ei voitu lisätä tapahtumaan!")
                        console.error(error.message)
                        return;
                     }

                     router.push(`/event/${event}`)
               }
            }
         })();
      }
   }, [hasEffectRun])
   return (
      <div className='w-full h-full'>
         {!eventExists && (
            <h1 className="text-2xl text-red-500 text-center">Tapahtuma ei löytynyt</h1>
         )}
         {errorMessage && <h1 className="text-2xl text-red-500 text-center">{errorMessage}</h1>}
         
      </div>
   )
}