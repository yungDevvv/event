import { Error } from "@/components/ui/error";
import { Toaster } from "@/components/ui/toaster";
import { EventProvider } from "@/context/EventContext";
import { createClient } from "@/lib/supabase/server";
import getAuthUser from "@/lib/supabase/user";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { cookies } from 'next/headers';

async function EventLayout({ children, params }) {
   const { invintation_id } = params;
   // const locale = cookies().get('locale')?.value || 'fi'; 

   const messages = await getMessages();

   const user = await getAuthUser();
   const supabase = createClient();



   const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('invintation_id', invintation_id)

   if (eventError) {
      console.error(eventError);
      return <Error text="500 Internal Server Error" />
   }

   if (event.length === 0) {
      return <Error text="Tapahtuma ei löydy!" />
   }

   const { data: member, error: memberError } = await supabase
      .from('event_member')
      .select('id')
      .eq('event_id', event[0].id)
      .eq('user_id', user.id)

   if (memberError) {
      console.error(memberError);
      return <Error text="500 Internal Server Error" />
   }

   if (member.length === 0) {
      return <Error text="Et ole tämän tapahtuman osallistuja" />
   }

   const eventData = event[0];
   const userData = user;

   return (
      <NextIntlClientProvider  messages={messages}>
         <EventProvider value={{ eventData, userData }}>
            <main className="w-full h-full min-h-screen bg-black">
               {children}
            </main>
            <Toaster />
         </EventProvider>
      </NextIntlClientProvider>
   );
}

export default EventLayout;