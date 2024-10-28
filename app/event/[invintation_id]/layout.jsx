import { Toaster } from "@/components/ui/toaster";
import { EventProvider } from "@/context/EventContext";
import { createClient } from "@/lib/supabase/server";
import getAuthUser from "@/lib/supabase/user";

export default async function EventLayout({ children, params }) {
   const user = await getAuthUser();
   const supabase = createClient();
   const { invintation_id } = params;

   const eventExists = await supabase
      .from('events')
      .select('*')
      .eq('invintation_id', invintation_id)
      .maybeSingle();

   if (eventExists && eventExists.error) {
      console.error(eventExists.error);
      return (
         <div className="flex h-full w-full items-center justify-center px-4 bg-orange-100">
            <h1 className="text-2xl text-red-500 font-semibold">Tapahtuman lataamisessa tapahtui virhe! SERVER ERROR</h1>
         </div>
      )
   }

   if (eventExists && !eventExists.data) {
      return (
         <div className="flex h-full w-full items-center justify-center px-4 bg-orange-100">
            <h1 className="text-2xl text-red-500 font-semibold">Tapahtuma ei löydy</h1>
         </div>
      )
   }

   const memberExists = await supabase
      .from('event_member')
      .select('id')
      .eq('event_id', eventExists.data.id)
      .eq('user_id', user.id)

   if (memberExists && memberExists.error) {
      console.error(memberExists.error);
      return (
         <div className="flex h-full w-full items-center justify-center px-4 bg-orange-100">
            <h1 className="text-2xl text-red-500 font-semibold">Tapahtui käyttäjän vahvistusvirhe! SERVER ERROR</h1>
         </div>
      )
   }

   if (memberExists && !memberExists.data) {
      return (
         <div className="flex h-full w-full items-center justify-center px-4 bg-orange-100">
            <h1 className="text-2xl text-red-500 font-semibold">Et ole tämän tapahtuman osallistuja.</h1>
         </div>
      )
   }

   const eventData = eventExists.data;
   const userData = user;
   
   return (
      <EventProvider value={{ eventData, userData }}>
         <div className={`antialiased`}>
            <main>
               {children}
            </main>
            <Toaster />
         </div>
      </EventProvider>

   );
}